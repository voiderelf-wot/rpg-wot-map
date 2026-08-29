// ============================================================
// LÓGICA DA FERRAMENTA — não deveria precisar editar isso pra
// atualizar conteúdo de campanha (isso é no data.js). Mexa
// aqui só se for mudar comportamento/funcionalidade.
// ============================================================

// VISIBILIDADE — cada card de conhecimento e cada NPC recebe um
// id estável e uma visibilidade padrão (derivada de who/pc, ou
// "all" = grupo todo). O Mestre pode sobrescrever isso na hora,
// pela própria ferramenta (ícone 👁 em cada card) — sincroniza
// via Firebase em tempo real pra todo mundo que estiver com a
// página aberta, e persiste entre sessões/dispositivos.
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

// Cache em memória, mantido sincronizado por um listener do Firebase
// (attachFirebaseListeners, no fim do arquivo). Leitura fica síncrona
// (bom pra renderização), escrita vai direto pro Firebase.
let visOverridesCache = {};

function saveVisOverride(cardId, vis){
  visOverridesCache[cardId] = vis; // atualização otimista, local
  db.ref('visibilityOverrides/' + cardId).set(vis);
}
function getVisibility(cardId, defaultVis){
  return visOverridesCache[cardId] || defaultVis;
}
function visLabel(vis){
  return vis.includes('all') ? 'Todos' : vis.join(', ');
}
function canCurrentUserSee(vis){
  if(!currentUser) return false;
  if(currentUser.char === 'Mestre') return true;
  return vis.includes('all') || vis.includes(currentUser.char);
}
function visEditorHTML(cardId, vis){
  if(!currentUser || currentUser.char !== 'Mestre') return '';
  const boxes = PLAYER_CHARS.map(name =>
    `<label><input type="checkbox" value="${name}" ${vis.includes(name) ? 'checked' : ''}> ${name}</label>`
  ).join('');
  return `
    <span class="vis-editor" data-card-id="${cardId}">
      <button type="button" class="vis-btn" title="Editar visibilidade">👁 ${visLabel(vis)}</button>
      <div class="vis-popover">
        <label><input type="checkbox" value="all" ${vis.includes('all') ? 'checked' : ''}> Todos (grupo)</label>
        <div class="vis-divider"></div>
        ${boxes}
      </div>
    </span>`;
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
    <p class="loc-eyebrow">Local</p>
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
      b.innerHTML = `<span class="home-icon">🏠</span><div><b>${name} é daqui</b><span>${info.origemLabel}</span></div>`;
      homeBannersEl.appendChild(b);
    }
  });

  // NPCs & Lojas
  if(loc.npcs && loc.npcs.length){
    const npcSection = document.getElementById('npcSection');
    npcSection.innerHTML = `<p class="npc-section-title">NPCs &amp; Lojas</p>`;
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
        <div class="npc-desc"><div class="npc-desc-inner">${npc.desc}</div></div>
      `;
      row.querySelector('.npc-row-head').addEventListener('click', (e) => {
        if(e.target.closest('.vis-editor')) return;
        row.classList.toggle('open');
      });
      npcSection.appendChild(row);
    });
  }

  const cardsEl = document.getElementById('cards');
  if(loc.knowledge.length){
    cardsEl.innerHTML = `<p class="npc-section-title">📖 Background pessoal</p>`;
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
}

// ------------------------------------------------------------
// NOTAS DA PARTY — quadro por local. Qualquer personagem logado
// pode adicionar uma nota (assinada com o nome dele), e todo
// mundo vê, ao vivo, via Firebase Realtime Database.
// ------------------------------------------------------------
let locationNotesCache = {}; // { [locationId]: { [pushId]: {author, text, createdAt} } }

function renderPartyNotesSection(locId){
  const el = document.getElementById('partyNotesSection');
  if(!el) return; // painel pode ter mudado de aba enquanto isso chegava
  const notesObj = locationNotesCache[locId] || {};
  const notes = Object.values(notesObj).sort((a, b) => a.createdAt - b.createdAt);

  const notesHTML = notes.length
    ? notes.map(n => `
        <div class="party-note">
          <div class="party-note-head"><b>${n.author}</b><span>${new Date(n.createdAt).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span></div>
          <p>${n.text}</p>
        </div>`).join('')
    : `<p class="party-notes-empty">Nenhuma nota da party ainda sobre este local.</p>`;

  el.innerHTML = `
    <p class="npc-section-title">📝 Notas da Party</p>
    <div class="party-notes-list">${notesHTML}</div>
    <div class="party-note-form">
      <textarea id="partyNoteInput" placeholder="Adicionar uma nota sobre ${LOCATIONS.find(l=>l.id===locId).name}..."></textarea>
      <button type="button" id="partyNoteSubmit">Adicionar nota</button>
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
}

// ------------------------------------------------------------
// NOTES TAB — bloco pessoal e privado por personagem. Salvo no
// Firebase (personalNotes/{personagem}), então sincroniza entre
// dispositivos diferentes logados com o mesmo personagem.
// ------------------------------------------------------------
let notesSaveTimeout = null;

function renderNotesTab(){
  panelMode = 'notes';
  document.getElementById('tabNotes').classList.add('active');
  document.getElementById('tabLocation').classList.remove('active');
  document.getElementById('tabDistances').classList.remove('active');

  if(!currentUser){
    panelBody.innerHTML = `<div class="notes-locked"><div class="glyph" style="font-size:26px;opacity:.5;">🔒</div><p>Faça login pra usar suas notas.</p></div>`;
    return;
  }
  const who = currentUser.char;

  panelBody.innerHTML = `
    <p class="loc-eyebrow">Bloco pessoal</p>
    <h2>Notas de ${who}</h2>
    <div class="notes-wrap">
      <textarea id="notesArea" placeholder="Escreva aqui suas anotações, teorias, pistas, o que quiser lembrar depois..." disabled></textarea>
      <div class="notes-status"><span id="notesStatus">carregando…</span><span>${who === 'Mestre' ? 'visível só pro mestre' : 'privado — só ' + who + ' vê, sincroniza entre dispositivos'}</span></div>
    </div>
  `;
  const area = document.getElementById('notesArea');
  const status = document.getElementById('notesStatus');

  db.ref('personalNotes/' + who).once('value').then(snap => {
    area.value = (snap.val() && snap.val().text) || '';
    area.disabled = false;
    status.textContent = 'salvo';
  });

  area.addEventListener('input', () => {
    status.textContent = 'salvando…';
    clearTimeout(notesSaveTimeout);
    notesSaveTimeout = setTimeout(() => {
      db.ref('personalNotes/' + who).set({ text: area.value, updatedAt: Date.now() })
        .then(() => { status.textContent = 'salvo'; })
        .catch(() => { status.textContent = 'erro ao salvar'; });
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
    panelBody.innerHTML = `<div class="empty-state"><div class="glyph">◈</div><p>Selecione um ponto no mapa para revelar o que os personagens sabem sobre aquele lugar.</p></div>`;
  }
});
document.getElementById('tabNotes').addEventListener('click', renderNotesTab);

// ------------------------------------------------------------
// DISTANCES TAB — canonical straight-line distances (WoT wiki)
// + D&D 5e travel pace conversion.
// ------------------------------------------------------------
const PACES_BASE = [
  { key: "fast",   label: "Rápido", milesPerDay: 30, note: "-5 Percepção passiva" },
  { key: "normal", label: "Normal", milesPerDay: 24, note: "—" },
  { key: "slow",   label: "Lento",  milesPerDay: 18, note: "permite furtividade" }
];
// Velocidades oficiais do D&D 5e (PHB, tabela de Montarias e Veículos).
// A tabela de ritmo padrão assume velocidade 30 pés; escalamos
// proporcionalmente para os outros modos de viagem.
const TRAVEL_MODES = {
  "a-pe":    { label: "A pé",     speedFt: 30, hint: "Velocidade humana padrão" },
  "cavalo":  { label: "A cavalo", speedFt: 60, hint: "Cavalo de montaria (Riding Horse), 60 pés" },
  "carroca": { label: "De carroça", speedFt: 40, hint: "Puxada por cavalo de tiro (Draft Horse), 40 pés" }
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
  const modeOptions = Object.entries(TRAVEL_MODES).map(([key, m]) => `<option value="${key}">${m.label}</option>`).join('');

  panelBody.innerHTML = `
    <p class="loc-eyebrow">Calculadora</p>
    <h2>Distâncias</h2>
    <p class="loc-desc">Distâncias canônicas em linha reta (wot.fandom.com). ★ = local já marcado no mapa.</p>
    <div class="dist-selects">
      <div>
        <label>De</label>
        <select id="distFrom">${options}</select>
      </div>
      <button class="dist-swap" id="distSwap" title="Inverter">⇅</button>
      <div>
        <label>Até</label>
        <select id="distTo">${options}</select>
      </div>
      <div>
        <label>Modo de viagem</label>
        <select id="distMode">${modeOptions}</select>
      </div>
      <label class="dist-terrain-toggle">
        <input type="checkbox" id="distTerrain"> Terreno difícil (dobra o tempo)
      </label>
    </div>
    <div id="distResult"></div>
  `;
  const fromSel = document.getElementById('distFrom');
  const toSel = document.getElementById('distTo');
  const modeSel = document.getElementById('distMode');
  const terrainCk = document.getElementById('distTerrain');
  toSel.selectedIndex = 1;

  function update(){
    const a = fromSel.value, b = toSel.value;
    const resultEl = document.getElementById('distResult');
    if(a === b){
      resultEl.innerHTML = `<div class="dist-none">Escolha dois locais diferentes.</div>`;
      return;
    }
    const miles = distanceBetween(a, b);
    if(miles == null){
      resultEl.innerHTML = `<div class="dist-none">Sem dado canônico entre esses dois locais.</div>`;
      return;
    }
    const mode = TRAVEL_MODES[modeSel.value];
    const speedMultiplier = mode.speedFt / 30;
    const terrainMultiplier = terrainCk.checked ? 0.5 : 1;

    const rows = PACES_BASE.map(p => {
      const effectiveMilesPerDay = p.milesPerDay * speedMultiplier * terrainMultiplier;
      const days = miles / effectiveMilesPerDay;
      const daysLabel = days < 1 ? `${Math.ceil(days*24)}h` : `${days.toFixed(1)} dias`;
      return `<tr><td>${p.label} (${effectiveMilesPerDay.toFixed(1)} mi/dia)</td><td class="days">${daysLabel}</td><td style="color:var(--ink-dim);font-size:11px;">${p.note}</td></tr>`;
    }).join('');
    resultEl.innerHTML = `
      <div class="dist-result">
        <div class="dist-miles">${miles.toLocaleString('pt-BR')}</div>
        <div class="dist-miles-label">MILHAS · EM LINHA RETA</div>
        <table class="dist-pace-table">
          <tr><th>Ritmo</th><th>Tempo</th><th></th></tr>
          ${rows}
        </table>
      </div>
      <p class="dist-note">${mode.hint}${terrainCk.checked ? ' · terreno difícil ativo (metade da distância diária, regra padrão do D&D 5e)' : ''}. Tempo estimado viajando em linha reta, sem paradas — estrada real costuma ser mais longa; ajuste como mestre achar melhor.</p>
    `;
  }
  fromSel.addEventListener('change', update);
  toSel.addEventListener('change', update);
  modeSel.addEventListener('change', update);
  terrainCk.addEventListener('change', update);
  document.getElementById('distSwap').addEventListener('click', () => {
    const tmp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = tmp;
    update();
  });
  update();
}
document.getElementById('tabDistances').addEventListener('click', renderDistancesTab);

function applyFilter(){
  // Mestre logado com "Todos" ativo vê tudo, sem restrição.
  // Nos demais casos (jogador, ou Mestre simulando um personagem
  // pelos chips), um card só aparece se sua visibilidade inclui
  // "all" ou o personagem em questão.
  const isMestreFull = currentUser && currentUser.char === 'Mestre' && activeChar === 'all';
  const simChar = currentUser ? (currentUser.char === 'Mestre' ? activeChar : currentUser.char) : null;

  document.querySelectorAll('.know-card, .npc-row').forEach(el => {
    const vis = (el.dataset.vis || 'all').split(',');
    const show = isMestreFull || (simChar && (vis.includes('all') || vis.includes(simChar)));
    el.classList.toggle('hidden-by-filter', !show);
  });
}

// Editor de visibilidade (só existe na tela quando logado como Mestre)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.vis-btn');
  if(btn){
    const editor = btn.closest('.vis-editor');
    const wasOpen = editor.classList.contains('open');
    document.querySelectorAll('.vis-editor.open').forEach(el => el.classList.remove('open'));
    if(!wasOpen) editor.classList.add('open');
    return;
  }
  if(!e.target.closest('.vis-popover')){
    document.querySelectorAll('.vis-editor.open').forEach(el => el.classList.remove('open'));
  }
});
document.addEventListener('change', (e) => {
  const cb = e.target.closest('.vis-popover input[type="checkbox"]');
  if(!cb) return;
  const editor = cb.closest('.vis-editor');
  const cardId = editor.dataset.cardId;
  const boxes = Array.from(editor.querySelectorAll('input[type="checkbox"]'));
  const allBox = editor.querySelector('input[value="all"]');
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
  editor.querySelector('.vis-btn').textContent = '👁 ' + visLabel(vis);
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
    ? 'Modo edição ativo.<br>Clique no mapa para capturar a posição.'
    : '';
});

mapScroll.addEventListener('click', (e) => {
  if(!editMode) return;
  const img = document.getElementById('mapImg');
  const rect = img.getBoundingClientRect();
  const left = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
  const top = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
  coordReadout.innerHTML = `top: <b>${top}%</b>, left: <b>${left}%</b><br><span style="opacity:.7">clique novamente para atualizar</span>`;
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
let currentUser = null; // { char: 'Maeri' | ... | 'Mestre' }

function buildLockGrid(){
  lockGrid.innerHTML = '';
  Object.keys(ACCESS_PINS).filter(c => c !== 'Mestre').forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.addEventListener('click', () => openPinStep(name));
    lockGrid.appendChild(btn);
  });
}

function openPinStep(name){
  pendingChar = name;
  pinName.textContent = name === 'Mestre' ? 'Mestre' : name;
  pinInput.value = '';
  pinError.innerHTML = '&nbsp;';
  pinStepPick.style.display = 'none';
  pinStepEnter.classList.add('active');
  setTimeout(() => pinInput.focus(), 50);
}

document.getElementById('lockGmBtn').addEventListener('click', () => openPinStep('Mestre'));
document.getElementById('pinBack').addEventListener('click', () => {
  pinStepEnter.classList.remove('active');
  pinStepPick.style.display = 'block';
});

function attemptLogin(){
  const val = pinInput.value.trim();
  if(val === ACCESS_PINS[pendingChar]){
    grantAccess(pendingChar, true);
  } else {
    pinError.textContent = 'PIN incorreto. Tente de novo.';
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
  const isGM = currentUser.char === 'Mestre';
  sessionBadge.style.display = 'flex';
  sessionWho.textContent = currentUser.char;
  document.getElementById('globalSearchWrap').style.display = 'block';

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
// GLOBAL SEARCH — busca por locais, NPCs/lojas e conhecimento,
// respeitando a visibilidade de quem está logado.
// ------------------------------------------------------------
function performSearch(query){
  const q = query.trim().toLowerCase();
  if(!q || !currentUser) return [];
  const results = [];
  const mestre = currentUser.char === 'Mestre';

  LOCATIONS.forEach(loc => {
    if((loc.name + ' ' + loc.desc).toLowerCase().includes(q)){
      results.push({ type: 'Local', locId: loc.id, label: loc.name, snippet: loc.desc });
    }
    (loc.knowledge || []).forEach(k => {
      const vis = getVisibility(k.id, k.visibleTo);
      if(!mestre && !(vis.includes('all') || vis.includes(currentUser.char))) return;
      if((k.text + ' ' + k.tag + ' ' + k.who).toLowerCase().includes(q)){
        results.push({ type: 'Conhecimento', locId: loc.id, cardId: k.id, label: loc.name + ' — ' + k.tag, snippet: k.text });
      }
    });
    (loc.npcs || []).forEach(n => {
      const vis = getVisibility(n.id, n.visibleTo);
      if(!mestre && !(vis.includes('all') || vis.includes(currentUser.char))) return;
      if((n.name + ' ' + n.role + ' ' + n.desc).toLowerCase().includes(q)){
        results.push({ type: 'NPC & Loja', locId: loc.id, cardId: n.id, label: n.name + ' · ' + loc.name, snippet: n.role });
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
    box.innerHTML = `<div class="search-empty">Nada encontrado para "${query}".</div>`;
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
// FIREBASE — listeners ao vivo. Mantêm os caches locais
// (visOverridesCache, locationNotesCache) sincronizados com o
// banco em tempo real, pra qualquer jogador com a página aberta
// ver as mudanças de outros sem precisar recarregar.
// ------------------------------------------------------------
function attachFirebaseListeners(){
  db.ref('visibilityOverrides').on('value', snap => {
    visOverridesCache = snap.val() || {};
    if(panelMode === 'location' && currentLocationId) selectLocation(currentLocationId);
  });

  db.ref('locationNotes').on('value', snap => {
    locationNotesCache = snap.val() || {};
    if(panelMode === 'location' && currentLocationId) renderPartyNotesSection(currentLocationId);
  });
}
attachFirebaseListeners();
