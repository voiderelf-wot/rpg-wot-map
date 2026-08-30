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
// CHARACTERS — profile + home location (homeLocationId points
// to an id in the LOCATIONS array). When that character opens
// the matching location, a "home turf" banner appears
// automatically at the top of the panel, even without writing
// a manual background card for it.
// ============================================================
const CHARACTERS = {
  "Maeri": { classe: "Cleric",  origemLabel: "Raised by The Kin in Abou Dar, Altara", homeLocationId: "altara" },
  "Uthar": { classe: "Fighter", origemLabel: "Plains of Maredo, on the Altara/Amadicia border", homeLocationId: "altara" },
  "Dongo": { classe: "Rogue",   origemLabel: "Tremosien, Cairhien", homeLocationId: "tremosien" },
  "Aynara": { classe: "Ranger",  origemLabel: "Origin not yet revealed in-game", homeLocationId: null }
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
    desc: "Island city on the River Erinin, within sight of the Herald's Lighthouse. Seat of the Aes Sedai and the Amyrlin Seat, it's the second most populous city in the Westlands and has remained independent since its founding — a vital trade link between the Borderlands and the southern realms.",
    knowledge: [],
    npcs: [
      { name: "Serenya Taravin", role: "Aes Sedai · Blue Ajah", type: "npc", desc: "Pragmatic, tall, black hair streaked with grey pinned in a bun, dark eyes. Runs a network of informants and hired the party outside the Tower's official structure." },
      { name: "Jarem al'Caar", role: "Serenya's Warder", type: "npc", desc: "Quiet and watchful, dark brown hair. A native of Arafel." },
      { name: "Tomas \"Tom\" Veldan", role: "Innkeeper · Blue Cat", type: "npc", desc: "Burly, friendly man, owner of the Blue Cat Inn — overlooking the River Erinin, multicultural décor." },
      { name: "Captain Elias Dorin", role: "Captain of the Guard", type: "npc", desc: "Captain of the city guard, questioned by the party during the investigation into the missing Novices." },
      { name: "Callan Forjaforte", role: "Blacksmith · weapon shop", type: "shop", desc: "Muscular man with a full black beard, a native of Illian. Sold basic weapons to the party using Serenya's letter of credit.",
        items: [
          { name: "Dagger", price: "2 GP" },
          { name: "Shortsword", price: "10 GP" },
          { name: "Longsword", price: "15 GP" },
          { name: "Shortbow", price: "25 GP" },
          { name: "Longbow", price: "50 GP" },
          { name: "Leather armor", price: "10 GP" },
          { name: "Chain shirt", price: "50 GP" },
          { name: "Chain mail", price: "75 GP" },
          { name: "Shield", price: "10 GP" }
        ] },
      { name: "Mara al'Dene", role: "Herbalist · healing potions", type: "shop", desc: "Short, kind, smelling of fresh herbs, a native of Tear. Sold healing potions to the party.",
        items: [
          { name: "Healing potion", price: "50 GP" },
          { name: "Antitoxin", price: "50 GP" },
          { name: "Healer's kit (10 uses)", price: "5 GP" },
          { name: "Rations (1 day)", price: "5 SP" }
        ] },
      { name: "Vandor Merrilin", role: "Merchant · general supplies", type: "shop", desc: "Elegant and shrewd, a native of Caemlyn. Sold general equipment to the party.",
        items: [
          { name: "Backpack", price: "2 GP" },
          { name: "Rope, hempen (50 ft)", price: "1 GP" },
          { name: "Rope, silk (50 ft)", price: "10 GP" },
          { name: "Torch", price: "1 CP" },
          { name: "Lantern with oil", price: "5 SP + 1 SP/hour" },
          { name: "Thieves' tools", price: "25 GP" },
          { name: "Parchment and ink", price: "1 GP" },
          { name: "Common saddle", price: "10 GP" }
        ] },
      { name: "Perrin Rattler", role: "Rat merchant", type: "npc", desc: "Peculiar merchant, a native of Murandy, found at South Harbor being accused by the Whitecloaks." },
      { name: "Gared Thane", role: "Guard", type: "npc", desc: "Guard, a native of Andor, in love with Elara Bryne — they fled Tar Valon together." },
      { name: "Elara Bryne", role: "Novice (fled)", type: "npc", desc: "Novice, a native of Andor, who fled voluntarily with Gared Thane — it wasn't a kidnapping." },
      { name: "Kaela Miren", role: "Novice (rescued)", type: "npc", desc: "Novice, a native of Cairhien, captured by mercenaries paid by the Seanchan and rescued by the party at the warehouse." },
      { name: "Lirene Valda", role: "Novice (rescued)", type: "npc", desc: "Novice, a native of Tarabon, captured by mercenaries paid by the Seanchan and rescued by the party at the warehouse." },
    ]
  },
  {
    id: "tremosien",
    name: "Tremosien",
    top: 43.3, left: 76.1,
    desc: "Small village in Cairhien, north of the capital — Dongo's home town.",
    knowledge: [
      { who: "Dongo", tag: "personal background", pc: true, text: "Born in Tremosien. Grew up within an organization where no one was ever allowed to show their face — his tutor and master was known only as 'Bear,' who trained orphaned children as spies and assassins." },
      { who: "Dongo", tag: "personal background", pc: true, text: "Fled after Pardal, another child in the group, was executed, and was discarded by Bear as 'damaged goods.'" },
    ],
    npcs: [
      { name: "Bear", role: "Mentor / trafficker", type: "npc", desc: "Raised orphaned children and trained them as spies and assassins to sell — no one was allowed to show their face. Executed Pardal as punishment and discarded Dongo once he judged him emotionally 'broken.'" },
      { name: "Pardal", role: "Fellow trainee (deceased)", type: "npc", desc: "Another child trained alongside Dongo. Landed a blow that nearly tore off his mask — Bear executed her as an example." },
    ]
  },
  {
    id: "cairhien",
    distCity: "Cairhien",
    name: "Cairhien",
    top: 45.7, left: 74.6,
    desc: "A square-walled city on the banks of the River Alguenya, rebuilt after being burned during the Aiel War. Famous for its Topless Towers and as the epicenter of Daes Dae'mar, the Game of Houses — the intricate political struggle among Cairhien's noble Houses.",
    knowledge: [],
  },
  {
    id: "altara",
    distCity: "Ebou Dar",
    name: "Altara (Ebou Dar)",
    top: 81.8, left: 44.6,
    desc: "Altara's port capital, built over the ruins of ancient Barashta. Split by the River Eldar between the wealthy noble quarter and the Rahad, a poor and dangerous district — known for its extravagant fashion and the vibrant life around the Tarasin Palace.",
    knowledge: [
      { who: "Uthar", tag: "personal background", pc: true, text: "Born into a noble family near the Plains of Maredo, a region disputed between Altara and Amadicia. His father, Lord Dainar, was killed when the Whitecloaks invaded with the help of a traitorous uncle." },
      { who: "Maeri", tag: "personal background", pc: true, text: "Rescued from the streets of Rahad by Vernam, a Wise Woman of The Kin, and grew up among the Kinswomen in Abou Dar, learning healing and herbcraft." },
      { who: "Maeri", tag: "personal background", pc: true, text: "Hid her ability to channel from everyone except Vernam — refused to go to the White Tower for years." },
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
      { who: "Uthar", tag: "personal background", pc: true, text: "Was captured by the Whitecloaks as a child and raised under the guardianship of a noble family secretly opposed to the Children's fanaticism." },
      { who: "Uthar", tag: "personal background", pc: true, text: "Learned swordsmanship, discipline, and strategy as one of the Whitecloaks, even while hating what they stood for." },
      { who: "Uthar", tag: "personal background", pc: true, text: "His adoptive family was executed as Darkfriends when the Whitecloaks discovered their rebellious activity — sealing his final break with Amadicia." },
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
    name: "Andor (Caemlyn)",
    top: 56.5, left: 64.7,
    desc: "Capital of Andor, considered the second most beautiful city in the Westlands, after only Tar Valon. Split between the Inner City, built by the Ogier, and the New City built by humans — home to the Royal Palace and the Lion Throne.",
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
