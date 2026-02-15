// ========== ScrollReveal ==========
document.addEventListener('DOMContentLoaded', () => {
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '40px',
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        interval: 100,
        reset: false,
    });

    // Section titles
    sr.reveal('.section-title', {
        distance: '30px',
        duration: 700,
    });

    // Cards & elements with data-sr
    sr.reveal('[data-sr]', {
        interval: 120,
    });

    // Hero content
    sr.reveal('.hero-name', {
        origin: 'top',
        distance: '30px',
        duration: 1000,
        delay: 200,
    });

    sr.reveal('.hero-tagline', {
        distance: '20px',
        duration: 900,
        delay: 400,
    });

    sr.reveal('.hero-cta', {
        distance: '20px',
        duration: 900,
        delay: 600,
    });

    // Load blog posts
    loadBlogPosts();
});

// ========== Copy Wallet Address ==========
function copyAddress(elementId) {
    const el = document.getElementById(elementId);
    const text = el.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
        const btn = el.parentElement.querySelector('.copy-btn');
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        }, 2000);
    });
}

// ========== Blog System ==========
let allPosts = [];
let activeTag = null;

async function loadBlogPosts() {
    try {
        const res = await fetch('blog/posts.json');
        if (!res.ok) throw new Error('Failed to load posts');
        allPosts = await res.json();

        // Sort by date (newest first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderTagFilter();
        renderBlogGrid(allPosts);
    } catch (err) {
        console.warn('Blog posts not loaded:', err.message);
        document.getElementById('blog-grid').innerHTML = '';
        document.getElementById('blog-empty').style.display = 'block';
        document.getElementById('blog-empty').querySelector('p').textContent = 'ブログ記事がまだありません';
    }
}

function renderTagFilter() {
    const tagFilter = document.getElementById('tag-filter');
    const allTags = new Set();

    allPosts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag));
        }
    });

    if (allTags.size === 0) return;

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'tag-btn active';
    allBtn.textContent = 'すべて';
    allBtn.addEventListener('click', () => {
        activeTag = null;
        updateTagButtons();
        filterPosts();
    });
    tagFilter.appendChild(allBtn);

    // Tag buttons
    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = tag;
        btn.addEventListener('click', () => {
            activeTag = tag;
            updateTagButtons();
            filterPosts();
        });
        tagFilter.appendChild(btn);
    });
}

function updateTagButtons() {
    const buttons = document.querySelectorAll('.tag-btn');
    buttons.forEach(btn => {
        if (activeTag === null) {
            btn.classList.toggle('active', btn.textContent === 'すべて');
        } else {
            btn.classList.toggle('active', btn.textContent === activeTag);
        }
    });
}

function filterPosts() {
    const query = document.getElementById('blog-search').value.toLowerCase().trim();
    let filtered = allPosts;

    // Tag filter
    if (activeTag) {
        filtered = filtered.filter(post => post.tags && post.tags.includes(activeTag));
    }

    // Search filter
    if (query) {
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(query) ||
            (post.description && post.description.toLowerCase().includes(query))
        );
    }

    renderBlogGrid(filtered);
}

function renderBlogGrid(posts) {
    const grid = document.getElementById('blog-grid');
    const empty = document.getElementById('blog-empty');

    if (posts.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    grid.innerHTML = posts.map(post => `
    <a href="${post.file}" class="blog-card">
      <div class="blog-thumb-wrapper">
        ${post.thumbnail
            ? `<img src="${post.thumbnail}" alt="${post.title}" class="blog-thumb" loading="lazy">`
            : `<div class="blog-thumb-placeholder"><i class="fa-solid fa-feather-pointed"></i></div>`
        }
      </div>
      <div class="blog-card-body">
        <div class="blog-card-date">${formatDate(post.date)}</div>
        <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
        <p class="blog-card-desc">${escapeHtml(post.description || '')}</p>
        <div class="blog-card-tags">
          ${(post.tags || []).map(tag => `<span class="blog-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    </a>
  `).join('');

    // Re-apply ScrollReveal to new cards
    if (typeof ScrollReveal !== 'undefined') {
        ScrollReveal().reveal('.blog-card', {
            origin: 'bottom',
            distance: '30px',
            duration: 600,
            interval: 80,
        });
    }
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== Search Input Event ==========
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => filterPosts(), 250);
        });
    }
});
