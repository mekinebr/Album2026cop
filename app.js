const TEAM_PAGES = [
  ['Argentina','ARG',1,2],['Especiais','FWC',3,7],['Marrocos','MAR',8,9],['Croácia','CRO',10,11],['Brasil','BRA',12,12],['Inglaterra','ENG',14,15],['Uruguai','URU',16,17],['Noruega','NOR',18,19],['Alemanha','GER',20,21],['Portugal','POR',22,23],['Alemanha Extra','GERX',24,24],['Arábia Saudita','KSA',25,25],['Argélia','ALG',26,26],['Argentina Mix','ARGX',27,28],['Austrália','AUS',29,29],['Áustria','AUT',30,30],['Bélgica','BEL',31,31],['Bósnia','BIH',32,32],['Brasil Mix','BRAX',33,34],['Cabo Verde','CPV',35,35],['Canadá','CAN',36,36],['Craques','STAR',37,37],['Colômbia','COL',38,38],['Coreia do Sul','KOR',39,39],['Costa do Marfim','CIV',40,40],['Croácia Mix','CROM',41,41],['Curaçao','CUW',42,42],['Equador','ECU',43,43],['Egito','EGY',44,44],['Escócia','SCO',45,45],['Espanha','ESP',46,47],['Estados Unidos','USA',48,48],['França','FRA',49,49],['Gana','GHA',50,50],['Haiti','HAI',51,51],['Inglaterra Mix','ENGX',52,52],['Irã','IRN',53,53],['Iraque','IRQ',54,54],['Japão','JPN',55,55],['Jordânia','JOR',56,56],['Marrocos Mix','MARM',57,57],['México','MEX',58,59],['Noruega Mix','NORM',60,60],['Nova Zelândia','NZL',61,61],['Holanda','NED',62,62],['Panamá','PAN',63,63],['Paraguai','PAR',64,64],['Portugal Mix','PORX',65,67],['RD Congo','COD',68,68],['Tchéquia','CZE',69,69]
];
const GROUPS = 'ABCDEFGHIJKL'.split('').map((g,i)=>({name:'Grupo '+g, teams:TEAM_PAGES.slice(i*4,i*4+4).map(t=>t[0])}));
const TOTAL_PAGES = 96;
const SLOTS_PER_PAGE = 16;
const state = JSON.parse(localStorage.getItem('albumCopa2026Status')||'{}');
const theme = localStorage.getItem('albumTheme'); if(theme==='dark') document.body.classList.add('dark');

function pageImage(p){return `assets/sheets/page-${String(p).padStart(3,'0')}.webp`}
function pageTeam(page){return TEAM_PAGES.find(t=>page>=t[2]&&page<=t[3]) || ['Página '+page, 'P'+String(page).padStart(3,'0'), page, page]}
function makeStickers(){
  const arr=[];
  for(let p=1;p<=TOTAL_PAGES;p++){
    const [team,prefix]=pageTeam(p);
    for(let s=1;s<=SLOTS_PER_PAGE;s++){
      const local = (p===pageTeam(p)[2] ? s : ((p-pageTeam(p)[2])*SLOTS_PER_PAGE+s));
      const code = `${prefix}-${String(local).padStart(2,'0')}`;
      arr.push({id:`P${String(p).padStart(3,'0')}-${String(s).padStart(2,'0')}`, code, page:p, slot:s, team, img:pageImage(p)});
    }
  }
  return arr;
}
const stickers = makeStickers();
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function save(){localStorage.setItem('albumCopa2026Status', JSON.stringify(state)); renderAll()}
function setStatus(id,status){ if(status==='none') delete state[id]; else state[id]=status; save(); }
function getStatus(id){return state[id]||'none'}
function statusLabel(s){return {have:'Tenho',missing:'Falta',repeat:'Repetida',none:'Não marcada'}[s]}
function statusEmoji(s){return {have:'✅',missing:'❌',repeat:'🔁',none:'⭕'}[s]}
function findSticker(q){q=(q||'').trim().toUpperCase(); return stickers.find(x=>x.id.toUpperCase()===q || x.code.toUpperCase()===q || x.code.replace('-','')===q || x.id.replace('-','')===q)}

function renderDashboard(){
  const have=stickers.filter(x=>getStatus(x.id)==='have').length;
  const repeat=stickers.filter(x=>getStatus(x.id)==='repeat').length;
  const missing=stickers.filter(x=>getStatus(x.id)==='missing').length;
  const total=stickers.length; const pct=Math.round((have/total)*100);
  $('#haveCount').textContent=have; $('#repeatCount').textContent=repeat; $('#missingCount').textContent=missing; $('#totalCount').textContent=total;
  $('#percent').textContent=pct+'%'; $('#barFill').style.width=pct+'%'; $('#progressText').textContent=`${have} de ${total} figurinhas marcadas como tenho`;
}
function renderGroups(){
  $('#groups').innerHTML = GROUPS.map(g=>`<div class="group"><b>${g.name}</b>${g.teams.map(t=>`<span class="team-pill">${t}</span>`).join('')}</div>`).join('');
}
function renderCards(){
  const q=$('#search')?.value?.toLowerCase()||''; const f=$('#statusFilter')?.value||'all';
  const list=stickers.filter(x=>{
    const st=getStatus(x.id); const okF=f==='all'||st===f; const okQ=!q||x.code.toLowerCase().includes(q)||x.id.toLowerCase().includes(q)||x.team.toLowerCase().includes(q)||String(x.page).includes(q); return okF&&okQ;
  }).slice(0,180);
  $('#cards').innerHTML=list.map(x=>cardHTML(x)).join('') || '<div class="panel muted">Nenhuma figurinha encontrada.</div>';
}
function cardHTML(x){const st=getStatus(x.id);return `<article class="card"><img src="${x.img}" alt="${x.team}" loading="lazy"><div class="card-body"><div class="code">${x.code}</div><b>${x.team}</b><p class="muted">Página ${x.page} · posição ${x.slot}</p><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button onclick="setStatus('${x.id}','have')">✅ Tenho</button><button onclick="setStatus('${x.id}','missing')">❌ Falta</button><button onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button></div></div></article>`}
function renderSheets(){
  $('#sheetGrid').innerHTML=Array.from({length:TOTAL_PAGES},(_,i)=>i+1).map(p=>`<div class="sheet" onclick="openSheet(${p})"><img src="${pageImage(p)}" loading="lazy" alt="Página ${p}"><div>Página ${String(p).padStart(3,'0')} · ${pageTeam(p)[0]}</div></div>`).join('');
}
function renderTrades(){
  const reps=stickers.filter(x=>getStatus(x.id)==='repeat').map(x=>`${x.code} - ${x.team}`);
  const miss=stickers.filter(x=>getStatus(x.id)==='missing').map(x=>`${x.code} - ${x.team}`);
  $('#repeatList').value=reps.join('\n')||'Nenhuma repetida marcada ainda.';
  $('#missingList').value=miss.join('\n')||'Nenhuma faltante marcada ainda.';
}
function renderQuick(x){
  if(!x){ $('#quickResult').innerHTML='<span class="muted">Figurinha não encontrada. Use exemplo: ARG-01, BRA-12 ou P001-01.</span>'; return; }
  const st=getStatus(x.id);
  $('#quickResult').innerHTML=`<div class="card"><img src="${x.img}" alt="${x.team}"><div class="card-body"><div class="code">${x.code}</div><b>${x.team}</b><p class="muted">Página ${x.page} · posição ${x.slot}</p><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button onclick="setStatus('${x.id}','have')">✅ Tenho</button><button onclick="setStatus('${x.id}','missing')">❌ Falta</button><button onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button><button onclick="setStatus('${x.id}','none')">Limpar</button></div></div></div>`;
}
function renderAll(){renderDashboard(); renderGroups(); renderCards(); renderTrades();}
function openSheet(p){$('#modalImg').src=pageImage(p); $('#modalTitle').textContent=`Página ${p} · ${pageTeam(p)[0]}`; $('#modal').classList.remove('hidden')}
function shareTrades(){
 const msg=`🏆 Minhas trocas - Álbum Copa 2026\n\n🔁 Tenho repetidas:\n${$('#repeatList').value}\n\n❌ Preciso:\n${$('#missingList').value}`;
 window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}
$$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>{$$('.bottom-nav button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); $$('.view').forEach(v=>v.classList.remove('active')); $('#'+btn.dataset.view).classList.add('active'); if(btn.dataset.view==='sheets') renderSheets(); if(btn.dataset.view==='trades') renderTrades();}));
$('#findBtn').addEventListener('click',()=>renderQuick(findSticker($('#quickCode').value)));
$('#quickCode').addEventListener('keydown',e=>{if(e.key==='Enter')renderQuick(findSticker(e.target.value))});
$('#search').addEventListener('input',renderCards); $('#statusFilter').addEventListener('change',renderCards);
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light')});
$('#shareBtn').addEventListener('click',shareTrades); $('#closeModal').addEventListener('click',()=>$('#modal').classList.add('hidden'));
if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(()=>{});
renderAll();
