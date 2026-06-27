(() => {
  const legalPaths = new Set([
    "/terms-of-service",
    "/terms-of-service/",
    "/privacy-policy",
    "/privacy-policy/",
    "/accessibility",
    "/accessibility/",
  ]);

  let dialog;
  let frame;
  let title;
  let savedScrollY = 0;

  function ensureDialog() {
    if (dialog) return;

    const style = document.createElement("style");
    style.textContent = `
      .legal-document-dialog {
        width: min(58rem, calc(100vw - 2rem));
        height: min(52rem, calc(100dvh - 2rem));
        max-width: none;
        max-height: none;
        margin: auto;
        padding: 0;
        overflow: hidden;
        border: 1px solid rgba(24, 32, 24, 0.16);
        border-radius: 14px;
        color: #182018;
        background: #f8fafc;
        box-shadow: 0 28px 90px rgba(5, 7, 12, 0.34);
      }
      .legal-document-dialog::backdrop {
        background: rgba(5, 7, 12, 0.68);
        backdrop-filter: blur(6px);
      }
      .legal-document-bar {
        display: flex;
        min-height: 3.5rem;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        border-bottom: 1px solid rgba(24, 32, 24, 0.1);
        padding: 0.65rem 0.75rem 0.65rem 1rem;
        background: #f3f1ea;
      }
      .legal-document-title {
        overflow: hidden;
        color: #242722;
        font: 650 0.9rem/1.2 "Hanken Grotesk Variable", system-ui, sans-serif;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .legal-document-close {
        display: inline-flex;
        min-width: 5.3rem;
        min-height: 2.35rem;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(24, 32, 24, 0.22);
        border-radius: 8px;
        color: #fff;
        background: #20231f;
        font: 650 0.82rem/1 "Hanken Grotesk Variable", system-ui, sans-serif;
        cursor: pointer;
      }
      .legal-document-close:hover,
      .legal-document-close:focus-visible {
        background: #181a17;
      }
      .legal-document-frame {
        display: block;
        width: 100%;
        height: calc(100% - 3.5rem);
        border: 0;
        background: #f8fafc;
      }
      body.legal-document-open {
        position: fixed;
        left: 0;
        width: 100%;
        overflow: hidden;
      }
      @media (max-width: 640px) {
        .legal-document-dialog {
          width: 100vw;
          height: 100dvh;
          border: 0;
          border-radius: 0;
        }
      }
    `;
    document.head.appendChild(style);

    dialog = document.createElement("dialog");
    dialog.className = "legal-document-dialog";
    dialog.setAttribute("aria-labelledby", "legal-document-title");
    dialog.innerHTML = `
      <div class="legal-document-bar">
        <strong class="legal-document-title" id="legal-document-title">Document</strong>
        <button class="legal-document-close" type="button" aria-label="Close document">Close</button>
      </div>
      <iframe class="legal-document-frame" title="Legal document"></iframe>
    `;
    document.body.appendChild(dialog);

    frame = dialog.querySelector(".legal-document-frame");
    title = dialog.querySelector(".legal-document-title");

    dialog.querySelector(".legal-document-close").addEventListener("click", closeDialog);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    window.addEventListener("message", (event) => {
      if (event.origin === window.location.origin && event.data === "close-legal-document") {
        closeDialog();
      }
    });
  }

  function openDialog(url, label) {
    ensureDialog();
    savedScrollY = window.scrollY;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add("legal-document-open");
    title.textContent = label || "Document";
    frame.title = label || "Document";
    frame.src = url;
    dialog.showModal();
    dialog.querySelector(".legal-document-close").focus();
  }

  function closeDialog() {
    if (!dialog?.open) return;
    dialog.close();
    frame.src = "about:blank";
    document.body.classList.remove("legal-document-open");
    document.body.style.top = "";
    window.scrollTo({ top: savedScrollY, behavior: "auto" });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || !legalPaths.has(url.pathname)) return;

    event.preventDefault();
    openDialog(url.pathname, link.textContent.trim());
  });
})();
