import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvyccKuqTDhtdNS4mMyqm3F3Gu7kfeKd4",
  authDomain: "album-copa-2026-6812c.firebaseapp.com",
  projectId: "album-copa-2026-6812c",
  storageBucket: "album-copa-2026-6812c.firebasestorage.app",
  messagingSenderId: "293116985913",
  appId: "1:293116985913:web:a9a5fb5de4cfdea7ef83e8",
  measurementId: "G-B2Y961B68T"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

const providerGoogle = new GoogleAuthProvider();
providerGoogle.setCustomParameters({
  prompt: "select_account"
});

const $ = (s) => document.querySelector(s);

let authReady = false;

function setAuthStatus(text){
  const el = $("#authStatus");
  if(el) el.textContent = text;
}

function setLoggedUser(user){
  const box = $("#loggedUserBox");
  const text = $("#loggedUserText");

  if(!box || !text) return;

  if(user){
    box.style.display = "flex";
    const name =
      user.displayName ||
      user.email ||
      (user.isAnonymous ? "Usuário anônimo" : "Colecionador");

    text.textContent = "Conectado: " + name;
    setAuthStatus("Conta conectada. Álbum, trocas e chat liberados.");
  }else{
    box.style.display = "none";
    text.textContent = "";
    setAuthStatus("Entre para usar trocas, chat e perfil online.");
  }
}

function notifyAuthChanged(user){
  setLoggedUser(user);
  window.albumFirebaseUser = user || null;
  window.dispatchEvent(new CustomEvent("album-auth-changed", {
    detail: { user: user || null }
  }));
}

async function prepareAuth(){
  if(authReady) return;

  try{
    await setPersistence(auth, browserLocalPersistence);
    authReady = true;
  }catch(error){
    console.error("Erro ao definir persistência do Firebase:", error);
    authReady = true;
  }
}

async function loginGoogle(){
  try{
    await prepareAuth();
    setAuthStatus("Abrindo login Google...");

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if(isMobile){
      await signInWithRedirect(auth, providerGoogle);
      return;
    }

    try{
      const result = await signInWithPopup(auth, providerGoogle);
      if(result && result.user){
        notifyAuthChanged(result.user);
      }
    }catch(popupError){
      console.warn("Popup falhou, tentando redirect:", popupError);
      await signInWithRedirect(auth, providerGoogle);
    }
  }catch(error){
    console.error("Erro login Google:", error);
    alert("Não foi possível entrar com Google. Confira domínio autorizado e cache do site.");
    setAuthStatus("Erro ao entrar com Google.");
  }
}

async function loginAnonimo(){
  try{
    await prepareAuth();
    setAuthStatus("Entrando como anônimo...");
    const result = await signInAnonymously(auth);

    if(result && result.user){
      notifyAuthChanged(result.user);
    }
  }catch(error){
    console.error("Erro login anônimo:", error);
    alert("Erro no login anônimo. Ative Anonymous no Firebase Authentication.");
    setAuthStatus("Erro no login anônimo.");
  }
}

async function loginEmail(){
  const email = ($("#emailLoginInput")?.value || "").trim();
  const senha = $("#passwordLoginInput")?.value || "";

  if(!email || !senha){
    alert("Informe e-mail e senha.");
    return;
  }

  try{
    await prepareAuth();
    setAuthStatus("Entrando com e-mail...");
    const result = await signInWithEmailAndPassword(auth, email, senha);

    if(result && result.user){
      notifyAuthChanged(result.user);
    }
  }catch(error){
    console.error("Erro login e-mail:", error);
    alert("Erro ao entrar. Confira e-mail/senha ou crie uma conta.");
    setAuthStatus("Erro no login por e-mail.");
  }
}

async function criarContaEmail(){
  const email = ($("#emailLoginInput")?.value || "").trim();
  const senha = $("#passwordLoginInput")?.value || "";

  if(!email || !senha){
    alert("Informe e-mail e senha para criar a conta.");
    return;
  }

  if(senha.length < 6){
    alert("A senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  try{
    await prepareAuth();
    setAuthStatus("Criando conta...");
    const result = await createUserWithEmailAndPassword(auth, email, senha);

    if(result && result.user){
      notifyAuthChanged(result.user);
    }
  }catch(error){
    console.error("Erro criar conta:", error);
    alert("Erro ao criar conta. Talvez esse e-mail já exista ou o login por e-mail não esteja ativado.");
    setAuthStatus("Erro ao criar conta.");
  }
}

async function sairConta(){
  try{
    await signOut(auth);
    notifyAuthChanged(null);
  }catch(error){
    console.error("Erro ao sair:", error);
    alert("Erro ao sair da conta.");
  }
}

function setupAuthButtons(){
  $("#googleLoginBtn")?.addEventListener("click", loginGoogle);
  $("#anonLoginBtn")?.addEventListener("click", loginAnonimo);
  $("#emailLoginBtn")?.addEventListener("click", loginEmail);
  $("#emailRegisterBtn")?.addEventListener("click", criarContaEmail);
  $("#logoutBtn")?.addEventListener("click", sairConta);

  $("#passwordLoginInput")?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter") loginEmail();
  });
}

async function initFirebaseAuth(){
  await prepareAuth();

  try{
    const result = await getRedirectResult(auth);
    if(result && result.user){
      notifyAuthChanged(result.user);
    }
  }catch(error){
    console.error("Erro redirect Google:", error);
  }

  onAuthStateChanged(auth, (user)=>{
    notifyAuthChanged(user);
  });
}

// Se ninguém estiver logado, deixa o usuário escolher.
// Não força login anônimo automático aqui, para não atrapalhar Google/e-mail.
if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", () => {
    setupAuthButtons();
    initFirebaseAuth();
  });
}else{
  setupAuthButtons();
  initFirebaseAuth();
}
