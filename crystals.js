// ============================================================
// MEMORY CRYSTALS — Heralds' Dungeon, Room 3 (Chamber of the Oath)
// Each player touches the crystal, rolls inside the page and gets
// the card of the role they take in the memory. The GM sees the
// whole table live. Rolls are saved in Firebase under "crystals/".
// Content source: vault note Cristais_das_Memorias (+ Descricoes).
// ============================================================
(function(){

  /* ---------------- content ---------------- */

  // Lines of the figure in red, said inside each character's head (Scene 4, GM only)
  const CX_RED_LINES = {
    Uthar:  '"Go to Rhuidean, son of Maredo! Go, child of the Crucible! Go, exile! Go!"',
    Dongo:  '"Go to Rhuidean, little mouse! Go, broken mask! Go, dreamer who bends the dream! Go!"',
    Maeri:  '"Go to Rhuidean, daughter of the Source! Go, you who listen to the wind! Listen, and go! Go, keeper of the Pattern! Go!"',
    Aynara: '"Go to Rhuidean, daughter of fire! Go, guardian of the doors! Go, stranger! Go!"'
  };

  const CX_BODY = [
    'Hands calloused from rope.',
    'A wedding ring you do not recognize.',
    'An old ache in the left knee.',
    'You are shorter than you should be.',
    'You are older than you should be.',
    'Your front teeth are broken.',
    'A ribbon with ten knots tied around your arm.',
    'A scar that pulls at the corner of your mouth.',
    'Hair shaved close, still rough to the touch.',
    'A smell of horse that will not leave your clothes.'
  ];

  const CX_ELEMENTS = [
    { n: 'Earth', t: 'the lakebed closes like hands around the creature\'s ankles and pins its legs.' },
    { n: 'Water', t: 'the whole lake folds over it, wraps it and drags it down.' },
    { n: 'Air',   t: 'the wind twists into ropes and binds its arms against its body.' }
  ];

  const CX_SCENES = [
    { id: 'c1', n: 'Scene 1', name: 'The Night of the Wall',
      intro: 'Night. A grey stone fortress on the shore of a black lake. Beyond the wall, a tide of Trollocs beats weapons against shields. Behind the fortress, boats with hooded lanterns search for something beneath the water.',
      rule: 'The crystal first decides your post: the lake or the wall, two characters each. On the wall, 1d4 decides the role.' },
    { id: 'c2', n: 'Scene 2', name: 'The March North',
      intro: 'Day. The wall held. The army marches north in a column that stretches to the horizon: carts, thin horses, soldiers with rags wrapped around their feet. Nobody sings.',
      rule: '1d6 decides the role. Two characters can land on the same one.' },
    { id: 'c3', n: 'Scene 3', name: 'The Ambush',
      intro: 'The wind enters a gorge and changes its voice. Walls of stone rise on both sides, and the sky becomes a grey ribbon far above. A patrol of four walks in single file along a dry riverbed. It is you.',
      rule: 'No roll: all four are in the same patrol.' },
    { id: 'c4', n: 'Scene 4', name: 'The Cave',
      intro: 'A huge mountain, alone in the middle of the plain, its peak lost in cloud. You stand in the rearguard, facing a dark opening in the rock. The ground trembles now and then, as if the mountain had a heartbeat.',
      rule: 'No roll: all four are rearguard soldiers.' }
  ];

  const CX_ROLES = {
    /* ---- Scene 1: the wall (1d4) ---- */
    arq: { scene: 'c1', face: 1, post: 'The wall · 1d4 = 1', name: 'Archer on the battlements',
      who: 'You stand on top of the wall, where the cutting wind steals half your arrows. A boy runs up and down the stairs just to keep your quiver full.',
      fields: [['Kit', 'Longbow and endless arrows.'], ['Special action', '<strong>Volley:</strong> one attack against every enemy in a 30-foot line, at −2 to hit.']],
      witness: 'Below, a single figure with a raised buckler holds the gate. Nobody says the name; the soldiers only shout "the Wall!" (Chanadriel).',
      death: 'A winged creature tears her off the battlements: heavy wingbeats, a smell of rotten leather, claws on the shoulders.' },
    cat: { scene: 'c1', face: 2, post: 'The wall · 1d4 = 2', name: 'Catapult crew',
      who: 'Your arms ache from turning the winch. The stone in the basket is warm from passing hand to hand, and the crew chief checks something written on the tower wall before giving the order to loose.',
      fields: [['Kit', 'Winch and stones.'], ['Special action', '<strong>Shot:</strong> group check, STR (load) and INT (aim) against DC 13. On a success, it hits a whole wave.']],
      witness: 'The trajectories are already chalked on the tower wall in small, hurried handwriting: the same equations as in the rat merchant\'s house. The chief says "the Builder" left the sums before moving on to another tower (Kalak).',
      hook: 'Whoever was in the rat merchant\'s house recognizes the handwriting at once. Ask for an INT check just to see how well they hide the reaction.',
      death: 'An enemy shot brings the tower down: a dry crack underfoot, the tower leans, and the chalk is the last thing they see.' },
    por: { scene: 'c1', face: 3, post: 'The wall · 1d4 = 3', name: 'Gate soldier',
      who: 'The shield is heavy on your arm and the spear trembles in your hand, from tiredness or fear, you cannot tell. On the other side of the gate\'s timber, something enormous pushes.',
      fields: [['Kit', 'Spear and shield.'], ['Special action', '<strong>Shield wall:</strong> +2 AC for you and for whoever stands beside you.']],
      witness: 'A messenger runs behind the line with orders on a scrap of leather, drawn like moves on a stones board. "From the Strategist!" he shouts, and vanishes (Battarath).',
      death: 'The gate gives way: the bar snaps, the timber splits into shards, and the smell of fur and blood floods in.' },
    maq: { scene: 'c1', face: 4, post: 'The wall · 1d4 = 4', name: 'Stretcher-bearer in the yard',
      who: 'You run across the yard with a stretcher, through smoke and screaming, ready for the worst.',
      fields: [['Kit', 'Stretcher and herbs.'], ['Special action', '<strong>Rescue:</strong> Athletics DC 12 to pull a wounded soldier out of the fire.']],
      witness: 'The wounded of a whole ward are already healed, all with the same smell of crushed leaves. "The Healer came through here." Nobody saw her leave (Vedelieth).',
      death: 'A roar from inside the yard: a Trolloc has leapt the wall.' },

    /* ---- Scene 1: the lake ---- */
    circ: { scene: 'c1', lake: true, post: 'The lake · the circle', name: 'Channeler of the circle',
      who: 'A boat glides without a sound over the black water. A sliver of light from the hooded lantern touches the lake. You are one of the circle\'s channelers, and someone beside you whispers: "She is down there. Tonight we wake her."',
      fields: [['Kit', 'The link of the circle: you channel the element the crystal chose.'], ['Element', ''], ['Checks', 'Each round, <strong>CON DC 13</strong> to hold the link. During the search, Perception DC 13; when it wakes, WIS DC 13 or frightened for 1 round.']],
      witness: 'The stone creature rises from the depths, a red light pulsing in the cracks of its chest. The one in command is the mistress of the circle: shaved head, hoarse voice, nobody calls her by name.',
      hook: 'If the character is a man, he feels saidin clean: "There is nothing tainted in it. Only the Source, whole, singing." Let it echo.',
      death: 'If the circle fails twice, the creature frees an arm and sweeps the shore.' },
    carga: { scene: 'c1', lake: true, post: 'The lake · the shore', name: 'Warrior of the shore',
      who: 'You crouch among the scouts on the shore, not daring to breathe loud. When the circle holds whatever comes out of the water, the order is to run.',
      fields: [['Kit', 'A sword, and the freezing water up to your waist.'], ['Checks', 'During the search, Perception DC 13; when it wakes, WIS DC 13 or frightened for 1 round.'], ['The charge', '<strong>Athletics DC 13</strong> to cross the shallows without falling; then one attack against the crack in the creature\'s chest.']],
      witness: 'Far ahead, too far to reach, someone runs with a sword that throws sparks like embers: the first into the water. Then the silhouette climbs the creature\'s arm and drives the blade into its chest. When the water settles, nobody is there.',
      death: 'If the circle fails twice, the creature frees an arm and sweeps the shore.' },

    /* ---- Scene 2 (1d6) ---- */
    bat: { scene: 'c2', face: 1, post: '1d6 = 1', name: 'Forward scout',
      who: 'You ride ahead of the column, alone. The village in front of you still smokes; the blackened beams point at the sky like fingers.',
      fields: [['What you do', '<strong>Survival DC 13</strong> to find the Shadow\'s trail in the burned village.']],
      witness: 'Someone passed before and marked the way with black and white pebbles, as on a game board, pointing to the gorge of Scene 3. The sergeant: "The Strategist always knows."' },
    car: { scene: 'c2', face: 2, post: '1d6 = 2', name: 'Supply-train porter',
      who: 'The cart wheel sinks into the mud up to the axle, and you push with your shoulder until the world goes dark at the edges.',
      fields: [['What you do', '<strong>Athletics</strong> to keep the cart moving through the mud.']],
      witness: 'The grain is already paid for: an old woman shows a square coin with a hole and says "the Merchant". Leaving the village, a new stone marker with a spiral that never ends (the Builder).',
      hook: 'It is the pattern on the black spear: whoever held the spear feels a tingle in the fingers.' },
    ten: { scene: 'c2', face: 3, post: '1d6 = 3', name: 'Tent raiser',
      who: 'Stakes, ropes, wet canvas. Hundreds of tents, all alike, and the camp rises from the ground through your hands.',
      fields: [['What you do', 'Raise the army\'s tents before night falls.']],
      witness: 'In the center, ten tents in a ring, guarded by veiled servants; nobody from the army goes near. At night, nine of them light up inside. The tenth stays dark.' },
    veu: { scene: 'c2', face: 4, post: '1d6 = 4', name: 'Veiled servant',
      who: 'The veil is thin and smells of old incense. You carry a tray of bread, hard cheese and a jug of watered wine.',
      fields: [['What you do', 'Carry the food to the ring of ten tents at the center of the camp.']],
      witness: 'Only to the edge: another servant takes the tray and goes in. Among the servants, a woman in a red veil stands looking north. When you look again, she is looking at you.',
      hook: 'First time they see the figure in red. Do not explain. Just let her look.' },
    gua: { scene: 'c2', face: 5, post: '1d6 = 5', name: 'Night watch',
      who: 'Spear on your shoulder, cloak wet with dew. The night in camp is long, and your post is at the edge, where the firelight ends.',
      fields: [['What you do', '<strong>Perception</strong> to keep watch through the night.']],
      witness: 'A lone figure spends the night on a rock, facing north, a sword across the knees. Near dawn, a hand passes along the blade and small sparks rise and die in the air.' },
    men: { scene: 'c2', face: 6, post: '1d6 = 6', name: 'Messenger',
      who: 'The horse is as tired as you are. You carry a sealed message from one end of the column to the other.',
      fields: [['What you do', 'Ride between the columns and deliver the message.']],
      witness: 'Delivers it to a veiled servant at the edge of the ten tents. From inside come low, tired voices, of people who have talked about the same thing for too long. The words do not reach.' },

    /* ---- Scene 3 ---- */
    pat: { scene: 'c3', post: 'The patrol', name: 'Patrol soldier',
      who: 'Four soldiers in single file along a dry riverbed, between sheer stone walls. You were sent ahead to see if the way is clear.',
      fields: [['Sheet', 'Your own character sheet, with the patrol\'s gear.'], ['The scene', 'Real combat, on the grid.']],
      witness: 'Enemies (Moderate, ~3,000 XP): 1 Myrddraal (Gladiator, Eyeless Gaze: WIS DC 13 or frightened) and 6 Trollocs (Bugbear Warrior). In round 2, the flaming sword enters the mouth of the gorge alone, holds the choke point and leaves without a word. Far off, nine figures only now come down the slope.',
      death: 'Whoever dies here wakes in Scene 4 as a soldier at the cave mouth.' },

    /* ---- Scene 4 ---- */
    ret: { scene: 'c4', post: 'The rearguard', name: 'Rearguard soldier',
      who: 'Your arms can barely lift the shield and every breath burns. You hold the rearguard line, facing the black mouth of a cave.',
      fields: [['Sheet', 'Your own character sheet.'], ['The scene', 'Short waves of Trollocs, narrated. Hold the line.']],
      witness: 'Taln passes through the line without stopping and speaks only to the captain: "Hold the entrance. They are coming." Then he goes in alone. One or two waves; then the Nine arrive up the slope, the voices go silent, the world spins, and only the figure in red remains.' }
  };

  const CX_WALL = ['arq', 'cat', 'por', 'maq'];
  const CX_MARCH = ['bat', 'car', 'ten', 'veu', 'gua', 'men'];

  /* ---------------- state ---------------- */

  const CX_LS = 'wot_crystals_ui_v1';
  let ui = { view: 'map', scene: 'c1' };
  try { Object.assign(ui, JSON.parse(localStorage.getItem(CX_LS) || '{}')); } catch (e) {}
  function saveUi(){ try { localStorage.setItem(CX_LS, JSON.stringify(ui)); } catch (e) {} }

  let allRolls = {};      // { [char]: { c1: entry, c2: entry, ... } }
  let isOpen = false;     // GM switch: players can see the tab
  let rolling = false;
  let writeError = false;

  const rnd = (n) => 1 + Math.floor(Math.random() * n);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const me = () => (typeof currentUser !== 'undefined' && currentUser) ? currentUser.char : null;
  const isGM = () => me() === 'GM';
  const players = () => (typeof PLAYER_CHARS !== 'undefined' ? PLAYER_CHARS : Object.keys(CX_RED_LINES));
  const myRolls = () => (me() && allRolls[me()]) || {};

  /* ---------------- DOM scaffolding ---------------- */

  const wrap = document.querySelector('.wrap');
  const header = document.querySelector('header.top');

  const switcher = document.createElement('div');
  switcher.className = 'view-switch';
  switcher.setAttribute('role', 'tablist');
  switcher.innerHTML =
    '<button class="view-btn" role="tab" data-view="map">🗺 Map</button>' +
    '<button class="view-btn" role="tab" data-view="crystals">◆ Memory Crystals</button>';
  header.insertAdjacentElement('afterend', switcher);

  const view = document.createElement('section');
  view.id = 'crystalsView';
  view.setAttribute('aria-label', 'Memory Crystals');
  view.innerHTML =
    '<div class="cx-wrap">' +
      '<header class="cx-head">' +
        '<p class="eyebrow">Heralds\' Dungeon · Chamber of the Oath</p>' +
        '<h2>The Memory Crystals</h2>' +
        '<p class="cx-lede">You step onto the platform. Light is born inside the stone and climbs your legs like warm water. When you open your eyes, the hands you raise before your face are not your own.</p>' +
      '</header>' +
      '<div id="cxBody"></div>' +
    '</div>';
  switcher.insertAdjacentElement('afterend', view);

  const body = view.querySelector('#cxBody');

  /* ---------------- rolling ---------------- */

  function newEntry(role, extra){
    return Object.assign({ role: role, body: Math.floor(Math.random() * CX_BODY.length), prev: [], at: Date.now() }, extra || {});
  }

  function othersIn(sceneId){
    return Object.keys(allRolls)
      .filter(c => c !== me() && c !== 'GM')
      .map(c => allRolls[c] && allRolls[c][sceneId])
      .filter(Boolean);
  }

  function rollScene(sid){
    if (sid === 'c1') {
      const others = othersIn('c1');
      const lakeTaken = others.map(r => r.role).filter(r => r === 'circ' || r === 'carga');
      const wallCount = others.filter(r => CX_WALL.includes(r.role)).length;
      let toLake;
      if (lakeTaken.length >= 2) toLake = false;
      else if (wallCount >= 2) toLake = true;
      else toLake = rnd(2) === 1;
      if (toLake) {
        const role = pick(['circ', 'carga'].filter(r => !lakeTaken.includes(r)));
        return { sides: 2, face: '≈', entry: newEntry(role, role === 'circ' ? { el: rnd(3) - 1 } : {}) };
      }
      const f = rnd(4);
      return { sides: 4, face: f, entry: newEntry(CX_WALL[f - 1]) };
    }
    if (sid === 'c2') {
      const f = rnd(6);
      return { sides: 6, face: f, entry: newEntry(CX_MARCH[f - 1]) };
    }
    return { sides: 0, face: '✦', entry: newEntry(sid === 'c3' ? 'pat' : 'ret') };
  }

  function rerollAfterDeath(sid){
    const cur = myRolls()[sid];
    if (!cur) return null;
    const prev = (cur.prev || []).concat([cur.role]);
    const list = sid === 'c1' ? CX_WALL : sid === 'c2' ? CX_MARCH : null;
    if (!list) return null;
    let f, role;
    do { f = rnd(list.length); role = list[f - 1]; } while (role === cur.role);
    return { sides: list.length, face: f, entry: Object.assign(newEntry(role), { prev: prev }) };
  }

  function animate(sides, face, done){
    const crystal = document.getElementById('cxCrystal');
    const die = document.getElementById('cxDie');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!crystal || !die || reduce) { done(); return; }
    rolling = true;
    crystal.classList.remove('spent');
    crystal.classList.add('rolling');
    let t = 0;
    const iv = setInterval(() => {
      die.textContent = sides ? String(rnd(sides)) : '✦';
      t += 70;
      if (t >= 980) {
        clearInterval(iv);
        die.textContent = String(face);
        crystal.classList.remove('rolling');
        setTimeout(() => { rolling = false; done(); }, 260);
      }
    }, 70);
  }

  function saveEntry(sid, entry){
    const who = me();
    if (!who) return;
    allRolls[who] = Object.assign({}, allRolls[who], { [sid]: entry });
    render();
    db.ref('crystals/rolls/' + who + '/' + sid).set(entry)
      .then(() => { if (writeError) { writeError = false; render(); } })
      .catch(() => { writeError = true; render(); });
  }

  function doRoll(){
    const sid = ui.scene;
    if (rolling || !me() || isGM() || myRolls()[sid]) return;
    const res = rollScene(sid);
    animate(res.sides, res.face, () => saveEntry(sid, res.entry));
  }

  function doDeath(){
    const sid = ui.scene;
    if (rolling || isGM()) return;
    if (sid === 'c3') {
      saveEntry('c3', Object.assign({}, myRolls().c3, { dead: true }));
      return;
    }
    const res = rerollAfterDeath(sid);
    if (!res) return;
    animate(res.sides, res.face, () => saveEntry(sid, res.entry));
  }

  /* ---------------- rendering ---------------- */

  function sceneTabs(rollsForTabs){
    return '<nav class="cx-scenes" role="tablist" aria-label="Scenes">' + CX_SCENES.map(s => {
      const r = rollsForTabs && rollsForTabs[s.id];
      const label = (r && CX_ROLES[r.role])
        ? '<span class="done">✓ ' + esc(CX_ROLES[r.role].name) + '</span>'
        : '<span>' + esc(s.name) + '</span>';
      return '<button class="cx-scene-btn" role="tab" data-scene="' + s.id + '" aria-selected="' + (ui.scene === s.id) + '"><b>' + s.n + '</b>' + label + '</button>';
    }).join('') + '</nav>';
  }

  function fieldsHTML(role, entry){
    return role.fields.map(([k, v]) => {
      let val = v;
      if (k === 'Element' && entry.el != null && CX_ELEMENTS[entry.el]) {
        const e = CX_ELEMENTS[entry.el];
        val = '<strong>' + e.n + '</strong> (1d3 = ' + (entry.el + 1) + '): ' + e.t;
      }
      const wide = (k === 'Checks' || k === 'The charge' || role.fields.length === 1) ? ' wide' : '';
      return '<div class="cx-field' + wide + '"><dt>' + k + '</dt><dd>' + val + '</dd></div>';
    }).join('');
  }

  function cardHTML(sid, entry){
    const role = CX_ROLES[entry.role];
    if (!role) return '';
    let h = '<article class="cx-card" aria-live="polite">';
    h += '<div class="cx-card-head"><div class="post">' + esc(role.post) + '</div><h4>' + esc(role.name) + '</h4>';
    h += '<p class="body-trait">Your new body: ' + esc(CX_BODY[entry.body % CX_BODY.length]) + '</p></div>';
    h += '<div class="cx-card-body"><p class="cx-who">' + esc(role.who) + '</p>';
    h += '<dl class="cx-grid">' + fieldsHTML(role, entry) + '</dl>';
    if (entry.prev && entry.prev.length) {
      h += '<p class="cx-prev">Earlier roles in this scene: ' + entry.prev.map(r => '<s>' + esc((CX_ROLES[r] || {}).name || r) + '</s>').join(', ') + '</p>';
    }
    if (sid === 'c3' && entry.dead) {
      h += '<div class="cx-dead-note">You fell in the gorge. In Scene 4 you wake as a soldier at the mouth of the cave.</div>';
    }
    const canDie = sid === 'c1' || sid === 'c2' || (sid === 'c3' && !entry.dead);
    const idx = CX_SCENES.findIndex(s => s.id === sid);
    h += '<div class="cx-actions">';
    if (canDie) h += '<button class="cx-btn ghost" data-act="death">' + (sid === 'c3' ? 'My character fell' : 'My role died: take another') + '</button>';
    if (idx < CX_SCENES.length - 1) h += '<button class="cx-btn ghost" data-goto="' + CX_SCENES[idx + 1].id + '">Go to ' + CX_SCENES[idx + 1].n + ' →</button>';
    h += '</div></div></article>';
    return h;
  }

  function playerHTML(){
    const s = CX_SCENES.find(x => x.id === ui.scene) || CX_SCENES[0];
    const entry = myRolls()[s.id];
    const face = entry ? ((CX_ROLES[entry.role] || {}).face || ((CX_ROLES[entry.role] || {}).lake ? '≈' : '✦')) : '?';
    let h = sceneTabs(myRolls());
    h += '<div class="cx-stage">';
    h += '<div class="cx-crystal' + (entry ? ' spent' : '') + '" id="cxCrystal" aria-hidden="true"><span class="cx-die" id="cxDie">' + face + '</span></div>';
    h += '<div><h3 class="cx-scene-title">' + s.n + ' — ' + esc(s.name) + '</h3>';
    h += '<p class="cx-intro">' + esc(s.intro) + '</p><p class="cx-rule">' + esc(s.rule) + '</p>';
    if (!entry) h += '<button class="cx-btn" data-act="roll">Touch the crystal</button>';
    else h += '<p class="cx-hint">This crystal\'s memory has already been taken.</p>';
    if (writeError) h += '<p class="cx-warn">Could not save to the server. Show your card to the GM.</p>';
    h += '</div></div>';
    if (entry) h += cardHTML(s.id, entry);
    h += rulesHTML();
    return h;
  }

  function rulesHTML(){
    return '<details class="cx-rules"><summary>How the memory works</summary><ul>' +
      '<li>You play with <b>your own character sheet</b> (abilities and skills) plus the <b>kit of the role</b> the crystal gives you.</li>' +
      '<li>If your role dies, you take another role from the same scene <b>at once</b>.</li>' +
      '<li>In the next scene, everyone touches the crystal again.</li>' +
      '<li>Nobody there knows who you are. You are ordinary people in the war.</li>' +
    '</ul></details>';
  }

  function gmHTML(){
    const s = CX_SCENES.find(x => x.id === ui.scene) || CX_SCENES[0];
    let h = '<section class="cx-gm">';
    h += '<div class="cx-gm-bar">';
    h += '<button class="cx-btn ' + (isOpen ? 'on' : 'ghost') + '" data-act="toggle-open">' + (isOpen ? '◆ Players can see this tab' : '◇ Hidden from players') + '</button>';
    h += '<button class="cx-btn ghost" data-act="reset">Clear all rolls</button>';
    h += '</div>';
    h += '<h3>The table right now</h3><p class="sub">Updates live as each player touches the crystal. † marks a role that died.</p>';
    h += '<div class="cx-table-wrap"><table class="cx-table"><thead><tr><th>Character</th>' + CX_SCENES.map(x => '<th>' + x.n + '</th>').join('') + '</tr></thead><tbody>';
    players().forEach(pc => {
      const rolls = allRolls[pc] || {};
      h += '<tr><td class="pc">' + esc(pc) + '</td>';
      CX_SCENES.forEach(x => {
        const r = rolls[x.id];
        const role = r && CX_ROLES[r.role];
        if (!role) { h += '<td class="muted">—</td>'; return; }
        let cell = esc(role.name);
        if (r.el != null && CX_ELEMENTS[r.el]) cell += ' <span class="muted">(' + CX_ELEMENTS[r.el].n + ')</span>';
        const deaths = (Array.isArray(r.prev) ? r.prev.length : 0) + (r.dead ? 1 : 0);
        if (deaths) cell += '<div class="dead">' + '† '.repeat(Math.min(deaths, 6)).trim() + '</div>';
        h += '<td>' + cell + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div></section>';

    h += sceneTabs(null);
    h += '<div class="cx-stage" style="grid-template-columns:1fr;"><div><h3 class="cx-scene-title">' + s.n + ' — ' + esc(s.name) + '</h3>';
    h += '<p class="cx-intro">' + esc(s.intro) + '</p><p class="cx-rule">' + esc(s.rule) + '</p></div></div>';

    h += '<div class="cx-ref"><h4>Roles in ' + s.n + ', with what they witness</h4>';
    Object.keys(CX_ROLES).filter(k => CX_ROLES[k].scene === s.id).forEach(k => {
      const r = CX_ROLES[k];
      const holders = players().filter(pc => allRolls[pc] && allRolls[pc][s.id] && allRolls[pc][s.id].role === k);
      h += '<div class="cx-ref-item"><b>' + esc(r.name) + '</b><span class="tag">' + esc(r.post) + '</span>';
      if (holders.length) h += '<span class="tag">· ' + holders.map(esc).join(', ') + '</span>';
      h += '<div class="cx-secret">';
      if (r.witness) h += '<p><b>Witnesses:</b> ' + esc(r.witness) + '</p>';
      if (r.hook) h += '<p><b>Hook:</b> ' + esc(r.hook) + '</p>';
      if (r.death) h += '<p><b>How it can die:</b> ' + esc(r.death) + '</p>';
      h += '</div></div>';
    });
    if (s.id === 'c4') {
      h += '<div class="cx-ref-item"><b>The figure in red</b><span class="tag">said to each one, privately</span><div class="cx-secret">' +
        players().map(pc => '<p><b>' + esc(pc) + ':</b> <i>' + esc(CX_RED_LINES[pc] || '') + '</i></p>').join('') + '</div></div>';
    }
    h += '</div>';
    return h;
  }

  function render(){
    const who = me();
    const showTab = !!who && (isGM() || isOpen);
    switcher.classList.toggle('ready', showTab);
    if (!showTab && ui.view === 'crystals') setView('map', true);
    switcher.querySelectorAll('.view-btn').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === ui.view)));
    if (!who || ui.view !== 'crystals') return;
    body.innerHTML = isGM() ? gmHTML() : playerHTML();
  }

  function setView(v, silent){
    ui.view = v;
    document.body.classList.toggle('view-crystals', v === 'crystals');
    saveUi();
    if (!silent) render();
  }

  /* ---------------- events ---------------- */

  switcher.addEventListener('click', (e) => {
    const b = e.target.closest('.view-btn');
    if (b) setView(b.dataset.view);
  });

  body.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.scene) { ui.scene = b.dataset.scene; saveUi(); render(); return; }
    if (b.dataset.goto) { ui.scene = b.dataset.goto; saveUi(); render(); view.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const act = b.dataset.act;
    if (act === 'roll') doRoll();
    else if (act === 'death') doDeath();
    else if (act === 'toggle-open' && isGM()) db.ref('crystals/open').set(!isOpen);
    else if (act === 'reset' && isGM()) {
      if (confirmReset(b)) db.ref('crystals/rolls').remove();
    }
  });

  // two-click confirmation instead of a browser dialog
  function confirmReset(btn){
    if (btn.dataset.armed) return true;
    btn.dataset.armed = '1';
    btn.textContent = 'Click again to clear every roll';
    setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = 'Clear all rolls'; } }, 3000);
    return false;
  }

  /* ---------------- Firebase + login hooks ---------------- */

  db.ref('crystals/rolls').on('value', snap => {
    if (rolling) { allRolls = snap.val() || {}; return; }
    allRolls = snap.val() || {};
    render();
  });
  db.ref('crystals/open').on('value', snap => {
    isOpen = !!snap.val();
    render();
  });

  // re-render after login (app.js calls applyAccessToUI on every login)
  if (typeof applyAccessToUI === 'function') {
    const orig = applyAccessToUI;
    applyAccessToUI = function(){ orig.apply(this, arguments); render(); };
  }

  setView(ui.view === 'crystals' ? 'crystals' : 'map', true);
  render();
})();
