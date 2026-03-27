// ============================================================
// OUTREACH PANEL — slide-in draft composer
// mailto: send, copy to clipboard, mark as sent
// ============================================================

import { closeOutreach, markOutreachSent } from '../state.js'
import { renderHumanReviewsBadge } from '../components.js'

// Module-scoped transient state
let copied = false
let sent = false

// ── Helpers ──

function buildMailtoUrl(email, subject, body) {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// ── Render ──

export function renderOutreachPanel(state) {
  const overlay = document.getElementById('outreach-overlay')
  const panel = document.getElementById('outreach-panel')
  if (!overlay || !panel) return

  if (state.outreachPanelOpen && state.outreachDraft) {
    const draft = state.outreachDraft
    copied = false
    sent = false

    const hasEmail = !!draft.email

    overlay.classList.remove('hidden')
    panel.classList.remove('hidden')
    panel.classList.add('animate-slide-in')

    panel.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between" style="padding:16px 24px;border-bottom:1px solid var(--gray-100)">
        <h2 class="text-lg font-bold" style="color:var(--gray-900)">Draft Outreach</h2>
        <button data-action="close-outreach" style="padding:6px;border-radius:8px;transition:background 0.15s" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='transparent'">
          <svg class="icon icon-md" style="color:var(--gray-400)"><use href="./css/icons.svg#x"></use></svg>
        </button>
      </div>

      <!-- Content -->
      <div style="flex:1;overflow-y:auto;padding:20px 24px">
        <div style="margin-bottom:16px">${renderHumanReviewsBadge()}</div>

        <div style="margin-bottom:16px">
          <label class="text-xs font-semibold text-gray-400" style="text-transform:uppercase;letter-spacing:0.05em">To</label>
          <p class="text-sm text-gray-800" style="margin-top:2px">
            ${draft.alumniName}${hasEmail ? `<span class="text-gray-400" style="margin-left:8px">${draft.email}</span>` : '<span style="margin-left:8px;color:var(--red-500);font-size:12px">No email on file</span>'}
          </p>
        </div>

        <div style="margin-bottom:16px">
          <label class="text-xs font-semibold text-gray-400" style="text-transform:uppercase;letter-spacing:0.05em">Subject</label>
          <input type="text" id="outreach-subject" class="input" style="margin-top:2px;font-weight:600"
            value="${(draft.subject || '').replace(/"/g, '&quot;')}">
        </div>

        <div>
          <label class="text-xs font-semibold text-gray-400" style="text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:8px">Message</label>
          <textarea id="outreach-body" class="textarea">${draft.body || ''}</textarea>
          <p class="text-xs text-gray-400" style="margin-top:8px;font-style:italic">
            Draft reflects Dean's office voice. Edit as needed before sending.
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div style="padding:16px 24px;border-top:1px solid var(--gray-100)">
        ${hasEmail ? `
        <!-- Primary: Send Email via mailto: -->
        <a id="outreach-mailto" class="btn btn-primary" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-bottom:8px;text-decoration:none;cursor:pointer" href="#">
          <svg class="icon icon-sm"><use href="./css/icons.svg#send"></use></svg>
          Send Email
        </a>
        <div class="flex items-center gap-2" style="margin-bottom:12px">
          <button id="outreach-copy" class="btn btn-outline" style="flex:1;justify-content:center">
            <svg class="icon icon-sm"><use href="./css/icons.svg#copy"></use></svg>
            <span id="copy-label">Copy to Clipboard</span>
          </button>
          ${draft.alumniId ? `<button id="outreach-send" class="btn btn-outline" style="flex:1;justify-content:center">
            <svg class="icon icon-sm"><use href="./css/icons.svg#check"></use></svg>
            <span id="send-label">Mark as Sent</span>
          </button>` : ''}
        </div>
        ` : `
        <!-- No email: copy only -->
        <div style="background:var(--red-50);border:1px solid var(--red-200);border-radius:8px;padding:12px 16px;margin-bottom:12px">
          <p class="text-xs" style="color:var(--red-600);font-weight:600">No email address on file for this alumnus.</p>
          <p class="text-xs" style="color:var(--red-500);margin-top:4px">Enrichment needed to enable direct sending. You can still copy the draft below.</p>
        </div>
        <div class="flex items-center gap-2" style="margin-bottom:12px">
          <button id="outreach-copy" class="btn btn-outline" style="flex:1;justify-content:center">
            <svg class="icon icon-sm"><use href="./css/icons.svg#copy"></use></svg>
            <span id="copy-label">Copy to Clipboard</span>
          </button>
          ${draft.alumniId && !draft.isGroupTrigger ? `<button id="outreach-send" class="btn btn-outline" style="flex:1;justify-content:center">
            <svg class="icon icon-sm"><use href="./css/icons.svg#check"></use></svg>
            <span id="send-label">Mark as Sent</span>
          </button>` : ''}
        </div>
        `}
        <button data-action="close-outreach" class="w-full text-center text-sm text-gray-400" style="padding:4px;transition:color 0.15s">
          Cancel
        </button>
      </div>
    `

    wireOutreachEvents(draft)
  } else {
    overlay.classList.add('hidden')
    panel.classList.add('hidden')
    panel.classList.remove('animate-slide-in')
  }
}

// ── Events ──

function wireOutreachEvents(draft) {
  // Close buttons
  document.querySelectorAll('[data-action="close-outreach"]').forEach(el =>
    el.addEventListener('click', () => closeOutreachPanel())
  )

  // mailto: send button — reads current subject/body at click time
  const mailtoBtn = document.getElementById('outreach-mailto')
  if (mailtoBtn) {
    mailtoBtn.addEventListener('click', (e) => {
      e.preventDefault()
      const subject = document.getElementById('outreach-subject')?.value || ''
      const body = document.getElementById('outreach-body')?.value || ''
      const url = buildMailtoUrl(draft.email, subject, body)
      window.location.href = url
    })
  }

  // Copy to clipboard
  const copyBtn = document.getElementById('outreach-copy')
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const subject = document.getElementById('outreach-subject')?.value || ''
      const body = document.getElementById('outreach-body')?.value || ''
      const text = `To: ${draft.alumniName}\nSubject: ${subject}\n\n${body}`
      try {
        await navigator.clipboard.writeText(text)
        copied = true
        const label = document.getElementById('copy-label')
        const icon = copyBtn.querySelector('use')
        if (label) label.textContent = 'Copied!'
        if (icon) icon.setAttribute('href', './css/icons.svg#check')
        copyBtn.style.background = 'var(--green-soft)'
        copyBtn.style.color = 'var(--green)'
        copyBtn.style.borderColor = 'var(--green-200)'
        setTimeout(() => {
          if (label) label.textContent = 'Copy to Clipboard'
          if (icon) icon.setAttribute('href', './css/icons.svg#copy')
          copyBtn.style.background = ''
          copyBtn.style.color = ''
          copyBtn.style.borderColor = ''
        }, 2000)
      } catch (e) {
        // Fallback: select text
      }
    })
  }

  // Mark as Sent
  const sendBtn = document.getElementById('outreach-send')
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      if (sent) return
      sent = true
      const label = document.getElementById('send-label')
      const icon = sendBtn.querySelector('use')
      if (label) label.textContent = 'Marked as Sent'
      if (icon) icon.setAttribute('href', './css/icons.svg#check')
      sendBtn.style.background = 'var(--green-soft)'
      sendBtn.style.color = 'var(--green)'
      sendBtn.style.borderColor = 'var(--green-200)'
      setTimeout(() => {
        markOutreachSent(draft.alumniId)
      }, 600)
    })
  }
}

export function closeOutreachPanel() {
  closeOutreach()
}
