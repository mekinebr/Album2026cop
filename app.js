const CATALOG_TEAM_PAGES = [
  ['Argentina','ARG',1,2],['Especiais','FWC',3,7],['Marrocos','MAR',8,9],['Croácia','CRO',10,11],
  ['Brasil','BRA',12,12],['Inglaterra','ENG',14,15],['Uruguai','URU',16,17],['Noruega','NOR',18,19],
  ['Alemanha','GER',20,21],['Portugal','POR',22,23],['Alemanha Extra','GERX',24,24],['Arábia Saudita','KSA',25,25],
  ['Argélia','ALG',26,26],['Argentina Mix','ARGX',27,28],['Austrália','AUS',29,29],['Áustria','AUT',30,30],
  ['Bélgica','BEL',31,31],['Bósnia e Herzegovina','BIH',32,32],['Brasil Mix','BRAX',33,34],['Cabo Verde','CPV',35,35],
  ['Canadá','CAN',36,36],['Craques','STAR',37,37],['Colômbia','COL',38,38],['República da Coreia','KOR',39,39],
  ['Costa do Marfim','CIV',40,40],['Croácia Mix','CROM',41,41],['Curaçau','CUW',42,42],['Equador','ECU',43,43],
  ['Egito','EGY',44,44],['Escócia','SCO',45,45],['Espanha','ESP',46,47],['EUA','USA',48,48],
  ['França','FRA',49,49],['Gana','GHA',50,50],['Haiti','HAI',51,51],['Inglaterra Mix','ENGX',52,52],
  ['RI do Irã','IRN',53,53],['Iraque','IRQ',54,54],['Japão','JPN',55,55],['Jordânia','JOR',56,56],
  ['Marrocos Mix','MARM',57,57],['México','MEX',58,59],['Noruega Mix','NORM',60,60],['Nova Zelândia','NZL',61,61],
  ['Holanda','NED',62,62],['Panamá','PAN',63,63],['Paraguai','PAR',64,64],['Portugal Mix','PORX',65,67],
  ['RD do Congo','COD',68,68],['Tchéquia','CZE',69,69]
];

const GROUPS = [
  {name:'Grupo A', teams:['México','África do Sul','República da Coreia','Tchéquia']},
  {name:'Grupo B', teams:['Canadá','Bósnia e Herzegovina','Catar','Suíça']},
  {name:'Grupo C', teams:['Brasil','Marrocos','Haiti','Escócia']},
  {name:'Grupo D', teams:['EUA','Paraguai','Austrália','Turquia']},
  {name:'Grupo E', teams:['Alemanha','Curaçau','Costa do Marfim','Equador']},
  {name:'Grupo F', teams:['Holanda','Japão','Suécia','Tunísia']},
  {name:'Grupo G', teams:['Bélgica','Egito','RI do Irã','Nova Zelândia']},
  {name:'Grupo H', teams:['Espanha','Cabo Verde','Arábia Saudita','Uruguai']},
  {name:'Grupo I', teams:['França','Senegal','Iraque','Noruega']},
  {name:'Grupo J', teams:['Argentina','Argélia','Áustria','Jordânia']},
  {name:'Grupo K', teams:['Portugal','RD do Congo','Uzbequistão','Colômbia']},
  {name:'Grupo L', teams:['Inglaterra','Croácia','Gana','Panamá']}
];

const FLAGS = {
  'México':'🇲🇽','África do Sul':'🇿🇦','República da Coreia':'🇰🇷','Tchéquia':'🇨🇿',
  'Canadá':'🇨🇦','Bósnia e Herzegovina':'🇧🇦','Catar':'🇶🇦','Suíça':'🇨🇭',
  'Brasil':'🇧🇷','Marrocos':'🇲🇦','Haiti':'🇭🇹','Escócia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'EUA':'🇺🇸','Paraguai':'🇵🇾','Austrália':'🇦🇺','Turquia':'🇹🇷',
  'Alemanha':'🇩🇪','Curaçau':'🇨🇼','Costa do Marfim':'🇨🇮','Equador':'🇪🇨',
  'Holanda':'🇳🇱','Japão':'🇯🇵','Suécia':'🇸🇪','Tunísia':'🇹🇳',
  'Bélgica':'🇧🇪','Egito':'🇪🇬','RI do Irã':'🇮🇷','Nova Zelândia':'🇳🇿',
  'Espanha':'🇪🇸','Cabo Verde':'🇨🇻','Arábia Saudita':'🇸🇦','Uruguai':'🇺🇾',
  'França':'🇫🇷','Senegal':'🇸🇳','Iraque':'🇮🇶','Noruega':'🇳🇴',
  'Argentina':'🇦🇷','Argélia':'🇩🇿','Áustria':'🇦🇹','Jordânia':'🇯🇴',
  'Portugal':'🇵🇹','RD do Congo':'🇨🇩','Uzbequistão':'🇺🇿','Colômbia':'🇨🇴',
  'Inglaterra':'🏴','Croácia':'🇭🇷','Gana':'🇬🇭','Panamá':'🇵🇦',
  'Especiais':'⭐','Craques':'🌟'
};

const TOTAL_PAGES = 96;
const SLOTS_PER_PAGE = 16;
let activeGroup = '';
let activeTeam = '';
const state = JSON.parse(localStorage.getItem('albumCopa2026Status')||'{}');
const theme = localStorage.getItem('albumTheme');
if(theme==='dark') document.body.classList.add('dark');

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const norm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

function pageImage(p){ return `assets/sheets/page-${String(p).padStart(3,'0')}.webp`; }
function pageTeam(page){ return CATALOG_TEAM_PAGES.find(t => page>=t[2] && page<=t[3]) || ['Página '+page, 'P'+String(page).padStart(3,'0'), page, page]; }
function slotPos(slot){ const c=(slot-1)%4; const r=Math.floor((slot-1)/4); return `${c*33.333}% ${r*33.333}%`; }
function stickerStyle(x){ return `--img:url('${x.img}');--pos:${slotPos(x.slot)}`; }
function canonicalTeam(team){ return String(team).replace(/ Mix| Extra/g,''); }
function flag(team){ return FLAGS[canonicalTeam(team)] || FLAGS[team] || '⚽'; }
function catalogForOfficialTeam(team){
  return CATALOG_TEAM_PAGES.filter(t => canonicalTeam(t[0]) === team || t[0] === team);
}
function officialGroupForTeam(team){
  const base = canonicalTeam(team);
  const g = GROUPS.find(gr => gr.teams.includes(base) || gr.teams.includes(team));
  return g ? g.name : (team==='Especiais'||team==='Craques' ? 'Especiais' : 'Outros');
}
function makeStickers(){
  const arr=[];
  for(let p=1;p<=TOTAL_PAGES;p++){
    const [team,prefix,start]=pageTeam(p);
    for(let s=1;s<=SLOTS_PER_PAGE;s++){
      const local=(p-start)*SLOTS_PER_PAGE+s;
      const code=`${prefix}-${String(local).padStart(2,'0')}`;
      arr.push({
        id:`P${String(p).padStart(3,'0')}-${String(s).padStart(2,'0')}`,
        code,page:p,slot:s,team,baseTeam:canonicalTeam(team),group:officialGroupForTeam(team),img:pageImage(p)
      });
    }
  }
  return arr;
}
const stickers = makeStickers();

function save(){ localStorage.setItem('albumCopa2026Status', JSON.stringify(state)); renderAll(); }
function setStatus(id,status){ if(status==='none') delete state[id]; else state[id]=status; save(); }
function getStatus(id){ return state[id]||'none'; }
function owns(x){ const st=getStatus(x.id); return st==='have' || st==='repeat'; }
function statusLabel(s){ return {have:'Tenho',missing:'Falta',repeat:'Repetida',none:'Não marcada'}[s]; }
function statusEmoji(s){ return {have:'✅',missing:'❌',repeat:'🔁',none:'⭕'}[s]; }
function matchesText(x,q){
  q=norm(q).trim(); if(!q) return true;
  const raw=q.replace(/\s/g,'');
  return norm(x.code).includes(q) || norm(x.id).includes(q) || norm(x.team).includes(q) || norm(x.baseTeam).includes(q) ||
    norm(x.group).includes(q) || String(x.page).includes(q) || norm(x.code.replace('-','')).includes(raw) ||
    norm(x.id.replace('-','')).includes(raw) || norm('pagina '+x.page).includes(q);
}
function applyFilters(x){
  const q=$('#search')?.value||''; const status=$('#statusFilter')?.value||'all';
  const byGroup = !activeGroup || x.group===activeGroup;
  const byTeam = !activeTeam || x.baseTeam===activeTeam || x.team===activeTeam;
  let byStatus = true;
  if(status==='have') byStatus = getStatus(x.id)==='have';
  if(status==='repeat') byStatus = getStatus(x.id)==='repeat';
  if(status==='missing') byStatus = !owns(x);
  if(status==='none') byStatus = getStatus(x.id)==='none';
  return byGroup && byTeam && byStatus && matchesText(x,q);
}
function findSticker(q){
  q=String(q||'').trim(); if(!q) return null;
  const qn=norm(q).replace(/\s/g,'');
  return stickers.find(x => norm(x.id)===qn || norm(x.code)===norm(q) || norm(x.code.replace('-',''))===qn || norm(x.id.replace('-',''))===qn)
    || stickers.find(x => matchesText(x,q));
}
function counts(list=stickers){
  const have=list.filter(x=>getStatus(x.id)==='have').length;
  const repeat=list.filter(x=>getStatus(x.id)==='repeat').length;
  const collected=have+repeat;
  return {
    have, repeat, collected,
    missing: Math.max(0, list.length-collected),
    explicitMissing: list.filter(x=>getStatus(x.id)==='missing').length,
    total:list.length,
    none:list.filter(x=>getStatus(x.id)==='none').length
  };
}
function pct(h,t){ return t?Math.round((h/t)*100):0; }

function renderDashboard(){
  const c=counts(); const p=pct(c.collected,c.total);
  $('#haveCount').textContent=c.collected;
  $('#repeatCount').textContent=c.repeat;
  $('#missingCount').textContent=c.missing;
  $('#totalCount').textContent=c.total;
  $('#homeRepeatCount').textContent=c.repeat;
  $('#homeMissingCount').textContent=c.explicitMissing || c.missing;
  $('#percent').textContent=p+'%';
  $('#barFill').style.width=p+'%';
  $('#progressText').textContent=`${c.collected} de ${c.total} figurinhas já estão no álbum`;
}
function openView(name){
  $$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#'+name).classList.add('active');
  if(name==='sheets') renderSheets();
  if(name==='trades') renderTrades();
  if(name==='album') renderCards();
  window.scrollTo({top:0,behavior:'smooth'});
}
function selectGroup(group){
  activeGroup=group; activeTeam='';
  if($('#search')) $('#search').value='';
  renderGroupSelector(); renderTeamSelector(); openView('home');
}
function selectTeam(team){
  activeTeam=team;
  activeGroup=officialGroupForTeam(team);
  $('#search').value=''; $('#statusFilter').value='all';
  renderGroupSelector(); renderTeamSelector(); openView('album'); renderCards();
}
function clearSelection(){
  activeGroup=''; activeTeam=''; $('#search').value=''; $('#statusFilter').value='all';
  renderGroupSelector(); renderTeamSelector(); renderCards();
}
function filterTo(q,status='all'){
  activeGroup=''; activeTeam=''; openView('album');
  $('#search').value=q; $('#statusFilter').value=status; renderCards();
}

function teamItems(team){ return stickers.filter(x => x.baseTeam===team || x.team===team); }
function renderGroupSelector(){
  $('#groupSelector').innerHTML = GROUPS.map(g=>{
    const items = stickers.filter(x=>x.group===g.name);
    const c=counts(items); const p=pct(c.collected,c.total);
    return `<button class="group-btn ${activeGroup===g.name?'active':''}" onclick="selectGroup('${g.name}')"><b>${g.name}</b><br><small>✅ ${c.collected} / ${c.total} · ${p}%</small></button>`;
  }).join('');
}
function renderTeamSelector(){
  const groupsToShow = activeGroup ? GROUPS.filter(g=>g.name===activeGroup) : GROUPS.slice(0,12);
  $('#teamSelector').innerHTML = groupsToShow.flatMap(g=>g.teams.map(team=>({team, group:g.name}))).map(({team,group})=>{
    const items=teamItems(team); const c=counts(items); const p=pct(c.collected,c.total);
    const unavailable = c.total===0;
    return `<button class="team-card ${activeTeam===team?'active':''} ${unavailable?'disabled-team':''}" onclick="${unavailable ? '' : `selectTeam('${team}')`}">
      <header><b>${flag(team)} ${team}</b><span>${unavailable?'—':p+'%'}</span></header>
      <div class="smallbar"><i style="width:${p}%"></i></div>
      <div class="mini-counts">${unavailable ? 'Ainda sem página no PDF' : `✅ ${c.collected} · ❌ ${c.missing} · 🔁 ${c.repeat} · Total ${c.total}`}</div>
    </button>`;
  }).join('');
}
function renderTeamProgress(){
  $('#teamProgress').innerHTML = GROUPS.map(g=>`
    <div class="progress-group">
      <h3>${g.name}</h3>
      ${g.teams.map(team=>{
        const items=teamItems(team); const c=counts(items); const p=pct(c.collected,c.total);
        return `<div class="team-row ${c.total===0?'disabled-team':''}" onclick="${c.total===0 ? '' : `selectTeam('${team}')`}">
          <header><span>${flag(team)} ${team}</span><span>${c.total===0?'Sem PDF':p+'%'}</span></header>
          <div class="smallbar"><i style="width:${p}%"></i></div>
          <small class="muted">${c.total===0 ? 'Aguardando cadastro das figurinhas dessa seleção.' : `✅ ${c.collected} · ❌ ${c.missing} · 🔁 ${c.repeat} · Total ${c.total}`}</small>
        </div>`;
      }).join('')}
    </div>
  `).join('');
}
function renderActiveFilters(){
  const chips=[];
  if(activeGroup) chips.push(`📌 ${activeGroup}`);
  if(activeTeam) chips.push(`${flag(activeTeam)} ${activeTeam}`);
  const st=$('#statusFilter')?.value;
  if(st&&st!=='all') chips.push(`${statusEmoji(st)} ${st==='missing'?'Faltam':statusLabel(st)}`);
  const q=$('#search')?.value; if(q) chips.push(`🔎 ${q}`);
  $('#activeFilters').innerHTML=chips.map(x=>`<span class="chip">${x}</span>`).join('');
}
function renderCards(){
  const filtered=stickers.filter(applyFilters); const list=filtered.slice(0,260); const c=counts(filtered);
  let title='Figurinhas'; if(activeTeam) title=`${flag(activeTeam)} ${activeTeam}`; else if(activeGroup) title=activeGroup;
  $('#albumTitle').textContent=title;
  $('#albumSubtitle').textContent=`${filtered.length} figurinhas · ✅ ${c.collected} · ❌ ${c.missing} · 🔁 ${c.repeat}`;
  renderActiveFilters();
  $('#cards').innerHTML = list.map(cardHTML).join('') || '<div class="notice">Nenhuma figurinha encontrada. Escolha outro grupo, seleção ou status.</div>';
}
function cardHTML(x){
  const st=getStatus(x.id);
  return `<article class="card">
    <div class="sticker-thumb" style="${stickerStyle(x)}" onclick="openSheet(${x.page})"></div>
    <div class="card-body">
      <div class="code">${x.code}</div>
      <b>${flag(x.baseTeam)} ${x.team}</b>
      <p class="muted">${x.group} · Página ${x.page} · posição ${x.slot}</p>
      <span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span>
      <div class="status-actions">
        <button class="${st==='have'?'active':''}" onclick="setStatus('${x.id}','have')">✅ Tenho</button>
        <button class="${st==='missing'?'active':''}" onclick="setStatus('${x.id}','missing')">❌ Falta</button>
        <button class="${st==='repeat'?'active':''}" onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button>
        <button onclick="setStatus('${x.id}','none')">Limpar</button>
      </div>
    </div>
  </article>`;
}
function renderSheets(){
  $('#sheetGrid').innerHTML=Array.from({length:TOTAL_PAGES},(_,i)=>i+1).map(p=>`<div class="sheet" onclick="openSheet(${p})"><img src="${pageImage(p)}" loading="lazy" alt="Página ${p}"><div>Página ${String(p).padStart(3,'0')} · ${pageTeam(p)[0]}</div></div>`).join('');
}
function listByStatus(status){
  if(status==='repeat') return stickers.filter(x=>getStatus(x.id)==='repeat').map(x=>`${x.code} - ${x.team} (${x.group})`).join('\n');
  return stickers.filter(x=>getStatus(x.id)==='missing').map(x=>`${x.code} - ${x.team} (${x.group})`).join('\n');
}
function renderTrades(){
  $('#repeatList').value=listByStatus('repeat') || 'Nenhuma repetida marcada ainda.';
  $('#missingList').value=listByStatus('missing') || 'Marque as figurinhas que você quer pedir em troca usando o botão ❌ Falta.';
}
function renderQuick(x){ if(!x){$('#quickResult').innerHTML='<div class="notice">Figurinha não encontrada. Use exemplo: ARG-01, BRA-12, Brasil ou Grupo C.</div>';return;} $('#quickResult').innerHTML=cardHTML(x); }
function openSheet(p){ $('#modalImg').src=pageImage(p); $('#modalTitle').textContent=`Página ${p} · ${pageTeam(p)[0]}`; $('#modal').classList.remove('hidden'); }
function tradeMessage(){ return `🏆 Minhas trocas - Álbum Copa 2026\n\n🔁 Tenho repetidas:\n${$('#repeatList').value}\n\n❌ Preciso:\n${$('#missingList').value}`; }
function shareTrades(){ window.open('https://wa.me/?text='+encodeURIComponent(tradeMessage()),'_blank'); }
async function copyTrades(){ try{ await navigator.clipboard.writeText(tradeMessage()); alert('Lista copiada!'); }catch(e){ alert('Não consegui copiar. Use o botão do WhatsApp.'); } }
function renderAll(){ renderDashboard(); renderGroupSelector(); renderTeamSelector(); renderTeamProgress(); renderCards(); renderTrades(); }

$$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.view)));
$$('[data-open-view]').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.openView)));
$('#findBtn').addEventListener('click',()=>renderQuick(findSticker($('#quickCode').value)));
$('#quickCode').addEventListener('input',e=>{
  const q=e.target.value.trim();
  if(q.length>=2){
    const group=GROUPS.find(g=>norm(g.name).includes(norm(q)));
    const team=GROUPS.flatMap(g=>g.teams).find(t=>norm(t).includes(norm(q)));
    if(group){selectGroup(group.name); return;}
    if(team && teamItems(team).length){selectTeam(team); return;}
    renderQuick(findSticker(q));
  }
});
$('#quickCode').addEventListener('keydown',e=>{if(e.key==='Enter')renderQuick(findSticker(e.target.value));});
$('#search').addEventListener('input',renderCards);
$('#statusFilter').addEventListener('change',renderCards);
$('#clearSelectionBtn').addEventListener('click',clearSelection);
$('#themeBtn').addEventListener('click',()=>{
  document.body.classList.toggle('dark');
  localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light');
  $('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';
});
$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';
$('#shareBtn').addEventListener('click',shareTrades);
$('#copyBtn').addEventListener('click',copyTrades);
$('#closeModal').addEventListener('click',()=>$('#modal').classList.add('hidden'));
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden');});

if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(()=>{});
renderAll();
