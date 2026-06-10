const GROUP_DATA = {
  "A": [
    [
      "México",
      "MEX"
    ],
    [
      "África do Sul",
      "RSA"
    ],
    [
      "República da Coreia",
      "KOR"
    ],
    [
      "Tchéquia",
      "CZE"
    ]
  ],
  "B": [
    [
      "Canadá",
      "CAN"
    ],
    [
      "Bósnia e Herzegovina",
      "BIH"
    ],
    [
      "Catar",
      "QAT"
    ],
    [
      "Suíça",
      "SUI"
    ]
  ],
  "C": [
    [
      "Brasil",
      "BRA"
    ],
    [
      "Marrocos",
      "MAR"
    ],
    [
      "Haiti",
      "HAI"
    ],
    [
      "Escócia",
      "SCO"
    ]
  ],
  "D": [
    [
      "EUA",
      "USA"
    ],
    [
      "Paraguai",
      "PAR"
    ],
    [
      "Austrália",
      "AUS"
    ],
    [
      "Turquia",
      "TUR"
    ]
  ],
  "E": [
    [
      "Alemanha",
      "GER"
    ],
    [
      "Curaçau",
      "CUW"
    ],
    [
      "Costa do Marfim",
      "CIV"
    ],
    [
      "Equador",
      "ECU"
    ]
  ],
  "F": [
    [
      "Holanda",
      "NED"
    ],
    [
      "Japão",
      "JPN"
    ],
    [
      "Suécia",
      "SWE"
    ],
    [
      "Tunísia",
      "TUN"
    ]
  ],
  "G": [
    [
      "Bélgica",
      "BEL"
    ],
    [
      "Egito",
      "EGY"
    ],
    [
      "RI do Irã",
      "IRN"
    ],
    [
      "Nova Zelândia",
      "NZL"
    ]
  ],
  "H": [
    [
      "Espanha",
      "ESP"
    ],
    [
      "Cabo Verde",
      "CPV"
    ],
    [
      "Arábia Saudita",
      "KSA"
    ],
    [
      "Uruguai",
      "URU"
    ]
  ],
  "I": [
    [
      "França",
      "FRA"
    ],
    [
      "Senegal",
      "SEN"
    ],
    [
      "Iraque",
      "IRQ"
    ],
    [
      "Noruega",
      "NOR"
    ]
  ],
  "J": [
    [
      "Argentina",
      "ARG"
    ],
    [
      "Argélia",
      "ALG"
    ],
    [
      "Áustria",
      "AUT"
    ],
    [
      "Jordânia",
      "JOR"
    ]
  ],
  "K": [
    [
      "Portugal",
      "POR"
    ],
    [
      "RD do Congo",
      "COD"
    ],
    [
      "Uzbequistão",
      "UZB"
    ],
    [
      "Colômbia",
      "COL"
    ]
  ],
  "L": [
    [
      "Inglaterra",
      "ENG"
    ],
    [
      "Croácia",
      "CRO"
    ],
    [
      "Gana",
      "GHA"
    ],
    [
      "Panamá",
      "PAN"
    ]
  ]
};
const SPECIALS = [{ group: 'Extras', team: 'História da Copa', code: 'FWC', total: 20 }];
const GROUPS = Object.entries(GROUP_DATA).map(([letter, teams]) => ({ letter, name: 'Grupo ' + letter, teams: teams.map(([team, code]) => ({ team, code, total: 20 })) }));
let activeGroup = '', activeTeam = '', activeCode = '', deferredInstallPrompt = null, scannerStream = null;
const state = JSON.parse(localStorage.getItem('albumCopa2026StatusV2') || '{}');
const theme = localStorage.getItem('albumTheme');
if (theme === 'dark') document.body.classList.add('dark');
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function makeStickers() {
  const arr = [];
  GROUPS.forEach(g => g.teams.forEach(t => {
    for (let n = 1; n <= t.total; n++) {
      const code = `${t.code}-${String(n).padStart(2, '0')}`;
      arr.push({ id: code, code, number: n, team: t.team, teamCode: t.code, group: g.name, groupLetter: g.letter, label: `Figurinha ${code}` });
    }
  }));
  SPECIALS.forEach(s => {
    for (let n = 0; n < s.total; n++) {
      const code = `${s.code}-${String(n).padStart(2, '0')}`;
      arr.push({ id: code, code, number: n, team: s.team, teamCode: s.code, group: s.group, groupLetter: 'Extras', label: `Figurinha ${code}` });
    }
  });
  return arr;
}
const stickers = makeStickers();

function save() { localStorage.setItem('albumCopa2026StatusV2', JSON.stringify(state)); renderAll(); }
function setStatus(id, status) { if (status === 'none') delete state[id]; else state[id] = status; save(); }
function cycleStatus(id) { const order = ['none','have','missing','repeat']; setStatus(id, order[(order.indexOf(getStatus(id)) + 1) % order.length]); }
function getStatus(id) { return state[id] || 'none'; }
function statusLabel(s) { return { have:'Tenho', missing:'Falta', repeat:'Repetida', none:'Não marcada' }[s]; }
function statusEmoji(s) { return { have:'✅', missing:'❌', repeat:'🔁', none:'⭕' }[s]; }
function counts(list = stickers) { return { have:list.filter(x=>getStatus(x.id)==='have').length, repeat:list.filter(x=>getStatus(x.id)==='repeat').length, missing:list.filter(x=>getStatus(x.id)==='missing').length, none:list.filter(x=>getStatus(x.id)==='none').length, total:list.length }; }
function pct(h,t) { return t ? Math.round((h/t)*100) : 0; }
function matchesText(x,q) {
  q = norm(q).trim(); if (!q) return true;
  const raw = q.replace(/\s/g,'').replace('-','');
  return norm(x.code).includes(q) || norm(x.code.replace('-','')).includes(raw) || norm(x.team).includes(q) || norm(x.teamCode).includes(q) || norm(x.group).includes(q) || String(x.number).padStart(2,'0') === raw || String(x.number) === raw;
}
function applyFilters(x) {
  const q = $('#search')?.value || '', status = $('#statusFilter')?.value || 'all';
  return (!activeGroup || x.group === activeGroup) && (!activeTeam || x.team === activeTeam) && (status === 'all' || getStatus(x.id) === status) && matchesText(x,q);
}
function findSticker(q) {
  q = String(q || '').trim(); if (!q) return null;
  const clean = norm(q).replace(/\s/g,'').replace('-','');
  return stickers.find(x => norm(x.code.replace('-','')) === clean) || stickers.find(x => matchesText(x,q));
}
function extractStickerCode(text) {
  const up = String(text || '').toUpperCase().replace(/[^A-Z0-9\-\s]/g, ' ');
  const compact = up.replace(/\s+/g, '');
  let m = compact.match(/([A-Z]{3})[\-]?(\d{1,2})/);
  if (m) return `${m[1]}-${String(Number(m[2])).padStart(2,'0')}`;
  m = up.match(/([A-Z]{3})\s*(\d{1,2})/);
  if (m) return `${m[1]}-${String(Number(m[2])).padStart(2,'0')}`;
  return '';
}
function renderDashboard() {
  const c = counts(), p = pct(c.have,c.total);
  $('#haveCount').textContent = c.have; $('#repeatCount').textContent = c.repeat; $('#missingCount').textContent = c.missing; $('#totalCount').textContent = c.total;
  $('#homeRepeatCount').textContent = c.repeat; $('#homeMissingCount').textContent = c.missing;
  $('#percent').textContent = p + '%'; $('#barFill').style.width = p + '%'; $('#progressText').textContent = `${c.have} de ${c.total} figurinhas marcadas como tenho`;
}
function openView(name) {
  $$('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  $$('.view').forEach(v => v.classList.remove('active')); $('#' + name).classList.add('active');
  if (name === 'album') renderCards(); if (name === 'trades') renderTrades(); window.scrollTo({top:0,behavior:'smooth'});
}
function selectGroup(group) { activeGroup = group; activeTeam = ''; activeCode = ''; $('#search').value = ''; renderGroupSelector(); renderTeamSelector(); openView('home'); }
function selectTeam(team) {
  const found = stickers.find(x => x.team === team); activeTeam = team; activeCode = found ? found.teamCode : ''; activeGroup = found ? found.group : activeGroup;
  $('#search').value = ''; $('#statusFilter').value = 'all'; renderGroupSelector(); renderTeamSelector(); openView('album');
}
function clearSelection() { activeGroup=''; activeTeam=''; activeCode=''; $('#search').value=''; $('#statusFilter').value='all'; renderGroupSelector(); renderTeamSelector(); renderCards(); }
function renderGroupSelector() {
  $('#groupSelector').innerHTML = GROUPS.map(g => {
    const items = stickers.filter(x => x.group === g.name), c = counts(items), p = pct(c.have,c.total);
    return `<button class="group-btn ${activeGroup===g.name?'active':''}" onclick="selectGroup('${g.name}')"><b>${g.name}</b><br><small>✅ ${c.have}/${c.total} · ${p}%</small></button>`;
  }).join('');
}
function renderTeamSelector() {
  const groupsToShow = activeGroup ? GROUPS.filter(g => g.name === activeGroup) : GROUPS;
  $('#teamSelector').innerHTML = groupsToShow.flatMap(g => g.teams).map(t => {
    const items = stickers.filter(x => x.team === t.team), c = counts(items), p = pct(c.have,c.total);
    return `<button class="team-card ${activeTeam===t.team?'active':''}" onclick="selectTeam('${t.team}')"><header><b>${t.team}</b><span>${t.code}</span></header><div class="smallbar"><i style="width:${p}%"></i></div><div class="mini-counts">✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat} · ⭕ ${c.none}</div></button>`;
  }).join('');
}
function renderTeamProgress() {
  const teams = GROUPS.flatMap(g => g.teams.map(t => ({...t, group:g.name})));
  $('#teamProgress').innerHTML = teams.map(t => {
    const items = stickers.filter(x => x.team === t.team), c = counts(items), p = pct(c.have,c.total);
    return `<div class="team-row" onclick="selectTeam('${t.team}')"><header><span>${t.team} <small class="muted">${t.code}</small></span><span>${p}%</span></header><div class="smallbar"><i style="width:${p}%"></i></div><small class="muted">${t.group} · ✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat}</small></div>`;
  }).join('');
}
function renderActiveFilters() {
  const chips=[]; if(activeGroup)chips.push(`📌 ${activeGroup}`); if(activeTeam)chips.push(`⚽ ${activeTeam}`);
  const st=$('#statusFilter')?.value; if(st&&st!=='all')chips.push(`${statusEmoji(st)} ${statusLabel(st)}`);
  const q=$('#search')?.value; if(q)chips.push(`🔎 ${q}`);
  $('#activeFilters').innerHTML=chips.map(x=>`<span class="chip">${x}</span>`).join('');
}
function renderCards() {
  const filtered=stickers.filter(applyFilters), list=filtered.slice(0,260), c=counts(filtered);
  $('#albumTitle').textContent=activeTeam||activeGroup||'Figurinhas';
  $('#albumSubtitle').textContent=`${filtered.length} figurinhas · ✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat} · ⭕ ${c.none}`;
  renderActiveFilters(); $('#cards').innerHTML=list.map(cardHTML).join('')||'<div class="notice">Nenhuma figurinha encontrada.</div>';
}
function cardHTML(x) {
  const st=getStatus(x.id);
  return `<article class="card"><div class="code" onclick="cycleStatus('${x.id}')">${x.code}</div><div class="team-name" onclick="cycleStatus('${x.id}')">${x.team}</div><small>${x.group} · Nº ${String(x.number).padStart(2,'0')}</small><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button class="${st==='have'?'active':''}" onclick="setStatus('${x.id}','have')">✅ Tenho</button><button class="${st==='missing'?'active':''}" onclick="setStatus('${x.id}','missing')">❌ Falta</button><button class="${st==='repeat'?'active':''}" onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button><button onclick="setStatus('${x.id}','none')">Limpar</button></div></article>`;
}
function listByStatus(status) { return stickers.filter(x=>getStatus(x.id)===status).map(x=>`${x.code} - ${x.team} (${x.group})`).join('\n'); }
function renderTrades() { $('#repeatList').value=listByStatus('repeat')||'Nenhuma repetida marcada ainda.'; $('#missingList').value=listByStatus('missing')||'Nenhuma faltante marcada ainda.'; }
function renderQuick(x) {
  if(!x) {
    const q=$('#quickCode').value.trim(), group=GROUPS.find(g=>norm(g.name).includes(norm(q))||norm(g.letter)===norm(q)), team=stickers.find(s=>norm(s.team).includes(norm(q))||norm(s.teamCode)===norm(q));
    if(group){selectGroup(group.name);return;} if(team){selectTeam(team.team);return;}
    $('#quickResult').innerHTML='<div class="notice">Figurinha não encontrada. Tente BRA-01, ARG, Brasil ou Grupo C.</div>'; return;
  }
  $('#quickResult').innerHTML=cardHTML(x);
}
function tradeMessage() { return `🏆 Álbum Copa 2026\n\n🔁 Tenho repetidas:\n${$('#repeatList').value}\n\n❌ Preciso:\n${$('#missingList').value}`; }
function shareTrades() { window.open('https://wa.me/?text='+encodeURIComponent(tradeMessage()),'_blank'); }
async function copyTrades() { try{await navigator.clipboard.writeText(tradeMessage());alert('Lista copiada!')}catch(e){alert('Não consegui copiar.')} }

async function startScanner() {
  const video = $('#scannerVideo');
  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = scannerStream;
    await video.play();
    $('#scannerStatus').textContent = 'Câmera aberta. Aponte para o código e toque em “Ler código”.';
  } catch(e) {
    $('#scannerStatus').textContent = 'Não consegui abrir a câmera. Confira a permissão do navegador.';
  }
}
function stopScanner() {
  if (scannerStream) scannerStream.getTracks().forEach(t => t.stop());
  scannerStream = null;
  $('#scannerVideo').srcObject = null;
  $('#scannerStatus').textContent = 'Scanner fechado.';
}
async function scanFrame() {
  const video = $('#scannerVideo'), canvas = $('#scannerCanvas'), status = $('#scannerStatus');
  if (!video.srcObject) { status.textContent = 'Abra a câmera primeiro.'; return; }
  status.textContent = 'Lendo código... segure a câmera firme.';
  const w = video.videoWidth || 1280, h = video.videoHeight || 720;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  try {
    let text = '';
    if (window.Tesseract) {
      const result = await Tesseract.recognize(canvas, 'eng');
      text = result?.data?.text || '';
    }
    const code = extractStickerCode(text);
    if (code) {
      $('#quickCode').value = code;
      const item = findSticker(code);
      renderQuick(item);
      status.textContent = item ? `Código encontrado: ${code}` : `Li ${code}, mas não achei na base.`;
      if (item) window.scrollTo({ top: $('#quickResult').offsetTop - 20, behavior: 'smooth' });
    } else {
      status.textContent = 'Não consegui identificar. Tente aproximar mais do código ou digite manualmente.';
    }
  } catch(e) {
    status.textContent = 'Erro na leitura. Tente novamente com mais luz.';
  }
}

function setupInstall() {
  const btn = $('#installBtn'), card = $('#installCard');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    card.style.display = 'flex';
  });
  btn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    } else {
      alert('No Android: abra no Chrome, toque nos 3 pontinhos e escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.');
    }
  });
}

function renderAll() { renderDashboard(); renderGroupSelector(); renderTeamSelector(); renderTeamProgress(); renderCards(); renderTrades(); }
$$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.view)));
$$('[data-open-view]').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.openView)));
$('#findBtn').addEventListener('click',()=>renderQuick(findSticker($('#quickCode').value)));
$('#quickCode').addEventListener('input',e=>{if(e.target.value.trim().length>=2)renderQuick(findSticker(e.target.value));});
$('#quickCode').addEventListener('keydown',e=>{if(e.key==='Enter')renderQuick(findSticker(e.target.value));});
$('#search').addEventListener('input',renderCards); $('#statusFilter').addEventListener('change',renderCards); $('#clearSelectionBtn').addEventListener('click',clearSelection);
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light');$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';});
$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';
$('#shareBtn').addEventListener('click',shareTrades); $('#copyBtn').addEventListener('click',copyTrades);
$('#startScannerBtn').addEventListener('click',startScanner); $('#scanFrameBtn').addEventListener('click',scanFrame); $('#stopScannerBtn').addEventListener('click',stopScanner);
setupInstall();
if('serviceWorker' in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});
renderAll();
