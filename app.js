const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

const menuToggle = $("menuToggle");
const nav = $("nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Public GitHub data; no personal access token is embedded in this static site.
async function loadGitHub() {
  const user = "ovulndeveloper";
  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`),
      fetch(`https://api.github.com/users/${user}/repos?type=owner&sort=updated&per_page=100`)
    ]);
    if (!profileRes.ok || !reposRes.ok) {
      throw new Error(profileRes.status === 403 || reposRes.status === 403
        ? "GitHub API rate limit reached."
        : "GitHub API is unavailable.");
    }
    const profile = await profileRes.json();
    const repos = await reposRes.json();
    if (!profile || !Array.isArray(repos)) throw new Error("Unexpected GitHub API response.");
    $("profileName").textContent = profile.name || profile.login;
    $("profileBio").textContent = profile.bio || "Independent developer and open-source builder.";
    $("repoCount").textContent = profile.public_repos ?? repos.length;
    $("followers").textContent = profile.followers ?? "—";
    if (profile.avatar_url) {
      const img = document.createElement("img");
      img.src = profile.avatar_url;
      img.alt = `${profile.name || profile.login} GitHub avatar`;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => img.remove());
      $("profileAvatar").replaceChildren(img);
    }
    const grid = $("repoGrid");
    grid.innerHTML = "";
    const publicRepos = repos
      .filter(r => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at));
    if (!publicRepos.length) { grid.innerHTML = '<div class="repo-loading">No public repositories found.</div>'; return; }
    publicRepos.forEach(repo => {
      const card = document.createElement("a");
      card.className = "repo-card";
      card.href = repo.html_url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      const title = document.createElement("h3");
      title.textContent = repo.name;
      const desc = document.createElement("p");
      desc.textContent = repo.description || "No repository description provided.";
      const meta = document.createElement("div");
      meta.className = "repo-meta";
      meta.textContent = `${repo.language || "—"}  ·  ★ ${repo.stargazers_count}  ·  Updated ${new Date(repo.updated_at).toLocaleDateString()}`;
      card.append(title, desc, meta);
      grid.append(card);
    });
  } catch (err) {
    $("repoGrid").innerHTML = '<div class="repo-loading">Repository cards could not be loaded right now.</div>';
    $("githubError").textContent = `${err.message} Browse all public repositories directly on GitHub.`;
  }
}
loadGitHub();

// File bytes stay in this browser tab. Only a SHA-256 digest is created.
const fileInput = $("fileInput"), dropZone = $("dropZone"), fileResult = $("fileResult");
let currentHash = "";
let dragDepth = 0;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes, i = -1;
  do { size /= 1024; i++; } while (size >= 1024 && i < units.length - 1);
  return `${size.toFixed(2)} ${units[i]}`;
}

function resetLookup() {
  $("vtLookup").href = "#";
  $("vtLookup").classList.add("disabled");
  $("vtLookup").setAttribute("aria-disabled", "true");
}

async function processFile(file) {
  if (!file) return;
  $("scannerError").textContent = "";
  fileResult.hidden = false;
  $("fileName").textContent = file.name;
  $("fileSize").textContent = formatBytes(file.size);
  $("hashValue").textContent = "Calculating SHA-256…";
  $("hashStatus").textContent = "WORKING";
  currentHash = "";
  resetLookup();
  try {
    if (!crypto.subtle) throw new Error("Web Crypto requires HTTPS or localhost. Use the deployed GitHub Pages HTTPS site.");
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    currentHash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    $("hashValue").textContent = currentHash;
    $("hashStatus").textContent = "HASH READY";
    $("vtLookup").href = `https://www.virustotal.com/gui/search/${currentHash}`;
    $("vtLookup").classList.remove("disabled");
    $("vtLookup").setAttribute("aria-disabled", "false");
  } catch (err) {
    $("hashValue").textContent = "Unable to calculate hash";
    $("hashStatus").textContent = "ERROR";
    $("scannerError").textContent = err.message;
  }
}

fileInput.addEventListener("change", e => processFile(e.target.files[0]));

// Stop the browser from opening files dropped anywhere outside the drop zone.
["dragover", "drop"].forEach(type => window.addEventListener(type, e => e.preventDefault()));
dropZone.addEventListener("dragover", e => e.preventDefault());
dropZone.addEventListener("dragenter", e => {
  e.preventDefault();
  dragDepth++;
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", e => {
  e.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dragDepth = 0;
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) processFile(file);
});

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.append(ta);
  ta.select();
  const ok = document.execCommand("copy");
  ta.remove();
  if (!ok) throw new Error("Copy failed.");
}

$("copyHash").addEventListener("click", async () => {
  if (!currentHash) return;
  try {
    await copyText(currentHash);
    $("copyHash").textContent = "COPIED";
    setTimeout(() => $("copyHash").textContent = "COPY", 1500);
  } catch {
    $("scannerError").textContent = "Clipboard access was blocked by your browser.";
  }
});

$("resetFile").addEventListener("click", () => {
  fileInput.value = "";
  currentHash = "";
  fileResult.hidden = true;
  $("scannerError").textContent = "";
  $("hashValue").textContent = "—";
  $("hashStatus").textContent = "";
  resetLookup();
});
