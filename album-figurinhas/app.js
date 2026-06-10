const STORAGE_KEY = 'album_figurinhas_v2';
const THEME_KEY = 'album_tema';
let players = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {numero:1,nome:'Neymar Jr',time:'Brasil',posicao:'Atacante',status:'tenho',foto:'',escudo:''},
  {numero:2,nome:'Vini Jr',time:'Brasil',posicao:'Atacante',status:'falta',foto:'',escudo:''},
  {numero:3,nome:'Rodrygo',time:'Brasil',posicao:'Atacante',status:'repetida',foto:'',escudo:''}
];

const $ = id => document.getElementById(id);
const list = $('playersList');
const form = $('playerForm');

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(players)); }
function statusLabel(status){ return status === 'tenho' ? '✅ Tenho' : status === 'falta' ? '❌ Falta' : '🔁 Repetida'; }
function initials(name){ return (name || '?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase(); }

function renderStats(){
  const total = players.length;
  const have = players.filter(p=>p.status==='tenho').length;
  const missing = players.filter(p=>p.status==='falta').length;
  const repeat = players.filter(p=>p.status==='repetida').length;
  const progress = total ? Math.round((have / total) * 100) : 0;
  $('totalCount').textContent = total;
  $('haveCount').textContent = have;
  $('missingCount').textContent = missing;
  $('repeatCount').textContent = repeat;
  $('progressText').textContent = progress + '%';
  $('progressBar').style.width = progress + '%';
  $('progressInfo').textContent = `${have} de ${total} figurinhas marcadas como tenho`;
}

function render(){
  const q = $('searchInput').value.toLowerCase().trim();
  const filter = $('statusFilter').value;
  const filtered = players
    .filter(p => filter === 'todos' || p.status === filter)
    .filter(p => String(p.numero).includes(q) || p.nome.toLowerCase().includes(q) || p.time.toLowerCase().includes(q))
    .sort((a,b)=>Number(a.numero)-Number(b.numero));

  list.innerHTML = filtered.length ? filtered.map((p, index) => `
    <article class="player-card">
      ${p.foto ? `<img class="photo" src="${p.foto}" alt="${p.nome}">` : `<div class="avatar-fallback">${initials(p.nome)}</div>`}
      <div>
        <div class="player-top">
          <h4>${p.nome}</h4>
          <span class="number">Nº ${String(p.numero).padStart(3,'0')}</span>
        </div>
        <div class="team-row">
          ${p.escudo ? `<img class="shield" src="${p.escudo}" alt="Escudo ${p.time}">` : '🛡️'}
          <span>${p.time}${p.posicao ? ' • ' + p.posicao : ''}</span>
        </div>
        <span class="status-pill status-${p.status}">${statusLabel(p.status)}</span>
        <div class="actions">
          <button onclick="changeStatus(${players.indexOf(p)}, 'tenho')">Tenho</button>
          <button onclick="changeStatus(${players.indexOf(p)}, 'falta')">Falta</button>
          <button onclick="changeStatus(${players.indexOf(p)}, 'repetida')">Repetida</button>
          <button class="delete" onclick="removePlayer(${players.indexOf(p)})">Excluir</button>
        </div>
      </div>
    </article>`).join('') : `<div class="empty">Nenhuma figurinha encontrada.</div>`;
  renderStats();
}

function changeStatus(i, status){ players[i].status = status; save(); render(); }
function removePlayer(i){ if(confirm('Excluir esta figurinha?')){ players.splice(i,1); save(); render(); } }
window.changeStatus = changeStatus;
window.removePlayer = removePlayer;

form.addEventListener('submit', e => {
  e.preventDefault();
  const item = {
    numero: Number($('numero').value), nome: $('nome').value.trim(), time: $('time').value.trim(),
    posicao: $('posicao').value.trim(), foto: $('foto').value.trim(), escudo: $('escudo').value.trim(), status: $('status').value
  };
  const existing = players.findIndex(p => Number(p.numero) === item.numero);
  if(existing >= 0 && !confirm('Já existe figurinha com esse número. Deseja substituir?')) return;
  if(existing >= 0) players[existing] = item; else players.push(item);
  save(); form.reset(); render();
});

$('searchInput').addEventListener('input', render);
$('statusFilter').addEventListener('change', render);
$('clearAll').addEventListener('click', () => { if(confirm('Apagar todas as figurinhas?')){ players = []; save(); render(); } });

function applyTheme(){
  const dark = localStorage.getItem(THEME_KEY) === 'dark';
  document.body.classList.toggle('dark', dark);
  $('toggleTheme').textContent = dark ? '☀️' : '🌙';
}
$('toggleTheme').addEventListener('click', () => {
  localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'light' : 'dark');
  applyTheme();
});

if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js').catch(()=>{}); }
applyTheme(); render();
