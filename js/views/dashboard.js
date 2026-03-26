// ============================================================
// DASHBOARD VIEW — full vanilla port of DashboardView.jsx
// Stat cards, Chart.js bar + pie charts, campus comparison, SOAP
// ============================================================

import { getEngagementCount } from '../utils/helpers.js'
import { renderCampusToggle, renderSOAPCard } from '../components.js'
import { setDashboardCampus, navigate } from '../state.js'
import { registerChart } from '../app.js'

// Brand chart colors
const COLORS = {
  burgundy: '#8b2230',
  gold: '#d4a24a',
  gray: '#9ca3af',
}

// ── Render ──

export function renderDashboard(state) {
  const { alumni, dashboardCampus } = state

  const filtered = dashboardCampus === 'all'
    ? alumni
    : alumni.filter(a => a.campus === dashboardCampus)

  const mentorCount = filtered.filter(a => a.engagement.is_mentor).length
  const donorCount = filtered.filter(a => a.engagement.is_donor).length
  const stateSet = new Set(filtered.map(a => a.professional.practice_state).filter(Boolean))
  const enrichedCount = filtered.filter(a => a.contact.enriched).length
  const withEmail = filtered.filter(a => a.contact.email).length
  const withWebsite = filtered.filter(a => a.professional.practice_website).length

  // Campus comparison data
  const pomona = alumni.filter(a => a.campus === 'pomona')
  const lebanon = alumni.filter(a => a.campus === 'lebanon')
  const hasLebanon = lebanon.length > 0

  const campusComparison = dashboardCampus === 'all' ? `
    <div class="card" style="padding:24px;margin-bottom:32px">
      <h3 class="text-base font-bold mb-4" style="color:var(--gray-900)">Two Campuses, Two Communities</h3>
      <div class="grid grid-2 gap-6">
        ${renderCampusCard('Pomona, CA', pomona.length.toLocaleString(), pomona.filter(a => getEngagementCount(a) > 0).length, pomona.filter(a => a.engagement.is_mentor).length, 'LA / San Diego', '1977')}
        ${hasLebanon
          ? renderCampusCard('Lebanon, OR', lebanon.length.toLocaleString(), lebanon.filter(a => getEngagementCount(a) > 0).length, lebanon.filter(a => a.engagement.is_mentor).length, 'OR / WA / PNW', '2011')
          : renderCampusCardPending('Lebanon, OR', '~2,347', 'OR / WA / PNW', '2011')}
      </div>
    </div>` : ''

  // Lebanon empty state
  const lebanonEmpty = dashboardCampus === 'lebanon' && filtered.length === 0 ? `
    <div class="card" style="padding:48px 24px;text-align:center;margin-bottom:32px">
      <div style="font-size:32px;margin-bottom:12px">🏔️</div>
      <h3 class="text-base font-bold mb-2" style="color:var(--gray-900)">Lebanon Campus — Coming Soon</h3>
      <p class="text-sm text-gray-400" style="max-width:400px;margin:0 auto">COMP-Northwest alumni data hasn't been loaded yet. When Lisa's graduate list is connected, Lebanon records will appear here.</p>
    </div>` : ''

  return `
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold" style="color:var(--gray-900)">Dashboard</h1>
        <p class="text-sm text-gray-400">The big picture — for the board, the president, COCA</p>
      </div>
      ${renderCampusToggle(dashboardCampus, 'dash-campus')}
    </div>

    ${lebanonEmpty}

    <!-- Stat Cards -->
    <div class="grid grid-4 gap-4 mb-8">
      ${renderStatCard('Alumni in Dataset', filtered.length.toLocaleString(), 'Matched via NPI Registry', true)}
      ${renderStatCard('States Represented', stateSet.size || '—', 'Practice locations', false)}
      ${renderStatCard('Active Mentors', mentorCount, 'Currently mentoring students', false)}
      ${renderStatCard('Donors', donorCount, "Contributing to Dean's Fund", false)}
    </div>

    <!-- Enrichment Stats -->
    ${enrichedCount > 0 ? `
    <div class="card" style="padding:20px 24px;margin-bottom:24px;border-left:3px solid #a855f7">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold" style="color:#a855f7">Data Enrichment — Apify Pipeline</h3>
          <p class="text-xs text-gray-400">Public data from Google Maps + practice website scraping</p>
        </div>
        <div class="flex gap-6 text-sm">
          <div class="text-center"><span class="text-lg font-bold" style="color:#a855f7">${enrichedCount}</span><br><span class="text-xs text-gray-400">Enriched</span></div>
          <div class="text-center"><span class="text-lg font-bold" style="color:#4ade80">${withEmail}</span><br><span class="text-xs text-gray-400">Emails</span></div>
          <div class="text-center"><span class="text-lg font-bold" style="color:var(--teal)">${withWebsite}</span><br><span class="text-xs text-gray-400">Websites</span></div>
        </div>
      </div>
    </div>` : ''}

    ${filtered.length > 0 ? `
    <!-- Charts -->
    <div class="grid grid-2 gap-6 mb-8">
      <div class="card" style="padding:24px">
        <h3 class="text-base font-bold mb-4" style="color:var(--gray-900)">Specialty Distribution</h3>
        <p class="text-xs text-gray-400 mb-4">Top 15 specialties from ${filtered.length.toLocaleString()} records</p>
        <div class="chart-wrap chart-wrap-bar">
          <canvas id="specialty-chart"></canvas>
        </div>
      </div>
      <div class="card" style="padding:24px">
        <h3 class="text-base font-bold mb-4" style="color:var(--gray-900)">Engagement Distribution</h3>
        <p class="text-xs text-gray-400 mb-4">Based on engagement checkboxes</p>
        <div class="chart-wrap chart-wrap-pie">
          <canvas id="engagement-chart"></canvas>
        </div>
        <div id="engagement-legend" style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:8px"></div>
      </div>
    </div>` : ''}

    ${campusComparison}

    <!-- SOAP Impact -->
    <div class="mb-8">
      <h3 class="text-base font-bold mb-4" style="color:var(--gray-900)">Impact Stories</h3>
      ${renderSOAPCard()}
    </div>

    <!-- Footer note -->
    <div class="text-center" style="padding:16px 0">
      <p class="text-xs text-gray-400">Showing ${filtered.length.toLocaleString()} records${dashboardCampus !== 'all' ? ' (' + dashboardCampus + ')' : ''}. Full dataset populates when Lisa's graduate list is connected.</p>
    </div>
  `
}

function renderStatCard(label, value, note, accent) {
  const bg = accent
    ? 'background:rgba(139,34,48,0.05);border-color:rgba(139,34,48,0.15)'
    : 'background:var(--surface-raised);box-shadow:0 1px 3px rgba(0,0,0,0.03)'
  const valColor = accent ? 'color:var(--burgundy)' : 'color:var(--gray-800)'

  return `<div class="card" style="padding:20px;${bg}">
    <div class="text-xs font-bold text-gray-400 mb-2" style="text-transform:uppercase;letter-spacing:0.05em;font-size:10px">${label}</div>
    <div class="text-2xl font-bold mb-1" style="${valColor}">${value}</div>
    <div class="text-xs text-gray-400">${note}</div>
  </div>`
}

function renderCampusCard(name, recordCount, engaged, mentors, corridor, founded) {
  const rows = [
    ['Records Loaded', recordCount],
    ['Engaged', engaged],
    ['Active Mentors', mentors],
    ['Primary Corridor', corridor],
    ['Founded', founded],
  ]
  return `<div style="border:1px solid var(--gray-200);border-radius:8px;padding:20px">
    <h4 class="text-lg font-bold mb-3" style="color:var(--burgundy)">${name}</h4>
    <div class="space-y-2">
      ${rows.map(([label, val]) => `
        <div class="flex justify-between text-sm" style="padding:4px 0;border-bottom:1px solid var(--gray-50)">
          <span class="text-gray-400">${label}</span>
          <span class="font-semibold text-gray-800">${val}</span>
        </div>`).join('')}
    </div>
  </div>`
}

function renderCampusCardPending(name, estimated, corridor, founded) {
  return `<div style="border:1px dashed var(--gray-300);border-radius:8px;padding:20px;opacity:0.7">
    <h4 class="text-lg font-bold mb-3" style="color:var(--burgundy)">${name}</h4>
    <div class="space-y-2">
      <div class="flex justify-between text-sm" style="padding:4px 0;border-bottom:1px solid var(--gray-50)">
        <span class="text-gray-400">Est. Alumni</span>
        <span class="font-semibold text-gray-800">${estimated}</span>
      </div>
      <div class="flex justify-between text-sm" style="padding:4px 0;border-bottom:1px solid var(--gray-50)">
        <span class="text-gray-400">Primary Corridor</span>
        <span class="font-semibold text-gray-800">${corridor}</span>
      </div>
      <div class="flex justify-between text-sm" style="padding:4px 0;border-bottom:1px solid var(--gray-50)">
        <span class="text-gray-400">Founded</span>
        <span class="font-semibold text-gray-800">${founded}</span>
      </div>
      <div class="text-xs text-gray-400" style="padding-top:8px;text-align:center;font-style:italic">Data pending — awaiting graduate list</div>
    </div>
  </div>`
}

// ── Chart Creation (called from wireEvents after DOM render) ──

function createCharts(filtered) {
  if (filtered.length === 0) return

  // Specialty distribution — horizontal bar chart
  const specMap = {}
  filtered.forEach(a => {
    const s = a.professional.specialty
    specMap[s] = (specMap[s] || 0) + 1
  })
  const specAll = Object.entries(specMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
  const TOP_N = 15
  const specTop = specAll.slice(0, TOP_N)
  const otherCount = specAll.slice(TOP_N).reduce((sum, d) => sum + d.count, 0)
  const specData = otherCount > 0 ? [...specTop, { name: 'Other', count: otherCount }] : specTop

  const specCanvas = document.getElementById('specialty-chart')
  if (specCanvas) {
    const chart = new Chart(specCanvas, {
      type: 'bar',
      data: {
        labels: specData.map(d => d.name),
        datasets: [{
          data: specData.map(d => d.count),
          backgroundColor: COLORS.burgundy,
          borderRadius: 4,
          barPercentage: 0.7,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { font: { size: 11 }, color: '#9ca3af' },
            grid: { color: '#f0f0f0', drawBorder: false },
          },
          y: {
            ticks: { font: { size: 11 }, color: '#6b7280' },
            grid: { display: false },
          },
        },
      },
    })
    registerChart(chart)
  }

  // Engagement distribution — pie chart
  const engDist = [
    { name: 'Highly Engaged (4+)', value: filtered.filter(a => getEngagementCount(a) >= 4).length, color: COLORS.burgundy },
    { name: 'Moderately Engaged (1-3)', value: filtered.filter(a => { const c = getEngagementCount(a); return c >= 1 && c < 4 }).length, color: COLORS.gold },
    { name: 'Not Yet Engaged', value: filtered.filter(a => getEngagementCount(a) === 0).length, color: COLORS.gray },
  ].filter(d => d.value > 0)

  const engCanvas = document.getElementById('engagement-chart')
  if (engCanvas) {
    const chart = new Chart(engCanvas, {
      type: 'pie',
      data: {
        labels: engDist.map(d => d.name),
        datasets: [{
          data: engDist.map(d => d.value),
          backgroundColor: engDist.map(d => d.color),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.raw}`,
            },
          },
        },
      },
    })
    registerChart(chart)

    // Custom legend
    const legendEl = document.getElementById('engagement-legend')
    if (legendEl) {
      legendEl.innerHTML = engDist.map(d =>
        `<div class="flex items-center gap-2 text-xs text-gray-500">
          <span style="width:10px;height:10px;border-radius:50%;background:${d.color};flex-shrink:0"></span>
          <span class="font-semibold text-gray-800">${d.value}</span>
          <span>${d.name}</span>
        </div>`
      ).join('')
    }
  }
}

// ── Events ──

export function wireDashboardEvents(state) {
  const { alumni, dashboardCampus } = state

  // Campus toggle
  document.querySelectorAll('[data-action="campus-toggle"][data-name="dash-campus"]').forEach(el =>
    el.addEventListener('click', () => setDashboardCampus(el.dataset.value))
  )

  // Navigate links (SOAP card)
  document.querySelectorAll('[data-action="navigate"]').forEach(el =>
    el.addEventListener('click', () => navigate(el.dataset.view, el.dataset.id))
  )

  // Create charts after DOM is ready
  const filtered = dashboardCampus === 'all'
    ? alumni
    : alumni.filter(a => a.campus === dashboardCampus)
  createCharts(filtered)
}
