const GROUPS={"A": [["México", "MEX"], ["África do Sul", "RSA"], ["República da Coreia", "KOR"], ["Tchéquia", "CZE"]], "B": [["Canadá", "CAN"], ["Bósnia e Herzegovina", "BIH"], ["Catar", "QAT"], ["Suíça", "SUI"]], "C": [["Brasil", "BRA"], ["Marrocos", "MAR"], ["Haiti", "HAI"], ["Escócia", "SCO"]], "D": [["EUA", "USA"], ["Paraguai", "PAR"], ["Austrália", "AUS"], ["Turquia", "TUR"]], "E": [["Alemanha", "GER"], ["Curaçau", "CUW"], ["Costa do Marfim", "CIV"], ["Equador", "ECU"]], "F": [["Holanda", "NED"], ["Japão", "JPN"], ["Suécia", "SWE"], ["Tunísia", "TUN"]], "G": [["Bélgica", "BEL"], ["Egito", "EGY"], ["Irã", "IRN"], ["Nova Zelândia", "NZL"]], "H": [["Espanha", "ESP"], ["Cabo Verde", "CPV"], ["Arábia Saudita", "KSA"], ["Uruguai", "URU"]], "I": [["França", "FRA"], ["Senegal", "SEN"], ["Iraque", "IRQ"], ["Noruega", "NOR"]], "J": [["Argentina", "ARG"], ["Argélia", "ALG"], ["Áustria", "AUT"], ["Jordânia", "JOR"]], "K": [["Portugal", "POR"], ["RD do Congo", "COD"], ["Uzbequistão", "UZB"], ["Colômbia", "COL"]], "L": [["Inglaterra", "ENG"], ["Croácia", "CRO"], ["Gana", "GHA"], ["Panamá", "PAN"]]};
const TOTAL_PER_TEAM=20;
const EXTRA_SECTIONS=[
 {key:'FWC',name:'Figurinhas FWC',group:'Especiais',code:'FWC',numbers:['00',...Array.from({length:19},(_,i)=>String(i+1))]},
 {key:'CC',name:'Coca-Cola',group:'Especiais',code:'CC',numbers:Array.from({length:8},(_,i)=>String(i+1))}
];
const OLD_STATE=JSON.parse(localStorage.getItem('albumBingo2026StatusV2')||'{}');
const SAVED=JSON.parse(localStorage.getItem('albumBingo2026StatusV5')||'null');
const state=SAVED||migrateState(OLD_STATE);
const daily=JSON.parse(localStorage.getItem('albumBingo2026Daily')||'{}');
let activeGroup='A',query='',statusFilter='all',currentView='groups',viewStack=['groups'],deferredInstallPrompt=null,holdTimer=null,holdFired=false;
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
if(localStorage.getItem('albumTheme')==='dark')document.body.classList.add('dark');
function migrateState(old){const out={};Object.entries(old||{}).forEach(([id,val])=>{if(typeof val==='number')out[id]=val;else if(val==='have')out[id]=1;else if(val==='repeat')out[id]=2});return out}
function persist(){localStorage.setItem('albumBingo2026StatusV5',JSON.stringify(state));localStorage.setItem('albumBingo2026Daily',JSON.stringify(daily))}
function todayKey(){return new Date().toLocaleDateString('pt-BR')}
function allStickers(){const arr=[];Object.entries(GROUPS).forEach(([g,teams])=>teams.forEach(([team,code])=>{for(let n=1;n<=TOTAL_PER_TEAM;n++)arr.push({id:`${code}-${n}`,group:g,groupName:`Grupo ${g}`,team,code,number:String(n),sort:n,type:'team'})}));EXTRA_SECTIONS.forEach(sec=>sec.numbers.forEach((n,i)=>arr.push({id:`${sec.code}-${n}`,group:'SPECIAL',groupName:'Especiais',team:sec.name,code:sec.code,number:n,sort:i,type:'special'})));return arr}
const stickers=allStickers();
function qty(id){return Number(state[id]||0)}
function getStatus(id){const q=qty(id);return q===0?'missing':q===1?'have':'repeat'}
function setQty(id,q){const old=qty(id);if(q<=0)delete state[id];else state[id]=q;if(old===0&&q>0)daily[todayKey()]=(daily[todayKey()]||0)+1;persist();render()}
function tapSticker(id){setQty(id,qty(id)+1);clearSearchAfterMark()}
function resetSticker(id){setQty(id,0);clearSearchAfterMark()}
function clearSearchAfterMark(){if(query){query='';$('#searchInput').value='';statusFilter='all';$('#statusFilter').value='all';setTimeout(()=>$('#searchInput').focus(),50)}}
function counts(list=stickers){const owned=list.filter(x=>qty(x.id)>0).length;const repeatQty=list.reduce((s,x)=>s+Math.max(0,qty(x.id)-1),0);const missing=list.length-owned;return{owned,repeatQty,missing,total:list.length}}
function groupItems(g){return stickers.filter(x=>x.group===g)}
function teamItems(code){return stickers.filter(x=>x.code===code)}
function parseExactStickerQuery(){
  const raw = String(query || '').trim().toUpperCase();
  if(!raw) return null;

  // Aceita: BRA 1, BRA-1, BRA01, BRA 11, FWC 00, CC 2
  const compact = raw.replace(/[^A-Z0-9]/g,'');
  const m = compact.match(/^([A-Z]{2,3})(0?[0-9]{1,2})$/);
  if(!m) return null;

  const code = m[1];
  let number = m[2];

  if(code === 'FWC' && number === '00'){
    return { code, number:'00' };
  }

  number = String(parseInt(number,10));
  if(number === 'NaN') return null;

  return { code, number };
}

function visibleSticker(x){
  const st = getStatus(x.id);
  const statusOk =
    statusFilter === 'all' ||
    st === statusFilter ||
    (statusFilter === 'have' && st === 'repeat');

  if(!statusOk) return false;

  const exact = parseExactStickerQuery();

  // Quando digitar BRA 1, mostra somente BRA 1.
  // Quando digitar BRA 11, mostra somente BRA 11.
  if(exact){
    return String(x.code).toUpperCase() === exact.code &&
           String(x.number) === exact.number;
  }

  const q = norm(query.trim());
  if(!q) return true;

  return norm(x.team).includes(q) ||
         norm(x.code).includes(q) ||
         norm(x.groupName).includes(q);
}
function goView(v,push=true){if(push&&currentView!==v)viewStack.push(v);currentView=v;$$('.app-view').forEach(el=>el.classList.remove('active'));$('#view-'+v).classList.add('active');$$('.bottom-nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render();scrollTo({top:0,behavior:'smooth'})}
function goBack(){if(viewStack.length>1){viewStack.pop();goView(viewStack[viewStack.length-1],false)}else goView('groups',false)}
function renderDashboard(){const c=counts(),p=c.total?Math.round(c.owned/c.total*100):0;$('#percent').textContent=p+'%';$('#barFill').style.width=p+'%';$('#progressText').textContent=`${c.owned} de ${c.total} marcadas como tenho/repetidas`;$('#haveCount').textContent=c.owned;$('#missingCount').textContent=c.missing;$('#repeatCount').textContent=c.repeatQty;$('#totalCount').textContent=c.total}
function groupSummaryHTML(g,teams){if(g==='SPECIAL')return `<div class="group-codes"><span class="sig-code">FWC</span><span class="sig-code">CC</span></div>`;return `<div class="group-codes">${teams.map(([team,code])=>`<span class="sig-code">${code}</span>`).join('')}</div>`}
function renderGroups(){const normal=Object.entries(GROUPS).map(([g,teams])=>{const c=counts(groupItems(g)),p=c.total?Math.round(c.owned/c.total*100):0;return`<button class="group-btn ${activeGroup===g?'active':''} ${p===100?'gold':''}" onclick="selectGroup('${g}')">${groupSummaryHTML(g,teams)}<div class="group-info"><b>Grupo ${g}</b><small>✅ ${c.owned}/${c.total}<br>${p}%</small></div></button>`}).join('');const sp=counts(groupItems('SPECIAL')),pp=sp.total?Math.round(sp.owned/sp.total*100):0;$('#groupSelector').innerHTML=normal+`<button class="group-btn ${activeGroup==='SPECIAL'?'active':''} ${pp===100?'gold':''}" onclick="selectGroup('SPECIAL')">${groupSummaryHTML('SPECIAL',[])}<div class="group-info"><b>⭐ Especiais</b><small>✅ ${sp.owned}/${sp.total}<br>${pp}%</small></div></button>`}
function selectGroup(g){activeGroup=g;goView('groups',false);document.querySelector('.tools-card').scrollIntoView({behavior:'smooth',block:'start'})}

function queryIsActive(){
  return query.trim().length > 0;
}

function teamMatchesSearch(code, team){
  if(!queryIsActive()) return true;

  const q = norm(query.trim());
  const exact = parseExactStickerQuery();

  if(exact){
    return String(code).toUpperCase() === exact.code &&
           teamItems(code).some(x => String(x.number) === exact.number);
  }

  return norm(code).includes(q) ||
         norm(team).includes(q) ||
         teamItems(code).some(x => visibleSticker(x));
}

function allBoards(){
  const arr = [];
  Object.entries(GROUPS).forEach(([g,teams])=>{
    teams.forEach(([team,code])=>arr.push([team,code,g]));
  });
  EXTRA_SECTIONS.forEach(s=>arr.push([s.name,s.code,'SPECIAL']));
  return arr;
}

function boardsForActive(){
  if(queryIsActive()){
    return allBoards().filter(([team,code])=>teamMatchesSearch(code,team));
  }

  if(activeGroup === 'SPECIAL'){
    return EXTRA_SECTIONS.map(s=>[s.name,s.code,'SPECIAL']);
  }

  return GROUPS[activeGroup].map(([team,code])=>[team,code,activeGroup]);
}
function startHold(id){holdFired=false;holdTimer=setTimeout(()=>{holdFired=true;resetSticker(id)},650)}
function endHold(){clearTimeout(holdTimer)}
function renderBoards(){
  const teams = boardsForActive();

  $('#bingoGrid').innerHTML = teams.map(([team,code,boardGroup])=>{
    const items = teamItems(code);
    const c = counts(items);
    const pct = c.total ? Math.round(c.owned / c.total * 100) : 0;

    const nums = items
      .sort((a,b)=>a.sort-b.sort)
      .map(x=>{
        const st = getStatus(x.id);
        const hide = visibleSticker(x) ? '' : 'hidden';
        const q = qty(x.id);

        return `<div class="num-wrap ${hide}">
          <button class="num-btn ${st}"
            onpointerdown="startHold('${x.id}')"
            onpointerup="endHold()"
            onpointerleave="endHold()"
            onclick="if(!holdFired)tapSticker('${x.id}')"
            title="${x.code} ${x.number}">
            ${x.number}
          </button>
          <span class="repeat-badge">${q>1?'x'+q:''}</span>
        </div>`;
      }).join('');

    const any = items.some(visibleSticker);
    const labelGroup = boardGroup === 'SPECIAL' ? 'Especiais' : 'Grupo ' + boardGroup;

    return `<article class="team-board ${any?'':'hidden'} ${pct===100?'complete':''}">
      <div class="team-head">
        <div>
          <h3>${team}</h3>
          <small>${code} · ${labelGroup}</small>
        </div>
        <div class="team-stats">✅ ${c.owned}/${c.total}<br>🔁 ${c.repeatQty} · ❌ ${c.missing}</div>
      </div>
      <div class="num-grid">${nums}</div>
    </article>`;
  }).join('') || '<div class="notice">Nenhum resultado encontrado.</div>';

  const c = queryIsActive()
    ? counts(stickers.filter(visibleSticker))
    : counts(groupItems(activeGroup));

  const title = queryIsActive()
    ? `Busca: ${query}`
    : (activeGroup === 'SPECIAL' ? 'Especiais' : 'Grupo ' + activeGroup);

  $('#activeInfo').innerHTML = `📌 <b>${title}</b> · ✅ Tenho: <b>${c.owned}</b> · 🔁 Repetidas: <b>${c.repeatQty}</b> · ❌ Me falta: <b>${c.missing}</b>`;
}
function groupedList(status){const order=[...Object.keys(GROUPS),'SPECIAL'];return order.map(g=>{const teams=(g==='SPECIAL'?EXTRA_SECTIONS.map(s=>[s.name,s.code]):GROUPS[g]);const blocks=teams.map(([team,code])=>{const arr=teamItems(code).filter(x=>getStatus(x.id)===status);if(!arr.length)return'';return`<div class="list-team"><b>${team} <small>(${code})</small></b><div class="chips">${arr.map(x=>`<span class="code-chip">${x.code} ${x.number}${qty(x.id)>1?' x'+qty(x.id):''}</span>`).join('')}</div></div>`}).join('');return blocks?`<div class="list-group"><h3>${g==='SPECIAL'?'⭐ Especiais':'Grupo '+g}</h3>${blocks}</div>`:''}).join('')||'<div class="notice">Nada por aqui.</div>'}
function renderLists(){$('#missingPanel').innerHTML=groupedList('missing');$('#repeatPanel').innerHTML=groupedList('repeat')}
function renderStats(){const teams=stickers.reduce((acc,x)=>{acc[x.code]=acc[x.code]||{team:x.team,code:x.code,group:x.group,total:0,owned:0,repeatQty:0};acc[x.code].total++;if(qty(x.id)>0)acc[x.code].owned++;acc[x.code].repeatQty+=Math.max(0,qty(x.id)-1);return acc},{});const arr=Object.values(teams).map(t=>({...t,pct:Math.round(t.owned/t.total*100)}));const most=[...arr].sort((a,b)=>b.pct-a.pct||b.owned-a.owned).slice(0,10);const least=[...arr].sort((a,b)=>a.pct-b.pct||a.owned-b.owned).slice(0,10);const maxDay=Math.max(1,...Object.values(daily));const days=Object.entries(daily).slice(-14).reverse();$('#statsPanel').innerHTML=`<div class="stats-card"><h3>10 mais completas</h3>${most.map(t=>`<div class="rank-row"><span>${t.team} (${t.code})</span><b>${t.owned}/${t.total} · ${t.pct}%</b></div>`).join('')}</div><div class="stats-card"><h3>10 menos completas</h3>${least.map(t=>`<div class="rank-row"><span>${t.team} (${t.code})</span><b>${t.owned}/${t.total} · ${t.pct}%</b></div>`).join('')}</div><div class="stats-card"><h3>Coladas por dia</h3><div class="day-bars">${days.length?days.map(([d,n])=>`<div class="day-row"><span>${d}</span><div class="day-bar"><i style="width:${Math.round(n/maxDay*100)}%"></i></div><b>${n}</b></div>`).join(''):'<p class="muted">Ainda nenhuma figurinha marcada como tenho/repetida.</p>'}</div></div>`}
function listTextByStatus(status){return stickers.filter(x=>getStatus(x.id)===status).map(x=>`${x.code} ${x.number}${qty(x.id)>1?' x'+qty(x.id):''} - ${x.team}`).join('\\n')}
function missingText(){return listTextByStatus('missing')||'Nenhuma faltando.'}
function repeatText(){return listTextByStatus('repeat')||'Nenhuma repetida.'}
function missingShareText(){return`🏆 Álbum Copa 2026\\n\\n❌ ME FALTAM\\n\\n${missingText()}`}
function repeatShareText(){return`🏆 Álbum Copa 2026\\n\\n🔁 REPETIDAS\\n\\n${repeatText()}`}
async function copyText(t,msg){try{await navigator.clipboard.writeText(t);alert(msg)}catch(e){alert('Não consegui copiar.')}}
function shareWhatsText(t){window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank')}
function exportBackup(){const data={version:5,createdAt:new Date().toISOString(),state,daily};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='album-copa2026-backup.json';a.click();URL.revokeObjectURL(a.href)}
async function importBackup(e){const file=e.target.files&&e.target.files[0];if(!file)return;try{const txt=await file.text();const data=JSON.parse(txt);Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,data.state||{});Object.keys(daily).forEach(k=>delete daily[k]);Object.assign(daily,data.daily||{});persist();alert('Backup importado!');render()}catch(err){alert('Backup inválido.')}finally{e.target.value=''}}
function setupInstall(){window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e});$('#installBtn').addEventListener('click',async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null}else alert('No Android: Chrome → 3 pontinhos → Instalar aplicativo ou Adicionar à tela inicial.')})}
function render(){renderDashboard();renderGroups();renderBoards();renderLists();renderStats();persist()}
$('#searchInput').addEventListener('input',e=>{query=e.target.value;renderBoards()});
$('#searchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.target.value='';query='';renderBoards();e.target.focus()}});
$('#statusFilter').addEventListener('change',e=>{statusFilter=e.target.value;renderBoards()});
$('#clearGroupBtn').addEventListener('click',()=>{query='';statusFilter='all';$('#searchInput').value='';$('#statusFilter').value='all';renderBoards();$('#searchInput').focus()});
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light');$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙'});
$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';
$('#copyMissingBtn').addEventListener('click',()=>copyText(missingShareText(),'Lista de faltantes copiada!'));
$('#shareMissingBtn').addEventListener('click',()=>shareWhatsText(missingShareText()));
$('#copyRepeatsBtn').addEventListener('click',()=>copyText(repeatShareText(),'Lista de repetidas copiada!'));
$('#shareRepeatsBtn').addEventListener('click',()=>shareWhatsText(repeatShareText()));
const exportBackupBtn=$('#exportBackupBtn'); if(exportBackupBtn) exportBackupBtn.addEventListener('click',exportBackup);
const importBackupInput=$('#importBackupInput'); if(importBackupInput) importBackupInput.addEventListener('change',importBackup);
$('#backBtn').addEventListener('click',goBack);
$$('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{goView(btn.dataset.view); $$('.bottom-nav button').forEach(b=>b.classList.remove('active')); btn.classList.add('active')}));
$$('.stat[data-view]').forEach(btn=>btn.addEventListener('click',()=>goView(btn.dataset.view)));
setupInstall();
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});
persist();render();


// Busca no topo
(function(){
const oldRenderBoards = renderBoards;
renderBoards = function(){
  oldRenderBoards();
  const sr = document.getElementById('searchResults');
  const gs = document.getElementById('groupSelector');
  if(!sr || !gs) return;

  if(query && query.trim()){
    const html = document.getElementById('bingoGrid').innerHTML;
    sr.style.display='block';
    sr.innerHTML='<section class="section-card"><div class="section-head"><h2>🔎 Resultado da Busca</h2></div>'+html+'</section>';
    document.getElementById('bingoGrid').innerHTML='';
    gs.style.display='none';
  }else{
    sr.style.display='none';
    sr.innerHTML='';
    gs.style.display='grid';
  }
}
})();




/* RESULTADO_DA_BUSCA_NO_TOPO */
(function(){
  const originalRenderBoards = renderBoards;
  renderBoards = function(){
    originalRenderBoards();

    const sr = document.getElementById('searchResults');
    const gs = document.getElementById('groupSelector');
    const bg = document.getElementById('bingoGrid');

    if(!sr || !gs || !bg) return;

    if(query && query.trim()){
      const html = bg.innerHTML || '<div class="notice">Nenhum resultado encontrado.</div>';
      sr.style.display='block';
      sr.innerHTML='<section class="section-card"><div class="section-head"><h2>🔎 Resultado da Busca</h2><p>Após marcar, a busca limpa automaticamente.</p></div>'+html+'</section>';
      bg.innerHTML='';
      gs.style.display='none';
    }else{
      sr.style.display='none';
      sr.innerHTML='';
      gs.style.display='grid';
    }
  };
})();
