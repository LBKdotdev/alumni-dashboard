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

let _focusRestore = null

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

  // Capture focused input before DOM rebuild
  const focused = document.activeElement
  if (focused && focused.id && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) {
    _focusRestore = { id: focused.id, pos: focused.selectionStart }
  }

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
    case 'lookup':
      root.innerHTML = renderLookup(state)
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

  // Restore focus to active input after DOM rebuild
  if (_focusRestore) {
    const el = document.getElementById(_focusRestore.id)
    if (el) {
      el.focus()
      if (typeof el.setSelectionRange === 'function' && _focusRestore.pos != null) {
        el.setSelectionRange(_focusRestore.pos, _focusRestore.pos)
      }
    }
    _focusRestore = null
  }
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

// ── Lookup View ──

function renderLookup(state) {
  return `
    <div style="max-width:600px;margin:0 auto;padding-top:40px">
      <h1 class="text-2xl font-bold" style="color:var(--gray-900);text-align:center;margin-bottom:8px">Quick Lookup</h1>
      <p class="text-sm text-gray-400" style="text-align:center;margin-bottom:24px">Find any alumnus instantly</p>
      <div style="position:relative;margin-bottom:24px">
        <svg class="icon icon-md" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--gray-400)"><use href="./css/icons.svg#search"></use></svg>
        <input type="text" id="lookup-input" class="input" style="padding:16px 16px 16px 48px;font-size:18px;border-radius:16px;width:100%" placeholder="Type a name..." autocomplete="off">
      </div>
      <div id="lookup-results"></div>
    </div>
  `
}

function wireLookupEvents() {
  const input = document.getElementById('lookup-input')
  const results = document.getElementById('lookup-results')
  if (!input || !results) return

  input.focus()

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase()
    if (q.length < 2) {
      results.innerHTML = q.length === 0 ? '' : '<p class="text-sm text-gray-400" style="text-align:center;padding:16px">Keep typing...</p>'
      return
    }
    const state = getState()
    const matches = state.alumni.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.professional.specialty.toLowerCase().includes(q) ||
      a.professional.practice_city.toLowerCase().includes(q)
    ).slice(0, 20)

    if (matches.length === 0) {
      results.innerHTML = '<p class="text-sm text-gray-400" style="text-align:center;padding:16px">No alumni found</p>'
      return
    }

    results.innerHTML = matches.map(a => `
      <button class="card" data-action="lookup-select" data-id="${a.id}" style="width:100%;text-align:left;cursor:pointer;padding:14px 18px;margin-bottom:8px;display:flex;align-items:center;gap:14px;transition:border-color 0.15s">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--burgundy,#8B2230);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0">${getInitials(a.name)}</div>
        <div style="min-width:0;flex:1">
          <div class="font-semibold" style="color:var(--gray-900);font-size:15px">${a.name}, ${a.credentials}</div>
          <div class="text-sm text-gray-500">${a.professional.specialty} &middot; ${a.professional.practice_city}, ${a.professional.practice_state}</div>
        </div>
        <svg class="icon icon-sm" style="color:var(--gray-300);flex-shrink:0"><use href="./css/icons.svg#chevron-right"></use></svg>
      </button>
    `).join('')

    results.querySelectorAll('[data-action="lookup-select"]').forEach(btn =>
      btn.addEventListener('click', () => navigate('profile', btn.dataset.id))
    )
  })
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
    case 'lookup': wireLookupEvents(); break
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
  const validViews = ['queue', 'directory', 'profile', 'dashboard', 'projects', 'lookup']
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
  const limit = isMobile ? 15 : 5
  const results = all.slice(0, limit)
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
const PIN_LENGTH = 4

function setupLogin() {
  const gate = document.getElementById('login-gate')
  const error = document.getElementById('login-error')
  const keypad = document.getElementById('keypad')
  const desktopInput = document.getElementById('login-code')
  const dotsMobile = document.getElementById('pin-dots-mobile')
  const dotsDesktop = document.getElementById('pin-dots-desktop')

  if (!gate) return false

  // Already authenticated this session
  if (sessionStorage.getItem('alumni_auth') === 'true') {
    gate.classList.add('hidden')
    return true
  }

  // ── Shared ──

  function getAllDots() {
    return [...(dotsMobile?.querySelectorAll('.pin-dot') || []), ...(dotsDesktop?.querySelectorAll('.pin-dot') || [])]
  }

  function unlock() {
    sessionStorage.setItem('alumni_auth', 'true')
    getAllDots().forEach(d => d.classList.add('filled'))
    setTimeout(() => {
      gate.style.transition = 'opacity 0.4s ease'
      gate.style.opacity = '0'
      setTimeout(() => gate.classList.add('hidden'), 400)
      startApp()
    }, 300)
  }

  function showError() {
    error.classList.remove('hidden')
    setTimeout(() => error.classList.add('hidden'), 1200)
  }

  // ── Desktop: text input with live dot sync ──

  if (desktopInput) {
    const dDots = dotsDesktop?.querySelectorAll('.pin-dot') || []

    function syncDesktopDots() {
      const len = desktopInput.value.length
      dDots.forEach((dot, i) => dot.classList.toggle('filled', i < len))
    }

    desktopInput.addEventListener('input', () => {
      // Strip non-digits
      desktopInput.value = desktopInput.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
      syncDesktopDots()

      if (desktopInput.value.length === PIN_LENGTH) {
        setTimeout(() => {
          if (desktopInput.value === ACCESS_CODE) {
            unlock()
          } else {
            showError()
            dotsDesktop?.classList.add('error')
            desktopInput.value = ''
            syncDesktopDots()
            setTimeout(() => dotsDesktop?.classList.remove('error'), 600)
          }
        }, 200)
      }
    })

    // Focus on desktop
    if (window.innerWidth >= 768) desktopInput.focus()
  }

  // ── Mobile: keypad ──

  if (keypad && dotsMobile) {
    let mobileCode = ''
    const mDots = dotsMobile.querySelectorAll('.pin-dot')

    function updateMobileDots() {
      mDots.forEach((dot, i) => dot.classList.toggle('filled', i < mobileCode.length))
    }

    function pressKey(key) {
      if (key === 'delete') {
        mobileCode = mobileCode.slice(0, -1)
        error.classList.add('hidden')
        updateMobileDots()
        return
      }
      if (mobileCode.length >= PIN_LENGTH) return

      mobileCode += key
      updateMobileDots()

      if (mobileCode.length === PIN_LENGTH) {
        setTimeout(() => {
          if (mobileCode === ACCESS_CODE) {
            unlock()
          } else {
            showError()
            dotsMobile.classList.add('error')
            mobileCode = ''
            updateMobileDots()
            setTimeout(() => dotsMobile.classList.remove('error'), 600)
          }
        }, 200)
      }
    }

    keypad.querySelectorAll('.key[data-key]').forEach(btn => {
      btn.addEventListener('click', () => pressKey(btn.dataset.key))
    })
  }

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
