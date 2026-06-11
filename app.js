const GROUPS={"A": [["México", "MEX"], ["África do Sul", "RSA"], ["República da Coreia", "KOR"], ["Tchéquia", "CZE"]], "B": [["Canadá", "CAN"], ["Bósnia e Herzegovina", "BIH"], ["Catar", "QAT"], ["Suíça", "SUI"]], "C": [["Brasil", "BRA"], ["Marrocos", "MAR"], ["Haiti", "HAI"], ["Escócia", "SCO"]], "D": [["EUA", "USA"], ["Paraguai", "PAR"], ["Austrália", "AUS"], ["Turquia", "TUR"]], "E": [["Alemanha", "GER"], ["Curaçau", "CUW"], ["Costa do Marfim", "CIV"], ["Equador", "ECU"]], "F": [["Holanda", "NED"], ["Japão", "JPN"], ["Suécia", "SWE"], ["Tunísia", "TUN"]], "G": [["Bélgica", "BEL"], ["Egito", "EGY"], ["Irã", "IRN"], ["Nova Zelândia", "NZL"]], "H": [["Espanha", "ESP"], ["Cabo Verde", "CPV"], ["Arábia Saudita", "KSA"], ["Uruguai", "URU"]], "I": [["França", "FRA"], ["Senegal", "SEN"], ["Iraque", "IRQ"], ["Noruega", "NOR"]], "J": [["Argentina", "ARG"], ["Argélia", "ALG"], ["Áustria", "AUT"], ["Jordânia", "JOR"]], "K": [["Portugal", "POR"], ["RD do Congo", "COD"], ["Uzbequistão", "UZB"], ["Colômbia", "COL"]], "L": [["Inglaterra", "ENG"], ["Croácia", "CRO"], ["Gana", "GHA"], ["Panamá", "PAN"]]};
const TOTAL_PER_TEAM=20;
const state=JSON.parse(localStorage.getItem('albumBingo2026StatusV2')||'{}');
const daily=JSON.parse(localStorage.getItem('albumBingo2026Daily')||'{}');
let activeGroup='A',query='',statusFilter='all',currentView='groups',viewStack=['groups'];
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
if(localStorage.getItem('albumTheme')==='dark')document.body.classList.add('dark');
function todayKey(){return new Date().toLocaleDateString('pt-BR')}
function allStickers(){const arr=[];Object.entries(GROUPS).forEach(([g,teams])=>teams.forEach(([team,code])=>{for(let n=1;n<=TOTAL_PER_TEAM;n++)arr.push({id:`${code}-${n}`,group:g,groupName:`Grupo ${g}`,team,code,number:n})}));return arr}
const stickers=allStickers();
function getStatus(id){return state[id]||'missing'}
function setStatus(id,status){const old=getStatus(id);if(status==='missing')delete state[id];else state[id]=status;if(old==='missing'&&(status==='have'||status==='repeat'))daily[todayKey()]=(daily[todayKey()]||0)+1;localStorage.setItem('albumBingo2026StatusV2',JSON.stringify(state));localStorage.setItem('albumBingo2026Daily',JSON.stringify(daily));render()}
function cycle(id){const s=getStatus(id);if(s==='missing')setStatus(id,'have');else if(s==='have')setStatus(id,'repeat');else setStatus(id,'missing')}
function counts(list=stickers){const have=list.filter(x=>getStatus(x.id)==='have').length,repeat=list.filter(x=>getStatus(x.id)==='repeat').length,owned=have+repeat,missing=list.length-owned;return{have,repeat,owned,missing,total:list.length}}
function groupItems(g){return stickers.filter(x=>x.group===g)}function teamItems(code){return stickers.filter(x=>x.code===code)}
function visibleSticker(x){const q=norm(query.trim()),st=getStatus(x.id);const statusOk=statusFilter==='all'||st===statusFilter||(statusFilter==='have'&&st==='repeat');const queryOk=!q||norm(x.team).includes(q)||norm(x.code).includes(q)||norm(x.groupName).includes(q);return statusOk&&queryOk}
function goView(v,push=true){if(push&&currentView!==v)viewStack.push(v);currentView=v;$$('.app-view').forEach(el=>el.classList.remove('active'));$('#view-'+v).classList.add('active');$$('.bottom-nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render();scrollTo({top:0,behavior:'smooth'})}
function goBack(){if(viewStack.length>1){viewStack.pop();goView(viewStack[viewStack.length-1],false)}else goView('groups',false)}
function renderBoards(){
  const teams=GROUPS[activeGroup];

  $('#bingoGrid').innerHTML=teams.map(([team,code])=>{
    const items=teamItems(code), c=counts(items);

    const nums=items.map(x=>{
      const st=getStatus(x.id);
      const hide=visibleSticker(x)?'':'hidden';

      return `<button class="num-btn ${st} ${hide}" onclick="cycle('${x.id}')" title="${code} ${x.number}">${x.number}</button>`;
    }).join('');

    const any=items.some(visibleSticker);

    return `<article class="team-board ${any?'':'hidden'}">
      <div class="team-head">
        <div>
          <h3>${team}</h3>
          <small>${code} · Grupo ${activeGroup}</small>
        </div>
        <div class="team-stats">
          ✅ ${c.owned}/${c.total}<br>
          🔁 ${c.repeat} · ❌ ${c.missing}
        </div>
      </div>
      <div class="num-grid">${nums}</div>
    </article>`;
  }).join('');

  const c=counts(groupItems(activeGroup));

  $('#activeInfo').innerHTML=`📌 Grupo <b>${activeGroup}</b> · ✅ Tenho/Repetidas: <b>${c.owned}</b> · 🔁 Repetidas: <b>${c.repeat}</b> · ❌ Me falta: <b>${c.missing}</b>`;
}
function renderGroups(){$('#groupSelector').innerHTML=Object.entries(GROUPS).map(([g])=>{const c=counts(groupItems(g)),p=c.total?Math.round(c.owned/c.total*100):0;return`<button class="group-btn ${activeGroup===g?'active':''}" onclick="selectGroup('${g}')"><b>Grupo ${g}</b><br><small>✅ ${c.owned}/${c.total} · ${p}%</small></button>`}).join('')}
function selectGroup(g){activeGroup=g;goView('groups',false);document.querySelector('.tools-card').scrollIntoView({behavior:'smooth',block:'start'})}
function renderBoards(){const teams=GROUPS[activeGroup];$('#bingoGrid').innerHTML=teams.map(([team,code])=>{const items=teamItems(code),c=counts(items);const nums=items.map(x=>{const st=getStatus(x.id),hide=visibleSticker(x)?'':'hidden',return`<button class="num-btn ${st} ${hide}" onclick="cycle('${x.id}')" title="${code} ${x.number}">${x.number}</button>`}).join('');const any=items.some(visibleSticker);return`<article class="team-board ${any?'':'hidden'}"><div class="team-head"><div><h3>${team}</h3><small>${code} · Grupo ${activeGroup}</small></div><div class="team-stats">✅ ${c.owned}/${c.total}<br>🔁 ${c.repeat} · ❌ ${c.missing}</div></div><div class="num-grid">${nums}</div></article>`}).join('');const c=counts(groupItems(activeGroup));$('#activeInfo').innerHTML=`📌 Grupo <b>${activeGroup}</b> · ✅ Tenho/Repetidas: <b>${c.owned}</b> · 🔁 Repetidas: <b>${c.repeat}</b> · ❌ Me falta: <b>${c.missing}</b>`}
function groupedList(status){return Object.entries(GROUPS).map(([g,teams])=>{const blocks=teams.map(([team,code])=>{const arr=teamItems(code).filter(x=>getStatus(x.id)===status);if(!arr.length)return'';return`<div class="list-team"><b>${team} <small>(${code})</small></b><div class="chips">${arr.map(x=>`<span class="code-chip">${x.code} ${x.number}</span>`).join('')}</div></div>`}).join('');return blocks?`<div class="list-group"><h3>Grupo ${g}</h3>${blocks}</div>`:''}).join('')||'<div class="notice">Nada por aqui.</div>'}
function renderLists(){$('#missingPanel').innerHTML=groupedList('missing');$('#repeatPanel').innerHTML=groupedList('repeat')}
function renderStats(){const teams=stickers.reduce((acc,x)=>{acc[x.code]=acc[x.code]||{team:x.team,code:x.code,group:x.group,total:0,owned:0,repeat:0};acc[x.code].total++;if(getStatus(x.id)==='have'||getStatus(x.id)==='repeat')acc[x.code].owned++;if(getStatus(x.id)==='repeat')acc[x.code].repeat++;return acc},{});const arr=Object.values(teams).map(t=>({...t,pct:Math.round(t.owned/t.total*100)}));const most=[...arr].sort((a,b)=>b.pct-a.pct).slice(0,5);const least=[...arr].sort((a,b)=>a.pct-b.pct).slice(0,5);const maxDay=Math.max(1,...Object.values(daily));const days=Object.entries(daily).slice(-14).reverse();$('#statsPanel').innerHTML=`<div class="stats-card"><h3>Mais completas</h3>${most.map(t=>`<div class="rank-row"><span>${t.team} (${t.code})</span><b>${t.owned}/${t.total} · ${t.pct}%</b></div>`).join('')}</div><div class="stats-card"><h3>Menos completas</h3>${least.map(t=>`<div class="rank-row"><span>${t.team} (${t.code})</span><b>${t.owned}/${t.total} · ${t.pct}%</b></div>`).join('')}</div><div class="stats-card"><h3>Coladas por dia</h3><div class="day-bars">${days.length?days.map(([d,n])=>`<div class="day-row"><span>${d}</span><div class="day-bar"><i style="width:${Math.round(n/maxDay*100)}%"></i></div><b>${n}</b></div>`).join(''):'<p class="muted">Ainda nenhuma figurinha marcada como tenho/repetida.</p>'}</div></div>`}
function renderTrades(){}
function shareText(){const repeat=stickers.filter(x=>getStatus(x.id)==='repeat').map(x=>`${x.code} ${x.number} - ${x.team}`).join('\n')||'Nenhuma repetida.';const miss=stickers.filter(x=>getStatus(x.id)==='missing').map(x=>`${x.code} ${x.number} - ${x.team}`).join('\n')||'Nenhuma faltando.';return`🏆 Álbum Copa 2026\n\n🔁 Repetidas:\n${repeat}\n\n❌ Me falta:\n${miss}`}
async function copyList(){try{await navigator.clipboard.writeText(shareText());alert('Lista copiada!')}catch(e){alert('Não consegui copiar.')}}function shareWhats(){window.open('https://wa.me/?text='+encodeURIComponent(shareText()),'_blank')}
function render(){renderDashboard();renderGroups();renderBoards();renderLists();renderStats()}
$('#searchInput').addEventListener('input',e=>{query=e.target.value;renderBoards()});$('#statusFilter').addEventListener('change',e=>{statusFilter=e.target.value;renderBoards()});$('#clearGroupBtn').addEventListener('click',()=>{query='';statusFilter='all';$('#searchInput').value='';$('#statusFilter').value='all';renderBoards()});
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light');$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙'});$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';
$('#copyBtn').addEventListener('click',copyList);$('#shareBtn').addEventListener('click',shareWhats);$('#backBtn').addEventListener('click',goBack);$$('[data-view]').forEach(btn=>btn.addEventListener('click',()=>goView(btn.dataset.view)));
$$('.stat[data-view]').forEach(btn=>btn.addEventListener('click',()=>goView(btn.dataset.view)));
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});render();
