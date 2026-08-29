// ============================================================
// Configuração do Firebase deste projeto (rpg-wot-map).
// Isso NÃO é segredo — é feito pra ficar exposto no navegador.
// Quem protege os dados de verdade são as regras do Realtime
// Database (configuradas no console do Firebase), não isso aqui.
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCzXxGDFwRFoZsI9seKkImBLJaEtvsLz8w",
  authDomain: "rpg-wot-map.firebaseapp.com",
  databaseURL: "https://rpg-wot-map-default-rtdb.firebaseio.com",
  projectId: "rpg-wot-map",
  storageBucket: "rpg-wot-map.firebasestorage.app",
  messagingSenderId: "839794078176",
  appId: "1:839794078176:web:1aaec3fc679fc8139f3b85",
  measurementId: "G-RPK98T3SH4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
