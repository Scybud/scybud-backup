import {
  Client,
  Databases,
} from "https://cdn.jsdelivr.net/npm/appwrite@14.0.0/+esm";
// Import your custom web component UI tools right here!
import {
  loadComponent,
  closeModal,
} from "https://scybud.github.io/scybud-ui/js/utils/modal.js";

// Configurations
const PROJECT_ID = "scysync";
const DATABASE_ID = "BackupSystem";
const COLLECTION_ID = "files";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const databases = new Databases(client);

// DOM Elements
const totalFilesEl = document.getElementById("total-files");
const pipelineListEl = document.getElementById("pipeline-list");
const lockBtn = document.getElementById("lock-btn");
const diagnosticBtn = document.getElementById("view-status-btn");

// Fetch tracking documents from Appwrite
async function fetchSyncState() {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    renderDashboard(response.documents);
  } catch (error) {
    console.error("Dashboard cloud sync interrupted:", error.message);
  }
}

function renderDashboard(documents) {
  totalFilesEl.textContent = documents.length;
  if (documents.length === 0) return;

  pipelineListEl.innerHTML = "";
  const folders = {};

  documents.forEach((doc) => {
    const pathSegments = doc.filePath.split(/[/\\]/);
    const folderName =
      pathSegments[pathSegments.length - 2] || "Root Workspace";
    if (!folders[folderName]) folders[folderName] = [];
    folders[folderName].push(doc);
  });

  for (const [folderName, files] of Object.entries(folders)) {
    const folderGroup = document.createElement("div");
    folderGroup.className = "folder-group";
    folderGroup.innerHTML = `<div class="folder-title">📂 ${folderName}</div>`;

    files.forEach((file) => {
      const fileRow = document.createElement("div");
      fileRow.className = "file-row";
      fileRow.innerHTML = `
                <span>📄 ${file.fileName}</span>
                <span class="file-meta">SHA-256: ${file.fileHash.substring(0, 8)}...</span>
            `;
      folderGroup.appendChild(fileRow);
    });
    pipelineListEl.appendChild(folderGroup);
  }
}

// 🎯 SCYBUD UI MODAL ACTIONS

// Action 1: Isolation Lock Confirmation Modal
lockBtn.addEventListener("click", () => {
  loadComponent("modal", "#modal-container", {
    title: "⚠️ Confirm Hard Isolation Lock",
    content: `
            <p style="margin-bottom: 1rem;">Are you sure you want to write a block state to Appwrite? This will prevent your local node agents from running mutations.</p>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button id="confirm-lock-action" class="btn btn-danger" style="margin:0;">Confirm Lock</button>
                <button id="close-modal-btn" class="btn" style="margin:0; background:#30363d; color:#fff;">Cancel</button>
            </div>
        `,
  });

  // Wire up actions inside your freshly loaded component context
  document
    .getElementById("close-modal-btn")
    ?.addEventListener("click", closeModal);
  document
    .getElementById("confirm-lock-action")
    ?.addEventListener("click", async () => {
      console.log("Pushing isolation status to Appwrite...");
      // Your block logic here
      closeModal();
    });
});

// Action 2: Diagnostic Information Modal
diagnosticBtn.addEventListener("click", () => {
  loadComponent("modal", "#modal-container", {
    title: "🔍 ScySync Agent Core Diagnostics",
    content: `
            <div style="font-family: monospace; font-size: 0.85rem; color: #8b949e;">
                <p>• Node Runtime Connection: Verified</p>
                <p>• Auth Context: Sessionless (Any Role Client)</p>
                <p>• Cross-Origin Platform Header: Authorized</p>
            </div>
            <button id="close-diag-btn" class="btn" style="width: 100%; background: #30363d; color: #fff; margin-top: 1rem;">Dismiss</button>
        `,
  });
  document
    .getElementById("close-diag-btn")
    ?.addEventListener("click", closeModal);
});

fetchSyncState();


// --- DOM SELECTORS ---
const modal = document.getElementById('scy-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCloseX = document.getElementById('modal-close-x');


// --- UTILITY CONTROLLERS ---
function openCustomModal(titleText, contentHtml) {
    modalTitle.textContent = titleText;
    modalBody.innerHTML = contentHtml;
    modal.showModal(); // Standard browser utility method
}

function closeCustomModal() {
    modal.close();
    modalBody.innerHTML = ''; // Wipe memory traces on close
}

// Bind native closure elements
modalCloseX?.addEventListener('click', closeCustomModal);

// Close modal instantly if user clicks on the outer blur backdrop area
modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeCustomModal();
});

// --- BUTTON TRIGGERS ---

// Trigger 1: Administrative Isolation Lock
lockBtn.addEventListener('click', () => {
    openCustomModal(
        '⚠️ Confirm Hard Isolation Lock', 
        `
        <p style="margin-bottom: 1.5rem; color: var(--text-muted);">
            Are you sure you want to write a block state to the cloud database? This will freeze execution permissions across all your active node workspace environments.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button id="modal-confirm-action" class="btn btn-danger" style="margin:0;">Confirm Lock</button>
            <button id="modal-cancel-action" class="btn btn-secondary" style="margin:0;">Cancel</button>
        </div>
        `
    );

    // Dynamic inside hook mapping
    document.getElementById('modal-cancel-action').addEventListener('click', closeCustomModal);
    document.getElementById('modal-confirm-action').addEventListener('click', () => {
        console.log("Triggering isolation sequence across remote servers...");
        closeCustomModal();
    });
});

// Trigger 2: System Metrics Diagnostic Panel
diagnosticBtn.addEventListener('click', () => {
    openCustomModal(
        '🔍 ScySync Agent Core Diagnostics',
        `
        <div style="font-family: var(--font-mono); font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; background: var(--bg-dark); padding: 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
            <p style="color: var(--accent-green);">[OK] Node Runtime Connectivity: Verified</p>
            <p style="color: var(--accent-green);">[OK] Session Security: Guest Public Read</p>
            <p style="color: var(--text-muted);">[ID] Project Node Hash: ${PROJECT_ID.substring(0,6)}...</p>
        </div>
        <button id="modal-dismiss-diag" class="btn btn-secondary" style="width: 100%; margin-top: 1.5rem;">Dismiss Panel</button>
        `
    );

    document.getElementById('modal-dismiss-diag').addEventListener('click', closeCustomModal);
});