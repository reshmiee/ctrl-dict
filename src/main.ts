import './style.css'

interface Term {
  term: string
  letter: string
  definitions: string[]
  note?: string
  types?: { name: string; description: string }[]
  parts?: { name: string; description: string }[]
  example?: string
}

const categories: { id: string; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'database', label: 'Database' },
  { id: 'extensions', label: 'Extensions' },
  { id: 'languages', label: 'Languages' },
]

const sidebar = document.getElementById('sidebar')!
const content = document.getElementById('content')!

let allData: Record<string, Term[]> = {}
let currentCatIndex = 0

async function loadCategory(id: string): Promise<Term[]> {
  const res = await fetch(`/data/${id}.json`)
  return res.json()
}

function groupByLetter(terms: Term[]): Record<string, Term[]> {
  const grouped: Record<string, Term[]> = {}
  for (const term of terms) {
    const l = term.letter.toUpperCase()
    if (!grouped[l]) grouped[l] = []
    grouped[l].push(term)
  }
  return grouped
}

function renderTerm(term: Term): string {
  let html = `<div class="term-block" id="term-${term.term.replace(/\s+/g, '-').toLowerCase()}">`
  html += `<h2 class="term-heading">${term.term}</h2>`

  if (term.definitions && term.definitions.length > 0) {
    for (const def of term.definitions) {
      html += `<div class="def-line"><span class="def-arrow">&gt;</span><span>${def}</span></div>`
    }
  }

  if (term.note) {
    html += `<div class="note-block">note: ${term.note}</div>`
  }

  if (term.types && term.types.length > 0) {
    html += `<ol class="typed-list">`
    for (const t of term.types) {
      html += `<li><strong>${t.name}</strong> — ${t.description}</li>`
    }
    html += `</ol>`
  }

  if (term.parts && term.parts.length > 0) {
    html += `<div class="parts-label">parts:</div><ul class="parts-list">`
    for (const p of term.parts) {
      html += `<li><strong>${p.name}:</strong> ${p.description}</li>`
    }
    html += `</ul>`
  }

  if (term.example) {
    html += `<pre class="example-block">${term.example}</pre>`
  }

  html += `</div>`
  return html
}

function showCategory(index: number) {
  currentCatIndex = index
  const cat = categories[index]
  const terms = allData[cat.id] || []

  // highlight active category in sidebar
  document.querySelectorAll('.cat-header').forEach((el, i) => {
    el.classList.toggle('active-cat', i === index)
  })

  let html = `<h1 class="cat-page-title">${cat.label} Terminologies</h1>`

  const grouped = groupByLetter(terms)
  for (const letter of Object.keys(grouped).sort()) {
    html += `<div class="letter-section">`
    html += `<div class="letter-col">${letter}</div>`
    html += `<div class="terms-col">`
    for (const term of grouped[letter]) {
      html += renderTerm(term)
    }
    html += `</div>`
    html += `</div>`
  }

  // pagination
  const prev = index > 0 ? categories[index - 1] : null
  const next = index < categories.length - 1 ? categories[index + 1] : null

  html += `<div class="pagination">`
  if (prev) {
    html += `<button class="page-btn" data-index="${index - 1}">← ${prev.label}</button>`
  }

  categories.forEach((c, i) => {
    html += `<button class="page-num ${i === index ? 'active-page' : ''}" data-index="${i}">${i + 1}</button>`
  })

  if (next) {
    html += `<button class="page-btn" data-index="${index + 1}">${next.label} →</button>`
  }
  html += `</div>`

  content.innerHTML = html
  content.scrollTop = 0

  // attach pagination click handlers
  content.querySelectorAll('[data-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      showCategory(parseInt((btn as HTMLElement).dataset.index!))
    })
  })
}

function buildSidebar() {
  sidebar.innerHTML = ''

  const box = document.createElement('div')
  box.className = 'sidebar-box'

  const title = document.createElement('div')
  title.className = 'sidebar-box-title'
  title.textContent = 'Terminology Categories'
  box.appendChild(title)

  categories.forEach((cat, index) => {
    const terms = allData[cat.id] || []
    const grouped = groupByLetter(terms)

    const catEl = document.createElement('div')
    catEl.className = 'cat-folder'

    const catHeader = document.createElement('div')
    catHeader.className = 'cat-header'
    catHeader.textContent = cat.label
    catHeader.addEventListener('click', () => showCategory(index))
    catEl.appendChild(catHeader)

    const catBody = document.createElement('div')
    catBody.className = 'cat-body hidden'

    for (const letter of Object.keys(grouped).sort()) {
      const letterEl = document.createElement('div')
      letterEl.className = 'letter-folder'

      const letterHeader = document.createElement('div')
      letterHeader.className = 'letter-header'
      letterHeader.textContent = letter
      letterEl.appendChild(letterHeader)

      const letterBody = document.createElement('div')
      letterBody.className = 'letter-body hidden'

      for (const term of grouped[letter]) {
        const termEl = document.createElement('div')
        termEl.className = 'term-item'
        termEl.textContent = term.term
        termEl.addEventListener('click', () => {
          showCategory(index)
          setTimeout(() => {
            const el = document.getElementById(`term-${term.term.replace(/\s+/g, '-').toLowerCase()}`)
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 50)
        })
        letterBody.appendChild(termEl)
      }

      letterEl.addEventListener('mouseenter', () => {
        letterBody.classList.remove('hidden')
        letterHeader.classList.add('open')
      })
      letterEl.addEventListener('mouseleave', () => {
        letterBody.classList.add('hidden')
        letterHeader.classList.remove('open')
      })

      letterEl.appendChild(letterBody)
      catBody.appendChild(letterEl)
    }

    catEl.addEventListener('mouseenter', () => {
      catBody.classList.remove('hidden')
      catHeader.classList.add('open')
    })
    catEl.addEventListener('mouseleave', () => {
      catBody.classList.add('hidden')
      catHeader.classList.remove('open')
    })

    catEl.appendChild(catBody)
    box.appendChild(catEl)
  })

  sidebar.appendChild(box)
}

function buildDropdown() {
  const search = document.getElementById('search')!
  const wrapper = document.createElement('div')
  wrapper.className = 'search-wrapper'
  search.parentNode!.insertBefore(wrapper, search)
  wrapper.appendChild(search)

  const dropdown = document.createElement('div')
  dropdown.id = 'search-dropdown'
  dropdown.className = 'hidden'
  wrapper.appendChild(dropdown)
  return dropdown
}

async function init() {
  for (const cat of categories) {
    allData[cat.id] = await loadCategory(cat.id)
  }
  buildSidebar()
  showCategory(0)

  const dropdown = buildDropdown()
  const search = document.getElementById('search') as HTMLInputElement

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim()
    if (!q) {
      dropdown.classList.add('hidden')
      dropdown.innerHTML = ''
      return
    }

    const results: { cat: typeof categories[0]; catIndex: number; term: Term }[] = []
    categories.forEach((cat, i) => {
      for (const term of (allData[cat.id] || [])) {
        if (term.term.toLowerCase().includes(q)) {
          results.push({ cat, catIndex: i, term })
        }
      }
    })

    if (results.length === 0) {
      dropdown.innerHTML = `<div class="search-no-result">No results found</div>`
    } else {
      dropdown.innerHTML = results.slice(0, 10).map(r => {
        const preview = r.term.definitions[0] || ''
        const short = preview.length > 80 ? preview.slice(0, 80) + '…' : preview
        return `<div class="search-item" data-cat="${r.catIndex}" data-term="${r.term.term.replace(/\s+/g, '-').toLowerCase()}">
          <div class="search-item-left">
            <span class="search-item-term">${r.term.term}</span>
            <span class="search-item-preview">${short}</span>
          </div>
          <span class="search-item-arrow">→</span>
        </div>`
      }).join('')

      dropdown.querySelectorAll('.search-item').forEach(el => {
        el.addEventListener('click', () => {
          const catIndex = parseInt((el as HTMLElement).dataset.cat!)
          const termId = (el as HTMLElement).dataset.term!
          search.value = ''
          dropdown.classList.add('hidden')
          dropdown.innerHTML = ''
          showCategory(catIndex)
          setTimeout(() => {
            document.getElementById(`term-${termId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 50)
        })
      })
    }

    dropdown.classList.remove('hidden')
  })

  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('#navbar')) {
      dropdown.classList.add('hidden')
    }
  })

  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.add('hidden')
      search.value = ''
    }
    if (e.key === 'Enter') {
      const q = search.value.toLowerCase().trim()
      if (!q) return
      dropdown.classList.add('hidden')

      const results: { cat: typeof categories[0]; catIndex: number; term: Term }[] = []
      categories.forEach((cat, i) => {
        for (const term of (allData[cat.id] || [])) {
          if (term.term.toLowerCase().includes(q)) {
            results.push({ cat, catIndex: i, term })
          }
        }
      })

      let html = `<h1 class="cat-page-title">Search: "${search.value}"</h1>`
      if (results.length === 0) {
        html += `<p style="color:#54595d;font-size:0.85rem;margin-top:12px;">No terms found.</p>`
      } else {
        for (const r of results) {
          html += `<div class="search-result-block">`
          html += `<div class="search-result-cat">${r.cat.label}</div>`
          html += renderTerm(r.term)
          html += `</div>`
        }
      }

      content.innerHTML = html
      content.scrollTop = 0
      search.value = ''
    }
  })
}

init()
