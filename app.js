const TEAM_PAGES=[
['México','MEX',58,59],['África do Sul','RSA',70,70],['República da Coreia','KOR',39,39],['Tchéquia','CZE',69,69],
['Canadá','CAN',36,36],['Bósnia e Herzegovina','BIH',32,32],['Catar','QAT',71,71],['Suíça','SUI',72,72],
['Brasil','BRA',12,12],['Marrocos','MAR',8,9],['Haiti','HAI',51,51],['Escócia','SCO',45,45],
['EUA','USA',48,48],['Paraguai','PAR',64,64],['Austrália','AUS',29,29],['Turquia','TUR',73,73],
['Alemanha','GER',20,21],['Curaçau','CUW',42,42],['Costa do Marfim','CIV',40,40],['Equador','ECU',43,43],
['Holanda','NED',62,62],['Japão','JPN',55,55],['Suécia','SWE',74,74],['Tunísia','TUN',75,75],
['Bélgica','BEL',31,31],['Egito','EGY',44,44],['RI do Irã','IRN',53,53],['Nova Zelândia','NZL',61,61],
['Espanha','ESP',46,47],['Cabo Verde','CPV',35,35],['Arábia Saudita','KSA',25,25],['Uruguai','URU',16,17],
['França','FRA',49,49],['Senegal','SEN',76,76],['Iraque','IRQ',54,54],['Noruega','NOR',18,19],
['Argentina','ARG',1,2],['Argélia','ALG',26,26],['Áustria','AUT',30,30],['Jordânia','JOR',56,56],
['Portugal','POR',22,23],['RD do Congo','COD',68,68],['Uzbequistão','UZB',77,77],['Colômbia','COL',38,38],
['Inglaterra','ENG',14,15],['Croácia','CRO',10,11],['Gana','GHA',50,50],['Panamá','PAN',63,63]
];
const GROUPS='ABCDEFGHIJKL'.split('').map((g,i)=>({name:'Grupo '+g,teams:TEAM_PAGES.slice(i*4,i*4+4)}));
const TOTAL_PAGES=96,SLOTS_PER_PAGE=16;let activeGroup='',activeTeam='';
const state=JSON.parse(localStorage.getItem('albumCopa2026Status')||'{}');const theme=localStorage.getItem('albumTheme');if(theme==='dark')document.body.classList.add('dark');
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function pageImage(p){return`assets/sheets/page-${String(p).padStart(3,'0')}.webp`}
function pageTeam(page){return TEAM_PAGES.find(t=>page>=t[2]&&page<=t[3])||['Extras','P'+String(page).padStart(3,'0'),page,page]}
function slotPos(slot){const c=(slot-1)%4,r=Math.floor((slot-1)/4);return`${c*33.333}% ${r*33.333}%`}
function stickerStyle(x){return`--img:url('${x.img}');--pos:${slotPos(x.slot)}`}
function groupNameForTeam(team){const g=GROUPS.find(gr=>gr.teams.some(t=>t[0]===team));return g?g.name:'Outros'}
function makeStickers(){const arr=[];for(const t of TEAM_PAGES){for(let p=t[2];p<=t[3];p++){for(let s=1;s<=SLOTS_PER_PAGE;s++){const local=(p-t[2])*SLOTS_PER_PAGE+s;arr.push({id:`P${String(p).padStart(3,'0')}-${String(s).padStart(2,'0')}`,code:`${t[1]}-${String(local).padStart(2,'0')}`,page:p,slot:s,team:t[0],group:groupNameForTeam(t[0]),img:pageImage(p)});}}}return arr}
const stickers=makeStickers();
function save(){localStorage.setItem('albumCopa2026Status',JSON.stringify(state));renderAll()}
function setStatus(id,status){if(status==='none')delete state[id];else state[id]=status;save()}
function getStatus(id){return state[id]||'none'}
function statusLabel(s){return{have:'Tenho',missing:'Falta',repeat:'Repetida',none:'Não marcada'}[s]}
function statusEmoji(s){return{have:'✅',missing:'❌',repeat:'🔁',none:'⭕'}[s]}
function matchesText(x,q){q=norm(q).trim();if(!q)return true;const raw=q.replace(/\s/g,'');return norm(x.code).includes(q)||norm(x.id).includes(q)||norm(x.team).includes(q)||norm(x.group).includes(q)||String(x.page).includes(q)||norm(x.code.replace('-','')).includes(raw)}
function applyFilters(x){const q=$('#search')?.value||'',status=$('#statusFilter')?.value||'all';return(!activeGroup||x.group===activeGroup)&&(!activeTeam||x.team===activeTeam)&&(status==='all'||getStatus(x.id)===status)&&matchesText(x,q)}
function findSticker(q){q=String(q||'').trim();if(!q)return null;const qn=norm(q).replace(/\s/g,'');return stickers.find(x=>norm(x.id)===qn||norm(x.code)===norm(q)||norm(x.code.replace('-',''))===qn)||stickers.find(x=>matchesText(x,q))}
function counts(list=stickers){return{have:list.filter(x=>getStatus(x.id)==='have').length,repeat:list.filter(x=>getStatus(x.id)==='repeat').length,missing:list.filter(x=>getStatus(x.id)==='missing').length,total:list.length,none:list.filter(x=>getStatus(x.id)==='none').length}}
function pct(h,t){return t?Math.round(h/t*100):0}
function renderDashboard(){const c=counts(),p=pct(c.have,c.total);$('#haveCount').textContent=c.have;$('#repeatCount').textContent=c.repeat;$('#missingCount').textContent=c.missing;$('#totalCount').textContent=c.total;$('#homeRepeatCount').textContent=c.repeat;$('#homeMissingCount').textContent=c.missing;$('#percent').textContent=p+'%';$('#barFill').style.width=p+'%';$('#progressText').textContent=`${c.have} de ${c.total} figurinhas marcadas como tenho`}
function openView(name){$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$$('.view').forEach(v=>v.classList.remove('active'));$('#'+name).classList.add('active');if(name==='sheets')renderSheets();if(name==='trades')renderTrades();if(name==='album')renderCards();scrollTo({top:0,behavior:'smooth'})}
function selectGroup(group){activeGroup=group;activeTeam='';$('#search').value='';renderGroupSelector();renderTeamSelector();openView('home')}
function selectTeam(team){activeTeam=team;$('#search').value='';$('#statusFilter').value='all';renderGroupSelector();renderTeamSelector();openView('album');renderCards()}
function clearSelection(){activeGroup='';activeTeam='';$('#search').value='';$('#statusFilter').value='all';renderGroupSelector();renderTeamSelector();renderCards()}
function renderGroupSelector(){$('#groupSelector').innerHTML=GROUPS.map(g=>{const items=stickers.filter(x=>x.group===g.name),c=counts(items),p=pct(c.have,c.total);return`<button class="group-btn ${activeGroup===g.name?'active':''}" onclick="selectGroup('${g.name}')"><b>${g.name}</b><br><small>✅ ${c.have}/${c.total} · ${p}%</small></button>`}).join('')}
function renderTeamSelector(){const groupsToShow=activeGroup?GROUPS.filter(g=>g.name===activeGroup):GROUPS;$('#teamSelector').innerHTML=groupsToShow.flatMap(g=>g.teams).map(t=>{const team=t[0],items=stickers.filter(x=>x.team===team),c=counts(items),p=pct(c.have,c.total);return`<button class="team-card ${activeTeam===team?'active':''}" onclick="selectTeam('${team}')"><header><b>${team}</b><span>${p}%</span></header><div class="smallbar"><i style="width:${p}%"></i></div><div class="mini-counts">✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat} · ⭕ ${c.none}</div></button>`}).join('')}
function renderTeamProgress(){$('#teamProgress').innerHTML=TEAM_PAGES.map(t=>{const team=t[0],items=stickers.filter(x=>x.team===team),c=counts(items),p=pct(c.have,c.total);return`<div class="team-row" onclick="selectTeam('${team}')"><header><span>${team}</span><span>${p}%</span></header><div class="smallbar"><i style="width:${p}%"></i></div><small class="muted">✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat} · Total ${c.total}</small></div>`}).join('')}
function renderActiveFilters(){const chips=[];if(activeGroup)chips.push(`📌 ${activeGroup}`);if(activeTeam)chips.push(`⚽ ${activeTeam}`);const st=$('#statusFilter')?.value;if(st&&st!=='all')chips.push(`${statusEmoji(st)} ${statusLabel(st)}`);const q=$('#search')?.value;if(q)chips.push(`🔎 ${q}`);$('#activeFilters').innerHTML=chips.map(x=>`<span class="chip">${x}</span>`).join('')}
function renderCards(){const filtered=stickers.filter(applyFilters),list=filtered.slice(0,260),c=counts(filtered);$('#albumTitle').textContent=activeTeam||activeGroup||'Figurinhas';$('#albumSubtitle').textContent=`${filtered.length} figurinhas encontradas · ✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat} · ⭕ ${c.none}`;renderActiveFilters();$('#cards').innerHTML=list.map(cardHTML).join('')||'<div class="notice">Nenhuma figurinha encontrada.</div>'}
function cardHTML(x){const st=getStatus(x.id);return`<article class="card"><div class="sticker-thumb" style="${stickerStyle(x)}" onclick="openSheet(${x.page})"></div><div class="card-body"><div class="code">${x.code}</div><b>${x.team}</b><p class="muted">${x.group} · Página ${x.page} · posição ${x.slot}</p><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button class="${st==='have'?'active':''}" onclick="setStatus('${x.id}','have')">✅ Tenho</button><button class="${st==='missing'?'active':''}" onclick="setStatus('${x.id}','missing')">❌ Falta</button><button class="${st==='repeat'?'active':''}" onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button><button onclick="setStatus('${x.id}','none')">Limpar</button></div></div></article>`}
function renderSheets(){$('#sheetGrid').innerHTML=Array.from({length:TOTAL_PAGES},(_,i)=>i+1).map(p=>`<div class="sheet" onclick="openSheet(${p})"><img src="${pageImage(p)}" loading="lazy"><div>Página ${String(p).padStart(3,'0')} · ${pageTeam(p)[0]}</div></div>`).join('')}
function listByStatus(status){return stickers.filter(x=>getStatus(x.id)===status).map(x=>`${x.code} - ${x.team} (${x.group})`).join('\n')}
function renderTrades(){$('#repeatList').value=listByStatus('repeat')||'Nenhuma repetida marcada ainda.';$('#missingList').value=listByStatus('missing')||'Nenhuma faltante marcada ainda.'}
function renderQuick(x){$('#quickResult').innerHTML=x?cardHTML(x):'<div class="notice">Figurinha não encontrada.</div>'}
function openSheet(p){$('#modalImg').src=pageImage(p);$('#modalTitle').textContent=`Página ${p} · ${pageTeam(p)[0]}`;$('#modal').classList.remove('hidden')}
function tradeMessage(){return`🏆 Minhas trocas - Álbum Copa 2026\n\n🔁 Tenho repetidas:\n${$('#repeatList').value}\n\n❌ Preciso:\n${$('#missingList').value}`}
function shareTrades(){window.open('https://wa.me/?text='+encodeURIComponent(tradeMessage()),'_blank')}
async function copyTrades(){try{await navigator.clipboard.writeText(tradeMessage());alert('Lista copiada!')}catch(e){alert('Não consegui copiar.')}}
function renderAll(){renderDashboard();renderGroupSelector();renderTeamSelector();renderTeamProgress();renderCards();renderTrades()}
$$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.view)));$$('[data-open-view]').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.openView)));$('#findBtn').addEventListener('click',()=>renderQuick(findSticker($('#quickCode').value)));$('#quickCode').addEventListener('input',e=>{if(e.target.value.trim().length>=2)renderQuick(findSticker(e.target.value))});$('#search').addEventListener('input',renderCards);$('#statusFilter').addEventListener('change',renderCards);$('#clearSelectionBtn').addEventListener('click',clearSelection);$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light');$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙'});$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';$('#shareBtn').addEventListener('click',shareTrades);$('#copyBtn').addEventListener('click',copyTrades);$('#closeModal').addEventListener('click',()=>$('#modal').classList.add('hidden'));$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden')});if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});renderAll();
