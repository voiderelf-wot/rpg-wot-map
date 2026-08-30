// ============================================================
// TOOL LOGIC — you shouldn't need to edit this to update
// campaign content (that's in data.js). Only touch this
// to change behavior/functionality.
// ============================================================

// VISIBILITY — each knowledge card and each NPC gets
// a stable id and a default visibility (derived from who/pc, or
// "all" = whole party). The GM can override this on the fly,
// right from the tool itself (👁 icon on each card) — syncs via
// Firebase in real time for everyone with the page open, and
// persists across sessions/devices.
// ============================================================
LOCATIONS.forEach(loc => {
  (loc.knowledge || []).forEach((k, i) => {
    k.id = loc.id + '-k' + i;
    if(!k.visibleTo){
      k.visibleTo = (k.pc && PLAYER_CHARS.includes(k.who)) ? [k.who] : ['all'];
    }
  });
  (loc.npcs || []).forEach((n, i) => {
    n.id = loc.id + '-n' + i;
    if(!n.visibleTo) n.visibleTo = ['all'];
  });
});

// In-memory cache, kept in sync by a Firebase listener
// (attachFirebaseListeners, at the end of the file). Reads stay
// synchronous (good for rendering), writes go straight to Firebase.
let visOverridesCache = {};

function saveVisOverride(cardId, vis){
  visOverridesCache[cardId] = vis; // optimistic local update
  db.ref('visibilityOverrides/' + cardId).set(vis);
}
function getVisibility(cardId, defaultVis){
  return visOverridesCache[cardId] || defaultVis;
}
function visLabel(vis){
  return vis.includes('all') ? 'All' : vis.join(', ');
}
function canCurrentUserSee(vis){
  if(!currentUser) return false;
  if(currentUser.char === 'GM') return true;
  return vis.includes('all') || vis.includes(currentUser.char);
}
function visEditorHTML(cardId, vis){
  if(!currentUser || currentUser.char !== 'GM') return '';
  return `<button type="button" class="vis-btn" data-card-id="${cardId}" data-vis="${vis.join(',')}" title="Edit visibility">👁 ${visLabel(vis)}</button>`;
}

function itemsTableHTML(items){
  if(!items || !items.length) return '';
  const rows = items.map(it => `<tr><td>${it.name}</td><td class="item-price">${it.price}</td></tr>`).join('');
  return `<table class="items-table"><tbody>${rows}</tbody></table>`;
}


const mapScroll = document.getElementById('mapScroll');
const mapContent = document.getElementById('mapContent');
const panelBody = document.getElementById('panelBody');
const coordReadout = document.getElementById('coordReadout');
let activeChar = 'all';
let editMode = false;
let currentLocationId = null;
let panelMode = 'location'; // 'location' | 'notes'

function renderPins(){
  document.querySelectorAll('.hotspot').forEach(p => p.remove());
  LOCATIONS.forEach(loc => {
    const hs = document.createElement('div');
    hs.className = 'hotspot';
    hs.style.top = loc.top + '%';
    hs.style.left = loc.left + '%';
    if(loc.size) hs.style.setProperty('--hs-size', loc.size + '%');
    hs.dataset.id = loc.id;
    hs.innerHTML = `<div class="hs-label">${loc.name}</div>`;
    hs.addEventListener('click', (e) => {
      e.stopPropagation();
      if(dragMoved) return;
      selectLocation(loc.id);
    });
    mapContent.appendChild(hs);
  });
}

// ------------------------------------------------------------
// ZOOM (pixel-based to avoid % siring on an auto-sized parent,
// which is what caused the hotspots to drift while zooming)
// ------------------------------------------------------------
const ZOOM_MIN = 40, ZOOM_MAX = 400, ZOOM_STEP = 25;
let zoom = 100;
const zoomLevelEl = document.getElementById('zoomLevel');
const mapImg = document.getElementById('mapImg');
let baseWidthPx = 0; // width in px that corresponds to zoom = 100%

function initZoomBase(){
  // "100%" = image fitted to the visible width of the frame, same as before zoom existed
  baseWidthPx = mapScroll.clientWidth;
  setZoomPx(baseWidthPx * (zoom / 100));
}

function setZoomPx(px){
  mapImg.style.width = px + 'px';
}

function applyZoom(centerX, centerY){
  const rect = mapScroll.getBoundingClientRect();
  const beforeW = mapImg.getBoundingClientRect().width;
  const beforeH = mapImg.getBoundingClientRect().height;
  const scrollLeftBefore = mapScroll.scrollLeft;
  const scrollTopBefore = mapScroll.scrollTop;
  const anchorX = centerX != null ? (centerX - rect.left + scrollLeftBefore) : (scrollLeftBefore + rect.width/2);
  const anchorY = centerY != null ? (centerY - rect.top + scrollTopBefore) : (scrollTopBefore + rect.height/2);
  const ratioX = anchorX / beforeW;
  const ratioY = anchorY / beforeH;

  const newWidthPx = baseWidthPx * (zoom / 100);
  setZoomPx(newWidthPx);
  zoomLevelEl.textContent = zoom + '%';

  requestAnimationFrame(() => {
    const afterW = mapImg.getBoundingClientRect().width;
    const afterH = mapImg.getBoundingClientRect().height;
    mapScroll.scrollLeft = ratioX * afterW - (centerX != null ? (centerX - rect.left) : rect.width/2);
    mapScroll.scrollTop = ratioY * afterH - (centerY != null ? (centerY - rect.top) : rect.height/2);
  });
}

document.getElementById('zoomInBtn').addEventListener('click', () => {
  zoom = Math.min(ZOOM_MAX, zoom + ZOOM_STEP);
  applyZoom();
});
document.getElementById('zoomOutBtn').addEventListener('click', () => {
  zoom = Math.max(ZOOM_MIN, zoom - ZOOM_STEP);
  applyZoom();
});
document.getElementById('zoomResetBtn').addEventListener('click', () => {
  zoom = 100;
  applyZoom();
  mapScroll.scrollTo({left:0, top:0, behavior:'smooth'});
});

mapScroll.addEventListener('wheel', (e) => {
  if(!(e.ctrlKey || e.metaKey)) return; // regular wheel = normal scroll/pan
  e.preventDefault();
  zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)));
  applyZoom(e.clientX, e.clientY);
}, { passive:false });

window.addEventListener('resize', () => {
  // keep "100%" meaning "fits the frame" if the window is resized and user hasn't zoomed
  if(zoom === 100){ initZoomBase(); }
});

// ------------------------------------------------------------
// DRAG TO PAN
// ------------------------------------------------------------
let isDragging = false, dragMoved = false, dragStartX = 0, dragStartY = 0, scrollStartX = 0, scrollStartY = 0;

mapScroll.addEventListener('mousedown', (e) => {
  if(editMode) return;
  if(e.target.closest('.hotspot')) return;
  isDragging = true; dragMoved = false;
  dragStartX = e.clientX; dragStartY = e.clientY;
  scrollStartX = mapScroll.scrollLeft; scrollStartY = mapScroll.scrollTop;
  mapScroll.classList.add('panning');
});
window.addEventListener('mousemove', (e) => {
  if(!isDragging) return;
  const dx = e.clientX - dragStartX, dy = e.clientY - dragStartY;
  if(Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
  mapScroll.scrollLeft = scrollStartX - dx;
  mapScroll.scrollTop = scrollStartY - dy;
});
window.addEventListener('mouseup', () => {
  isDragging = false;
  mapScroll.classList.remove('panning');
  setTimeout(() => { dragMoved = false; }, 0);
});

function selectLocation(id){
  currentLocationId = id;
  panelMode = 'location';
  document.getElementById('tabLocation').classList.add('active');
  document.getElementById('tabDistances').classList.remove('active');
  document.getElementById('tabNotes').classList.remove('active');
  document.querySelectorAll('.hotspot').forEach(p => p.classList.toggle('selected', p.dataset.id === id));
  const loc = LOCATIONS.find(l => l.id === id);
  if(!loc) return;
  panelBody.innerHTML = `
    <p class="loc-eyebrow">Location</p>
    <h2>${loc.name}</h2>
    <p class="loc-desc">${loc.desc}</p>
    <div id="homeBanners"></div>
    <div id="npcSection"></div>
    <div id="cards"></div>
    <div id="partyNotesSection"></div>
  `;
  const homeBannersEl = document.getElementById('homeBanners');
  Object.entries(CHARACTERS).forEach(([name, info]) => {
    if(info.homeLocationId === loc.id){
      const b = document.createElement('div');
      b.className = 'home-banner';
      b.innerHTML = `<span class="home-icon">🏠</span><div><b>${name} is from here</b><span>${info.origemLabel}</span></div>`;
      homeBannersEl.appendChild(b);
    }
  });

  // NPCs & Shops
  if(loc.npcs && loc.npcs.length){
    const npcSection = document.getElementById('npcSection');
    npcSection.innerHTML = `<p class="npc-section-title">NPCs &amp; Shops</p>`;
    loc.npcs.forEach((npc) => {
      const vis = getVisibility(npc.id, npc.visibleTo);
      const row = document.createElement('div');
      row.className = 'npc-row';
      row.dataset.cardId = npc.id;
      row.dataset.vis = vis.join(',');
      const badge = npc.type === 'shop' ? '🛒' : '🧑';
      row.innerHTML = `
        <div class="npc-row-head">
          <span class="npc-badge">${badge}</span>
          <span class="npc-name">${npc.name}</span>
          <span class="npc-role">${npc.role}</span>
          ${visEditorHTML(npc.id, vis)}
          <span class="npc-chevron">▸</span>
        </div>
        <div class="npc-desc"><div class="npc-desc-inner">${npc.desc}${itemsTableHTML(npc.items)}</div></div>
      `;
      row.querySelector('.npc-row-head').addEventListener('click', (e) => {
        if(e.target.closest('.vis-btn')) return;
        row.classList.toggle('open');
      });
      npcSection.appendChild(row);
    });
  }

  const cardsEl = document.getElementById('cards');
  if(loc.knowledge.length){
    cardsEl.innerHTML = `<p class="npc-section-title">📖 Personal Background</p>`;
  }
  loc.knowledge.forEach(k => {
    const vis = getVisibility(k.id, k.visibleTo);
    const card = document.createElement('div');
    card.className = 'know-card' + (k.pc ? ' pc' : '');
    card.dataset.cardId = k.id;
    card.dataset.vis = vis.join(',');
    card.innerHTML = `<div class="who">${k.who} <span class="tag">${k.tag}</span>${visEditorHTML(k.id, vis)}</div><p>${k.text}</p>`;
    cardsEl.appendChild(card);
  });
  applyFilter();
  renderPartyNotesSection(loc.id);
  renderShopCatalog();
}

// ------------------------------------------------------------
// PARTY NOTES — a board per location. Any logged-in character
// can add a note (signed with their name), and everyone sees it
// live, via Firebase Realtime Database.
// ------------------------------------------------------------
let locationNotesCache = {}; // { [locationId]: { [pushId]: {author, text, createdAt} } }

function renderPartyNotesSection(locId){
  const el = document.getElementById('partyNotesSection');
  if(!el) return; // panel may have switched tabs before this arrived
  const notesObj = locationNotesCache[locId] || {};
  const notes = Object.entries(notesObj).sort((a, b) => a[1].createdAt - b[1].createdAt);

  const notesHTML = notes.length
    ? notes.map(([pushId, n]) => {
        const canDelete = currentUser && (currentUser.char === 'GM' || currentUser.char === n.author);
        const delBtn = canDelete ? `<button type="button" class="party-note-del" data-loc-id="${locId}" data-push-id="${pushId}" title="Delete note">🗑</button>` : '';
        return `
        <div class="party-note">
          <div class="party-note-head">
            <div class="pn-left"><b>${n.author}</b><span>${new Date(n.createdAt).toLocaleString('en-US', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span></div>
            ${delBtn}
          </div>
          <p>${n.text}</p>
        </div>`;
      }).join('')
    : `<p class="party-notes-empty">No party notes for this location yet.</p>`;

  el.innerHTML = `
    <p class="npc-section-title">📝 Party Notes</p>
    <div class="party-notes-list">${notesHTML}</div>
    <div class="party-note-form">
      <textarea id="partyNoteInput" placeholder="Add a note about ${LOCATIONS.find(l=>l.id===locId).name}..."></textarea>
      <button type="button" id="partyNoteSubmit">Add note</button>
    </div>
  `;
  document.getElementById('partyNoteSubmit').addEventListener('click', () => {
    const input = document.getElementById('partyNoteInput');
    const text = input.value.trim();
    if(!text || !currentUser) return;
    db.ref('locationNotes/' + locId).push({
      author: currentUser.char,
      text: text,
      createdAt: Date.now()
    });
    input.value = '';
  });
  el.querySelectorAll('.party-note-del').forEach(btn => {
    btn.addEventListener('click', () => {
      if(!confirm('Delete this note?')) return;
      db.ref('locationNotes/' + btn.dataset.locId + '/' + btn.dataset.pushId).remove();
    });
  });
}

// ------------------------------------------------------------
// NOTES TAB — a private personal notebook per character. Saved
// to Firebase (personalNotes/{character}), so it syncs across
// different devices logged in as the same character.
// ------------------------------------------------------------
let notesSaveTimeout = null;

function renderNotesTab(){
  panelMode = 'notes';
  document.getElementById('tabNotes').classList.add('active');
  document.getElementById('tabLocation').classList.remove('active');
  document.getElementById('tabDistances').classList.remove('active');

  if(!currentUser){
    panelBody.innerHTML = `<div class="notes-locked"><div class="glyph" style="font-size:26px;opacity:.5;">🔒</div><p>Log in to use your notes.</p></div>`;
    return;
  }
  const who = currentUser.char;

  panelBody.innerHTML = `
    <p class="loc-eyebrow">Personal notebook</p>
    <h2>${who}'s Notes</h2>
    <div class="notes-wrap">
      <textarea id="notesArea" placeholder="Write your notes, theories, clues, anything you want to remember later..." disabled></textarea>
      <div class="notes-status"><span id="notesStatus">loading…</span><span>${who === 'GM' ? 'visible only to the GM' : 'private — only ' + who + ' sees this, syncs across devices'}</span></div>
    </div>
  `;
  const area = document.getElementById('notesArea');
  const status = document.getElementById('notesStatus');

  db.ref('personalNotes/' + who).once('value').then(snap => {
    area.value = (snap.val() && snap.val().text) || '';
    area.disabled = false;
    status.textContent = 'saved';
  });

  area.addEventListener('input', () => {
    status.textContent = 'saving…';
    clearTimeout(notesSaveTimeout);
    notesSaveTimeout = setTimeout(() => {
      db.ref('personalNotes/' + who).set({ text: area.value, updatedAt: Date.now() })
        .then(() => { status.textContent = 'saved'; })
        .catch(() => { status.textContent = 'error saving'; });
    }, 400);
  });
}

document.getElementById('tabLocation').addEventListener('click', () => {
  if(currentLocationId){ selectLocation(currentLocationId); }
  else {
    panelMode = 'location';
    document.getElementById('tabLocation').classList.add('active');
    document.getElementById('tabDistances').classList.remove('active');
    document.getElementById('tabNotes').classList.remove('active');
    panelBody.innerHTML = `<div class="empty-state"><div class="glyph">◈</div><p>Select a point on the map to reveal what the characters know about that place.</p></div>`;
  }
});
document.getElementById('tabNotes').addEventListener('click', renderNotesTab);

// ------------------------------------------------------------
// DISTANCES TAB — canonical straight-line distances (WoT wiki)
// + D&D 5e travel pace conversion.
// ------------------------------------------------------------
const PACES_BASE = [
  { key: "fast",   label: "Fast", milesPerDay: 30, note: "-5 passive Perception" },
  { key: "normal", label: "Normal", milesPerDay: 24, note: "—" },
  { key: "slow",   label: "Slow",  milesPerDay: 18, note: "allows stealth" }
];
// Official D&D 5e speeds (PHB, Mounts and Vehicles table).
// The standard pace table assumes 30ft speed; we scale
// proportionally for the other travel modes.
const TRAVEL_MODES = {
  "a-pe":    { label: "On foot",     speedFt: 30, hint: "Standard human speed" },
  "cavalo":  { label: "On horseback", speedFt: 60, hint: "Riding Horse, 60 ft" },
  "carroca": { label: "By wagon", speedFt: 40, hint: "Pulled by a Draft Horse, 40 ft" }
};

function cityHasPin(cityName){
  return LOCATIONS.some(l => l.distCity === cityName);
}
function pinnedLocationFor(cityName){
  return LOCATIONS.find(l => l.distCity === cityName);
}

function distanceBetween(cityA, cityB){
  const i = DIST_CITIES.indexOf(cityA), j = DIST_CITIES.indexOf(cityB);
  if(i === -1 || j === -1 || i === j) return null;
  return DIST_MATRIX[i][j];
}

function renderDistancesTab(){
  panelMode = 'distances';
  document.getElementById('tabDistances').classList.add('active');
  document.getElementById('tabLocation').classList.remove('active');
  document.getElementById('tabNotes').classList.remove('active');

  const options = DIST_CITIES.map(c => `<option value="${c}">${cityHasPin(c) ? '★ ' : ''}${c}</option>`).join('');

  panelBody.innerHTML = `
    <p class="loc-eyebrow">Calculator</p>
    <h2>Distances</h2>
    <p class="loc-desc">Canonical straight-line distances (wot.fandom.com). ★ = location already pinned on the map.</p>
    <div class="dist-selects">
      <div>
        <label>From</label>
        <select id="distFrom">${options}</select>
      </div>
      <button class="dist-swap" id="distSwap" title="Swap">⇅</button>
      <div>
        <label>To</label>
        <select id="distTo">${options}</select>
      </div>
      <div>
        <label>Travel mode</label>
        <select id="distMode"></select>
      </div>
      <label class="dist-terrain-toggle" id="distTerrainWrap">
        <input type="checkbox" id="distTerrain"> Difficult terrain (doubles travel time)
      </label>
    </div>
    <div id="distResult"></div>
  `;
  const fromSel = document.getElementById('distFrom');
  const toSel = document.getElementById('distTo');
  const modeSel = document.getElementById('distMode');
  const terrainCk = document.getElementById('distTerrain');
  const terrainWrap = document.getElementById('distTerrainWrap');
  toSel.selectedIndex = 1;

  function rebuildModeOptions(){
    const prevValue = modeSel.value;
    const groundOptions = Object.entries(TRAVEL_MODES).map(([key, m]) => `<option value="${key}">${m.label}</option>`).join('');
    const route = findWaterRoute(fromSel.value, toSel.value);
    const waterOption = route ? `<option value="water:${route.mode}">🚤 ${WATER_MODES[route.mode].label} (${route.note})</option>` : '';
    modeSel.innerHTML = groundOptions + waterOption;
    // keep the previous selection if it's still available (e.g. still a valid water route)
    if([...modeSel.options].some(o => o.value === prevValue)) modeSel.value = prevValue;
  }

  function update(){
    const a = fromSel.value, b = toSel.value;
    const resultEl = document.getElementById('distResult');
    if(a === b){
      resultEl.innerHTML = `<div class="dist-none">Choose two different locations.</div>`;
      return;
    }
    const miles = distanceBetween(a, b);
    if(miles == null){
      resultEl.innerHTML = `<div class="dist-none">No canonical data between these two locations.</div>`;
      return;
    }

    const isWater = modeSel.value.startsWith('water:');

    if(isWater){
      terrainWrap.style.display = 'none';
      const waterKey = modeSel.value.split(':')[1];
      const wMode = WATER_MODES[waterKey];
      const route = findWaterRoute(a, b);
      const days = miles / wMode.milesPerDay;
      const daysLabel = days < 1 ? `${Math.ceil(days*24)}h` : `${days.toFixed(1)} days`;
      resultEl.innerHTML = `
        <div class="dist-result">
          <div class="dist-miles">${miles.toLocaleString('en-US')}</div>
          <div class="dist-miles-label">MILES · AS THE CROW FLIES</div>
          <table class="dist-pace-table">
            <tr><th>Route</th><th>Time</th><th></th></tr>
            <tr><td>${wMode.label} (${wMode.milesPerDay} mi/day)</td><td class="days">${daysLabel}</td><td style="color:var(--ink-dim);font-size:11px;">${route ? route.note : ''}</td></tr>
          </table>
        </div>
        <p class="dist-note">${wMode.hint}</p>
      `;
      return;
    }

    terrainWrap.style.display = 'flex';
    const mode = TRAVEL_MODES[modeSel.value];
    const speedMultiplier = mode.speedFt / 30;
    const terrainMultiplier = terrainCk.checked ? 0.5 : 1;

    const rows = PACES_BASE.map(p => {
      const effectiveMilesPerDay = p.milesPerDay * speedMultiplier * terrainMultiplier;
      const days = miles / effectiveMilesPerDay;
      const daysLabel = days < 1 ? `${Math.ceil(days*24)}h` : `${days.toFixed(1)} days`;
      return `<tr><td>${p.label} (${effectiveMilesPerDay.toFixed(1)} mi/day)</td><td class="days">${daysLabel}</td><td style="color:var(--ink-dim);font-size:11px;">${p.note}</td></tr>`;
    }).join('');
    resultEl.innerHTML = `
      <div class="dist-result">
        <div class="dist-miles">${miles.toLocaleString('en-US')}</div>
        <div class="dist-miles-label">MILES · AS THE CROW FLIES</div>
        <table class="dist-pace-table">
          <tr><th>Pace</th><th>Time</th><th></th></tr>
          ${rows}
        </table>
      </div>
      <p class="dist-note">${mode.hint}${terrainCk.checked ? ' · difficult terrain active (half the daily distance, standard D&D 5e rule)' : ''}. Estimated time traveling in a straight line, without stops — actual roads tend to be longer; adjust as the GM sees fit.</p>
    `;
  }

  fromSel.addEventListener('change', () => { rebuildModeOptions(); update(); });
  toSel.addEventListener('change', () => { rebuildModeOptions(); update(); });
  modeSel.addEventListener('change', update);
  terrainCk.addEventListener('change', update);
  document.getElementById('distSwap').addEventListener('click', () => {
    const tmp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = tmp;
    rebuildModeOptions();
    update();
  });
  rebuildModeOptions();
  update();
}
document.getElementById('tabDistances').addEventListener('click', renderDistancesTab);

function applyFilter(){
  // GM logged in with "All" active sees everything, no restriction.
  // In other cases (player, or GM simulating a character via the
  // chips), a card only shows if its visibility includes
  // "all" or the character in question.
  const isGMFull = currentUser && currentUser.char === 'GM' && activeChar === 'all';
  const simChar = currentUser ? (currentUser.char === 'GM' ? activeChar : currentUser.char) : null;

  document.querySelectorAll('.know-card, .npc-row').forEach(el => {
    const vis = (el.dataset.vis || 'all').split(',');
    const show = isGMFull || (simChar && (vis.includes('all') || vis.includes(simChar)));
    el.classList.toggle('hidden-by-filter', !show);
  });
}

// ------------------------------------------------------------
// Visibility editor (only exists on screen when logged in as
// GM). The popover is a single floating element (position:fixed),
// repositioned via JS on each click, so it never gets clipped by
// the panel's internal scroll — it used to live inside the card
// and the browser would cut off the list when it didn't fit.
// ------------------------------------------------------------
const visPopoverEl = document.getElementById('visPopoverFloating');

function closeVisPopover(){
  visPopoverEl.classList.remove('open');
  visPopoverEl.dataset.cardId = '';
}

function openVisPopover(btn){
  const cardId = btn.dataset.cardId;
  const vis = (btn.dataset.vis || 'all').split(',');
  const boxes = PLAYER_CHARS.map(name =>
    `<label><input type="checkbox" value="${name}" ${vis.includes(name) ? 'checked' : ''}> ${name}</label>`
  ).join('');
  visPopoverEl.innerHTML = `
    <label><input type="checkbox" value="all" ${vis.includes('all') ? 'checked' : ''}> All (party)</label>
    <div class="vis-divider"></div>
    ${boxes}
  `;
  visPopoverEl.dataset.cardId = cardId;
  visPopoverEl.classList.add('open');

  // position right below the button, without overflowing the screen's right/bottom edge
  const r = btn.getBoundingClientRect();
  const popW = 170, popH = visPopoverEl.offsetHeight || 160;
  let left = r.left;
  let top = r.bottom + 4;
  if(left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
  if(top + popH > window.innerHeight - 8) top = r.top - popH - 4;
  visPopoverEl.style.left = Math.max(8, left) + 'px';
  visPopoverEl.style.top = Math.max(8, top) + 'px';
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.vis-btn');
  if(btn){
    const wasOpenForThis = visPopoverEl.classList.contains('open') && visPopoverEl.dataset.cardId === btn.dataset.cardId;
    closeVisPopover();
    if(!wasOpenForThis) openVisPopover(btn);
    return;
  }
  if(!e.target.closest('#visPopoverFloating')){
    closeVisPopover();
  }
});
window.addEventListener('scroll', closeVisPopover, true);

document.addEventListener('change', (e) => {
  const cb = e.target.closest('#visPopoverFloating input[type="checkbox"]');
  if(!cb) return;
  const cardId = visPopoverEl.dataset.cardId;
  if(!cardId) return;
  const boxes = Array.from(visPopoverEl.querySelectorAll('input[type="checkbox"]'));
  const allBox = visPopoverEl.querySelector('input[value="all"]');
  let vis;
  if(cb.value === 'all' && cb.checked){
    boxes.forEach(b => { if(b.value !== 'all') b.checked = false; });
    vis = ['all'];
  } else {
    if(cb.value !== 'all' && cb.checked) allBox.checked = false;
    vis = boxes.filter(b => b.checked && b.value !== 'all').map(b => b.value);
    if(vis.length === 0){ allBox.checked = true; vis = ['all']; }
  }
  saveVisOverride(cardId, vis);
  const targetBtn = document.querySelector(`.vis-btn[data-card-id="${cardId}"]`);
  if(targetBtn){
    targetBtn.textContent = '👁 ' + visLabel(vis);
    targetBtn.dataset.vis = vis.join(',');
  }
  const targetEl = document.querySelector(`[data-card-id="${cardId}"].know-card, [data-card-id="${cardId}"].npc-row`);
  if(targetEl) targetEl.dataset.vis = vis.join(',');
  applyFilter();
});

document.getElementById('charFilters').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if(!chip || chip.id === 'editToggle') return;
  document.querySelectorAll('.chip[data-char]').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeChar = chip.dataset.char;
  applyFilter();
});

document.getElementById('editToggle').addEventListener('click', function(){
  editMode = !editMode;
  this.classList.toggle('active', editMode);
  coordReadout.classList.toggle('show', editMode);
  coordReadout.innerHTML = editMode
    ? 'Edit mode active.<br>Click the map to capture the position.'
    : '';
});

mapScroll.addEventListener('click', (e) => {
  if(!editMode) return;
  const img = document.getElementById('mapImg');
  const rect = img.getBoundingClientRect();
  const left = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
  const top = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
  coordReadout.innerHTML = `top: <b>${top}%</b>, left: <b>${left}%</b><br><span style="opacity:.7">click again to update</span>`;
});

renderPins();

// initialize zoom base once the map image is ready and laid out
if(mapImg.complete){
  initZoomBase();
} else {
  mapImg.addEventListener('load', initZoomBase);
}

// ============================================================
// ACCESS CONTROL / LOGIN GATE
// ============================================================
const lockScreen = document.getElementById('lockScreen');
const pinStepPick = document.getElementById('pinStepPick');
const pinStepEnter = document.getElementById('pinStepEnter');
const lockGrid = document.getElementById('lockGrid');
const pinName = document.getElementById('pinName');
const pinInput = document.getElementById('pinInput');
const pinError = document.getElementById('pinError');
const sessionBadge = document.getElementById('sessionBadge');
const sessionWho = document.getElementById('sessionWho');
let pendingChar = null;
let currentUser = null; // { char: 'Maeri' | ... | 'GM' }

function buildLockGrid(){
  lockGrid.innerHTML = '';
  Object.keys(ACCESS_PINS).filter(c => c !== 'GM').forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.addEventListener('click', () => openPinStep(name));
    lockGrid.appendChild(btn);
  });
}

function openPinStep(name){
  pendingChar = name;
  pinName.textContent = name === 'GM' ? 'GM' : name;
  pinInput.value = '';
  pinError.innerHTML = '&nbsp;';
  pinStepPick.style.display = 'none';
  pinStepEnter.classList.add('active');
  setTimeout(() => pinInput.focus(), 50);
}

document.getElementById('lockGmBtn').addEventListener('click', () => openPinStep('GM'));
document.getElementById('pinBack').addEventListener('click', () => {
  pinStepEnter.classList.remove('active');
  pinStepPick.style.display = 'block';
});

function attemptLogin(){
  const val = pinInput.value.trim();
  if(val === ACCESS_PINS[pendingChar]){
    grantAccess(pendingChar, true);
  } else {
    pinError.textContent = 'Wrong PIN. Try again.';
    pinInput.classList.remove('shake'); void pinInput.offsetWidth; pinInput.classList.add('shake');
    pinInput.value = '';
  }
}
document.getElementById('pinSubmit').addEventListener('click', attemptLogin);
pinInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') attemptLogin(); });

function grantAccess(name, persist){
  currentUser = { char: name };
  if(persist){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser)); }catch(e){}
  }
  lockScreen.classList.add('hidden');
  applyAccessToUI();
}

function applyAccessToUI(){
  const isGM = currentUser.char === 'GM';
  sessionBadge.style.display = 'flex';
  sessionWho.textContent = currentUser.char;
  document.getElementById('globalSearchWrap').style.display = 'block';
  document.getElementById('shopCatalogWrap').style.display = 'block';
  renderShopCatalog();

  const filterBar = document.getElementById('charFilters');
  if(isGM){
    // GM sees every control, unrestricted
    filterBar.style.display = 'flex';
    activeChar = 'all';
    document.querySelectorAll('.chip[data-char]').forEach(c => c.classList.toggle('active', c.dataset.char === 'all'));
  } else {
    // Player: lock the toolbar down to their own character only, hide GM tools
    document.querySelectorAll('.chip[data-char]').forEach(chip => {
      if(chip.dataset.char === currentUser.char){
        chip.classList.add('active');
        chip.style.pointerEvents = 'none';
      } else {
        chip.style.display = 'none';
      }
    });
    document.getElementById('editToggle').style.display = 'none';
    activeChar = currentUser.char;
  }
  applyFilter();
}

// ------------------------------------------------------------
// GLOBAL SEARCH — searches locations, NPCs/shops and lore,
// respecting the visibility of whoever is logged in.
// ------------------------------------------------------------
function performSearch(query){
  const q = query.trim().toLowerCase();
  if(!q || !currentUser) return [];
  const results = [];
  const isGM = currentUser.char === 'GM';

  LOCATIONS.forEach(loc => {
    if((loc.name + ' ' + loc.desc).toLowerCase().includes(q)){
      results.push({ type: 'Location', locId: loc.id, label: loc.name, snippet: loc.desc });
    }
    (loc.knowledge || []).forEach(k => {
      const vis = getVisibility(k.id, k.visibleTo);
      if(!isGM && !(vis.includes('all') || vis.includes(currentUser.char))) return;
      if((k.text + ' ' + k.tag + ' ' + k.who).toLowerCase().includes(q)){
        results.push({ type: 'Lore', locId: loc.id, cardId: k.id, label: loc.name + ' — ' + k.tag, snippet: k.text });
      }
    });
    (loc.npcs || []).forEach(n => {
      const vis = getVisibility(n.id, n.visibleTo);
      if(!isGM && !(vis.includes('all') || vis.includes(currentUser.char))) return;
      if((n.name + ' ' + n.role + ' ' + n.desc).toLowerCase().includes(q)){
        results.push({ type: 'NPC & Shop', locId: loc.id, cardId: n.id, label: n.name + ' · ' + loc.name, snippet: n.role });
      }
    });
  });
  return results.slice(0, 12);
}

function renderSearchResults(results, query){
  const box = document.getElementById('searchResults');
  if(!query.trim()){
    box.classList.remove('show');
    box.innerHTML = '';
    return;
  }
  if(results.length === 0){
    box.innerHTML = `<div class="search-empty">Nothing found for "${query}".</div>`;
    box.classList.add('show');
    return;
  }
  box.innerHTML = results.map((r, i) =>
    `<button type="button" class="search-result-item" data-idx="${i}">
      <div class="sr-type">${r.type}</div>
      <div class="sr-label">${r.label}</div>
      <div class="sr-snippet">${r.snippet}</div>
    </button>`
  ).join('');
  box.classList.add('show');
  box.querySelectorAll('.search-result-item').forEach((btn, i) => {
    btn.addEventListener('click', () => jumpToSearchResult(results[i]));
  });
}

function jumpToSearchResult(result){
  document.getElementById('searchResults').classList.remove('show');
  document.getElementById('globalSearch').value = '';
  selectLocation(result.locId);
  if(result.cardId){
    setTimeout(() => {
      const el = document.querySelector(`[data-card-id="${CSS.escape(result.cardId)}"]`);
      if(el){
        if(el.classList.contains('npc-row')) el.classList.add('open');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('flash-highlight');
        setTimeout(() => el.classList.remove('flash-highlight'), 1600);
      }
    }, 50);
  }
}

const globalSearchInput = document.getElementById('globalSearch');
globalSearchInput.addEventListener('input', () => {
  const q = globalSearchInput.value;
  renderSearchResults(performSearch(q), q);
});
document.addEventListener('click', (e) => {
  if(!e.target.closest('.global-search')){
    document.getElementById('searchResults').classList.remove('show');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  location.reload();
});

// bootstrap: check for an existing session first
buildLockGrid();
(function initSession(){
  let saved = null;
  try{ saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }catch(e){}
  if(saved && ACCESS_PINS.hasOwnProperty(saved.char)){
    grantAccess(saved.char, false);
  }
})();
// ------------------------------------------------------------
// SHOP CATALOG — shows the shops for the currently selected
// location (currentLocationId). Updates whenever the player
// clicks another point, respecting visibility (GM sees
// everything; players only see what they're allowed to).
// ------------------------------------------------------------
function renderShopCatalog(){
  const wrap = document.getElementById('shopCatalog');
  const titleEl = document.getElementById('shopCatalogTitle');
  if(!wrap || !currentUser) return;
  const isGM = currentUser.char === 'GM';

  if(!currentLocationId){
    titleEl.textContent = '🛒 Shops';
    wrap.innerHTML = `<p class="shop-catalog-empty">Select a location on the map to see its shops.</p>`;
    return;
  }

  const loc = LOCATIONS.find(l => l.id === currentLocationId);
  const shops = (loc.npcs || []).filter(n => {
    if(n.type !== 'shop') return false;
    const vis = getVisibility(n.id, n.visibleTo);
    return isGM || vis.includes('all') || vis.includes(currentUser.char);
  });

  titleEl.textContent = `🛒 Shops in ${loc.name}`;

  if(shops.length === 0){
    wrap.innerHTML = `<p class="shop-catalog-empty">No shops in ${loc.name}.</p>`;
    return;
  }

  wrap.innerHTML = `<div class="shop-catalog-grid">${shops.map((s, i) => `
    <div class="shop-card" data-idx="${i}">
      <div class="shop-card-head">
        <div>
          <div class="shop-card-name">${s.name}</div>
          <div class="shop-card-role">${s.role}</div>
        </div>
        <span class="shop-card-chevron">▸</span>
      </div>
      <div class="shop-card-desc">${s.desc}</div>
      <div class="shop-card-body">
        ${itemsTableHTML(s.items) || `<p class="shop-catalog-empty" style="padding:8px 0 0;">No items listed yet.</p>`}
      </div>
    </div>`).join('')}</div>`;

  wrap.querySelectorAll('.shop-card-head').forEach(head => {
    head.addEventListener('click', () => {
      head.closest('.shop-card').classList.toggle('open');
    });
  });
}

document.getElementById('shopCatalogToggle').addEventListener('click', () => {
  document.getElementById('shopCatalogWrap').classList.toggle('open');
});

// ------------------------------------------------------------
// FIREBASE — live listeners. Keep the local caches
// (visOverridesCache, locationNotesCache) synced with the
// database in real time, so any player with the page open
// sees others' changes without needing to reload.
// ------------------------------------------------------------
function attachFirebaseListeners(){
  db.ref('visibilityOverrides').on('value', snap => {
    visOverridesCache = snap.val() || {};
    if(panelMode === 'location' && currentLocationId) selectLocation(currentLocationId);
    if(currentUser) renderShopCatalog();
  });

  db.ref('locationNotes').on('value', snap => {
    locationNotesCache = snap.val() || {};
    if(panelMode === 'location' && currentLocationId) renderPartyNotesSection(currentLocationId);
  });
}
attachFirebaseListeners();
