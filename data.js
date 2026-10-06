// ============================================================
// CAMPAIGN DATA — locations, characters, canonical distances.
// Editing this file is the normal way to update content
// between sessions (new locations, NPCs, backgrounds, etc.).
// ============================================================

// ============================================================
// ACCESS — set each character's PIN here.
// Share these numbers with each player individually
// (WhatsApp, on paper, etc.) — not visible on screen.
// ============================================================
const ACCESS_PINS = {
  "Maeri": "1111",
  "Uthar": "2222",
  "Dongo": "3333",
  "Aynara": "4444",
  "GM": "0000"
};
const STORAGE_KEY = "wot_map_session_v1";
const PLAYER_CHARS = Object.keys(ACCESS_PINS).filter(c => c !== "GM");

// ============================================================
// CANONICAL DISTANCES — source: wot.fandom.com/wiki/Distances_in_the_Westlands
// "As the crow flies", between the 28 main capitals/locations
// of the continent. DIST_MATRIX[i][j] = distance between
// DIST_CITIES[i] and DIST_CITIES[j].
// ============================================================
const DIST_CITIES = ["Amador", "Aringill", "Baerlon", "Bandar Eban", "Caemlyn", "Cairhien", "Chachin", "Ebou Dar", "Emond's Field", "Fal Dara", "Fal Moran", "Falme", "Far Madding", "Godan", "Illian", "Jangai Pass", "Jehanna", "Katar", "Lugard", "Maradon", "Mayene", "Salidar", "Shol Arbela", "Tanchico", "Tar Valon", "Tear", "Tremalking", "Whitebridge"];
const DIST_MATRIX = [
  [null,1998,993,1644,1674,2444,2569,602,824,3417,3327,1307,1631,2748,1358,3071,502,1149,1060,2301,2911,454,2922,938,2421,1930,1441,1005],
  [1998,null,1751,2787,357,588,1619,1890,1775,1746,1657,2897,541,1305,1452,1121,1683,2050,943,1982,1551,1676,1546,2765,899,929,3438,1132],
  [993,1751,null,1060,1397,1981,1691,1468,171,2715,2631,1180,1658,2882,1913,2609,529,317,1107,1320,3098,1170,2139,1198,1786,2148,2131,668],
  [1644,2787,1060,null,2440,2934,2264,2240,1103,3443,3370,646,2717,3942,2873,3531,1410,745,2152,1629,4156,2011,2813,1079,2646,3198,2046,1728],
  [1674,357,1397,2440,null,792,1516,1634,1418,1892,1800,2540,502,1573,1345,1401,1333,1700,646,1762,1811,1389,1573,2414,935,1025,3114,775],
  [2444,588,1981,2934,792,null,1267,2424,2051,1159,1071,3161,1128,1642,2040,637,2055,2240,1438,1799,1885,2180,1035,3110,460,1479,3877,1477],
  [2569,1619,1691,2264,1516,1267,null,2833,1843,1206,1146,2716,2017,2877,2814,1608,2071,1790,1934,700,3124,2523,570,2865,807,2520,3821,1634],
  [602,1890,1468,2240,1634,2424,2833,null,1313,3506,3413,1900,1412,2359,847,3010,939,1687,995,2695,2488,316,3092,1494,2513,1552,1714,1200],
  [824,1775,171,1103,1418,2051,1843,1313,null,2837,2751,1124,1629,2853,1805,2685,375,398,1051,1490,3062,1024,2274,1080,1888,2096,1983,654],
  [3417,1746,2715,3443,1892,1159,1206,3506,2837,null,92,3838,2284,2617,3194,910,2961,2888,2512,1904,2837,3233,637,3912,999,2622,4796,2412],
  [3327,1657,2631,3370,1800,1071,1146,3413,2751,92,null,3759,2195,2549,3105,854,2872,2807,2420,1846,2772,3141,577,3827,908,2538,4707,2321],
  [1307,2897,1180,646,2540,3161,2716,1900,1124,3838,3759,null,2705,3914,2650,3788,1280,952,2103,2151,4106,1743,3230,489,2951,3120,1403,1768],
  [1631,541,1658,2717,502,1128,2017,1412,1629,2284,2195,2705,null,1226,911,1639,1429,1974,605,2241,1441,1246,2039,2491,1390,542,3046,989],
  [2748,1305,2882,3942,1573,1642,2877,2359,2853,2617,2549,3914,1226,null,1548,1722,2633,3198,1814,3287,248,2310,2669,3660,2087,819,4073,2214],
  [1358,1452,1913,2873,1345,2040,2814,847,1805,3194,3105,2650,911,1548,null,2527,1463,2202,923,2886,1655,909,2917,2295,2276,789,2549,1366],
  [3071,1121,2609,3531,1401,637,1608,3010,2685,910,854,3788,1639,1722,2527,null,2692,2858,2043,2249,1934,2785,1163,3747,905,1849,4508,2114],
  [502,1683,529,1410,1333,2055,2071,939,375,2961,2872,1280,1429,2633,1463,2692,null,762,825,1807,2827,649,2443,1083,1976,1843,1840,578],
  [1149,2050,317,745,1700,2240,1790,1687,398,2888,2807,952,1974,3198,2202,2858,762,null,1421,1304,3414,1409,2286,1086,2003,2464,2079,985],
  [1060,943,1107,2152,646,1438,1934,995,1051,2512,2420,2103,605,1814,923,2043,825,1421,null,1963,2015,743,2123,1888,1524,1045,2498,469],
  [2301,1982,1320,1629,1762,1799,700,2695,1490,1904,1846,2151,2241,3287,2886,2249,1807,1304,1963,null,3532,2379,1269,2383,1369,2780,3383,1546],
  [2911,1551,3098,4156,1811,1885,3124,2488,3062,2837,2772,4106,1441,248,1655,1934,2827,3414,2015,3532,null,2466,2909,3834,2333,988,4201,2430],
  [454,1676,1170,2011,1389,2180,2523,316,1024,3233,3141,1743,1246,2310,909,2785,649,1409,743,2379,2466,null,2798,1392,2235,1491,1803,889],
  [2922,1546,2139,2813,1573,1035,570,3092,2274,637,577,3230,2039,2669,2917,1163,2443,2286,2123,1269,2909,2798,null,3335,651,2474,4253,1931],
  [938,2765,1198,1079,2414,3110,2865,1494,1080,3912,3827,489,2491,3660,2295,3747,1083,1086,1888,2383,3834,1392,3335,null,2968,2847,1013,1645],
  [2421,899,1786,2646,935,460,807,2513,1888,999,908,2951,1390,2087,2276,905,1976,2003,1524,1369,2333,2235,651,2968,null,1828,3815,1417],
  [1930,929,2148,3198,1025,1479,2520,1552,2096,2622,2538,3120,542,819,789,1849,1843,2464,1045,2780,988,1491,2474,2847,1828,null,3263,1488],
  [1441,3438,2131,2046,3114,3877,3821,1714,1983,4796,4707,1403,3046,4073,2549,4508,1840,2079,2498,3383,4201,1803,4253,1013,3815,3263,null,2411],
  [1005,1132,668,1728,775,1477,1634,1200,654,2412,2321,1768,989,2214,1366,2114,578,985,469,1546,2430,889,1931,1645,1417,1488,2411,null]
];

// ============================================================
// WATER ROUTES — river/sea systems. Any two cities that share a
// system get an extra "by boat" option in the Distances
// calculator. Grouped by waterway instead of listing every pair
// by hand, so adding a city to a river is a one-line change.
// Sources (WoT wiki + Wheel of Time Atlas):
//  - River Erinin: rises in the Spine of the World, forms the
//    southern border of Shienar and Arafel, flows through Tar
//    Valon, forms the Cairhien/Andor border (Aringill <-> Maerone
//    port crossing), and reaches the Sea of Storms at Tear.
//    Confirmed in-book trips: Aringill<->Tar Valon<->Tear (TDR),
//    Maerone->Tear (LoC).
//    Cairhien city actually sits on the River Alguenya, which
//    joins the Erinin just south of it; it's listed on the Erinin
//    system because boats reach it by way of the Alguenya.
//  - River Manetherendrelle ("White River"): rises in Andor,
//    passes Whitebridge, runs through Altara, borders Murandy,
//    reaches the Sea of Storms at Illian (river trip Remen->Illian
//    is mentioned in-book).
//  - Sea Folk ships connect coastal port cities on the Sea of Storms.
// Andor's river ports are Aringill (Erinin) and Whitebridge (Arinelle,
// near where it meets the Manetherendrelle). Caemlyn stands on no great
// river, so it has no boat option (R03, 06/10/2026).
//  - River Arinelle: flows south from Saldaea past Maradon to Whitebridge.
// ============================================================
const WATER_MODES = {
  "rio": {
    label: "River boat",
    milesPerDay: 107,
    hint: "In The Dragon Reborn, Egwene's group travels ~1,600 miles down the River Erinin from Tar Valon to Tear in about 15 days aboard a boat described as slow — roughly 107 miles/day."
  },
  "mar": {
    label: "Sea ship (Sea Folk)",
    milesPerDay: 170,
    hint: "Sea Folk ships (Atha'an Miere) are described in canon as the fastest known vessels in the world, aided by Windfinders — but no exact speed is ever given in the books, so this number is a reasonable estimate, not a canonical figure."
  }
};
const RIVER_SYSTEMS = [
  { river: "River Erinin", mode: "rio", cities: ["Shol Arbela", "Tar Valon", "Cairhien", "Aringill", "Tear"] },
  { river: "River Arinelle", mode: "rio", cities: ["Maradon", "Whitebridge"] },
  { river: "River Manetherendrelle", mode: "rio", cities: ["Whitebridge", "Ebou Dar", "Lugard", "Illian"] },
  { river: "Sea of Storms coast (Sea Folk)", mode: "mar", cities: ["Tear", "Illian", "Ebou Dar"] }
];
function findWaterRoute(cityA, cityB){
  const system = RIVER_SYSTEMS.find(s => s.cities.includes(cityA) && s.cities.includes(cityB));
  if(!system) return null;
  return { mode: system.mode, note: `via the ${system.river}` };
}
function cityHasWaterRoute(city){
  return RIVER_SYSTEMS.some(s => s.cities.includes(city));
}

// ============================================================
// CHARACTERS — profile + home location (homeLocationId points
// to an id in the LOCATIONS array). When that character opens
// the matching location, a "home turf" banner appears
// automatically at the top of the panel, even without writing
// a manual background card for it.
// ============================================================
const CHARACTERS = {
  "Maeri": { classe: "Cleric",  origemLabel: "Born in a village in Altara; raised by The Kin in Ebou Dar; grew up in So Eban", homeLocationId: "altara" },
  "Uthar": { classe: "Fighter", origemLabel: "House Maredo — a border fortress near Alkindar, Altara", homeLocationId: "altara" },
  "Dongo": { classe: "Rogue",   origemLabel: "Tremonsien, Cairhien", homeLocationId: "tremosien" },
  "Aynara": { classe: "Paladin", origemLabel: "Origin not yet revealed in-game", homeLocationId: null }
};

// ============================================================
// DATA — edit here. `top` and `left` are percentages (0-100)
// relative to the total size of the map image.
// ============================================================
const LOCATIONS = [
  {
    id: "tar-valon",
    distCity: "Tar Valon",
    name: "Tar Valon",
    top: 35.5, left: 70.5,
    desc: "Island city on the River Erinin, in sight of the Herald's Lighthouse. Seat of the Aes Sedai and the Amyrlin Seat, it is the most populous city in the Westlands, counting the bridge villages, and a vital trade link between the Borderlands and the southern realms.",
    geography: [
      "The island is about eight miles long and over two miles wide. The River Erinin splits around it: the Alindrelle Erinin to the west and the Osendrelle Erinin to the east.",
      "The Shining Walls and the White Tower, at some 600 feet the tallest building on the continent, are visible for miles.",
      "The Herald's Lighthouse rises about thirty miles to the southwest of the island.",
      "Six great bridges link the island to the mainland, each ending in a village: Jualdhe, Darein and Alindaer on the west bank; Luagde, Daghain and Osenrein on the east.",
      "The Ogier Grove, two miles of oaks and Great Trees ringed by spiral stone arches, holds a Waygate that is fenced off and sealed to the public.",
      "Two harbors serve the city: Northharbour, built by the Ogier in white stone veined with silver and almost a mile wide, and Southharbour, at the island's southern tip."
    ],
    politics: [
      "Ruled by the Amyrlin Seat, supreme leader of the Aes Sedai: above every Ajah, belonging to all and none, holding religious, political and military power.",
      "A magocracy: the day-to-day running of the city falls to a council of Aes Sedai and civil administrators. It is the only place where Aes Sedai have held official administrative power since the War of the Hundred Years.",
      "The Hall of the Tower, with three Sitters from each Ajah (twenty-one in all), votes on the great decisions.",
      "By Tower Law, any man who can channel must be brought to Tar Valon and tried by the Tower before he is gentled.",
      "Tower Law: crimes committed in the city are judged by the Tower, not by outside authorities, which often chafes visitors who don't know the local rules.",
      "Defended by the Tower Guard, led by the High Captain, who answers to the Amyrlin Seat. Tar Valon has never been conquered and has stayed independent since its founding.",
      "Anything enchanted with the One Power is controlled by the White Tower; buying or selling such items without authorization is illegal.",
      "The bridge villages are run by councils of civil elders under the Tower's indirect oversight, with a Tower Guard presence that varies from village to village."
    ],
    culture: [
      "About 500,000 people live here, in a city built largely by Ogier stonemasons: even ordinary inns and shops look like works of art.",
      "Raised soon after the Shattering, with the Ogier contributing heavily. The name comes from the Old Tongue and means roughly \"Tower that Guards.\"",
      "The city's symbol is the Flame of Tar Valon: a white flame, also drawn as a white teardrop with its point up.",
      "Every nation has a presence: embassies, merchants, and outsiders who never left.",
      "The Light is the common faith.",
      "Natives grow up treating Aes Sedai and Warders as everyday neighbors, though always with an undercurrent of reverence and respect.",
      "Merchants steer clear of any single Ajah's colors so as not to look affiliated.",
      "Each bridge village has its own temper: Alindaer is an opportunistic crossroads playing the Great Game in miniature; Jualdhe is a place of passage where no one asks questions; Darein is stubbornly persistent; Luagde is discreet; Daghain leans Cairhienin; Osenrein welcomes weary travelers and keeps the memory of its dead."
    ],
    places: [
      { group: "City", items: [
        { name: "The Blue Cat", desc: "Inn shaped like a sleeping blue cat, overlooking the Erinin. Multicultural décor, old maps and exotic wines. Innkeeper: Tom Veldan." },
        { name: "The Light's Blessing Inn", desc: "Mid-sized inn run by Halwin Sorrel, with a library of rare books." },
        { name: "The Woman of Tanchico", desc: "Inn on the edge of Southharbour, with a few tables tucked into more private corners." },
        { name: "Great Fish Market", desc: "A market whose streets fan out toward the river like a school of colorful fish (see Shops)." },
        { name: "Kandori Merchants' Guild Hall", desc: "Its façade shows horses galloping out of the sea." },
        { name: "The White Tower", desc: "The Amyrlin's and the Keeper's offices at the top; the seven Ajahs' quarters in pie-slice sections of the upper half; the Novices' Palace; the circular Hall of the Tower; and the Great Library, the largest repository of knowledge in the world." },
        { name: "The Ogier Grove", desc: "Two miles of oaks and Great Trees; the Waygate inside is fenced off and sealed." }
      ] },
      { group: "Bridge villages", items: [
        { name: "Alindaer", desc: "West bank, ~8,000 people. The busiest of the six bridges and the start of the road south to Caemlyn. Inns: The Blue Brick and The Carver's Table. Three money-changers, a river port for barges, and Bridge Square, the best place to hear rumors from far away." },
        { name: "Darein", desc: "West bank, ~4,500. The middle bridge, a place for discreet meetings between factions. The Windmill Tavern (tavern, barn and smithy in one building), the Hall of Negotiations (neutral meetings for a fee to the council), Smiths' Row and the North Mill." },
        { name: "Jualdhe", desc: "West bank, ~3,200. The northern gate, where travelers and troops from the Borderlands arrive. Inns: The Shield and the Snow and The Last Flame. A twenty-soldier Tower Guard outpost and the Border Market." },
        { name: "Luagde", desc: "East bank, ~2,800. A quiet fishing and farming village. Inn: The Ferry and the Hook. Old Maret's Garden belongs to an unofficial healer the villagers trust." },
        { name: "Daghain", desc: "East bank, ~5,000. The most commercial of the eastern villages, with strong Cairhienin influence. Inns: The Gray Stone and several cheaper ones around Market Square. A market three times a week and a Guild depot." },
        { name: "Osenrein", desc: "East bank, ~3,800. End of the southern road, built to welcome weary travelers. Inn: The Last Mile. Inn Row, the Provisions Market, View Square, and the Temple of Memory, whose walls bear the names of the dead." }
      ] }
    ],
    subMap: {
      title: "Tar Valon",
      image: "map-tar-valon.png",
      credit: "Map by Adam Whitehead, Atlas of Ice and Fire (2019)",
      pins: [
        { name: "Jualdhe", top: 34.5, left: 10.0, size: 13 },
        { name: "Darein", top: 63.5, left: 6.0, size: 12 },
        { name: "Alindaer", top: 87.5, left: 16.5, size: 13 },
        { name: "Luagde", top: 27.4, left: 70.4, size: 13 },
        { name: "Daghain", top: 47.0, left: 81.5, size: 13 },
        { name: "Osenrein", top: 76.5, left: 87.5, size: 12 },
        { name: "The White Tower", top: 55.5, left: 43.2, size: 10 },
        { name: "The Blue Cat", top: 62.2, left: 34.3, size: 3.6 },
        { name: "Kandori Merchants' Guild Hall", top: 63.6, left: 39.4, size: 3.6 },
        { name: "Great Fish Market", top: 68.2, left: 37.2, size: 3.6 },
        { name: "The Woman of Tanchico", top: 86.1, left: 43.9, size: 3.6 },
        { name: "The Ogier Grove", top: 71.5, left: 61.5, size: 14 }
      ]
    },
    rumors: [
      "The Whitecloaks have been asking questions in the bridge villages.",
      "A merchant at Alindaer's port who complained about the fees has vanished.",
      "One night the sky above Darein glowed orange to the north.",
      "If you don't want to be seen leaving Tar Valon, go by way of Luagde."
    ],
    knowledge: [
      { who: "Dongo", tag: "personal background", pc: true, text: "Reached Tar Valon by boat, arriving at South Harbor — surviving the voyage by stealing olives on board." },
      { who: "Dongo", tag: "personal background", pc: true, text: "Carries a mission from the Ghostbloods: eliminate 'the rat merchant' in Tar Valon. In return they promised him information about his own past. They warned him: 'he is not what he seems.' Refusing could mean being found by his old buyers." },
      { who: "Aynara", tag: "personal background", pc: true, visibleTo: ["Aynara"], text: "Worked for High Inquisitor Dagobert Thane as a tracker and informant, finding and mapping Portal Stones with a portal-identifying device he gave her." },
      { who: "Aynara", tag: "personal background", pc: true, visibleTo: ["Aynara"], text: "Was imprisoned in the Whitecloak camp after openly questioning the mission and disobeying a direct order — she had tried to walk away from it." },
    ],
    npcs: [
      { name: "Serenya Taravin", role: "Aes Sedai · Blue Ajah · Sitter", type: "npc", desc: "Apparent age around 45, from Saldaea. Pragmatic and direct: tall, black hair streaked with grey pinned in a bun, dark eyes. A Sitter in the Hall of the Tower, she runs a network of informants outside the Tower's official channels and hired the party for tasks the Tower cannot take on openly." },
      { name: "Jarem al'Caar", role: "Serenya's Warder", type: "npc", desc: "Apparent age around 50, jovial and quick to read people. A former intelligence operative for a noble House of Arafel. Dark brown hair." },
      { name: "Tomas \"Tom\" Veldan", role: "Innkeeper · The Blue Cat", type: "npc", desc: "Burly, friendly man who owns the Blue Cat Inn, overlooking the River Erinin." },
      { name: "Halwin Sorrel", role: "Innkeeper · The Light's Blessing", type: "npc", desc: "Runs the Light's Blessing Inn, a mid-sized inn with a library of rare books." },
      { name: "Edras Vorn", role: "Tower Guard Captain · Jualdhe", type: "npc", desc: "Veteran of the north, around fifty, commanding the Tower Guard outpost at Jualdhe. A practical man who doesn't believe the stories but acts as if he did." },
      { name: "Mira Lyndrel", role: "House Lyndrel agent · Daghain", type: "npc", desc: "Cairhienin agent of House Lyndrel who sells information as readily as goods. The person to hire to learn what is coming from the east." },
      { name: "Ossin Leal", role: "Innkeeper · The Ferry and the Hook", type: "npc", desc: "Knows the name and face of every villager in Luagde and is the village's social hub." },
      { name: "Cenda Vail", role: "Innkeeper · The Last Mile", type: "npc", desc: "Runs the Last Mile in Osenrein and seems to know each guest's origin and destination before asking the price." },
      { name: "The Traveler's Shop", role: "General gear", type: "shop", desc: "A white-stone shop two blocks from the South Bridge, with ropes, hooks and baskets covering every wall. Owner Anaiatel Doswell (Andor), a broad, gray-bearded former caravan guard, speaks plainly and never sells what you don't need. His niece Sela (Murandy), a chaotic but sharp-minded teenager, helps at the counter.",
        items: [
          { name: "Backpack", price: "2 GP" },
          { name: "Large backpack", price: "4 GP" },
          { name: "Burlap sack", price: "1 CP" },
          { name: "Leather pouch", price: "5 SP" },
          { name: "Rations (1 day)", price: "5 SP" },
          { name: "Rations (1 week, packed)", price: "3 GP" },
          { name: "Rope, hempen (50 ft)", price: "1 GP" },
          { name: "Rope, silk (50 ft)", price: "10 GP" },
          { name: "Blanket", price: "5 SP" },
          { name: "Tent (two-person)", price: "2 GP" },
          { name: "Torch", price: "1 CP" },
          { name: "Hooded lantern", price: "5 GP" },
          { name: "Tinderbox", price: "5 SP" },
          { name: "Lamp oil (flask)", price: "1 SP" },
          { name: "Leather waterskin", price: "2 SP" },
          { name: "Glass bottle", price: "1 GP" },
          { name: "Grappling hook", price: "2 GP" },
          { name: "Piton", price: "5 CP" },
          { name: "Hammer (for pitons)", price: "1 GP" },
          { name: "Shovel", price: "2 GP" },
          { name: "Candle", price: "1 CP" },
          { name: "Signal whistle", price: "5 CP" },
          { name: "Whetstone", price: "1 CP" },
          { name: "Paper (sheet)", price: "2 SP" },
          { name: "Ink (bottle)", price: "10 GP" },
          { name: "Quill", price: "2 CP" }
        ] },
      { name: "The Blade Shoppe", role: "Weapons", type: "shop", desc: "A forge in a side alley near the north docks, marked only by a wrought-iron sword. Owner Callan Forjaforte (Illian), a muscular, black-bearded man of few words, will ask you 'What for?' before showing you a blade. His apprentice Bryn (Tar Valon) handles the counter.",
        items: [
          { name: "Dagger", price: "2 GP" },
          { name: "Handaxe", price: "5 GP" },
          { name: "Light hammer", price: "2 GP" },
          { name: "Spear", price: "1 GP" },
          { name: "Shortsword", price: "10 GP" },
          { name: "Longsword", price: "15 GP" },
          { name: "Greatsword", price: "50 GP" },
          { name: "Greataxe", price: "30 GP" },
          { name: "Shortbow", price: "25 GP" },
          { name: "Longbow", price: "50 GP" },
          { name: "Light crossbow", price: "25 GP" },
          { name: "Arrows (20)", price: "1 GP" },
          { name: "Crossbow bolts (20)", price: "1 GP" },
          { name: "Quiver", price: "1 GP" },
          { name: "Whetstone (weapons)", price: "5 SP" }
        ] },
      { name: "Cyril's Fine Armor", role: "Armor", type: "shop", desc: "A wide shop on a main commercial street, with a showy suit of scale armor in the window that is never for sale. Owner Cyril Nadaven (Tear), a blunt former outfitter of soldiers, sells armor for real fighting, not ceremony. Her nephew Davan (Andor) fits pieces to unusual bodies.",
        items: [
          { name: "Leather armor", price: "10 GP" },
          { name: "Studded leather armor", price: "45 GP" },
          { name: "Chain shirt", price: "50 GP" },
          { name: "Scale mail", price: "50 GP" },
          { name: "Chain mail", price: "75 GP" },
          { name: "Half plate", price: "750 GP" },
          { name: "Reinforced wooden shield", price: "7 GP" },
          { name: "Metal shield", price: "10 GP" },
          { name: "Leather helm", price: "3 GP" },
          { name: "Metal helm", price: "15 GP" },
          { name: "Leather gloves", price: "2 GP" },
          { name: "Mail gloves", price: "8 GP" },
          { name: "Leather bandolier", price: "5 GP" },
          { name: "Wide leather belt", price: "2 GP" },
          { name: "Leather-and-linen quiver", price: "3 GP" }
        ] },
      { name: "Erol's Fine Tailoring", role: "Tailor", type: "shop", desc: "A shop with a painted geometric façade that deliberately avoids any Ajah's colors. Owner Erol Sanvaere (Cairhien) asks about destination and company before suggesting a thing. Mila (Tar Valon) does the embroidery and finishing.",
        items: [
          { name: "Traveler's clothes (sturdy)", price: "2 GP" },
          { name: "Common clothes (spare)", price: "5 SP" },
          { name: "Fine clothes (for cities)", price: "15 GP" },
          { name: "Disguise clothes (neutral, no national markers)", price: "12 GP" },
          { name: "Hooded cloak", price: "5 SP" },
          { name: "Traveling cloak (waterproofed)", price: "3 GP" },
          { name: "Sturdy boots", price: "2 GP" },
          { name: "Fine boots (for occasions)", price: "8 GP" },
          { name: "Cloth gloves", price: "2 SP" },
          { name: "Large kerchief", price: "1 SP" },
          { name: "Sewing and repair kit", price: "1 GP" },
          { name: "Custom order", price: "by arrangement" }
        ] },
      { name: "Equine Emporium", role: "Stables & tack", type: "shop", desc: "Stables for forty animals, a covered test yard and a tack shop out front. Owner Arene Miron (Shienar), bow-legged and horse-wise, can recite any animal's bloodline and won't sell a sick or badly trained horse. Coram (Andor) tends the animals and matches riders to mounts.",
        items: [
          { name: "Draft horse", price: "50 GP" },
          { name: "Light warhorse", price: "150 GP" },
          { name: "Racehorse", price: "200 GP" },
          { name: "Mule", price: "8 GP" },
          { name: "Pony", price: "30 GP" },
          { name: "Standard saddle", price: "10 GP" },
          { name: "War saddle (reinforced)", price: "20 GP" },
          { name: "Bridle", price: "2 GP" },
          { name: "Saddlebags (pair)", price: "4 GP" },
          { name: "Horse feed (1 day)", price: "5 CP" },
          { name: "Horseshoes (set of four)", price: "1 GP" },
          { name: "Saddle blanket", price: "5 SP" },
          { name: "Metal stirrups (pair)", price: "3 GP" }
        ] },
      { name: "First Stop Bakery", role: "Bakery", type: "shop", desc: "The first street past the Alindaer Bridge: not the best bread in Tar Valon, but the first. Owner Branda Voss (Andor), flour in her eyebrows, knows every regular traveler. Young Sela (Tar Valon) runs the dining room.",
        items: [
          { name: "Bread (loaf)", price: "2 CP" },
          { name: "Hardtack for travel (1 week)", price: "1 SP" },
          { name: "Aged cheese", price: "1 SP" },
          { name: "Dried meat (portion)", price: "3 SP" },
          { name: "Pressed travel ration", price: "5 SP" },
          { name: "Honey (small jar)", price: "3 SP" },
          { name: "Simple wine (bottle)", price: "2 SP" },
          { name: "Ale (mug)", price: "4 CP" },
          { name: "Tea (cup, served in shop)", price: "2 CP" },
          { name: "Tear coffee (rare, pricey)", price: "1 SP" }
        ] },
      { name: "Mara al'Dene, Herbalist", role: "Herbs & healing", type: "shop", desc: "A small shop in an alley between the commercial district and the Yellow Ajah's hospital, hung with drying herbs. Mara al'Dene (Tear) studied three years with the Yellow Ajah before going her own way, and asks about symptoms before recommending anything. Her apprentice Nessie hails from Ghealdan.",
        items: [
          { name: "Healing potion (1d4+1)", price: "50 GP" },
          { name: "Greater healing potion (4d4+4)", price: "100 GP" },
          { name: "Healer's kit", price: "5 GP" },
          { name: "Antitoxin (generic)", price: "50 GP" },
          { name: "Calming herbs (10 doses)", price: "3 GP" },
          { name: "Sleeping herbs (5 doses)", price: "5 GP" },
          { name: "Wound poultice", price: "2 GP" },
          { name: "Fever tincture (5 doses)", price: "4 GP" },
          { name: "Medicinal herbs, bulk", price: "1 GP/lb" },
          { name: "Healing ritual components", price: "10 GP" }
        ] },
      { name: "The Erinin Writing Desk", role: "Stationer & books", type: "shop", desc: "A silent shop near the Tower, more library than store, favored by novices on errands and independent scholars. Owner Nesara Tol (Tar Valon), white-haired and ink-stained, refuses to sell cheap paper because documents should last. Aldric (Cairhien), a discreet calligrapher, copies documents on commission.",
        items: [
          { name: "Parchment (sheet)", price: "1 SP" },
          { name: "Quality parchment (sheet)", price: "3 SP" },
          { name: "Common paper (sheet)", price: "2 SP" },
          { name: "Quality paper (sheet)", price: "5 SP" },
          { name: "Common ink (bottle)", price: "10 GP" },
          { name: "Quality ink (bottle, long-lasting)", price: "20 GP" },
          { name: "Red ink (bottle)", price: "15 GP" },
          { name: "Common quill", price: "2 CP" },
          { name: "Quality quill", price: "1 SP" },
          { name: "Blank seal and signet", price: "5 SP" },
          { name: "Blank book (200 pages)", price: "25 GP" },
          { name: "Blank book (50 pages, small)", price: "8 GP" },
          { name: "Map of Tar Valon (official)", price: "1 GP" },
          { name: "Map of Tar Valon (unofficial, with shortcuts)", price: "3 GP" },
          { name: "Map of the Borderlands (basic)", price: "5 GP" },
          { name: "Map of the Borderlands (detailed, with outposts)", price: "15 GP" },
          { name: "Writing/divination ritual components", price: "10 GP" },
          { name: "Document copy (per page, on commission)", price: "5 SP" }
        ] },
      { name: "Great Fish Market", role: "Open market", type: "shop", desc: "An open-air market shaped like a school of fish, its streets narrowing toward the Erinin. Goods from every nation, rare fish on ice, vendors calling in Illianer, Tairen and Saldaean accents. Neutral ground with no single owner; nothing magical is sold here, because vendors know the Tower is watching.",
        itemsNote: "Stock varies with the day, the season and which harbor just received ships. Almost any common item can be found, at varying prices and quality; rarer goods turn up now and then." },
    ]
  },
  {
    id: "tremosien",
    name: "Tremonsien",
    top: 43.3, left: 76.1,
    desc: "Small village in Cairhien, north of the capital, on the road to Tar Valon.",
    geography: [
      "Sits atop a terraced hill in the foothills of Kinslayer's Dagger, with square stone houses on uniform lots and streets laid out in a neat grid.",
      "About a hundred miles north of the capital along the road to Tar Valon."
    ],
    politics: [
      "Governed locally, under the nobility of the region."
    ],
    culture: [
      "Its people are short, pale and friendly.",
      "A trading post for miners and for merchants braving the long road north to Shienar."
    ],
    places: [
      { group: "Village", items: [
        { name: "The Nine Rings", desc: "The village inn." },
        { name: "The Excavation", desc: "Near the village, Cairhienin nobles are digging up a giant stone hand holding a crystal sphere. No one knows what it is; some travel a long way just to see it." }
      ] }
    ],
    rumors: [
      "The diggers found a chamber beneath the stone hand. The first crew that went down never came back, and the noble funding the dig is looking for discreet people — none of them Cairhienin.",
      "Village children swear that on a moonless night the crystal sphere glowed for an instant. Ever since, the dogs howl toward the excavation."
    ],
    knowledge: [
      { who: "Dongo", tag: "personal background", pc: true, text: "Raised and trained in Tremonsien. Grew up within an organization where no one was ever allowed to show their face — his tutor and master was known only as 'Bear,' who trained orphaned children as spies and assassins." },
      { who: "Dongo", tag: "personal background", pc: true, text: "Trained in a courtyard paved with red sandstone, worn smooth and polished by years of use — a detail he still carries with him." },
      { who: "Dongo", tag: "personal background", pc: true, text: "After Pardal, another child in the group, was executed, he tried to flee. He was caught, and Bear discarded him as 'damaged goods.'" },
      { who: "Dongo", tag: "personal background", pc: true, text: "Woke up alone on a quiet road in the rain and mud, holding a soaked letter: there was no place for him there, for whoever lets themselves be led by emotion is weak — he had honored his name all too well: 'Camundongo.'" },
    ],
    npcs: [
      { name: "Bear", role: "Mentor / trafficker", type: "npc", visibleTo: ["Dongo"], desc: "Raised orphaned children and trained them as spies and assassins to sell — no one was allowed to show their face. Executed Pardal as punishment and discarded Dongo once he judged him emotionally 'broken.'" },
      { name: "Pardal", role: "Fellow trainee (deceased)", type: "npc", visibleTo: ["Dongo"], desc: "Another child trained alongside Dongo. Landed a blow that nearly tore off his mask — Bear executed her as an example." },
    ]
  },
  {
    id: "cairhien",
    distCity: "Cairhien",
    name: "Cairhien",
    top: 45.7, left: 74.6,
    desc: "Capital of Cairhien: a square-walled city raised on terraced hills along the River Alguenya. Famous for its Topless Towers and as the epicenter of Daes Dae'mar, the Game of Houses. Since King Galldrian Riatin was assassinated, the Sun Throne has stood empty and the noble Houses are at civil war.",
    geography: [
      "The inner city lies within square walls, built on hills flattened into terraces, with streets laid out in a perfect grid.",
      "Outside the walls sprawls the Foregate: a second city, unplanned, loud, colorful and chaotic — the opposite of the inner city.",
      "The Topless Towers were burned by the Aiel in 976 NE. Ogier stonemasons have been rebuilding them, but the work goes slowly.",
      "There are seventy-one Topless Towers, several over 300 feet tall. Some are held by noble Houses as a mark of prestige, some stand abandoned and others belong to the crown.",
      "The city stands on the River Alguenya, just south of where the Gaelin flows into it; the Alguenya joins the Erinin further south.",
      "Four gates pierce the walls: the Jangai Gate to the north, the Dragonwall Gate to the east, the Alguenya Gate to the west, by the river port, and the Erinin Gate to the south. The Foregate spreads outside the north and south walls.",
      "The north road leads to Tar Valon by way of Tremonsien, about a hundred miles away; the east road runs all the way to the Jangai Pass, with the town of Eianrod about halfway."
    ],
    politics: [
      "Cairhien is a monarchy: its ruler sits the Sun Throne, and the nobility is split into Houses that vie for the crown.",
      "King Galldrian Riatin was assassinated. Since then the Sun Throne has stood empty, and the Houses are at civil war over the succession — only the fifth in a thousand years, for Cairhienin consider open war a crude way to play.",
      "Daes Dae'mar, the Game of Houses, is at its height: every word and gesture has a second meaning, and in Cairhien even commoners play. Forcing a rival to concede is admired more than killing him — though assassination is part of the Game too.",
      "The country's symbol is the Rising Sun: a golden sun with wavy rays on a field of blue.",
      "The Aiel War (976–978 NE): King Laman Damodred cut down Avendoraldera, a sapling of the Aiel's Tree of Life gifted to Cairhien, to make himself a throne. In answer, four Aiel clans crossed the Jangai Pass, burned half the city, and pursued the king to the Shining Walls of Tar Valon, where he was killed."
    ],
    culture: [
      "Cairhienin are, as a rule, short and pale, wary, and fond of order. They tend to follow a conversation rather than lead it.",
      "Nobles dress in dark, reserved clothing; colored stripes across the chest show a noble's House and rank — the more stripes, the higher the rank. Commoners favor brighter colors.",
      "The inner city is rigid and reserved; the Foregate is festive and unruly, and the nobility despises it — though nobles sometimes join its revels, above all at the Feast of Lights.",
      "Even twenty-five years later, resentment toward the Aiel runs deep.",
      "With the civil war, the Foregate is crowded with people who fled the countryside.",
      "For five centuries Cairhien grew rich on caravans crossing the Aiel Waste to Shara. The Aiel War closed that road, and the economy never recovered: despite vast farmland, the country depends on grain shipped up the Erinin from Tear. With the war, food, weapons and horses cost a quarter more than usual."
    ],
    places: [
      { group: "City", items: [
        { name: "The Sun Palace", desc: "Seat of the Sun Throne, now empty, at the heart of the city." },
        { name: "The Royal Library", desc: "The greatest library in the world open to the public (the White Tower's is larger, but access is tightly controlled); the Aiel took care to protect it when they burned the city." },
        { name: "House Damodred Palace", desc: "Palace of House Damodred, the House of the late King Laman." },
        { name: "The Topless Towers", desc: "Burned in the Aiel War; Ogier stonemasons are slowly rebuilding them." },
        { name: "Port of Cairhien", desc: "The river port on the Alguenya, outside the western wall." }
      ] },
      { group: "Gates", items: [
        { name: "Jangai Gate", desc: "The northern gate, where the road from Tremonsien and Tar Valon enters the city." },
        { name: "Dragonwall Gate", desc: "The eastern gate, facing the Spine of the World — the Dragonwall." },
        { name: "Alguenya Gate", desc: "The western gate, opening onto the river port." },
        { name: "Erinin Gate", desc: "The southern gate." }
      ] },
      { group: "Inns", items: [
        { name: "The Defender of the Dragonwall", desc: "An inn in the inner city, near the Jangai Gate." },
        { name: "The Great Tree", desc: "An inn in the inner city, east of the Sun Palace." },
        { name: "The Bunch of Grapes", desc: "An inn in the northern Foregate, just outside the Jangai Gate." }
      ] },
      { group: "Foregate", items: [
        { name: "The Foregate", desc: "The city outside the walls, sprawling north and south of them." },
        { name: "Guild of Illuminators Chapter House", desc: "The walled chapter house of the Illuminators, the secretive guild that makes fireworks, in the northern Foregate." }
      ] }
    ],
    subMap: {
      title: "Cairhien",
      image: "cairhien-city-final-2.png",
      credit: "Map by Adam Whitehead, Atlas of Ice and Fire (2018)",
      pins: [
        { name: "The Sun Palace", top: 47.7, left: 61.0, size: 10 },
        { name: "Jangai Gate", top: 16.3, left: 59.8, size: 5 },
        { name: "Dragonwall Gate", top: 50.1, left: 95.6, size: 5 },
        { name: "Alguenya Gate", top: 50.1, left: 36.5, size: 5 },
        { name: "Erinin Gate", top: 79.8, left: 61.5, size: 5 },
        { name: "The Bunch of Grapes", top: 13.8, left: 54.5, size: 3.6 },
        { name: "The Great Tree", top: 54.2, left: 68.4, size: 3.6 },
        { name: "The Defender of the Dragonwall", top: 28.3, left: 69.2, size: 3.6 },
        { name: "Guild of Illuminators Chapter House", top: 1.2, left: 78.5, size: 4 },
        { name: "The Royal Library", top: 31.2, left: 88.3, size: 6 },
        { name: "House Damodred Palace", top: 57.6, left: 44.0, size: 3.6 },
        { name: "The Foregate", top: 15.1, left: 69.8, size: 10 },
        { name: "The Foregate", top: 83.5, left: 76.8, size: 10 },
        { name: "Port of Cairhien", top: 38.8, left: 24.2, size: 10 }
      ]
    },
    rumors: [
      "Someone no one has ever seen is paying off the debts of minor Houses ruined by the war. The Houses accept — and afterward they all vote the same way.",
      "Rival Houses are paying Foregate folk to swell their militias. Yesterday two gangs clashed on Tanners' Street, and no one knows who started it.",
      "A foreign scholar paid dearly to read everything the Royal Library holds about the stone hand of Tremonsien. A week later, the librarian who helped him burned to death in his own room — and nothing else in the room caught fire.",
      "Three heirs of different Houses died this season without a single wound, their faces frozen in fear. No one saw the killer come or go."
    ],
    knowledge: [
      { who: "Party", tag: "session 1", pc: false, text: "Kaela Miren, one of the kidnapped novices, is from Cairhien." },
    ],
    npcs: [
      { name: "The Seven Stripes", role: "Tailor", type: "shop", desc: "A narrow, tall shop in the inner city whose only window shows a black coat with seven colored stripes — the number only royalty wears. Owner Doren Halvane (Cairhien), small and quick-handed, has sewn noble stripes for thirty years; with Houses switching sides, he knows who changed allegiance before anyone else, and never says a word. His helper Iselle (Foregate) laughs loudly and has the best eye for color in the city.",
        items: [
          { name: "Common clothes", price: "5 SP" },
          { name: "Traveler's clothes", price: "2 GP" },
          { name: "Fine clothes (dark, Cairhienin cut)", price: "15 GP" },
          { name: "Stripeless clothes (well cut, no House mark)", price: "8 GP" },
          { name: "House stripe, sewn on (per stripe)", price: "1 GP" },
          { name: "Hooded cloak", price: "2 GP" },
          { name: "Fine leather gloves", price: "5 SP" },
          { name: "Costume", price: "5 GP" },
          { name: "Sewing kit", price: "5 SP" },
          { name: "Disguise kit", price: "25 GP" }
        ] },
      { name: "The Wall Arsenal", role: "Weapons & armor", type: "shop", desc: "A stone warehouse built against the north wall by the Jangai Gate, marked only by a reinforced door and an Aiel spear hung upside down. Owner Barin Talmoor (Cairhien), an Aiel War veteran scarred from ear to chin, sells to the mercenaries the Houses hire and charges high without apology. He will not sell short spears, on principle. His helper Kesh (Murandy), a mercenary left without a House, talks too much about who is hiring and how much they pay.",
        items: [
          { name: "Dagger", price: "2 GP 5 SP" },
          { name: "Handaxe", price: "6 GP" },
          { name: "Mace", price: "6 GP" },
          { name: "Spear (long)", price: "1 GP 3 SP" },
          { name: "Quarterstaff", price: "3 SP" },
          { name: "Shortsword", price: "13 GP" },
          { name: "Longsword", price: "19 GP" },
          { name: "Rapier", price: "31 GP" },
          { name: "Battleaxe", price: "13 GP" },
          { name: "Warhammer", price: "19 GP" },
          { name: "Halberd", price: "25 GP" },
          { name: "Shortbow", price: "31 GP" },
          { name: "Arrows (20)", price: "1 GP 3 SP" },
          { name: "Light crossbow", price: "31 GP" },
          { name: "Crossbow bolts (20)", price: "1 GP 3 SP" },
          { name: "Padded armor", price: "5 GP" },
          { name: "Leather armor", price: "10 GP" },
          { name: "Studded leather", price: "45 GP" },
          { name: "Chain shirt", price: "50 GP" },
          { name: "Scale mail", price: "50 GP" },
          { name: "Chain mail", price: "75 GP" },
          { name: "Shield", price: "10 GP" }
        ] },
      { name: "The Grain Barge", role: "Provisions", type: "shop", desc: "A long shed in the Foregate near the Alguenya docks, always crowded, with grain sacks stacked to the rafters and the smell of flour and river. Owner Harlan Vey (Andor), a stout red-haired merchant, buys the Tearen grain shipped up the Erinin and the Alguenya; in a time of scarcity his is the busiest shop in the city — and the one the Houses watch most closely. He swears he takes no side. No one believes him. His helper Pip (Foregate), a quick boy, delivers where no carter will go.",
        items: [
          { name: "Rations (1 day)", price: "6 SP" },
          { name: "Rations (1 week, packed)", price: "3 GP 8 SP" },
          { name: "Bread (loaf)", price: "3 CP" },
          { name: "Cheese (hunk)", price: "1 SP 3 CP" },
          { name: "Salted meat (chunk)", price: "4 SP" },
          { name: "Salted fish (piece)", price: "3 SP" },
          { name: "Flour (10 lb sack)", price: "1 SP 3 CP" },
          { name: "Ale (mug)", price: "5 CP" },
          { name: "Common wine (pitcher)", price: "3 SP" },
          { name: "Horse feed (1 day)", price: "6 CP" },
          { name: "Burlap sack", price: "1 CP" },
          { name: "Barrel", price: "2 GP" },
          { name: "Leather waterskin", price: "2 SP" }
        ] },
      { name: "The Sun Scribe", role: "Stationer, maps & copies", type: "shop", desc: "A quiet room a few steps from the Royal Library, smelling of ink and wax, with slanted copyist desks and maps hung on lines. A board on the wall lists the couriers leaving for Tar Valon, Caemlyn and Tear, and on which days. Owner Ellin Corvane (Cairhien), a tiny bespectacled copyist who remembers everything she has ever copied: the place to send a letter safely — or to learn who is writing to whom. Her helper Aldwin (Tar Valon) came to study at the Library and stayed.",
        items: [
          { name: "Paper (sheet)", price: "2 SP" },
          { name: "Parchment (sheet)", price: "1 SP" },
          { name: "Ink (bottle)", price: "10 GP" },
          { name: "Quill", price: "2 CP" },
          { name: "Sealing wax", price: "5 SP" },
          { name: "Map or scroll case", price: "1 GP" },
          { name: "Blank book", price: "25 GP" },
          { name: "Map of Cairhien", price: "5 GP" },
          { name: "Map of the lands between the Spine and Tar Valon", price: "15 GP" },
          { name: "Copy of a text (per page)", price: "1 SP" },
          { name: "Translation from the Old Tongue (per page)", price: "2 GP" },
          { name: "Letter sent (Tar Valon, Caemlyn or Tear)", price: "2 SP" }
        ] }
    ]
  },
  {
    id: "altara",
    distCity: "Ebou Dar",
    name: "Altara (Ebou Dar)",
    top: 81.8, left: 44.6,
    desc: "Altara's port capital, built over the ruins of ancient Barashta. Split by the River Eldar between the wealthy noble quarter and the Rahad, a poor and dangerous district — known for its extravagant fashion and the vibrant life around the Tarasin Palace.",
    knowledge: [
      { who: "Uthar", tag: "personal background", pc: true, text: "Born into House Maredo, an Altaran noble family. His father, Lord Dainar, held a border fortress near Alkindar, on the River Eldar, guarding Altara against Amadician incursions — and was killed when the Whitecloaks invaded with the help of a traitorous uncle." },
      { who: "Uthar", tag: "personal background", pc: true, text: "Carries his father's sword: a heron-marked longsword that once belonged to Lord Dainar." },
      { who: "Maeri", tag: "personal background", pc: true, text: "Born in a small village in Altara to parents whose house was always full of drying herbs and curing pelts. She barely remembers them — at some point she got lost and found herself alone on an unknown road." },
      { who: "Maeri", tag: "personal background", pc: true, text: "Reached the Rahad around age 6 and survived its streets on luck and observation. For about six months a passing traveler taught her how to break free, where to strike, how to flee, and whom to trust — then left as suddenly as she came." },
      { who: "Maeri", tag: "personal background", pc: true, text: "Around age 8, Vernam, a healer of The Kin, found her in a desperate state in the Rahad and healed her. Maeri followed her everywhere, worked the Farm and gathered herbs until Vernam became her official guardian, teaching her healing and herbcraft." },
      { who: "Maeri", tag: "personal background", pc: true, text: "Began to show the Power at 11. Refused the White Tower, and Vernam kept her secret from the other Kinswomen — on the condition that she never channel in front of anyone. She was never entered in The Kin's records." },
      { who: "Maeri", tag: "personal background", pc: true, text: "At 13 she moved with Vernam to the village of So Eban, where Vernam is the Wisdom. Grew up as a Wisdom in training — tending the sick, presiding over births and deaths, and practising the Power alone in secret." },
    ],
    npcs: [
      { name: "Vernam", role: "Elder · The Kin", type: "npc", desc: "One of the Elders of The Kin, part of the Knitting Circle. Particular talent for healing, both with the Power and with herbs. Rescued Maeri from the streets of Rahad and became her official guardian." },
    ]
  },
  {
    id: "amadicia",
    distCity: "Amador",
    name: "Amadicia",
    top: 69.9, left: 38.9,
    desc: "Capital of Amadicia and home to the Fortress of the Light, headquarters of the Children of the Light. Amadicia has a king, but it's the Whitecloaks who really rule — channeling is outlawed throughout the territory.",
    knowledge: [
      { who: "Uthar", tag: "personal background", pc: true, text: "Captured by the Whitecloaks at around 10 after the fall of his father's fortress, he was handed to the guardianship of House Macura — an Amadician noble house that publicly served the Light but secretly opposed the Children's fanaticism." },
      { who: "Uthar", tag: "personal background", pc: true, text: "House Macura's crest: a silver scale with open hands. Its motto: 'By the hand, not by the knee.' To outsiders, devotion to the Light; to those inside, 'we serve standing, not kneeling.'" },
      { who: "Uthar", tag: "personal background", pc: true, text: "His adoptive family: Lord Eldric Macura, reserved and calculating; Lady Maren, who showed him genuine tenderness; Evon, his adoptive brother — rival and comrade; Theril, the tutor who trained him; and Sena, head of the servants, who always knew more than she let on." },
      { who: "Uthar", tag: "personal background", pc: true, text: "Learned swordsmanship, discipline and strategy inside the Children's world, even while hating what they stood for." },
      { who: "Uthar", tag: "personal background", pc: true, text: "The Crucible of the Light: when he was about 16, the Children branded House Macura as Darkfriends and destroyed it in a single night. Fire arrows set the banners ablaze, the manor burned, and Lord Eldric was executed in public — he died on his feet." },
      { who: "Uthar", tag: "personal background", pc: true, text: "The Crucible was commanded by an Inquisitor named Thane. Uthar saw him lick his dagger after killing a guard — a gesture that felt almost ritual, and that he has never understood." },
      { who: "Uthar", tag: "personal background", pc: true, text: "Escaped the massacre and fled east through Ghealdan, crossing into Andor. He does not know whether Maren, Evon, Theril or Sena survived." },
    ],
  },
  {
    id: "saldaea",
    distCity: "Maradon",
    name: "Saldaea (Maradon)",
    top: 20.3, left: 51.3,
    desc: "Capital of Saldaea, the largest of the Borderlands, built on the banks of the River Arinelle right by the Blight. Home to the Cordamora Palace and a lively court, despite the constant threat of the Blight just to the north.",
    knowledge: [],
  },
  {
    id: "andor",
    distCity: "Caemlyn",
    name: "Caemlyn (Andor)",
    top: 56.5, left: 64.7,
    desc: "Capital of Andor, the largest nation in the Westlands, and seat of the Lion Throne. Counted the second most beautiful city after Tar Valon: an Ogier-built Inner City wrapped by a human New City, with Low Caemlyn spilling past the walls.",
    geography: [
      "Built on hills in the plain between Braem Wood and the Tunaighan Hills. It stands on no great river: the city lives on springs and cisterns, and on water carted in daily from the River Cary to the west and the Erinin to the east.",
      "The Inner City was raised by the Ogier soon after the Shattering and has withstood sieges ever since. The New City grew around it, built by human hands, and was walled in turn.",
      "Low Caemlyn spreads a mile or two beyond the outer wall, with farmers' markets at each of the main gates.",
      "Around 300,000 people live here year-round, and many more come during the trading season.",
      "South of the city lies the populous heart of the realm, with villages and lanes every few miles. North and northwest, toward the Caralain Grass, the land empties out."
    ],
    politics: [
      "Only a queen may sit the Lion Throne and wear the Rose Crown. Her eldest daughter, the Daughter-Heir, is sent to study in the White Tower and receives the Tower's ring whether or not she can channel. Her eldest brother, the First Prince of the Sword, is sworn to protect her and trained to lead the queen's armies.",
      "Andor has over four hundred noble Houses, but only nineteen Great Houses truly count. A claimant needs the support of ten High Seats to take the throne. Commoners are free: lesser Houses follow the great ones by alliance, not by oath of land.",
      "The realm was founded during the War of the Hundred Years by Ishara, daughter of Artur Hawkwing's governor, and Souran Maravaile, Hawkwing's greatest general. Every queen since has claimed descent from Ishara.",
      "Morgase Trakand has reigned since 976 NE. The Daughter-Heir Tigraine had vanished, and Morgase, only sixteen, won the Succession with the support of thirteen Houses.",
      "Today a newcomer to court, Lord Gaebril, has the queen's ear. Old allies have been sent away or exiled, and the Captain-General Gareth Bryne no longer commands the Queen's Guard.",
      "Morgase has signed an agreement with the Children of the Light, who now travel and preach freely in Andor. She dismissed her Aes Sedai advisor, breaking a tradition a thousand years old."
    ],
    culture: [
      "Andor is the realm of the White Lion on a field of red; its national colors are red and white, and Andorans are fiercely proud of their queen.",
      "For a thousand years Andor has been the White Tower's firmest ally. The pact with the Whitecloaks has shaken that bond, and the court has grown cold toward Tar Valon.",
      "Tigraine's disappearance in 972 NE remains a public mystery, sung about in ballads across the realm."
    ],
    places: [
      { group: "City", items: [
        { name: "The Royal Palace", desc: "Seat of the Lion Throne, in the heart of the Inner City." },
        { name: "The Inner City", desc: "The old city raised by the Ogier, on the highest hills." },
        { name: "The New City", desc: "The human-built city around the Inner City, enclosed by the outer wall." },
        { name: "Low Caemlyn", desc: "The sprawl outside the outer wall, with farmers' markets at each main gate." }
      ] },
      { group: "Inns", items: [
        { name: "The Queen's Blessing", desc: "A well-kept inn run by Basel Gill, a stout and loyal subject of the queen." }
      ] }
    ],
    rumors: [
      "The queen listens to no one but Lord Gaebril now; those who disagree wake up exiled.",
      "Whitecloaks have been 'visiting' villages south of Caemlyn, asking after women who heal.",
      "For the first time in a thousand years, there is no Aes Sedai in the palace.",
      "Travelers swear they have seen the Daughter-Heir Tigraine, older now, among pale-eyed foreigners."
    ],
    npcs: [
      { name: "Morgase Trakand", role: "Queen of Andor", type: "npc", desc: "Has held the Lion Throne since 976 NE, when she won the Succession at sixteen. A beautiful woman of about forty-three with red-gold hair. Her House, Trakand, bears three golden keys." },
      { name: "Lord Gaebril", role: "Favorite of the queen", type: "npc", desc: "A newcomer to court who quickly became the queen's closest counselor. No one seems quite sure where he came from." },
      { name: "Gareth Bryne", role: "Former Captain-General of the Queen's Guard", type: "npc", desc: "One of the Great Captains, he served three queens. Removed from command under Lord Gaebril's influence." },
      { name: "Dyelin Taravin", role: "High Seat of House Taravin", type: "npc", desc: "Proud and plainspoken, she became High Seat at fifteen and drove raiders from her lands. Her House, which bears an owl and oak, stands next in line for the throne." },
      { name: "Basel Gill", role: "Innkeeper · The Queen's Blessing", type: "npc", desc: "Stout, good-natured and loyal to the queen, he runs one of the best inns in the New City." },
      { name: "The White Rose", role: "Tailor", type: "shop", desc: "A two-story shop in the New City, below the climb to the Inner City. Its window shows a red gown embroidered with white roses, the colors of Andor. Run by Elsbet Harlan, who dresses half the court — and knows which nobles are leaving town by the size of their trunks.",
        items: [
          { name: "Common clothes", price: "5 SP" },
          { name: "Traveler's clothes", price: "2 GP" },
          { name: "Fine clothes (red and white, Andoran cut)", price: "15 GP" },
          { name: "Court clothes (in a House's colors)", price: "25 GP" },
          { name: "Hooded cloak", price: "2 GP" },
          { name: "Fine leather gloves", price: "5 SP" },
          { name: "Costume", price: "5 GP" },
          { name: "Sewing kit", price: "5 SP" },
          { name: "Disguise kit", price: "25 GP" }
        ] },
      { name: "The Iron Lion", role: "Weapons & armor", type: "shop", desc: "Forge and shop in the Queen's Guard barracks quarter, under a lion of hammered iron. Dannel Forsyth, a former Guard sergeant, left the service when Gareth Bryne was removed. He still arms half the Guard — and sells nothing to Whitecloaks.",
        items: [
          { name: "Dagger", price: "2 GP" },
          { name: "Handaxe", price: "5 GP" },
          { name: "Mace", price: "5 GP" },
          { name: "Spear", price: "1 GP" },
          { name: "Quarterstaff", price: "2 SP" },
          { name: "Shortsword", price: "10 GP" },
          { name: "Longsword", price: "15 GP" },
          { name: "Rapier", price: "25 GP" },
          { name: "Battleaxe", price: "10 GP" },
          { name: "Warhammer", price: "15 GP" },
          { name: "Halberd", price: "20 GP" },
          { name: "Shortbow", price: "25 GP" },
          { name: "Longbow", price: "50 GP" },
          { name: "Arrows (20)", price: "1 GP" },
          { name: "Light crossbow", price: "25 GP" },
          { name: "Crossbow bolts (20)", price: "1 GP" },
          { name: "Padded armor", price: "5 GP" },
          { name: "Leather armor", price: "10 GP" },
          { name: "Studded leather", price: "45 GP" },
          { name: "Chain shirt", price: "50 GP" },
          { name: "Scale mail", price: "50 GP" },
          { name: "Chain mail", price: "75 GP" },
          { name: "Shield", price: "10 GP" }
        ] },
      { name: "The West Gate Market", role: "Provisions & travel gear", type: "shop", desc: "Not a shop but the farmers' market in Low Caemlyn, by the gate where the Whitebridge road comes in. Corwin Pell owns the biggest stall and settles the market's quarrels; he knows every carter on the road west.",
        items: [
          { name: "Rations (1 day)", price: "5 SP" },
          { name: "Rations (1 week, packed)", price: "3 GP" },
          { name: "Bread (loaf)", price: "2 CP" },
          { name: "Cheese (hunk)", price: "1 SP" },
          { name: "Salted meat (chunk)", price: "3 SP" },
          { name: "Ale (mug)", price: "4 CP" },
          { name: "Backpack", price: "2 GP" },
          { name: "Bedroll", price: "1 GP" },
          { name: "Two-person tent", price: "2 GP" },
          { name: "Hempen rope (50 ft)", price: "1 GP" },
          { name: "Hooded lantern", price: "5 GP" },
          { name: "Oil (flask)", price: "1 SP" },
          { name: "Torches (10)", price: "1 SP" },
          { name: "Tinderbox", price: "5 SP" },
          { name: "Waterskin", price: "2 SP" },
          { name: "Climber's kit", price: "25 GP" }
        ] },
      { name: "Mistress Tamsin's Herbs", role: "Herbalist", type: "shop", desc: "A narrow house in a New City alley, with herbs drying from the ceiling. Tamsin Aldrow, from the Two Rivers, heals with herbs and only herbs. Since the Whitecloaks began asking after 'women who heal', she works behind closed doors and took down her sign.",
        items: [
          { name: "Healer's kit", price: "5 GP" },
          { name: "Antitoxin (vial)", price: "50 GP" },
          { name: "Herbal wound salve (comfort only)", price: "5 SP" },
          { name: "Fever tea", price: "2 SP" },
          { name: "Sleeping tea", price: "3 SP" },
          { name: "Herbalism kit", price: "5 GP" },
          { name: "Rare herbs (per dose, by order)", price: "1–10 GP" }
        ] },
      { name: "The Lion Stables", role: "Horses & tack", type: "shop", desc: "Large stables in Low Caemlyn, on the south road. Hob Tarvey talks to horses more than to people, and checks teeth and brands before he asks a price.",
        items: [
          { name: "Draft horse", price: "50 GP" },
          { name: "Riding horse", price: "75 GP" },
          { name: "Pony", price: "30 GP" },
          { name: "Mule", price: "8 GP" },
          { name: "Riding saddle", price: "10 GP" },
          { name: "Pack saddle", price: "5 GP" },
          { name: "Saddlebags", price: "4 GP" },
          { name: "Bit and bridle", price: "2 GP" },
          { name: "Cart", price: "35 GP" },
          { name: "Stabling (per day)", price: "5 SP" },
          { name: "Feed (per day)", price: "5 CP" }
        ] }
    ],
    knowledge: [
      { who: "Uthar", tag: "personal background", pc: true, text: "Spent his years of exile in Andor as a mercenary, hiding his past and selling his sword to lords who saw him as little more than a useful blade. Came to Tar Valon by the Caemlyn road." },
    ],
  },
  {
    id: "aringill",
    distCity: "Aringill",
    name: "Aringill",
    top: 57.3, left: 70.8,
    desc: "Andor's chief port on the River Erinin, facing the Cairhienin town of Maerone across the water. Most of the realm's river trade passes through its docks.",
    geography: [
      "A walled river town on the west bank of the Erinin, about 300 miles by road from Caemlyn.",
      "Ferries cross to Maerone, on the Cairhienin shore."
    ],
    politics: [
      "Ruled by a governor appointed by the Crown, not by any noble House."
    ],
    places: [
      { group: "Town", items: [
        { name: "The Docks of Aringill", desc: "The busiest river docks in Andor, where barges from Tar Valon, Cairhien and Tear unload." }
      ] }
    ],
    knowledge: [],
  },
  {
    id: "whitebridge",
    distCity: "Whitebridge",
    name: "Whitebridge",
    top: 55.9, left: 51.7,
    desc: "A walled town on the River Arinelle, where the Caemlyn Road crosses the water on a bridge older than the Shattering. It divides Andor's thinly settled west from its crowded east.",
    geography: [
      "Stands on the east bank of the Arinelle. The White Bridge, made of something that looks like glass, runs nearly a mile and has not worn in thousands of years.",
      "It is the last crossing of the Arinelle south of Maradon.",
      "Trade is seasonal: in winter the mountain passes and the river to the north close.",
      "About 730 miles west of Caemlyn along the Caemlyn Road."
    ],
    politics: [
      "Ruled by a governor appointed by the Crown."
    ],
    culture: [
      "A town of merchant houses, warehouses and fishermen. Andoran goods go north to Saldaea and south to Illian; furs and ice peppers come down from the north."
    ],
    places: [
      { group: "Town", items: [
        { name: "The White Bridge", desc: "A glass-like span from before the Shattering, nearly a mile long." },
        { name: "The Wayfarer's Rest", desc: "An inn on the central square, run by Bartim." }
      ] }
    ],
    rumors: [
      "On nights of strong wind, the White Bridge sings."
    ],
    npcs: [
      { name: "Bartim", role: "Innkeeper · The Wayfarer's Rest", type: "npc", desc: "Runs the inn on the central square and hears every piece of news that crosses the bridge." }
    ],
    knowledge: [],
  },
  {
    id: "baerlon",
    distCity: "Baerlon",
    name: "Baerlon",
    top: 49.1, left: 42.7,
    desc: "A walled mining town in western Andor, gateway to the Two Rivers and the Mountains of Mist.",
    geography: [
      "Lies in the far west, near the foothills of the Mountains of Mist, where the roads from the mines meet the road to Whitebridge."
    ],
    politics: [
      "Ruled by a governor appointed by the Crown."
    ],
    culture: [
      "Miners from the mountains sell their ore here, and Two Rivers wool and tabac pass through on their way east."
    ],
    knowledge: [],
  },
  {
    id: "four-kings",
    name: "Four Kings",
    top: 57.2, left: 61.3,
    desc: "A crossroads town on the Caemlyn Road, west of the capital, where goods change hands for Lugard and the south.",
    geography: [
      "Sits on the Caemlyn Road between Whitebridge and Caemlyn, where a road branches south toward Lugard."
    ],
    places: [
      { group: "Road", items: [
        { name: "Hawkwing's Statue", desc: "A great statue of Artur Hawkwing beside the Caemlyn Road, west of the town." }
      ] }
    ],
    knowledge: [],
  },
  {
    id: "emonds-field",
    distCity: "Emond's Field",
    name: "Emond's Field (Two Rivers)",
    top: 53.4, left: 40.9,
    desc: "The largest of the four villages of the Two Rivers, a remote district in Andor's far southwest that belongs to the realm mostly on paper.",
    geography: [
      "The Two Rivers lies between the Taren and the White River, with the Forest of Shadows to the south and the Mountains of Mist to the west.",
      "Its four villages are Emond's Field, Deven Ride, Taren Ferry and Watch Hill."
    ],
    politics: [
      "There is no lord: each village is run by a Village Council and a Mayor, and the women's Circle led by the Wisdom.",
      "No tax collector from Caemlyn has come in generations."
    ],
    culture: [
      "Two Rivers folk are stubborn, independent and plainspoken. They sell wool and tabac to the merchants of Baerlon."
    ],
    places: [
      { group: "Village", items: [
        { name: "The Winespring Inn", desc: "The inn on the village green, beside the spring that gives it its name." }
      ] }
    ],
    knowledge: [],
  },
  {
    id: "far-madding",
    distCity: "Far Madding",
    name: "Far Madding",
    top: 67.5, left: 66.4,
    desc: "Independent city-state on an island, linked to the mainland by three bridges. Home to the Guardian, an ancient ter'angreal that blocks access to the One Power in and around the city — the only known place where no one can channel.",
    knowledge: [
      { who: "GM", tag: "worldbuilding", pc: false, text: "Reserved for future expansion — surrounding villages, local culture and conflicts still in development. The party hasn't been here yet.", visibleTo: [] },
    ],
  },
  {
    id: "illian",
    distCity: "Illian",
    name: "Illian",
    top: 85.3, left: 59.3,
    desc: "One of the largest cities in the Westlands, cut through by many canals and jointly ruled by the King, the Council of Nine, and the Assemblage. Famous for hosting the Great Hunt of the Horn, in which Hunters swear to find the Horn of Valere.",
    knowledge: [],
  },
  {
    id: "tear",
    distCity: "Tear",
    name: "Tear",
    top: 77.6, left: 71.4,
    desc: "Great port on the Sea of Storms, dominated by the Stone of Tear — a massive fortress raised shortly after the Breaking of the World, never taken until the coming of the Dragon Reborn. Ruled by High Lords deeply averse to anything tied to the One Power.",
    knowledge: [],
  },
  {
    id: "murandy",
    distCity: "Lugard",
    name: "Murandy (Lugard)",
    top: 65, left: 56.9,
    desc: "Capital of Murandy, a city kept alive by trade but known for its disorder and for how little authority the king holds beyond his own walls. A crossroads of trade routes between Andor, Illian, Altara, and Ghealdan.",
    knowledge: [],
  },
  {
    id: "tarabon",
    distCity: "Tanchico",
    name: "Tarabon (Tanchico)",
    top: 62.5, left: 25.9,
    desc: "Former capital of Tarabon, built across three peninsulas on Tanchico Bay. Home to the Panarch's Palace — parts of which date back to the Age of Legends itself — now weakened by civil war and the growing Seanchan presence.",
    knowledge: [],
  },
  {
    id: "arafel",
    distCity: "Shol Arbela",
    name: "Arafel (Shol Arbela)",
    top: 21, left: 71.6,
    desc: "Capital of Arafel, known as the City of Ten Thousand Bells for the local custom of braiding bells into one's hair. One of the few great Westlands cities not built by the Ogier.",
    knowledge: [],
  },
];
