// ============================================================
// PROJECTS VIEW — Landing + Detail with tabbed sections
// Campaigns, events, initiatives — proactive work
// ============================================================

import { filterAlumni, sortAlumni, formatDate, getLastConnection, getEngagementCount } from '../utils/helpers.js'
import { renderAvatar } from '../components.js'
import { selectProject, clearProject, navigate, openOutreach, setAlumniInviteStatus } from '../state.js'

// Module-scoped tab state
let activeTab = 'alumni'
let alumniPageSize = 50
let alumniSortBy = 'enrichment'
let alumniEnrichFilter = 'all'

// ── Helpers ──

function daysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
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

function getProjectAlumni(project, alumni) {
  if (!project.filter) return []
  return filterAlumni(alumni, project.filter, '')
}

function getTypeLabel(type) {
  const labels = { conference: 'Conference', reunion: 'Reunion', campaign: 'Campaign', initiative: 'Initiative' }
  return labels[type] || type || 'Project'
}

function getTypeColor(type) {
  const colors = { conference: 'var(--burgundy)', reunion: 'var(--gold)', campaign: 'var(--green)', initiative: 'var(--blue-500)' }
  return colors[type] || 'var(--gray-500)'
}

// ════════════════════════════════════════════════════════════
// LANDING VIEW — project cards
// ════════════════════════════════════════════════════════════

export function renderProjects(state) {
  const { projects, alumni, selectedProjectId } = state

  // If a project is selected, render the detail view
  if (selectedProjectId) {
    const project = projects.find(p => p.id === selectedProjectId)
    if (project) return renderProjectDetail(project, state)
  }

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
      </div>`
  }

  const cards = projects.map((p, i) => renderProjectCard(p, alumni, i)).join('')
  return `
    <div class="mb-6">
      <h1 class="text-2xl font-bold" style="color:var(--gray-900)">Projects</h1>
      <p class="text-sm text-gray-400">${projects.length} active project${projects.length !== 1 ? 's' : ''} — campaigns, events, and initiatives</p>
    </div>
    <div class="space-y-3">${cards}</div>`
}

function renderProjectCard(project, alumni, index) {
  const matched = getProjectAlumni(project, alumni)
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
      <div class="proj-card-layout">
        <div class="proj-card-body">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${typeColor};flex-shrink:0"></span>
            <span class="text-xs font-bold" style="color:${typeColor};text-transform:uppercase;letter-spacing:0.05em">${typeLabel}</span>
          </div>
          <h3 class="text-base font-bold mb-1" style="color:var(--gray-900)">${project.name}</h3>
          <p class="text-sm text-gray-400">${dateRange}${project.location ? ' &middot; ' + project.location : ''}</p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px">
            <span class="text-xs text-gray-500"><strong style="color:var(--gray-800)">${matched.length}</strong> alumni matched</span>
            ${project.alumni_status ? `<span class="text-xs text-gray-500"><strong style="color:var(--gray-800)">${Object.values(project.alumni_status).filter(s => s === 'invited' || s === 'confirmed').length}</strong> invited</span>` : ''}
          </div>
          ${checklistBar}
        </div>
        ${countdown}
      </div>
    </button>`
}

// ════════════════════════════════════════════════════════════
// DETAIL VIEW — project header + tabbed content
// ════════════════════════════════════════════════════════════

function renderProjectDetail(project, state) {
  const { alumni } = state
  const matched = getProjectAlumni(project, alumni)
  const days = daysUntil(project.date_range?.start)
  const dateRange = formatDateRange(project.date_range?.start, project.date_range?.end)
  const typeLabel = getTypeLabel(project.type)
  const typeColor = getTypeColor(project.type)
  const checklist = project.checklist || []
  const doneCount = checklist.filter(c => c.done).length

  const tabs = [
    { key: 'alumni', label: 'Alumni', count: matched.length },
    { key: 'checklist', label: 'Checklist', count: `${doneCount}/${checklist.length}` },
    { key: 'outreach', label: 'Outreach' },
    { key: 'brief', label: 'Brief' },
  ]

  const tabBar = tabs.map(t => {
    const isActive = activeTab === t.key
    const badge = t.count != null ? `<span style="margin-left:4px;font-size:11px;color:${isActive ? 'var(--burgundy)' : 'var(--gray-400)'}">${t.count}</span>` : ''
    return `<button class="proj-tab${isActive ? ' proj-tab-active' : ''}" data-action="project-tab" data-tab="${t.key}">
      ${t.label}${badge}
    </button>`
  }).join('')

  let tabContent = ''
  switch (activeTab) {
    case 'alumni': tabContent = renderAlumniTab(project, matched); break
    case 'checklist': tabContent = renderChecklistTab(project); break
    case 'outreach': tabContent = renderOutreachTab(project); break
    case 'brief': tabContent = renderBriefTab(project); break
  }

  const countdownBadge = days !== null && days >= 0
    ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(139,34,48,0.08);border:1px solid rgba(139,34,48,0.15);border-radius:20px;padding:4px 12px;font-size:13px;font-weight:700;color:var(--burgundy)">${days} days</span>`
    : ''

  return `
    <!-- Back button -->
    <button class="flex items-center gap-2 mb-4" style="color:var(--gray-500);font-size:13px;background:none;border:none;cursor:pointer;padding:4px 0" data-action="back-to-projects">
      <svg class="icon icon-sm"><use href="./css/icons.svg#arrow-left"></use></svg>
      Projects
    </button>

    <!-- Project header -->
    <div class="card" style="padding:24px;margin-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0">
      <div class="proj-detail-header">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${typeColor}"></span>
            <span class="text-xs font-bold" style="color:${typeColor};text-transform:uppercase;letter-spacing:0.05em">${typeLabel}</span>
          </div>
          <h1 class="text-2xl font-bold" style="color:var(--gray-900);margin-bottom:4px">${project.name}</h1>
          <p class="text-sm text-gray-400">${dateRange}${project.location ? ' &middot; ' + project.location : ''}</p>
          ${project.description ? `<p class="text-sm text-gray-500" style="margin-top:8px;max-width:550px">${project.description}</p>` : ''}
        </div>
        ${countdownBadge}
      </div>
    </div>

    <!-- Tab bar -->
    <div class="proj-tab-bar">${tabBar}</div>

    <!-- Tab content -->
    <div style="margin-top:16px">
      ${tabContent}
    </div>`
}

// ── Alumni Tab ──

function getStatusStyle(status) {
  const styles = {
    invited: { bg: 'rgba(59,130,246,0.08)', color: 'var(--blue-700)', border: 'rgba(59,130,246,0.2)', label: 'Invited' },
    confirmed: { bg: 'rgba(34,197,94,0.08)', color: 'var(--green-700)', border: 'rgba(34,197,94,0.2)', label: 'Confirmed' },
    declined: { bg: 'rgba(239,68,68,0.06)', color: 'var(--red-600)', border: 'rgba(239,68,68,0.15)', label: 'Declined' },
  }
  return styles[status] || null
}

function renderAlumniTab(project, matched) {
  // Apply enrichment filter
  let filtered = matched
  if (alumniEnrichFilter === 'enriched') filtered = matched.filter(a => a.contact.enriched)
  else if (alumniEnrichFilter === 'has_email') filtered = matched.filter(a => a.contact.email)
  else if (alumniEnrichFilter === 'has_website') filtered = matched.filter(a => a.professional.practice_website)
  else if (alumniEnrichFilter === 'not_enriched') filtered = matched.filter(a => !a.contact.enriched)

  const sorted = sortAlumni(filtered, alumniSortBy)

  if (matched.length === 0) {
    return `<div class="card" style="padding:32px;text-align:center">
      <p class="text-sm text-gray-400">No alumni match this project's filter criteria.</p>
    </div>`
  }

  // Enrichment counts (from full matched set, not filtered)
  const enrichedCount = matched.filter(a => a.contact.enriched).length
  const withEmail = matched.filter(a => a.contact.email).length
  const withWebsite = matched.filter(a => a.professional.practice_website).length

  // Status summary
  const statuses = project.alumni_status || {}
  const invited = Object.values(statuses).filter(s => s === 'invited').length
  const confirmed = Object.values(statuses).filter(s => s === 'confirmed').length
  const declined = Object.values(statuses).filter(s => s === 'declined').length
  const noStatus = sorted.length - invited - confirmed - declined

  const statusSummary = (invited + confirmed + declined) > 0
    ? `<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px">
        ${confirmed ? `<span class="text-xs" style="color:var(--green-700)"><strong>${confirmed}</strong> confirmed</span>` : ''}
        ${invited ? `<span class="text-xs" style="color:var(--blue-700)"><strong>${invited}</strong> invited</span>` : ''}
        ${declined ? `<span class="text-xs" style="color:var(--red-600)"><strong>${declined}</strong> declined</span>` : ''}
        ${noStatus ? `<span class="text-xs text-gray-400"><strong>${noStatus}</strong> not yet invited</span>` : ''}
      </div>` : ''

  // Sort + filter bar
  const sortOpts = [
    { key: 'enrichment', label: 'Most Data First' },
    { key: 'name', label: 'Name' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'last_touchpoint', label: 'Last Touchpoint' },
  ].map(o => `<option value="${o.key}" ${alumniSortBy === o.key ? 'selected' : ''}>Sort: ${o.label}</option>`).join('')

  const filterOpts = [
    { key: 'all', label: `All (${matched.length})` },
    { key: 'enriched', label: `Enriched (${enrichedCount})` },
    { key: 'has_email', label: `Has Email (${withEmail})` },
    { key: 'has_website', label: `Has Website (${withWebsite})` },
    { key: 'not_enriched', label: `No Data Yet (${matched.length - enrichedCount})` },
  ].map(o => `<option value="${o.key}" ${alumniEnrichFilter === o.key ? 'selected' : ''}>${o.label}</option>`).join('')

  const controlBar = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <select class="select" data-action="proj-enrich-filter" style="font-size:12px;border-color:rgba(168,85,247,0.3);color:#a855f7">${filterOpts}</select>
      <select class="select" data-action="proj-alumni-sort" style="font-size:12px">${sortOpts}</select>
      <span class="text-xs text-gray-400 ml-auto">Showing ${Math.min(alumniPageSize, sorted.length)} of ${sorted.length}</span>
    </div>`

  const cards = sorted.slice(0, alumniPageSize).map((a, i) => {
    const status = statuses[a.id]
    const sty = getStatusStyle(status)
    const statusBadge = sty
      ? `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:${sty.bg};color:${sty.color};border:1px solid ${sty.border}">${sty.label}</span>`
      : ''
    const lastConn = getLastConnection(a)
    const touchLine = lastConn ? `Connected: ${formatDate(lastConn.date)}` : 'No connection yet'

    // Status dropdown options
    const statusOptions = ['invited', 'confirmed', 'declined'].map(s => {
      const sel = status === s ? 'font-weight:700;' : ''
      return `<option value="${s}" ${status === s ? 'selected' : ''} style="${sel}">${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
    }).join('')

    return `
      <div class="card card-hover proj-alumni-card" style="padding:14px 16px">
        <div class="proj-alumni-info" style="cursor:pointer" data-action="proj-alumni-profile" data-alumni-id="${a.id}">
          <div style="display:flex;align-items:center;gap:8px">
            ${renderAvatar(a.name, 'sm')}
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span class="text-sm font-bold" style="color:var(--gray-900)">${a.name}, ${a.credentials}</span>
                ${statusBadge}
              </div>
              <p class="text-xs text-gray-400">${a.professional.specialty} &middot; ${a.professional.practice_city}${a.professional.practice_name ? ` &middot; ${a.professional.practice_name}` : ''}</p>
              <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap">
                ${a.contact.email ? '<span style="font-size:10px;background:rgba(34,197,94,0.12);color:#4ade80;padding:1px 6px;border-radius:8px;font-weight:600">Email</span>' : ''}
                ${a.professional.practice_website ? '<span style="font-size:10px;background:rgba(111,195,223,0.12);color:#6FC3DF;padding:1px 6px;border-radius:8px;font-weight:600">Website</span>' : ''}
                ${a.professional.google_rating ? `<span style="font-size:10px;background:rgba(212,162,74,0.12);color:var(--gold);padding:1px 6px;border-radius:8px;font-weight:600">★ ${a.professional.google_rating}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="proj-alumni-meta">
          <div style="display:flex;align-items:center;gap:4px">
            <select class="select" style="font-size:11px;padding:3px 6px;min-width:auto;width:auto;border-radius:6px"
              data-action="set-invite-status" data-alumni-id="${a.id}">
              <option value="" ${!status ? 'selected' : ''}>—</option>
              ${statusOptions}
            </select>
            <button class="btn btn-ghost btn-sm" style="padding:3px 6px;font-size:11px" data-action="proj-draft-outreach" data-alumni-id="${a.id}">
              <svg class="icon" style="width:12px;height:12px"><use href="./css/icons.svg#mail"></use></svg>
            </button>
          </div>
          <span class="text-xs text-gray-400">${touchLine}</span>
        </div>
      </div>`
  }).join('')

  const showing = Math.min(alumniPageSize, sorted.length)
  const moreNote = sorted.length > showing
    ? `<div style="text-align:center;padding:16px 0">
        <p class="text-xs text-gray-400" style="margin-bottom:8px">Showing ${showing} of ${sorted.length} alumni</p>
        <button class="btn btn-outline btn-sm" data-action="load-more-alumni">Show ${Math.min(50, sorted.length - showing)} more</button>
      </div>`
    : ''

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <span class="text-sm text-gray-500"><strong style="color:var(--gray-800)">${matched.length}</strong> alumni in ${project.filter?.state || 'filter'}${enrichedCount > 0 ? ` &middot; <span style="color:#a855f7;font-weight:600">${enrichedCount} enriched</span>` : ''}</span>
    </div>
    ${controlBar}
    ${statusSummary}
    <div class="space-y-2">${cards}</div>
    ${moreNote}`
}

// ── Checklist Tab ──

function renderChecklistItem(item, i) {
  const overdue = !item.done && item.due_date && daysUntil(item.due_date) < 0
  const dueSoon = !item.done && item.due_date && daysUntil(item.due_date) >= 0 && daysUntil(item.due_date) <= 3
  const dueColor = overdue ? 'color:var(--red-500);font-weight:600' : dueSoon ? 'color:var(--gold);font-weight:600' : 'color:var(--gray-400)'

  return `
    <div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;${item.done ? 'opacity:0.6' : ''}"
      data-action="toggle-checklist" data-index="${i}">
      <div style="width:20px;height:20px;border-radius:4px;border:2px solid ${item.done ? 'var(--green)' : 'var(--gray-300)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;background:${item.done ? 'var(--green-bg)' : 'transparent'}">
        ${item.done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
      </div>
      <div style="flex:1;min-width:0">
        <span class="text-sm ${item.done ? 'text-gray-400' : ''}" style="${item.done ? 'text-decoration:line-through' : 'color:var(--gray-900)'}">${item.task}</span>
      </div>
      ${item.due_date ? `<span class="text-xs" style="${dueColor}">${formatDate(item.due_date)}</span>` : ''}
    </div>`
}

function renderChecklistTab(project) {
  const checklist = project.checklist || []
  if (checklist.length === 0) {
    return `<div class="card" style="padding:32px;text-align:center">
      <p class="text-sm text-gray-400">No checklist items for this project.</p>
    </div>`
  }

  const hasRoles = checklist.some(c => c.role)
  const doneCount = checklist.filter(c => c.done).length

  const progressBar = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <span class="text-sm text-gray-500"><strong style="color:var(--gray-800)">${doneCount}</strong> of ${checklist.length} complete</span>
      <div style="width:120px;height:6px;background:var(--gray-100);border-radius:3px;overflow:hidden">
        <div style="width:${Math.round(doneCount / checklist.length * 100)}%;height:100%;background:var(--green);border-radius:3px"></div>
      </div>
    </div>`

  if (!hasRoles) {
    return `${progressBar}<div class="space-y-2">${checklist.map((item, i) => renderChecklistItem(item, i)).join('')}</div>`
  }

  const deanItems = checklist.map((item, i) => ({ item, i })).filter(({ item }) => item.role !== 'staff')
  const staffItems = checklist.map((item, i) => ({ item, i })).filter(({ item }) => item.role === 'staff')

  const deanDone = deanItems.filter(({ item }) => item.done).length
  const staffDone = staffItems.filter(({ item }) => item.done).length

  const deanSection = deanItems.length > 0 ? `
    <div style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid var(--burgundy)">
        <span class="text-xs font-bold" style="color:var(--burgundy);text-transform:uppercase;letter-spacing:0.05em">Dean's Checklist</span>
        <span class="text-xs text-gray-400">${deanDone}/${deanItems.length}</span>
      </div>
      <div class="space-y-2">${deanItems.map(({ item, i }) => renderChecklistItem(item, i)).join('')}</div>
    </div>` : ''

  const staffSection = staffItems.length > 0 ? `
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid var(--gray-300)">
        <span class="text-xs font-bold" style="color:var(--gray-500);text-transform:uppercase;letter-spacing:0.05em">Staff / Assistant</span>
        <span class="text-xs text-gray-400">${staffDone}/${staffItems.length}</span>
      </div>
      <div class="space-y-2">${staffItems.map(({ item, i }) => renderChecklistItem(item, i)).join('')}</div>
    </div>` : ''

  return `${progressBar}${deanSection}${staffSection}`
}

// ── Outreach Tab ──

function renderOutreachTab(project) {
  const template = project.outreach_template
  if (!template) {
    return `<div class="card" style="padding:32px;text-align:center">
      <p class="text-sm text-gray-400">No outreach template configured for this project.</p>
    </div>`
  }

  const previewBody = template.body.replace(/\n/g, '<br>').replace(/\{\{last_name\}\}/g, '<span style="color:var(--burgundy);font-weight:600">[Last Name]</span>')

  return `
    <div class="card" style="padding:24px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <svg class="icon icon-sm" style="color:var(--burgundy)"><use href="./css/icons.svg#mail"></use></svg>
        <span class="text-sm font-bold" style="color:var(--gray-900)">Outreach Template</span>
      </div>
      <div style="background:var(--gray-50);border:1px solid var(--gray-100);border-radius:8px;padding:20px">
        <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--gray-100)">
          <span class="text-xs text-gray-400" style="text-transform:uppercase;letter-spacing:0.05em">Subject</span>
          <p class="text-sm font-bold" style="color:var(--gray-900);margin-top:2px">${template.subject}</p>
        </div>
        <div class="text-sm" style="color:var(--gray-700);line-height:1.7">${previewBody}</div>
      </div>
    </div>
    <p class="text-xs text-gray-400" style="text-align:center">Tap an alumni from the Alumni tab, then draft outreach to use this template with their name filled in.</p>`
}

// ── Brief Tab ──

function renderBriefTab(project) {
  if (!project.brief) {
    return `<div class="card" style="padding:32px;text-align:center">
      <p class="text-sm text-gray-400">No intel brief for this project.</p>
    </div>`
  }

  // Simple markdown → HTML (headers, bold, lists, paragraphs)
  const html = project.brief
    .replace(/^## (.+)$/gm, '<h3 style="color:var(--gray-900);font-size:15px;font-weight:700;margin:20px 0 8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--gray-800)">$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;color:var(--gray-600)">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, match => `<ul style="margin:8px 0 12px 16px;list-style:disc">${match}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:8px 0;color:var(--gray-600)">')

  return `
    <div class="card" style="padding:24px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <svg class="icon icon-sm" style="color:var(--burgundy)"><use href="./css/icons.svg#shield"></use></svg>
        <span class="text-sm font-bold" style="color:var(--gray-900)">Intel Brief</span>
      </div>
      <div class="text-sm" style="color:var(--gray-600);line-height:1.7">${html}</div>
    </div>`
}

// ════════════════════════════════════════════════════════════
// EVENTS
// ════════════════════════════════════════════════════════════

export function wireProjectsEvents(state) {
  // Landing: open project
  document.querySelectorAll('[data-action="open-project"]').forEach(el => {
    el.addEventListener('click', () => {
      activeTab = 'alumni'
      alumniPageSize = 50
      alumniSortBy = 'enrichment'
      alumniEnrichFilter = 'all'
      selectProject(el.dataset.projectId)
    })
  })

  // Detail: back to projects list
  document.querySelectorAll('[data-action="back-to-projects"]').forEach(el => {
    el.addEventListener('click', () => clearProject())
  })

  // Detail: tab switching
  document.querySelectorAll('[data-action="project-tab"]').forEach(el => {
    el.addEventListener('click', () => {
      activeTab = el.dataset.tab
      // Re-render by forcing state update
      selectProject(state.selectedProjectId)
    })
  })

  // Detail: alumni profile navigation
  document.querySelectorAll('[data-action="proj-alumni-profile"]').forEach(el => {
    el.addEventListener('click', () => navigate('profile', el.dataset.alumniId))
  })

  // Detail: checklist toggle
  document.querySelectorAll('[data-action="toggle-checklist"]').forEach(el => {
    el.addEventListener('click', () => {
      const project = state.projects.find(p => p.id === state.selectedProjectId)
      if (project?.checklist) {
        const idx = parseInt(el.dataset.index)
        if (idx >= 0 && idx < project.checklist.length) {
          project.checklist[idx].done = !project.checklist[idx].done
          selectProject(state.selectedProjectId) // re-render
        }
      }
    })
  })

  // Detail: invite status change
  document.querySelectorAll('[data-action="set-invite-status"]').forEach(el => {
    el.addEventListener('change', () => {
      setAlumniInviteStatus(state.selectedProjectId, el.dataset.alumniId, el.value || null)
    })
  })

  // Detail: alumni sort
  document.querySelectorAll('[data-action="proj-alumni-sort"]').forEach(el => {
    el.addEventListener('change', () => {
      alumniSortBy = el.value
      alumniPageSize = 50
      selectProject(state.selectedProjectId)
    })
  })

  // Detail: alumni enrichment filter
  document.querySelectorAll('[data-action="proj-enrich-filter"]').forEach(el => {
    el.addEventListener('change', () => {
      alumniEnrichFilter = el.value
      alumniPageSize = 50
      selectProject(state.selectedProjectId)
    })
  })

  // Detail: load more alumni
  document.querySelectorAll('[data-action="load-more-alumni"]').forEach(el => {
    el.addEventListener('click', () => {
      alumniPageSize += 50
      selectProject(state.selectedProjectId)
    })
  })

  // Detail: draft outreach from project template
  document.querySelectorAll('[data-action="proj-draft-outreach"]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation()
      const project = state.projects.find(p => p.id === state.selectedProjectId)
      const alumni = state.alumni.find(a => a.id === el.dataset.alumniId)
      if (!project || !alumni) return
      const template = project.outreach_template
      const lastName = alumni.name.split(',')[0].replace(/^Dr\.\s*/, '')
      openOutreach({
        alumniId: alumni.id,
        alumniName: alumni.name,
        email: alumni.contact?.email || '',
        subject: template?.subject || `${project.name}, Invitation`,
        body: template?.body?.replace(/\{\{last_name\}\}/g, lastName) || `Hi Dr. ${lastName},\n\nI wanted to reach out about ${project.name}. I think you'd be a great fit and I'd love for you to be part of it.\n\nLet me know if you're interested and I'll send over the details.\n\nWarm regards,\nLisa Warren, DO, MBA\nDean, COMP & COMP-Northwest`,
        projectId: project.id,
      })
    })
  })
}
