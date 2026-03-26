// ============================================================
// PROJECTS VIEW — Landing page with project cards
// Campaigns, events, initiatives — proactive work
// ============================================================

import { filterAlumni } from '../utils/helpers.js'
import { selectProject, navigate } from '../state.js'

// ── Helpers ──

function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return diff
}

function formatDateRange(start, end) {
  if (!start) return ''
  const s = new Date(start + 'T00:00:00')
  const opts = { month: 'short', day: 'numeric' }
  const startStr = s.toLocaleDateString('en-US', opts)
  if (!end) return startStr
  const e = new Date(end + 'T00:00:00')
  if (s.getMonth() === e.getMonth()) {
    return `${startStr}–${e.getDate()}, ${e.getFullYear()}`
  }
  return `${startStr} – ${e.toLocaleDateString('en-US', opts)}, ${e.getFullYear()}`
}

function getAlumniCount(project, alumni) {
  if (!project.filter) return 0
  return filterAlumni(alumni, project.filter, '').length
}

function getTypeLabel(type) {
  const labels = {
    conference: 'Conference',
    reunion: 'Reunion',
    campaign: 'Campaign',
    initiative: 'Initiative',
  }
  return labels[type] || type || 'Project'
}

function getTypeColor(type) {
  const colors = {
    conference: 'var(--burgundy)',
    reunion: 'var(--gold)',
    campaign: 'var(--green)',
    initiative: 'var(--blue-500)',
  }
  return colors[type] || 'var(--gray-500)'
}

// ── Render ──

export function renderProjects(state) {
  const { projects, alumni } = state

  if (projects.length === 0) {
    return `
      <div class="mb-6">
        <h1 class="text-2xl font-bold" style="color:var(--gray-900)">Projects</h1>
        <p class="text-sm text-gray-400">Campaigns, events, and initiatives</p>
      </div>
      <div class="card" style="padding:48px 24px;text-align:center">
        <div style="font-size:32px;margin-bottom:12px">📁</div>
        <h3 class="text-base font-bold mb-2" style="color:var(--gray-900)">No Projects Yet</h3>
        <p class="text-sm text-gray-400" style="max-width:400px;margin:0 auto">Projects organize your proactive outreach — conferences, reunions, campaigns. Data will appear here when project records are loaded.</p>
      </div>
    `
  }

  const cards = projects.map((p, i) => renderProjectCard(p, alumni, i)).join('')

  return `
    <div class="mb-6">
      <h1 class="text-2xl font-bold" style="color:var(--gray-900)">Projects</h1>
      <p class="text-sm text-gray-400">${projects.length} active project${projects.length !== 1 ? 's' : ''} — campaigns, events, and initiatives</p>
    </div>
    <div class="space-y-3">${cards}</div>
  `
}

function renderProjectCard(project, alumni, index) {
  const alumniCount = getAlumniCount(project, alumni)
  const days = daysUntil(project.date_range?.start)
  const dateRange = formatDateRange(project.date_range?.start, project.date_range?.end)
  const typeLabel = getTypeLabel(project.type)
  const typeColor = getTypeColor(project.type)
  const checklist = project.checklist || []
  const doneCount = checklist.filter(c => c.done).length

  const countdown = days !== null && days >= 0
    ? `<div style="display:flex;align-items:center;gap:6px">
        <span class="text-2xl font-bold" style="color:var(--burgundy)">${days}</span>
        <span class="text-xs text-gray-400" style="line-height:1.2">days<br>away</span>
      </div>`
    : days !== null && days < 0
    ? `<span class="text-xs font-bold" style="color:var(--gray-400)">Past</span>`
    : ''

  const checklistBar = checklist.length > 0
    ? `<div style="display:flex;align-items:center;gap:8px;margin-top:8px">
        <div style="flex:1;height:4px;background:var(--gray-100);border-radius:2px;overflow:hidden">
          <div style="width:${Math.round(doneCount / checklist.length * 100)}%;height:100%;background:var(--green);border-radius:2px"></div>
        </div>
        <span class="text-xs text-gray-400">${doneCount}/${checklist.length}</span>
      </div>`
    : ''

  return `
    <button class="w-full card card-hover animate-fade-up" style="text-align:left;padding:20px;animation-delay:${index * 0.05}s"
      data-action="open-project" data-project-id="${project.id}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${typeColor};flex-shrink:0"></span>
            <span class="text-xs font-bold" style="color:${typeColor};text-transform:uppercase;letter-spacing:0.05em">${typeLabel}</span>
          </div>
          <h3 class="text-base font-bold mb-1" style="color:var(--gray-900)">${project.name}</h3>
          <p class="text-sm text-gray-400">${dateRange}${project.location ? ' &middot; ' + project.location : ''}</p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px">
            <span class="text-xs text-gray-500">
              <strong style="color:var(--gray-800)">${alumniCount}</strong> alumni matched
            </span>
            ${project.alumni_status ? `<span class="text-xs text-gray-500"><strong style="color:var(--gray-800)">${Object.values(project.alumni_status).filter(s => s === 'invited' || s === 'confirmed').length}</strong> invited</span>` : ''}
          </div>
          ${checklistBar}
        </div>
        ${countdown}
      </div>
    </button>`
}

// ── Events ──

export function wireProjectsEvents(state) {
  document.querySelectorAll('[data-action="open-project"]').forEach(el => {
    el.addEventListener('click', () => {
      selectProject(el.dataset.projectId)
    })
  })
}
