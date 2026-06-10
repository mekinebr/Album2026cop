const TEAM_PAGES = [
  ['Argentina','ARG',1,2],['Especiais','FWC',3,7],['Marrocos','MAR',8,9],['Croácia','CRO',10,11],
  ['Brasil','BRA',12,12],['Inglaterra','ENG',14,15],['Uruguai','URU',16,17],['Noruega','NOR',18,19],
  ['Alemanha','GER',20,21],['Portugal','POR',22,23],['Alemanha Extra','GERX',24,24],['Arábia Saudita','KSA',25,25],
  ['Argélia','ALG',26,26],['Argentina Mix','ARGX',27,28],['Austrália','AUS',29,29],['Áustria','AUT',30,30],
  ['Bélgica','BEL',31,31],['Bósnia','BIH',32,32],['Brasil Mix','BRAX',33,34],['Cabo Verde','CPV',35,35],
  ['Canadá','CAN',36,36],['Craques','STAR',37,37],['Colômbia','COL',38,38],['Coreia do Sul','KOR',39,39],
  ['Costa do Marfim','CIV',40,40],['Croácia Mix','CROM',41,41],['Curaçao','CUW',42,42],['Equador','ECU',43,43],
  ['Egito','EGY',44,44],['Escócia','SCO',45,45],['Espanha','ESP',46,47],['Estados Unidos','USA',48,48],
  ['França','FRA',49,49],['Gana','GHA',50,50],['Haiti','HAI',51,51],['Inglaterra Mix','ENGX',52,52],
  ['Irã','IRN',53,53],['Iraque','IRQ',54,54],['Japão','JPN',55,55],['Jordânia','JOR',56,56],
  ['Marrocos Mix','MARM',57,57],['México','MEX',58,59],['Noruega Mix','NORM',60,60],['Nova Zelândia','NZL',61,61],
  ['Holanda','NED',62,62],['Panamá','PAN',63,63],['Paraguai','PAR',64,64],['Portugal Mix','PORX',65,67],
  ['RD Congo','COD',68,68],['Tchéquia','CZE',69,69]
];
const GROUPS = 'ABCDEFGHIJKL'.split('').map((g,i)=>({name:'Grupo '+g, teams:TEAM_PAGES.slice(i*4,i*4+4)}));
const TOTAL_PAGES = 96;
const SLOTS_PER_PAGE = 16;
const state = JSON.parse(localStorage.getItem('albumCopa2026Status')||'{}');
const theme = localStorage.getItem('albumTheme');
if(theme==='dark') document.body.classList.add('dark');

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const norm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function pageImage(p){return `assets/sheets/page-${String(p).padStart(3,'0')}.webp`}
function pageTeam(page){return TEAM_PAGES.find(t=>page>=t[2]&&page<=t[3]) || ['Página '+page, 'P'+String(page).padStart(3,'0'), page, page]}
function slotPos(slot){const c=(slot-1)%4;const r=Math.floor((slot-1)/4);return `${c*33.333}% ${r*33.333}%`}
function stickerStyle(x){return `--img:url('${x.img}');--pos:${slotPos(x.slot)}`}
function teamTotal(t){return (t[3]-t[2]+1)*SLOTS_PER_PAGE}
function groupNameForTeam(team){const g=GROUPS.find(gr=>gr.teams.some(t=>t[0]===team));return g?g.name:'Outros'}
function makeStickers(){
  const arr=[];
  for(let p=1;p<=TOTAL_PAGES;p++){
    const [team,prefix,start]=pageTeam(p);
    for(let s=1;s<=SLOTS_PER_PAGE;s++){
      const local = (p-start)*SLOTS_PER_PAGE+s;
      const code = `${prefix}-${String(local).padStart(2,'0')}`;
      arr.push({id:`P${String(p).padStart(3,'0')}-${String(s).padStart(2,'0')}`, code, page:p, slot:s, team, group:groupNameForTeam(team), img:pageImage(p)});
    }
  }
  return arr;
}
const stickers = makeStickers();
function save(){localStorage.setItem('albumCopa2026Status', JSON.stringify(state)); renderAll()}
function setStatus(id,status){ if(status==='none') delete state[id]; else state[id]=status; save(); }
function getStatus(id){return state[id]||'none'}
function statusLabel(s){return {have:'Tenho',missing:'Falta',repeat:'Repetida',none:'Não marcada'}[s]}
function statusEmoji(s){return {have:'✅',missing:'❌',repeat:'🔁',none:'⭕'}[s]}
function matches(x,q){
  q=norm(q).trim(); if(!q) return true;
  const raw=q.replace(/\s/g,'');
  return norm(x.code).includes(q)||norm(x.id).includes(q)||norm(x.team).includes(q)||norm(x.group).includes(q)||String(x.page).includes(q)||norm(x.code.replace('-','')).includes(raw)||norm(x.id.replace('-','')).includes(raw);
}
function findSticker(q){
  q=String(q||'').trim(); if(!q) return null;
  const qn=norm(q).replace(/\s/g,'');
  return stickers.find(x=>norm(x.id)===qn || norm(x.code)===norm(q) || norm(x.code.replace('-',''))===qn || norm(x.id.replace('-',''))===qn) || stickers.find(x=>matches(x,q));
}
function counts(){
  return {
    have:stickers.filter(x=>getStatus(x.id)==='have').length,
    repeat:stickers.filter(x=>getStatus(x.id)==='repeat').length,
    missing:stickers.filter(x=>getStatus(x.id)==='missing').length,
    total:stickers.length
  };
}
function renderDashboard(){
  const c=counts(); const pct=Math.round((c.have/c.total)*100);
  $('#haveCount').textContent=c.have; $('#repeatCount').textContent=c.repeat; $('#missingCount').textContent=c.missing; $('#totalCount').textContent=c.total;
  $('#homeRepeatCount').textContent=c.repeat; $('#homeMissingCount').textContent=c.missing;
  $('#percent').textContent=pct+'%'; $('#barFill').style.width=pct+'%'; $('#progressText').textContent=`${c.have} de ${c.total} figurinhas marcadas como tenho`;
}
function openView(name){
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#'+name).classList.add('active');
  if(name==='sheets') renderSheets();
  if(name==='trades') renderTrades();
  window.scrollTo({top:0,behavior:'smooth'});
}
function filterTo(q,status='all'){
  openView('album');
  $('#search').value=q;
  $('#statusFilter').value=status;
  renderCards();
}
function renderGroups(){
  $('#groups').innerHTML = GROUPS.map(g=>`<div class="group" onclick="filterTo('${g.name}')"><b>${g.name}</b>${g.teams.map(t=>`<span class="team-pill" onclick="event.stopPropagation();filterTo('${t[0]}')">${t[0]}</span>`).join('')}</div>`).join('');
}
function renderTeamProgress(){
  const rows=TEAM_PAGES.slice(0,48).map(t=>{
    const team=t[0]; const items=stickers.filter(x=>x.team===team); const have=items.filter(x=>getStatus(x.id)==='have').length; const repeat=items.filter(x=>getStatus(x.id)==='repeat').length; const missing=items.filter(x=>getStatus(x.id)==='missing').length; const pct=Math.round((have/items.length)*100);
    return `<div class="team-row" onclick="filterTo('${team}')"><header><span>${team}</span><span>${pct}%</span></header><div class="smallbar"><i style="width:${pct}%"></i></div><small class="muted">✅ ${have} · ❌ ${missing} · 🔁 ${repeat} · Total ${items.length}</small></div>`;
  }).join('');
  $('#teamProgress').innerHTML=rows;
}
function renderCards(){
  const q=$('#search')?.value||''; const f=$('#statusFilter')?.value||'all';
  const list=stickers.filter(x=>{const st=getStatus(x.id); return (f==='all'||st===f)&&matches(x,q)}).slice(0,220);
  $('#cards').innerHTML=list.map(x=>cardHTML(x)).join('') || '<div class="notice">Nenhuma figurinha encontrada. Tente buscar por seleção, grupo, página ou código. Exemplo: BRA-01, Argentina, Grupo A.</div>';
}
function cardHTML(x){
  const st=getStatus(x.id);
  return `<article class="card"><div class="sticker-thumb" style="${stickerStyle(x)}" onclick="openSheet(${x.page})"></div><div class="card-body"><div class="code">${x.code}</div><b>${x.team}</b><p class="muted">${x.group} · Página ${x.page} · posição ${x.slot}</p><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button class="${st==='have'?'active':''}" onclick="setStatus('${x.id}','have')">✅ Tenho</button><button class="${st==='missing'?'active':''}" onclick="setStatus('${x.id}','missing')">❌ Falta</button><button class="${st==='repeat'?'active':''}" onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button></div></div></article>`
}
function renderSheets(){
  $('#sheetGrid').innerHTML=Array.from({length:TOTAL_PAGES},(_,i)=>i+1).map(p=>`<div class="sheet" onclick="openSheet(${p})"><img src="${pageImage(p)}" loading="lazy" alt="Página ${p}"><div>Página ${String(p).padStart(3,'0')} · ${pageTeam(p)[0]}</div></div>`).join('');
}
function listByStatus(status){return stickers.filter(x=>getStatus(x.id)===status).map(x=>`${x.code} - ${x.team} (${x.group})`).join('\n')}
function renderTrades(){
  $('#repeatList').value=listByStatus('repeat')||'Nenhuma repetida marcada ainda.';
  $('#missingList').value=listByStatus('missing')||'Nenhuma faltante marcada ainda.';
}
function renderQuick(x){
  if(!x){ $('#quickResult').innerHTML='<div class="notice">Figurinha não encontrada. Use exemplo: ARG-01, BRA-12, P001-01, Brasil ou Grupo A.</div>'; return; }
  const st=getStatus(x.id);
  $('#quickResult').innerHTML=`<div class="card compact"><div class="sticker-thumb" style="${stickerStyle(x)}" onclick="openSheet(${x.page})"></div><div class="card-body"><div class="code">${x.code}</div><b>${x.team}</b><p class="muted">${x.group} · Página ${x.page} · posição ${x.slot}</p><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button class="${st==='have'?'active':''}" onclick="setStatus('${x.id}','have')">✅ Tenho</button><button class="${st==='missing'?'active':''}" onclick="setStatus('${x.id}','missing')">❌ Falta</button><button class="${st==='repeat'?'active':''}" onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button><button onclick="setStatus('${x.id}','none')">Limpar</button></div></div></div>`;
}
function openSheet(p){$('#modalImg').src=pageImage(p); $('#modalTitle').textContent=`Página ${p} · ${pageTeam(p)[0]}`; $('#modal').classList.remove('hidden')}
function tradeMessage(){return `🏆 Minhas trocas - Álbum Copa 2026\n\n🔁 Tenho repetidas:\n${$('#repeatList').value}\n\n❌ Preciso:\n${$('#missingList').value}`}
function shareTrades(){window.open('https://wa.me/?text='+encodeURIComponent(tradeMessage()),'_blank')}
async function copyTrades(){try{await navigator.clipboard.writeText(tradeMessage()); alert('Lista copiada!')}catch(e){alert('Não consegui copiar. Use o botão do WhatsApp.')}}
function renderAll(){renderDashboard(); renderGroups(); renderTeamProgress(); renderCards(); renderTrades();}

$$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.view)));
$$('[data-open-view]').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.openView)));
$$('[data-go]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.go).scrollIntoView({behavior:'smooth',block:'start'})));
$('#findBtn').addEventListener('click',()=>renderQuick(findSticker($('#quickCode').value)));
$('#quickCode').addEventListener('input',e=>{if(e.target.value.trim().length>=3) renderQuick(findSticker(e.target.value))});
$('#quickCode').addEventListener('keydown',e=>{if(e.key==='Enter')renderQuick(findSticker(e.target.value))});
$('#search').addEventListener('input',renderCards); $('#statusFilter').addEventListener('change',renderCards);
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light');$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙'});
$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';
$('#shareBtn').addEventListener('click',shareTrades); $('#copyBtn').addEventListener('click',copyTrades); $('#closeModal').addEventListener('click',()=>$('#modal').classList.add('hidden')); $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')});
if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(()=>{});
renderAll();
