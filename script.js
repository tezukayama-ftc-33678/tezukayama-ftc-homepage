// Smooth scrolling for navigation links (binds to anchors and avoids duplicate handlers)
function attachSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.dataset.scBound) return;
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
        anchor.dataset.scBound = '1';
    });
}

// initial bind (for static links)
if (document.readyState === 'complete' || document.readyState === 'interactive') attachSmoothScroll();

// Load editable content from content.json (for non-technical maintainers)
async function loadContent() {
    try {
        const resp = await fetch('content.json');
        if (!resp.ok) return;
        const data = await resp.json();

        const set = (id, value, useHTML = false) => {
            const el = document.getElementById(id);
            if (!el || value === undefined) return;
            if (useHTML) el.innerHTML = value;
            else el.textContent = value;
        };

        set('team-number', data.teamNumber);
        set('team-name', data.teamName);
        set('hero-title-text', data.heroTitle);
        set('hero-subtitle', data.heroSubtitle);
        set('hero-description', data.heroDescription, true);

        set('about-title', data.aboutTitle);
            // about: if array provided, render dynamically; otherwise use legacy fields
            if (data.about && Array.isArray(data.about.cards)) {
                renderAbout(data.about.cards);
            } else {
                set('about-mission-title', data.aboutMission && data.aboutMission.title);
                set('about-mission-text', data.aboutMission && data.aboutMission.text, true);
                set('about-values-title', data.aboutValues && data.aboutValues.title);
                set('about-values-text', data.aboutValues && data.aboutValues.text, true);
                set('about-goals-title', data.aboutGoals && data.aboutGoals.title);
                set('about-goals-text', data.aboutGoals && data.aboutGoals.text, true);
            }

        // outreach: render dynamically
        if (data.outreach && Array.isArray(data.outreach.cards)) {
            renderOutreach(data.outreach.cards);
        }

        // sections: render arbitrary sections
        if (data.sections && Array.isArray(data.sections)) {
            renderSections(data.sections);
        }

        // contact
        set('contact-email-title', data.contact.email.title);
        set('contact-email-text', data.contact.email.text);
        set('contact-social-title', data.contact.social.title);
        set('contact-social-text', data.contact.social.text);
        set('contact-team-title', data.contact.team.title);
        set('contact-team-text', data.contact.team.text);

        // footer
        set('footer-team', data.footer.teamName);
        set('footer-copy', data.footer.copy);

        // ensure smooth-scroll bound for any new anchors
        attachSmoothScroll();

    } catch (err) {
        console.error('Unable to load content.json', err);
    }
}

// load content on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
} else {
    loadContent();
}

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards and sections
function observeAnimatedElements() {
    document.querySelectorAll('.about-card, .outreach-card, .robot-info, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// call once for initially present elements
observeAnimatedElements();

// renderOutreach: build outreach cards from JSON
function renderOutreach(cards) {
    const container = document.getElementById('outreach-grid');
    if (!container) return;
    container.innerHTML = '';
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'outreach-card';

        const iconEl = document.createElement('div');
        iconEl.className = 'outreach-icon';
        iconEl.textContent = card.icon || '📚';

        // optional image
        if (card.imageUrl) {
            const img = document.createElement('img');
            img.src = card.imageUrl;
            img.alt = card.title || '';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.marginBottom = '8px';
            cardEl.appendChild(img);
        }

        const titleEl = document.createElement('h3');
        titleEl.textContent = card.title || '';

        const textEl = document.createElement('p');
        textEl.innerHTML = card.text || '';

        cardEl.appendChild(iconEl);
        cardEl.appendChild(titleEl);
        cardEl.appendChild(textEl);

        container.appendChild(cardEl);
    });

    // Observe newly added outreach cards for animation
    document.querySelectorAll('#outreach-grid .outreach-card').forEach(el => {
        // Always show cards immediately - they're part of the main content
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
}

// renderAbout: build about cards from JSON
function renderAbout(cards) {
    const container = document.getElementById('about-content');
    if (!container) return;
    container.innerHTML = '';
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'about-card';

        const iconEl = document.createElement('div');
        iconEl.className = 'card-icon';
        iconEl.textContent = card.icon || '🤖';

        const h3 = document.createElement('h3');
        h3.textContent = card.title || '';

        const p = document.createElement('p');
        p.innerHTML = card.text || '';

        // optional image
        if (card.imageUrl) {
            const img = document.createElement('img');
            img.src = card.imageUrl;
            img.alt = card.title || '';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.marginTop = '8px';
            cardEl.appendChild(img);
        }

        cardEl.appendChild(iconEl);
        cardEl.appendChild(h3);
        cardEl.appendChild(p);

        container.appendChild(cardEl);
    });

    // Observe newly added about cards for animation
    document.querySelectorAll('#about-content .about-card').forEach(el => {
        // Always show cards immediately - they're part of the main content
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
}

// renderSections: build arbitrary sections
function renderSections(sections) {
    const root = document.getElementById('sections-root');
    if (!root) return;
    root.innerHTML = '';
    sections.forEach(sec => {
        const secWrap = document.createElement('div');
        secWrap.className = 'section-block';
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = sec.title || '';
        // assign id so we can link to it from nav
        const key = sec.key || sec.title && sec.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g,'') || Math.random().toString(36).slice(2,8);
        secWrap.id = `sec-${key}`;
        // optional section image
        if (sec.imageUrl) {
            const sImg = document.createElement('img');
            sImg.src = sec.imageUrl;
            sImg.alt = sec.title || '';
            sImg.style.maxWidth = '100%';
            sImg.style.borderRadius = '8px';
            sImg.style.marginBottom = '12px';
            secWrap.appendChild(sImg);
        }

        const grid = document.createElement('div');
        grid.className = 'outreach-grid';

        (sec.cards || []).forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'outreach-card';

            const iconEl = document.createElement('div');
            iconEl.className = 'outreach-icon';
            iconEl.textContent = card.icon || '📌';

            // optional image
            if (card.imageUrl) {
                const img = document.createElement('img');
                img.src = card.imageUrl;
                img.alt = card.title || '';
                img.style.maxWidth = '100%';
                img.style.borderRadius = '8px';
                img.style.marginBottom = '8px';
                cardEl.appendChild(img);
            }

            const titleEl = document.createElement('h3');
            titleEl.textContent = card.title || '';

            const textEl = document.createElement('p');
            textEl.innerHTML = card.text || '';

            cardEl.appendChild(iconEl);
            cardEl.appendChild(titleEl);
            cardEl.appendChild(textEl);
            grid.appendChild(cardEl);
        });

        secWrap.appendChild(title);
        secWrap.appendChild(grid);
        root.appendChild(secWrap);
    });

    // Observe added cards
    document.querySelectorAll('#sections-root .outreach-card').forEach(el => {
        // Always show cards immediately - they're part of the main content
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // update nav: remove previously generated section links, then add links for current sections
    const nav = document.querySelector('.nav-menu');
    if (nav) {
        // remove old generated links
        nav.querySelectorAll('li[data-generated="true"]').forEach(n=>n.remove());
        sections.forEach(sec=>{
            const k = sec.key || sec.title && sec.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g,'') || Math.random().toString(36).slice(2,8);
            const li = document.createElement('li');
            li.dataset.generated = 'true';
            const a = document.createElement('a');
            a.href = `#sec-${k}`;
            a.textContent = sec.title || 'セクション';
            li.appendChild(a);

            // determine insertion position
            // supported: sec.navPosition === 'start'|'end' (default 'end'), or sec.navIndex (number)
            const pos = sec.navPosition;
            const idx = (typeof sec.navIndex === 'number') ? sec.navIndex : (typeof sec.navIndex === 'string' && /^\\d+$/.test(sec.navIndex) ? parseInt(sec.navIndex,10) : null);
            if (pos === 'start') {
                nav.insertBefore(li, nav.firstElementChild);
            } else if (idx !== null && !isNaN(idx)) {
                const children = Array.from(nav.children);
                const clamped = Math.max(0, Math.min(idx, children.length));
                if (children[clamped]) nav.insertBefore(li, children[clamped]); else nav.appendChild(li);
            } else {
                // end/default
                nav.appendChild(li);
            }
        });
    }

    // bind smooth scroll for newly added nav links
    attachSmoothScroll();
}

// Page loaded - body opacity handled by CSS initial state
