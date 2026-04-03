// Natural Earth 50m
const DATA_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson';

// The property key for sovereign state name in the Natural Earth dataset
const NAME_PROP = 'ADMIN';

// Aliases -> canonical name as it appears in the Natural Earth ADMIN field
const ALIASES = {
    'united states': 'United States of America',
    'britain': 'United Kingdom',
    'uae': 'United Arab Emirates',
    'czechia': 'Czech Republic',
    'dr congo': 'Democratic Republic of the Congo',
    'drc': 'Democratic Republic of the Congo',
    "cote d'ivoire": "Ivory Coast",
    'east timor': 'Timor-Leste',
    'timor leste': 'Timor-Leste',
    'trinidad': 'Trinidad and Tobago',
    'burma': 'Myanmar',
    'swaziland': 'eSwatini',
    'holland': 'Netherlands',
    'macedonia': 'North Macedonia',
    'sao tome and principe': 'São Tomé and Príncipe',
    'st lucia': 'Saint Lucia',
    'st vincent': 'Saint Vincent and the Grenadines',
    'vatican city': 'Vatican',
};

// -- Projection constants ---------------------------------------------------

const ASPECT = 2.0;    // width / height ratio for the canvas

// -- State ------------------------------------------------------------------

let W = 0;
let H = 0;
let features    = [];
let nameIndex   = {};   // normalized name -> feature
let foundSet    = new Set();
let foundCount  = 0;
let gaveUp      = false;
let flashFeature = null;
let flashTimer   = null;
let feedTimer    = null;
let transform = { x: 0, y: -200, scale: 1 };
let drag      = { active: false, sx: 0, sy: 0, tx: 0, ty: 0 };
let cachedPaths  = {
    default: new Path2D(),
    found: new Path2D(),
    missed: new Path2D()
};

// -- DOM refs ---------------------------------------------------------------

const canvas       = document.getElementById('map');
const ctx          = canvas.getContext('2d');
const input        = document.getElementById('country-input');
const countEl      = document.getElementById('count');
const totalEl      = document.getElementById('total');
const feedEl       = document.getElementById('feedback');
const loadEl       = document.getElementById('loading');
const resetBtn     = document.getElementById('reset-btn');
const giveUpBtn    = document.getElementById('give-up-btn');
const continentPanel = document.getElementById('continent-panel');

// -- Utilities --------------------------------------------------------------

function norm(s) {
    return s.toLowerCase().trim();
}

function resolveGuess(raw) {
    return norm(ALIASES[raw] || raw);
}

// -- Canvas / projection ----------------------------------------------------

function initCanvas() {
    W = canvas.parentElement.clientWidth;
    H = Math.round(W / ASPECT);
    canvas.width  = W;
    canvas.height = H;
}

// Mercator projection
// x: longitude [-180, 180] maps to [0, W]
// y: latitude projected with the same W-based scale, centred vertically
function mercator(lon, lat) {
    const x = (lon + 180) / 360 * W;
    const s = Math.sin(lat * Math.PI / 180);
    const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * W;
    return [x, y];
}

// Build a Path2D for a single feature's geometry, projected into canvas space.
// Called once per feature at load time
function buildPath2D(geom) {
    const path = new Path2D();
    if (!geom) return path;

    const addRings = (rings) => {
        rings.forEach((ring) => {
            ring.forEach(([lon, lat], i) => {
                const [x, y] = mercator(lon, lat);
                i === 0 ? path.moveTo(x, y) : path.lineTo(x, y);
            });
            path.closePath();
        });
    };

    if (geom.type === 'Polygon') {
        addRings(geom.coordinates);
    }
    if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach(addRings);
    }

    return path;
}

// Pre-compute Path2D objects for every feature. Must be called after
// initCanvas() since mercator() depends on W, and re-called on resize.
function buildPaths() {
    features.forEach((f) => {
        f._path = buildPath2D(f.geometry);
    });
}

function rebuildCachedPaths() {
    cachedPaths.default = new Path2D();
    cachedPaths.found = new Path2D();
    cachedPaths.missed = new Path2D();
    features.forEach((f) => {
        if (foundSet.has(f._key)) {
            cachedPaths.found.addPath(f._path);
        } else if (gaveUp) {
            cachedPaths.missed.addPath(f._path);
        } else {
            cachedPaths.default.addPath(f._path);
        }
    });
}

function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);
    console.log(transform.scale);

    const lw = 0.8 / transform.scale;
    ctx.lineWidth = lw;

    // 1. Draw Default (Blue)
    ctx.fillStyle = '#2a3042'; ctx.strokeStyle = '#3d4560';
    ctx.fill(cachedPaths.default, 'evenodd'); ctx.stroke(cachedPaths.default);

    // 2. Draw Found (Green)
    ctx.fillStyle = '#2ecc71'; ctx.strokeStyle = '#27ae60';
    ctx.fill(cachedPaths.found, 'evenodd'); ctx.stroke(cachedPaths.found);

    // 3. Draw Missed (Red - only if gaveUp is true)
    if (gaveUp) {
        ctx.fillStyle = '#c0392b'; ctx.strokeStyle = '#922b21';
        ctx.fill(cachedPaths.missed, 'evenodd'); ctx.stroke(cachedPaths.missed);
    }

    // 4. Draw Flash (Yellow - dynamic)
    if (flashFeature) {
        ctx.fillStyle = '#f9e04b'; ctx.strokeStyle = '#d4c240';
        ctx.fill(flashFeature._path, 'evenodd'); ctx.stroke(flashFeature._path);
    }
    ctx.restore();
}

// -- Flash animation --------------------------------------------------------

function doFlash(feature) {
    clearTimeout(flashTimer);
    flashFeature = feature;
    render();
    flashTimer = setTimeout(() => {
        flashFeature = null;
        render();
    }, 700);
}

// -- Feedback bar -----------------------------------------------------------

function showFeedback(text, color) {
    clearTimeout(feedTimer);
    feedEl.textContent = text;
    feedEl.style.color = color;
    feedTimer = setTimeout(() => {
        feedEl.textContent = '';
    }, 2000);
}

// -- Continent panel --------------------------------------------------------

function buildContinentPanel() {
    continentPanel.innerHTML = '';

    // Group features by their CONTINENT property from the geodata
    const groups = {};
    features.forEach((f) => {
        const continent = f.properties.CONTINENT || 'Other';
        if (!groups[continent]) groups[continent] = [];
        groups[continent].push(f);
    });

    // Render in sorted continent order, countries alphabetically within each
    Object.keys(groups).sort().forEach((continent) => {
        const countries = groups[continent].slice().sort((a, b) =>
            a._label.localeCompare(b._label)
        );

        const id = continent.replace(/\s+/g, '-');

        const block = document.createElement('div');
        block.className = 'continent-block';
        block.dataset.continent = continent;

        const header = document.createElement('div');
        header.className = 'continent-header';

        const nameEl = document.createElement('span');
        nameEl.className = 'continent-name';
        nameEl.textContent = continent;

        const progressEl = document.createElement('span');
        progressEl.className = 'continent-progress';
        progressEl.id = `progress-${id}`;
        progressEl.textContent = `0 / ${countries.length}`;

        header.appendChild(nameEl);
        header.appendChild(progressEl);

        const grid = document.createElement('div');
        grid.className = 'country-grid';
        grid.id = `grid-${id}`;

        countries.forEach((f) => {
            const pill = document.createElement('span');
            pill.className = 'country-pill';
            pill.textContent = f._label;
            pill.dataset.country = f._key;
            grid.appendChild(pill);
        });

        block.appendChild(header);
        block.appendChild(grid);
        continentPanel.appendChild(block);
    });
}

function revealPill(key) {
    const pill = document.querySelector(`.country-pill[data-country="${key}"]`);
    if (pill) {
        pill.classList.add('found');
    }
}

function missedPill(key) {
    const pill = document.querySelector(`.country-pill[data-country="${key}"]`);
    if (pill) {
        pill.classList.add('missed');
    }
}

function updateContinentProgress(key) {
    const pill = document.querySelector(`.country-pill[data-country="${key}"]`);
    if (!pill) return;

    const grid = pill.closest('.country-grid');
    if (!grid) return;

    const block  = grid.closest('.continent-block');
    const id     = block.dataset.continent.replace(/\s+/g, '-');
    const found  = grid.querySelectorAll('.country-pill.found').length;
    const total  = grid.querySelectorAll('.country-pill').length;
    const progEl = document.getElementById(`progress-${id}`);
    if (progEl) progEl.textContent = `${found} / ${total}`;
}

// -- Input handler ----------------------------------------------------------

input.addEventListener('input', (e) => {
    if (gaveUp) return;

    const raw  = norm(e.target.value);
    if (!raw) return;

    const key  = resolveGuess(raw);
    const feat = nameIndex[key];

    if (feat && !foundSet.has(feat._key)) {
        foundSet.add(feat._key);
        foundCount++;
        rebuildCachedPaths();
        countEl.textContent = foundCount;

        showFeedback('+1  ' + feat._label, '#2ecc71');
        doFlash(feat);
        setTimeout(() => render(), 750);

        revealPill(feat._key);
        updateContinentProgress(feat._key);

        e.target.value = '';

        if (foundCount === features.length) {
            showFeedback('You got them all!', '#f9e04b');
        }
    }
});

// -- Give up ----------------------------------------------------------------

giveUpBtn.addEventListener('click', () => {
    if (gaveUp) return;
    gaveUp = true;
    input.disabled     = true;
    giveUpBtn.disabled = true;

    features.forEach((f) => {
        if (!foundSet.has(f._key)) {
            missedPill(f._key);
            updateContinentProgress(f._key);
        }
    });

    showFeedback(
        `${foundCount} / ${features.length} - missed ${features.length - foundCount}`,
        '#e07b39'
    );

    rebuildCachedPaths();
    render();
});

// -- Reset ------------------------------------------------------------------

resetBtn.addEventListener('click', () => {
    foundSet.clear();
    foundCount = 0;
    gaveUp     = false;

    countEl.textContent = 0;
    feedEl.textContent  = '';
    input.disabled      = false;
    input.value         = '';
    giveUpBtn.disabled  = false;

    // Reset all pills
    document.querySelectorAll('.country-pill').forEach((pill) => {
        pill.classList.remove('found', 'missed');
    });

    // Reset all progress counters from DOM
    document.querySelectorAll('.continent-block').forEach((block) => {
        const id     = block.dataset.continent.replace(/\s+/g, '-');
        const total  = block.querySelectorAll('.country-pill').length;
        const progEl = document.getElementById(`progress-${id}`);
        if (progEl) progEl.textContent = `0 / ${total}`;
    });

    rebuildCachedPaths();
    render();
    input.focus();
});

// -- Pan / zoom -------------------------------------------------------------

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect  = canvas.getBoundingClientRect();
    const mx    = (e.clientX - rect.left) * (W / rect.width);
    const my    = (e.clientY - rect.top)  * (H / rect.height);
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    transform.x     = mx + (transform.x - mx) * delta;
    transform.y     = my + (transform.y - my) * delta;
    transform.scale *= delta;
    render();
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    drag.active = true;
    drag.sx = e.clientX;
    drag.sy = e.clientY;
    drag.tx = transform.x;
    drag.ty = transform.y;
    canvas.classList.add('dragging');
});

window.addEventListener('mousemove', (e) => {
    if (!drag.active) return;
    transform.x = drag.tx + (e.clientX - drag.sx);
    transform.y = drag.ty + (e.clientY - drag.sy);
    render();
});

window.addEventListener('mouseup', () => {
    drag.active = false;
    canvas.classList.remove('dragging');
});

window.addEventListener('resize', () => {
    initCanvas();
    render();
});

// -- Init -------------------------------------------------------------------

async function init() {
    initCanvas();

    try {
        const res = await fetch(DATA_URL);
        const geo = await res.json();

        features = geo.features.map((f) => {
            const p = f.properties || {};
            const label = p['ADMIN'] || p['FORMAL_EN'] || '';
            f._label = label;
            f._key   = norm(label);
            return f;
        }).filter((f) => f._key);

        buildPaths();
        rebuildCachedPaths();

        nameIndex = {};
        features.forEach((f) => {
            const p = f.properties;

            nameIndex[f._key] = f;

            const possibleProperties = ['NAME', 'NAME_LONG', 'NAME_EN', 'FORMAL_EN', 'ADMIN', 'NAME_SORT'];
            possibleProperties.forEach(prop => {
                if (p[prop]) {
                    nameIndex[norm(p[prop])] = f;
                }
            });
        });

        // Register aliases
        Object.entries(ALIASES).forEach(([alias, canonical]) => {
            const k = norm(canonical);
            if (nameIndex[k]) {
                nameIndex[norm(alias)] = nameIndex[k];
            }
        });

        buildContinentPanel();

        totalEl.textContent  = features.length;
        loadEl.style.display = 'none';
        input.disabled       = false;
        resetBtn.disabled    = false;
        giveUpBtn.disabled   = false;
        input.focus();
        render();
    } catch (err) {
        loadEl.textContent = 'failed to load - check your connection';
        console.error(err);
    }
}

init();
