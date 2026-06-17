import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import { auth, db } from "./firebase.js";

let currentUser = null;
let myPosition = null;
let selectedChatUser = null;
let unsubscribeChat = null;

const $ = (s) => document.querySelector(s);

function setTradeStatus(text){
  const el = $("#tradeStatus");
  if(el) el.textContent = text;
}

function getAlbumState(){
  try{
    return JSON.parse(localStorage.getItem("albumBingo2026StatusV5") || "{}");
  }catch(e){
    return {};
  }
}

function getAlbumStats(){
  const state = getAlbumState();
  let owned = 0;
  let repeatQty = 0;

  Object.values(state).forEach(v=>{
    const q = Number(v || 0);
    if(q > 0) owned++;
    if(q > 1) repeatQty += q - 1;
  });

  return {
    owned,
    repeatQty,
    missing: 994 - owned
  };
}

function saveLocalTradeProfile(profile){
  localStorage.setItem("albumTradeProfile", JSON.stringify(profile));
}

function loadLocalTradeProfile(){
  try{
    return JSON.parse(localStorage.getItem("albumTradeProfile") || "{}");
  }catch(e){
    return {};
  }
}

function fillTradeProfile(){
  const p = loadLocalTradeProfile();

  if($("#tradeNick")) $("#tradeNick").value = p.nick || "";
  if($("#tradeWhatsapp")) $("#tradeWhatsapp").value = p.whatsapp || "";
  if($("#tradeCity")) $("#tradeCity").value = p.city || "";
}

function getTradeProfileForm(){
  return {
    nick: ($("#tradeNick")?.value || "").trim() || "Colecionador",
    whatsapp: ($("#tradeWhatsapp")?.value || "").replace(/\D/g, ""),
    city: ($("#tradeCity")?.value || "").trim()
  };
}

function getPosition(){
  return new Promise((resolve, reject)=>{
    if(!navigator.geolocation){
      reject(new Error("GPS não disponível neste aparelho."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy || null
      }),
      err => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 120000
      }
    );
  });
}

function kmDistance(a,b){
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const x =
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

function compatibility(otherUser){
  const mine = getAlbumState();
  const other = otherUser.albumState || {};

  let theyHaveINeed = 0;
  let iHaveTheyNeed = 0;

  Object.entries(other).forEach(([id, q])=>{
    if(Number(q) > 1 && Number(mine[id] || 0) === 0){
      theyHaveINeed++;
    }
  });

  Object.entries(mine).forEach(([id, q])=>{
    if(Number(q) > 1 && Number(other[id] || 0) === 0){
      iHaveTheyNeed++;
    }
  });

  const score = Math.min(100, Math.round(((theyHaveINeed + iHaveTheyNeed) / 20) * 100));

  return {
    theyHaveINeed,
    iHaveTheyNeed,
    score
  };
}

async function saveTradeProfile(){
  if(!currentUser){
    alert("Entre na conta antes de salvar o perfil.");
    return;
  }

  const profile = getTradeProfileForm();
  saveLocalTradeProfile(profile);

  alert("Perfil salvo neste aparelho.");
}

async function publishTradeProfile(){
  if(!currentUser){
    alert("Entre na conta antes de publicar seu perfil.");
    return;
  }

  const profile = getTradeProfileForm();
  saveLocalTradeProfile(profile);

  setTradeStatus("Pedindo permissão de localização...");

  try{
    myPosition = await getPosition();
  }catch(e){
    console.error(e);
    alert("Não consegui acessar o GPS. Permita localização no navegador.");
    setTradeStatus("GPS não autorizado.");
    return;
  }

  const stats = getAlbumStats();

  await setDoc(doc(db, "users", currentUser.uid), {
    uid: currentUser.uid,
    nick: profile.nick,
    whatsapp: profile.whatsapp || "",
    city: profile.city || "",
    lat: myPosition.lat,
    lng: myPosition.lng,
    accuracy: myPosition.accuracy,
    albumState: getAlbumState(),
    owned: stats.owned,
    repeatQty: stats.repeatQty,
    missing: stats.missing,
    active: true,
    updatedAt: serverTimestamp()
  }, { merge: true });

  setTradeStatus("Perfil publicado. Buscando pessoas próximas...");
  await findNearbyPeople();
}

async function findNearbyPeople(){
  if(!currentUser){
    alert("Entre na conta para buscar pessoas próximas.");
    return;
  }

  if(!myPosition){
    try{
      myPosition = await getPosition();
    }catch(e){
      alert("Permita localização para encontrar pessoas próximas.");
      return;
    }
  }

  const radius = Number($("#tradeRadius")?.value || 5);
  const box = $("#nearbyPeople");

  if(box){
    box.innerHTML = '<div class="notice">Buscando colecionadores próximos...</div>';
  }

  const usersQuery = query(
    collection(db, "users"),
    where("active", "==", true),
    limit(200)
  );

  const snap = await getDocs(usersQuery);
  const list = [];

  snap.forEach(d=>{
    const u = d.data();

    if(!u || u.uid === currentUser.uid) return;
    if(typeof u.lat !== "number" || typeof u.lng !== "number") return;

    const distance = kmDistance(myPosition, {lat:u.lat, lng:u.lng});

    if(distance <= radius){
      list.push({
        ...u,
        distance,
        comp: compatibility(u)
      });
    }
  });

  list.sort((a,b)=>a.distance - b.distance || b.comp.score - a.comp.score);

  renderNearbyPeople(list);

  setTradeStatus(
    list.length
      ? `Encontradas ${list.length} pessoa(s) próximas.`
      : "Nenhuma pessoa próxima encontrada neste raio."
  );
}

function renderNearbyPeople(list){
  const box = $("#nearbyPeople");
  if(!box) return;

  if(!list.length){
    box.innerHTML = '<div class="notice">Nenhuma pessoa próxima encontrada. Tente aumentar o raio.</div>';
    return;
  }

  box.innerHTML = list.map(u=>{
    const phone = u.whatsapp
      ? `https://wa.me/${u.whatsapp}?text=${encodeURIComponent("Olá! Vi seu perfil no Álbum Copa 2026 para troca de figurinhas.")}`
      : "";

    return `
      <article class="person-card">
        <div class="person-head">
          <div>
            <h4>${escapeHtml(u.nick || "Colecionador")}</h4>
            <small>${escapeHtml(u.city || "Cidade não informada")} · ${u.distance.toFixed(1)} km</small>
          </div>
          <small>⭐ ${u.comp.score}%</small>
        </div>

        <div class="match-badges">
          <span>✅ Tem: ${u.owned || 0}</span>
          <span>🔁 Rep.: ${u.repeatQty || 0}</span>
          <span>❌ Falta: ${u.missing || 0}</span>
          <span>🤝 Tem p/ você: ${u.comp.theyHaveINeed}</span>
          <span>🎁 Você tem p/ ela: ${u.comp.iHaveTheyNeed}</span>
        </div>

        <div class="person-actions">
          <button type="button" data-chat="${u.uid}" data-nick="${escapeAttr(u.nick || "Colecionador")}">💬 Chat</button>
          ${
            phone
              ? `<a href="${phone}" target="_blank" rel="noopener">📲 WhatsApp</a>`
              : `<button type="button" disabled>Sem WhatsApp</button>`
          }
        </div>
      </article>
    `;
  }).join("");

  box.querySelectorAll("[data-chat]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      openChat(btn.dataset.chat, btn.dataset.nick);
    });
  });
}

function chatId(a,b){
  return [a,b].sort().join("_");
}

function openChat(uid, nick){
  selectedChatUser = { uid, nick };

  const box = $("#chatBox");
  if(!box || !currentUser) return;

  box.innerHTML = `
    <div class="chat-header">
      <b>💬 Conversa com ${escapeHtml(nick)}</b>
      <button type="button" id="closeChatBtn" class="ghost">Fechar</button>
    </div>

    <div id="chatMessages" class="chat-messages">
      <div class="notice">Carregando mensagens...</div>
    </div>

    <div class="chat-form">
      <input id="chatInput" placeholder="Digite sua mensagem..."/>
      <button id="sendChatBtn" type="button">Enviar</button>
    </div>
  `;

  $("#closeChatBtn")?.addEventListener("click", ()=>{
    if(unsubscribeChat) unsubscribeChat();
    unsubscribeChat = null;
    selectedChatUser = null;
    box.innerHTML = '<div class="notice">Selecione uma pessoa próxima para abrir o chat.</div>';
  });

  $("#sendChatBtn")?.addEventListener("click", sendMessage);
  $("#chatInput")?.addEventListener("keydown", e=>{
    if(e.key === "Enter") sendMessage();
  });

  listenMessages(uid);
}

function listenMessages(otherUid){
  if(unsubscribeChat) unsubscribeChat();

  const id = chatId(currentUser.uid, otherUid);

  const qMsg = query(
    collection(db, "chats", id, "messages"),
    orderBy("createdAt", "asc"),
    limit(80)
  );

  unsubscribeChat = onSnapshot(qMsg, snap=>{
    const msgs = [];
    snap.forEach(d=>msgs.push(d.data()));
    renderMessages(msgs);
  });
}

function renderMessages(msgs){
  const box = $("#chatMessages");
  if(!box) return;

  if(!msgs.length){
    box.innerHTML = '<div class="notice">Nenhuma mensagem ainda.</div>';
    return;
  }

  box.innerHTML = msgs.map(m=>{
    return `<div class="chat-msg ${m.from === currentUser.uid ? "me" : ""}">${escapeHtml(m.text || "")}</div>`;
  }).join("");

  box.scrollTop = box.scrollHeight;
}

async function sendMessage(){
  const input = $("#chatInput");
  const text = (input?.value || "").trim();

  if(!text || !selectedChatUser || !currentUser) return;

  const id = chatId(currentUser.uid, selectedChatUser.uid);

  await addDoc(collection(db, "chats", id, "messages"), {
    from: currentUser.uid,
    to: selectedChatUser.uid,
    text,
    createdAt: serverTimestamp()
  });

  input.value = "";
}

async function deleteTradeProfile(){
  if(!currentUser) return;

  if(!confirm("Deseja apagar seu perfil online de trocas?")) return;

  await deleteDoc(doc(db, "users", currentUser.uid));

  setTradeStatus("Perfil online apagado.");

  const box = $("#nearbyPeople");
  if(box) box.innerHTML = '<div class="notice">Perfil apagado. Publique novamente para aparecer nas trocas.</div>';
}

function escapeHtml(str){
  return String(str || "").replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[m]));
}

function escapeAttr(str){
  return escapeHtml(str).replace(/"/g, "&quot;");
}

function setupTradeButtons(){
  fillTradeProfile();

  $("#saveTradeProfileBtn")?.addEventListener("click", saveTradeProfile);
  $("#publishTradeProfileBtn")?.addEventListener("click", publishTradeProfile);
  $("#findNearbyBtn")?.addEventListener("click", findNearbyPeople);
  $("#deleteTradeProfileBtn")?.addEventListener("click", deleteTradeProfile);
}

window.addEventListener("album-auth-changed", (event)=>{
  currentUser = event.detail.user || null;

  if(currentUser){
    setTradeStatus("Conectado. Salve seu perfil e publique sua localização.");
  }else{
    setTradeStatus("Entre na sua conta para usar as trocas.");
  }
});

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", setupTradeButtons);
}else{
  setupTradeButtons();
}
