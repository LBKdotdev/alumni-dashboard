// ============================================================
// APP — Hash router + event delegation + data init
// Vanilla port of React App.jsx + main.jsx
// ============================================================

import { initState, getState, onRender, navigate, navigateDirectorySearch } from './state.js'
import { getInitials } from './utils/helpers.js'
import { renderQueue, wireQueueEvents } from './views/queue.js'
import { renderDirectory, wireDirectoryEvents } from './views/directory.js'
import { renderProfile, wireProfileEvents } from './views/profile.js'
import { renderDashboard, wireDashboardEvents } from './views/dashboard.js'
import { renderProjects, wireProjectsEvents } from './views/projects.js'
import { renderOutreachPanel, closeOutreachPanel } from './panels/outreach.js'

// ── Data Init ──

async function loadData() {
  let alumni, triggers, projects

  // Try API endpoint first (for when deployed with Worker)
  try {
    const res = await fetch('./api/data')
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json()
      if (data.alumni) {
        alumni = data.alumni
        triggers = data.triggers || []
        projects = data.projects || []
        console.log(`[Alumni Engine] Loaded ${alumni.length} records from API`)
      }
    }
  } catch (e) {
    // API not available — fall through to static files
  }

  // Fall back to static JSON
  if (!alumni) {
    try {
      const [alumniRes, triggersRes, projectsRes] = await Promise.all([
        fetch('./data/alumni.json'),
        fetch('./data/triggers.json'),
        fetch('./data/projects.json').catch(() => ({ json: () => [] })),
      ])
      alumni = await alumniRes.json()
      triggers = await triggersRes.json()
      projects = await projectsRes.json()
      console.log(`[Alumni Engine] Loaded ${alumni.length} records, ${projects.length} projects from static JSON`)
    } catch (e) {
      console.error('[Alumni Engine] Failed to load data:', e)
      alumni = []
      triggers = []
      projects = []
    }
  }

  return { alumni, triggers, projects }
}

// ── Render ──

let currentCharts = []

function destroyCharts() {
  currentCharts.forEach(c => c.destroy())
  currentCharts = []
}

export function registerChart(chart) {
  currentCharts.push(chart)
}

function render() {
  const state = getState()
  const root = document.getElementById('root')

  destroyCharts()

  switch (state.currentView) {
    case 'queue':
      root.innerHTML = renderQueue(state)
      break
    case 'profile': {
      const alumni = state.selectedAlumniId
        ? state.alumni.find(a => a.id === state.selectedAlumniId)
        : null
      if (alumni) {
        root.innerHTML = renderProfile(alumni, state)
      } else {
        root.innerHTML = renderQueue(state)
      }
      break
    }
    case 'directory':
      root.innerHTML = renderDirectory(state)
      break
    case 'dashboard':
      root.innerHTML = renderDashboard(state)
      break
    case 'projects':
      root.innerHTML = renderProjects(state)
      break
    default:
      root.innerHTML = renderQueue(state)
  }

  // Update nav active state
  updateNav(state)

  // Update queue badge
  updateQueueBadge(state)

  // Handle outreach panel
  renderOutreachPanel(state)

  // Wire events after render
  wireEvents()
}

function updateNav(state) {
  // Desktop sidebar
  document.querySelectorAll('.sidebar .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.currentView)
  })
  // Mobile nav
  document.querySelectorAll('.mobile-nav .mobile-nav-item[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.currentView)
  })
}

function updateQueueBadge(state) {
  const count = state.queueItems.length
  const badge = document.getElementById('queue-badge')
  const mobileBadge = document.getElementById('mobile-queue-badge')
  if (badge) {
    badge.textContent = count
    badge.classList.toggle('hidden', count === 0)
  }
  if (mobileBadge) {
    mobileBadge.textContent = count
    mobileBadge.classList.toggle('hidden', count === 0)
  }
}

// ── Event Delegation ──

function wireEvents() {
  // View-specific wiring is handled by each view's exported wireEvents function
  // (called from each render function if they export one)
  const state = getState()

  // Wire view-specific events
  switch (state.currentView) {
    case 'queue': wireQueueEvents(state); break
    case 'directory': wireDirectoryEvents(state); break
    case 'profile': wireProfileEvents(state); break
    case 'dashboard': wireDashboardEvents(state); break
    case 'projects': wireProjectsEvents(state); break
  }
}

// ── Global Event Delegation ──

function setupGlobalEvents() {
  // Sidebar nav clicks
  document.querySelectorAll('.sidebar .nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.view))
  })

  // Mobile nav clicks
  document.querySelectorAll('.mobile-nav .mobile-nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.view))
  })

  // Desktop search
  const searchTrigger = document.getElementById('search-trigger')
  const searchActive = document.getElementById('search-active')
  const searchInput = document.getElementById('search-input')
  const searchClose = document.getElementById('search-close')
  const searchResults = document.getElementById('search-results')

  if (searchTrigger) {
    searchTrigger.addEventListener('click', () => {
      searchTrigger.classList.add('hidden')
      searchActive.classList.remove('hidden')
      searchInput.focus()
    })
  }

  if (searchClose) {
    searchClose.addEventListener('click', () => {
      searchInput.value = ''
      searchActive.classList.add('hidden')
      searchTrigger.classList.remove('hidden')
      searchResults.classList.add('hidden')
    })
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderSearchResults(searchInput.value, searchResults, false)
    })
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (!searchInput.value) {
          searchActive.classList.add('hidden')
          searchTrigger.classList.remove('hidden')
          searchResults.classList.add('hidden')
        }
      }, 150)
    })
  }

  // Mobile search
  const mobileSearchBtn = document.getElementById('mobile-search-btn')
  const mobileSearchOverlay = document.getElementById('mobile-search-overlay')
  const mobileSearchInput = document.getElementById('mobile-search-input')
  const mobileSearchClose = document.getElementById('mobile-search-close')
  const mobileSearchResults = document.getElementById('mobile-search-results')

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', () => {
      mobileSearchOverlay.classList.remove('hidden')
      mobileSearchInput.focus()
    })
  }

  if (mobileSearchClose) {
    mobileSearchClose.addEventListener('click', () => {
      mobileSearchOverlay.classList.add('hidden')
      mobileSearchInput.value = ''
    })
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', () => {
      renderSearchResults(mobileSearchInput.value, mobileSearchResults, true)
    })
  }

  // Outreach overlay click to close
  document.getElementById('outreach-overlay')?.addEventListener('click', () => {
    closeOutreachPanel()
  })

  // Hash change routing
  window.addEventListener('hashchange', handleHashChange)
}

function handleHashChange() {
  const hash = location.hash.slice(1) || 'queue'
  const [view, id] = hash.split('/')
  const validViews = ['queue', 'directory', 'profile', 'dashboard', 'projects']
  if (validViews.includes(view)) {
    navigate(view, id || null)
  }
}

function renderSearchResults(query, container, isMobile) {
  const state = getState()
  if (query.length < 2) {
    if (isMobile) {
      container.innerHTML = '<div class="search-empty" style="padding:32px">Type at least 2 characters to search</div>'
    } else {
      container.classList.add('hidden')
    }
    return
  }

  const q = query.toLowerCase()
  const all = state.alumni.filter(a =>
    a.name.toLowerCase().includes(q) ||
    a.professional.specialty.toLowerCase().includes(q) ||
    a.professional.practice_city.toLowerCase().includes(q) ||
    a.professional.practice_state.toLowerCase() === q
  )
  const results = all.slice(0, 5)
  const moreCount = all.length - results.length

  if (all.length === 0) {
    container.innerHTML = '<div class="search-empty">No alumni found</div>'
    container.classList.remove('hidden')
    return
  }

  let html = results.map(a => `
    <button class="search-result-item" data-action="search-select" data-id="${a.id}">
      <div class="search-result-avatar">${getInitials(a.name)}</div>
      <div class="min-w-0">
        <div class="search-result-name truncate">${a.name}</div>
        <div class="search-result-detail truncate">${a.professional.specialty} &middot; ${a.professional.practice_city}, ${a.professional.practice_state}</div>
      </div>
    </button>
  `).join('')

  if (moreCount > 0) {
    html += `<button class="search-more" data-action="search-all" data-query="${query}">View all ${all.length} results in Directory &rarr;</button>`
  }

  container.innerHTML = html
  container.classList.remove('hidden')

  // Wire result clicks
  container.querySelectorAll('[data-action="search-select"]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate('profile', btn.dataset.id)
      // Close search
      const searchInput = document.getElementById('search-input')
      const mobileOverlay = document.getElementById('mobile-search-overlay')
      if (searchInput) searchInput.value = ''
      if (mobileOverlay) mobileOverlay.classList.add('hidden')
      container.classList.add('hidden')
    })
  })
  container.querySelectorAll('[data-action="search-all"]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateDirectorySearch(btn.dataset.query)
      const searchInput = document.getElementById('search-input')
      const mobileOverlay = document.getElementById('mobile-search-overlay')
      if (searchInput) searchInput.value = ''
      if (mobileOverlay) mobileOverlay.classList.add('hidden')
      container.classList.add('hidden')
    })
  })
}

// ── Login Gate ──

const ACCESS_CODE = '2001'

function setupLogin() {
  const gate = document.getElementById('login-gate')
  const input = document.getElementById('login-code')
  const btn = document.getElementById('login-btn')
  const error = document.getElementById('login-error')

  if (!gate || !input || !btn) return false

  // Already authenticated this session
  if (sessionStorage.getItem('alumni_auth') === 'true') {
    gate.classList.add('hidden')
    return true
  }

  function attempt() {
    if (input.value === ACCESS_CODE) {
      sessionStorage.setItem('alumni_auth', 'true')
      gate.style.transition = 'opacity 0.4s ease'
      gate.style.opacity = '0'
      setTimeout(() => gate.classList.add('hidden'), 400)
      startApp()
    } else {
      error.classList.remove('hidden')
      input.value = ''
      input.focus()
      input.style.borderColor = '#f87171'
      setTimeout(() => { input.style.borderColor = ''; }, 1500)
    }
  }

  btn.addEventListener('click', attempt)
  input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt() })
  input.focus()
  return false
}

// ── Boot ──

async function startApp() {
  const { alumni, triggers, projects } = await loadData()
  initState(alumni, triggers, projects)
  onRender(render)
  setupGlobalEvents()
  render()
  console.log('[Alumni Engine] Booted — vanilla v2')
}

function boot() {
  const authenticated = setupLogin()
  if (authenticated) startApp()
}

boot()
