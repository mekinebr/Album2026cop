const GROUPS={"A": [["México", "MEX"], ["África do Sul", "RSA"], ["República da Coreia", "KOR"], ["Tchéquia", "CZE"]], "B": [["Canadá", "CAN"], ["Bósnia e Herzegovina", "BIH"], ["Catar", "QAT"], ["Suíça", "SUI"]], "C": [["Brasil", "BRA"], ["Marrocos", "MAR"], ["Haiti", "HAI"], ["Escócia", "SCO"]], "D": [["EUA", "USA"], ["Paraguai", "PAR"], ["Austrália", "AUS"], ["Turquia", "TUR"]], "E": [["Alemanha", "GER"], ["Curaçau", "CUW"], ["Costa do Marfim", "CIV"], ["Equador", "ECU"]], "F": [["Holanda", "NED"], ["Japão", "JPN"], ["Suécia", "SWE"], ["Tunísia", "TUN"]], "G": [["Bélgica", "BEL"], ["Egito", "EGY"], ["Irã", "IRN"], ["Nova Zelândia", "NZL"]], "H": [["Espanha", "ESP"], ["Cabo Verde", "CPV"], ["Arábia Saudita", "KSA"], ["Uruguai", "URU"]], "I": [["França", "FRA"], ["Senegal", "SEN"], ["Iraque", "IRQ"], ["Noruega", "NOR"]], "J": [["Argentina", "ARG"], ["Argélia", "ALG"], ["Áustria", "AUT"], ["Jordânia", "JOR"]], "K": [["Portugal", "POR"], ["RD do Congo", "COD"], ["Uzbequistão", "UZB"], ["Colômbia", "COL"]], "L": [["Inglaterra", "ENG"], ["Croácia", "CRO"], ["Gana", "GHA"], ["Panamá", "PAN"]]};
const TOTAL_PER_TEAM=20;
const EXTRA_SECTIONS=[
  {key:'FWC',name:'Figurinhas FWC',group:'Especiais',code:'FWC',numbers:['00',...Array.from({length:19},(_,i)=>String(i+1))]},
  {key:'CC',name:'Coca-Cola',group:'Especiais',code:'CC',numbers:Array.from({length:14},(_,i)=>String(i+1))}
];

const OLD_STATE=JSON.parse(localStorage.getItem('albumBingo2026StatusV2')||'{}');
const SAVED=JSON.parse(localStorage.getItem('albumBingo2026StatusV5')||'null');
const state=SAVED||migrateState(OLD_STATE);
const daily=JSON.parse(localStorage.getItem('albumBingo2026Daily')||'{}');

let activeGroup='A';
let query='';
let statusFilter='all';
let currentView='groups';
let viewStack=['groups'];
let deferredInstallPrompt=null;
let holdTimer=null;
let holdFired=false;
const recentUpdates=JSON.parse(localStorage.getItem('albumRecentUpdates')||'[]');

// FIREBASE CLOUD SYNC
let cloudUser=null;
let cloudLoading=false;
let cloudSaveTimer=null;
let cloudLastLoadedUid=null;


const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

if(localStorage.getItem('albumTheme')==='dark')document.body.classList.add('dark');

function migrateState(old){
  const out={};
  Object.entries(old||{}).forEach(([id,val])=>{
    if(typeof val==='number')out[id]=val;
    else if(val==='have')out[id]=1;
    else if(val==='repeat')out[id]=2;
  });
  return out;
}

function persist(){
  localStorage.setItem('albumBingo2026StatusV5',JSON.stringify(state));
  localStorage.setItem('albumBingo2026Daily',JSON.stringify(daily));
  localStorage.setItem('albumRecentUpdates',JSON.stringify(recentUpdates.slice(0,10)));
  scheduleCloudSave();
}


async function getCloudApi(){
  const firebase = await import('./firebase.js');
  const firestore = await import('https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js');
  return {
    db: firebase.db,
    doc: firestore.doc,
    getDoc: firestore.getDoc,
    setDoc: firestore.setDoc,
    serverTimestamp: firestore.serverTimestamp
  };
}

function currentAlbumPayload(){
  return {
    app:'album-copa2026',
    version:7,
    state:JSON.parse(JSON.stringify(state || {})),
    daily:JSON.parse(JSON.stringify(daily || {})),
    theme:localStorage.getItem('albumTheme') || 'light',
    updatedAt:null
  };
}

function scheduleCloudSave(){
  if(!cloudUser || cloudLoading) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer=setTimeout(saveCloudAlbum,900);
}

async function saveCloudAlbum(){
  if(!cloudUser || cloudLoading) return;

  try{
    const {db,doc,setDoc,serverTimestamp}=await getCloudApi();
    const payload=currentAlbumPayload();
    payload.updatedAt=serverTimestamp();

    await setDoc(doc(db,'albums',cloudUser.uid),payload,{merge:true});

    const status=document.getElementById('authStatus');
    if(status) status.textContent='Conta conectada. Álbum salvo na nuvem.';
  }catch(e){
    console.error('Erro ao salvar álbum na nuvem:',e);
    const status=document.getElementById('authStatus');
    if(status) status.textContent='Conta conectada, mas não consegui salvar na nuvem.';
  }
}

async function loadCloudAlbum(user){
  if(!user) return;
  if(cloudLastLoadedUid===user.uid) return;

  cloudUser=user;
  cloudLastLoadedUid=user.uid;
  cloudLoading=true;

  try{
    const {db,doc,getDoc}=await getCloudApi();
    const ref=doc(db,'albums',user.uid);
    const snap=await getDoc(ref);

    if(snap.exists()){
      const data=snap.data() || {};

      if(data.state && typeof data.state==='object'){
        Object.keys(state).forEach(k=>delete state[k]);
        Object.assign(state,data.state);
        localStorage.setItem('albumBingo2026StatusV5',JSON.stringify(state));
      }

      if(data.daily && typeof data.daily==='object'){
        Object.keys(daily).forEach(k=>delete daily[k]);
        Object.assign(daily,data.daily);
        localStorage.setItem('albumBingo2026Daily',JSON.stringify(daily));
      }

      if(data.theme){
        localStorage.setItem('albumTheme',data.theme);
        document.body.classList.toggle('dark',data.theme==='dark');
        const themeBtn=document.getElementById('themeBtn');
        if(themeBtn) themeBtn.textContent=data.theme==='dark'?'☀️':'🌙';
      }

      render();

      const status=document.getElementById('authStatus');
      if(status) status.textContent='Álbum carregado da nuvem.';
    }else{
      await saveCloudAlbum();
    }
  }catch(e){
    console.error('Erro ao carregar álbum da nuvem:',e);
    const status=document.getElementById('authStatus');
    if(status) status.textContent='Conta conectada, mas não consegui carregar a nuvem.';
  }finally{
    cloudLoading=false;
  }
}

window.addEventListener('album-auth-changed',(event)=>{
  const accountName=document.getElementById('accountNameLabel');
  const pill=document.getElementById('accountOnlinePill');
  const u=event.detail && event.detail.user ? event.detail.user : null;
  if(accountName) accountName.textContent=u?(u.displayName||u.email||(u.isAnonymous?'Anônimo':'Colecionador')):'Colecionador';
  if(pill){pill.textContent=u?'Online':'Offline';pill.style.background=u?'rgba(34,197,94,.28)':'rgba(239,68,68,.22)';}

  const user=event.detail && event.detail.user ? event.detail.user : null;

  if(user){
    loadCloudAlbum(user);
  }else{
    cloudUser=null;
    cloudLastLoadedUid=null;
  }
});


function todayKey(){return new Date().toLocaleDateString('pt-BR')}

function allStickers(){
  const arr=[];
  Object.entries(GROUPS).forEach(([g,teams])=>{
    teams.forEach(([team,code])=>{
      for(let n=1;n<=TOTAL_PER_TEAM;n++){
        arr.push({id:`${code}-${n}`,group:g,groupName:`Grupo ${g}`,team,code,number:String(n),sort:n,type:'team'});
      }
    });
  });
  EXTRA_SECTIONS.forEach(sec=>{
    sec.numbers.forEach((n,i)=>{
      arr.push({id:`${sec.code}-${n}`,group:'SPECIAL',groupName:'Especiais',team:sec.name,code:sec.code,number:n,sort:i,type:'special'});
    });
  });
  return arr;
}

const stickers=allStickers();

function qty(id){return Number(state[id]||0)}
function getStatus(id){const q=qty(id);return q===0?'missing':q===1?'have':'repeat'}

function setQty(id,q){
  const old=qty(id);
  if(q<=0)delete state[id];else state[id]=q;
  if(old===0&&q>0)daily[todayKey()]=(daily[todayKey()]||0)+1;
  persist();
  render();
  if(window.albumFirebaseUser) loadCloudAlbum(window.albumFirebaseUser);
}

function tapSticker(id){
  setQty(id,qty(id)+1);
  clearSearchAfterMark();
}

function resetSticker(id){
  setQty(id,0);
  clearSearchAfterMark();
}

function clearSearchAfterMark(){
  if(query){
    query='';
    const input=$('#searchInput');
    if(input)input.value='';
    statusFilter='all';
    const filter=$('#statusFilter');
    if(filter)filter.value='all';
    setTimeout(()=>{const i=$('#searchInput'); if(i)i.focus();},50);
  }
}

function counts(list=stickers){
  const owned=list.filter(x=>qty(x.id)>0).length;
  const repeatQty=list.reduce((s,x)=>s+Math.max(0,qty(x.id)-1),0);
  const missing=list.length-owned;
  return {owned,repeatQty,missing,total:list.length};
}

function groupItems(g){return stickers.filter(x=>x.group===g)}
function teamItems(code){return stickers.filter(x=>x.code===code)}

function parseSearch(){
  const raw=String(query||'').trim();
  if(!raw)return {type:'empty'};

  const compact=raw.toUpperCase().replace(/[^A-Z0-9]/g,'');
  const exact=compact.match(/^([A-Z]{2,3})(0?[0-9]{1,2})$/);

  if(exact){
    const code=exact[1];
    let number=exact[2];

    if(code==='FWC' && number==='00')return {type:'exact',code,number:'00'};

    number=String(parseInt(number,10));
    return {type:'exact',code,number};
  }

  return {type:'text',text:norm(raw)};
}

function visibleSticker(x){
  const st=getStatus(x.id);
  const statusOk=statusFilter==='all'||st===statusFilter||(statusFilter==='have'&&st==='repeat');
  if(!statusOk)return false;

  const s=parseSearch();
  if(s.type==='empty')return true;

  if(s.type==='exact'){
    return String(x.code).toUpperCase()===s.code && String(x.number)===s.number;
  }

  return norm(x.team).includes(s.text)||norm(x.code).includes(s.text)||norm(x.groupName).includes(s.text);
}

function queryIsActive(){return parseSearch().type!=='empty'}

function allBoards(){
  const arr=[];
  Object.entries(GROUPS).forEach(([g,teams])=>{
    teams.forEach(([team,code])=>arr.push([team,code,g]));
  });
  EXTRA_SECTIONS.forEach(s=>arr.push([s.name,s.code,'SPECIAL']));
  return arr;
}

function teamMatchesSearch(code,team){
  const s=parseSearch();
  if(s.type==='empty')return true;

  if(s.type==='exact'){
    return String(code).toUpperCase()===s.code && teamItems(code).some(x=>String(x.number)===s.number);
  }

  return norm(code).includes(s.text)||norm(team).includes(s.text)||teamItems(code).some(visibleSticker);
}

function boardsForActive(){
  if(queryIsActive())return allBoards().filter(([team,code])=>teamMatchesSearch(code,team));
  if(activeGroup==='SPECIAL')return EXTRA_SECTIONS.map(s=>[s.name,s.code,'SPECIAL']);
  return GROUPS[activeGroup].map(([team,code])=>[team,code,activeGroup]);
}

function goView(v,push=true){
  if(push&&currentView!==v)viewStack.push(v);
  currentView=v;
  $$('.app-view').forEach(el=>el.classList.remove('active'));
  const view=$('#view-'+v);
  if(view)view.classList.add('active');
  $$('.bottom-nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  render();
  scrollTo({top:0,behavior:'smooth'});
}

function goBack(){
  if(viewStack.length>1){viewStack.pop();goView(viewStack[viewStack.length-1],false)}
  else goView('groups',false);
}

function renderDashboard(){
  const c=counts();
  const p=c.total?Math.round(c.owned/c.total*100):0;
  if($('#percent'))$('#percent').textContent=p+'%';
  if($('#barFill'))$('#barFill').style.width=p+'%';
  if($('#progressText'))$('#progressText').textContent=`${c.owned} de ${c.total} marcadas como tenho/repetidas`;
  if($('#haveCount'))$('#haveCount').textContent=c.owned;
  if($('#missingCount'))$('#missingCount').textContent=c.missing;
  if($('#repeatCount'))$('#repeatCount').textContent=c.repeatQty;
  if($('#totalCount'))$('#totalCount').textContent=c.total;
}

function groupSummaryHTML(g,teams){
  if(g==='SPECIAL')return `<div class="group-codes"><span class="sig-code">FWC</span><span class="sig-code">CC</span></div>`;
  return `<div class="group-codes">${teams.map(([team,code])=>`<span class="sig-code">${code}</span>`).join('')}</div>`;
}

function renderGroups(){
  const selector=$('#groupSelector');
  if(!selector)return;

  const normal=Object.entries(GROUPS).map(([g,teams])=>{
    const c=counts(groupItems(g));
    const p=c.total?Math.round(c.owned/c.total*100):0;
    return `<button class="group-btn ${activeGroup===g?'active':''} ${p===100?'gold':''}" onclick="selectGroup('${g}')">
      ${groupSummaryHTML(g,teams)}
      <div class="group-info"><b>Grupo ${g}</b><small>✅ ${c.owned}/${c.total}<br>${p}%</small></div>
    </button>`;
  }).join('');

  const sp=counts(groupItems('SPECIAL'));
  const pp=sp.total?Math.round(sp.owned/sp.total*100):0;

  selector.innerHTML=normal+`<button class="group-btn ${activeGroup==='SPECIAL'?'active':''} ${pp===100?'gold':''}" onclick="selectGroup('SPECIAL')">
    ${groupSummaryHTML('SPECIAL',[])}
    <div class="group-info"><b>⭐ Especiais</b><small>✅ ${sp.owned}/${sp.total}<br>${pp}%</small></div>
  </button>`;
}

function selectGroup(g){
  activeGroup=g;
  goView('groups',false);
  const tools=document.querySelector('.tools-card');
  if(tools)tools.scrollIntoView({behavior:'smooth',block:'start'});
}

function startHold(id){
  holdFired=false;
  holdTimer=setTimeout(()=>{holdFired=true;resetSticker(id)},650);
}

function endHold(){clearTimeout(holdTimer)}

function renderBoards(){
  const teams=boardsForActive();

  const html=teams.map(([team,code,boardGroup])=>{
    const items=teamItems(code);
    const c=counts(items);
    const pct=c.total?Math.round(c.owned/c.total*100):0;

    const nums=items.sort((a,b)=>a.sort-b.sort).map(x=>{
      if(!visibleSticker(x))return '';
      const st=getStatus(x.id);
      const q=qty(x.id);
      return `<div class="num-wrap">
        <button class="num-btn ${st}"
          onpointerdown="startHold('${x.id}')"
          onpointerup="endHold()"
          onpointerleave="endHold()"
          onclick="if(!holdFired)tapSticker('${x.id}')"
          title="${x.code} ${x.number}">
          ${x.number}
        </button>
        <span class="repeat-badge">${q>1?'x'+(q-1):''}</span>
      </div>`;
    }).join('');

    if(!nums.trim())return '';

    const labelGroup=boardGroup==='SPECIAL'?'Especiais':'Grupo '+boardGroup;

    return `<article class="team-board ${pct===100?'complete':''}">
      <div class="team-head">
        <div><h3>${team}</h3><small>${code} · ${labelGroup}</small></div>
        <div class="team-stats">✅ ${c.owned}/${c.total}<br>🔁 ${c.repeatQty} · ❌ ${c.missing}</div>
      </div>
      <div class="num-grid">${nums}</div>
    </article>`;
  }).join('')||'<div class="notice">Nenhum resultado encontrado.</div>';

  const sr=$('#searchResults');
  const gs=$('#groupSelector');
  const bg=$('#bingoGrid');

  if(queryIsActive()){
    if(sr){
      sr.style.display='block';
      sr.innerHTML=`<section class="section-card"><div class="section-head"><h2>🔎 Resultado da Busca</h2><p>Após marcar, a busca limpa automaticamente.</p></div>${html}</section>`;
    }
    if(gs)gs.style.display='none';
    if(bg)bg.innerHTML='';
  }else{
    if(sr){sr.style.display='none';sr.innerHTML='';}
    if(gs)gs.style.display='grid';
    if(bg)bg.innerHTML=html;
  }

  const c=queryIsActive()?counts(stickers.filter(visibleSticker)):counts(groupItems(activeGroup));
  const title=queryIsActive()?`Busca: ${query}`:(activeGroup==='SPECIAL'?'Especiais':'Grupo '+activeGroup);
  if($('#activeInfo'))$('#activeInfo').innerHTML=`📌 <b>${title}</b> · ✅ Tenho: <b>${c.owned}</b> · 🔁 Repetidas: <b>${c.repeatQty}</b> · ❌ Me falta: <b>${c.missing}</b>`;
}

function groupedList(status){
  const order=[...Object.keys(GROUPS),'SPECIAL'];
  return order.map(g=>{
    const teams=g==='SPECIAL'?EXTRA_SECTIONS.map(s=>[s.name,s.code]):GROUPS[g];
    const blocks=teams.map(([team,code])=>{
      const arr=teamItems(code).filter(x=>getStatus(x.id)===status);
      if(!arr.length)return '';
      return `<div class="list-team"><b>${team} <small>(${code})</small></b><div class="chips">${arr.map(x=>`<span class="code-chip">${x.code} ${x.number}${qty(x.id)>1?' x'+(qty(x.id)-1):''}</span>`).join('')}</div></div>`;
    }).join('');
    return blocks?`<div class="list-group"><h3>${g==='SPECIAL'?'⭐ Especiais':'Grupo '+g}</h3>${blocks}</div>`:'';
  }).join('')||'<div class="notice">Nada por aqui.</div>';
}

function renderLists(){
  if($('#missingPanel'))$('#missingPanel').innerHTML=groupedList('missing');
  if($('#repeatPanel'))$('#repeatPanel').innerHTML=groupedList('repeat');
}

function renderStats(){
  const panel=$('#statsPanel');
  if(!panel)return;

  const teams=stickers.reduce((acc,x)=>{
    acc[x.code]=acc[x.code]||{team:x.team,code:x.code,group:x.group,total:0,owned:0,repeatQty:0};
    acc[x.code].total++;
    if(qty(x.id)>0)acc[x.code].owned++;
    acc[x.code].repeatQty+=Math.max(0,qty(x.id)-1);
    return acc;
  },{});

  const arr=Object.values(teams).map(t=>({...t,pct:Math.round(t.owned/t.total*100)}));
  const most=[...arr].sort((a,b)=>b.pct-a.pct||b.owned-a.owned).slice(0,10);
  const least=[...arr].sort((a,b)=>a.pct-b.pct||a.owned-b.owned).slice(0,10);
  const maxDay=Math.max(1,...Object.values(daily));
  const days=Object.entries(daily).slice(-14).reverse();

  panel.innerHTML=`<div class="stats-card"><h3>10 mais completas</h3>${most.map(t=>`<div class="rank-row"><span>${t.team} (${t.code})</span><b>${t.owned}/${t.total} · ${t.pct}%</b></div>`).join('')}</div>
  <div class="stats-card"><h3>10 menos completas</h3>${least.map(t=>`<div class="rank-row"><span>${t.team} (${t.code})</span><b>${t.owned}/${t.total} · ${t.pct}%</b></div>`).join('')}</div>
  <div class="stats-card"><h3>Coladas por dia</h3><div class="day-bars">${days.length?days.map(([d,n])=>`<div class="day-row"><span>${d}</span><div class="day-bar"><i style="width:${Math.round(n/maxDay*100)}%"></i></div><b>${n}</b></div>`).join(''):'<p class="muted">Ainda nenhuma figurinha marcada como tenho/repetida.</p>'}</div></div>`;
}

function listTextByStatus(status){
  return stickers.filter(x=>getStatus(x.id)===status).map(x=>`${x.code} ${x.number}${qty(x.id)>1?' x'+(qty(x.id)-1):''} - ${x.team}`).join('\n');
}
function missingText(){return listTextByStatus('missing')||'Nenhuma faltando.'}
function repeatText(){return listTextByStatus('repeat')||'Nenhuma repetida.'}
function missingShareText(){return `🏆 Álbum Copa 2026\n\n❌ ME FALTAM\n\n${missingText()}`}
function repeatShareText(){return `🏆 Álbum Copa 2026\n\n🔁 REPETIDAS\n\n${repeatText()}`}

async function copyText(t,msg){try{await navigator.clipboard.writeText(t);alert(msg)}catch(e){alert('Não consegui copiar.')}}
function shareWhatsText(t){window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank')}

function exportBackup(){
  const data={version:5,createdAt:new Date().toISOString(),state,daily};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='album-copa2026-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importBackup(e){
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  try{
    const txt=await file.text();
    const data=JSON.parse(txt);
    Object.keys(state).forEach(k=>delete state[k]);
    Object.assign(state,data.state||{});
    Object.keys(daily).forEach(k=>delete daily[k]);
    Object.assign(daily,data.daily||{});
    persist();
    alert('Backup importado!');
    render();
  }catch(err){alert('Backup inválido.')}
  finally{e.target.value=''}
}

function setupInstall(){
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredInstallPrompt=e;
    const btn=$('#installBtn');
    if(btn){
      btn.disabled=false;
      btn.textContent='Instalar';
    }
  });

  const btn=$('#installBtn');
  const help=$('#installHelp');

  if(btn)btn.addEventListener('click',async(ev)=>{
    ev.preventDefault();

    if(deferredInstallPrompt){
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt=null;
      return;
    }

    if(help){
      help.style.display='block';
      help.scrollIntoView({behavior:'smooth',block:'center'});
    }

    const ua=navigator.userAgent.toLowerCase();
    const isIOS=/iphone|ipad|ipod/.test(ua);
    const isAndroid=/android/.test(ua);

    if(isIOS){
      alert('No iPhone: abra no Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.');
    }else if(isAndroid){
      alert('No Android: abra no Chrome com internet, toque nos 3 pontinhos ⋮ e escolha Instalar aplicativo ou Adicionar à tela inicial. Não use o botão de baixar página.');
    }else{
      alert('No PC: abra no Chrome ou Edge e clique no ícone de instalar na barra de endereço.');
    }
  });
}

function renderRecentUpdates(){
  const box=document.getElementById('recentUpdates');
  if(!box)return;
  if(!recentUpdates.length){
    box.innerHTML='<div class="update-row"><span class="up-have">✅</span><div><b>Seu álbum está pronto</b><small>Marque figurinhas para ver seu histórico aqui.</small></div></div>';
    return;
  }
  box.innerHTML=recentUpdates.slice(0,5).map(u=>{
    const q=Number(u.qty||0);
    const icon=q===0?'❌':q===1?'✅':'🔁';
    const cls=q===0?'up-missing':q===1?'up-have':'up-repeat';
    const action=q===0?'marcou como faltando':q===1?'marcou':'marcou como repetida x'+(q-1);
    const time=new Date(u.at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    return `<div class="update-row"><span class="${cls}">${icon}</span><div><b>Você ${action} <mark>${u.code} ${u.number}</mark></b><small>${time}</small></div></div>`;
  }).join('');
}

function render(){
  renderDashboard();
  renderGroups();
  renderBoards();
  renderLists();
  renderStats();
  renderRecentUpdates();
  persist();
}



/* HISTÓRICO: BAIXAR E CARREGAR DADOS ENTRE CELULARES */
function buildHistoryBackup(){
  return {
    app: 'album-copa2026',
    version: 7,
    createdAt: new Date().toISOString(),
    state: state || {},
    daily: daily || {},
    theme: localStorage.getItem('albumTheme') || 'light'
  };
}

function downloadHistory(){
  try{
    persist();

    const data = buildHistoryBackup();
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().slice(0,10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-album-copa2026-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    alert('Histórico baixado com sucesso!');
  }catch(e){
    alert('Não consegui baixar o histórico.');
  }
}

async function loadHistoryFile(event){
  const file = event.target.files && event.target.files[0];
  if(!file) return;

  try{
    const text = await file.text();
    const data = JSON.parse(text);

    if(!data || data.app !== 'album-copa2026' || !data.state){
      alert('Arquivo de histórico inválido.');
      event.target.value='';
      return;
    }

    const confirmLoad = confirm('Carregar este histórico vai substituir os dados atuais deste aparelho. Deseja continuar?');
    if(!confirmLoad){
      event.target.value='';
      return;
    }

    Object.keys(state).forEach(k=>delete state[k]);
    Object.assign(state, data.state || {});

    Object.keys(daily).forEach(k=>delete daily[k]);
    Object.assign(daily, data.daily || {});

    if(data.theme){
      localStorage.setItem('albumTheme', data.theme);
      document.body.classList.toggle('dark', data.theme === 'dark');
      const themeBtn = document.getElementById('themeBtn');
      if(themeBtn) themeBtn.textContent = data.theme === 'dark' ? '☀️' : '🌙';
    }

    persist();
    render();
    saveCloudAlbum();
    alert('Histórico carregado com sucesso!');
  }catch(e){
    alert('Erro ao carregar histórico. Verifique se o arquivo é o backup correto.');
  }finally{
    event.target.value='';
  }
}

function setupHistoryButtons(){
  const downloadBtn = document.getElementById('downloadHistoryBtn');
  const uploadInput = document.getElementById('uploadHistoryInput');

  if(downloadBtn) downloadBtn.addEventListener('click', downloadHistory);
  if(uploadInput) uploadInput.addEventListener('change', loadHistoryFile);
}


function init(){
  const search=$('#searchInput');
  if(search)search.addEventListener('input',e=>{query=e.target.value;renderBoards()});
  if(search)search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.target.value='';query='';renderBoards();e.target.focus()}});

  const filter=$('#statusFilter');
  if(filter)filter.addEventListener('change',e=>{statusFilter=e.target.value;renderBoards()});

  const clear=$('#clearGroupBtn');
  if(clear)clear.addEventListener('click',()=>{query='';statusFilter='all';if(search)search.value='';if(filter)filter.value='all';renderBoards();if(search)search.focus()});

  const theme=$('#themeBtn');
  if(theme)theme.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light');theme.textContent=document.body.classList.contains('dark')?'☀️':'🌙'});
  if(theme)theme.textContent=document.body.classList.contains('dark')?'☀️':'🌙';

  if($('#copyMissingBtn'))$('#copyMissingBtn').addEventListener('click',()=>copyText(missingShareText(),'Lista de faltantes copiada!'));
  if($('#shareMissingBtn'))$('#shareMissingBtn').addEventListener('click',()=>shareWhatsText(missingShareText()));
  if($('#copyRepeatsBtn'))$('#copyRepeatsBtn').addEventListener('click',()=>copyText(repeatShareText(),'Lista de repetidas copiada!'));
  if($('#shareRepeatsBtn'))$('#shareRepeatsBtn').addEventListener('click',()=>shareWhatsText(repeatShareText()));

  if($('#exportBackupBtn'))$('#exportBackupBtn').addEventListener('click',exportBackup);
  if($('#importBackupInput'))$('#importBackupInput').addEventListener('change',importBackup);
  if($('#backBtn'))$('#backBtn').addEventListener('click',goBack);
  if($('#floatingBackBtn'))$('#floatingBackBtn').addEventListener('click',goBack);

  $$('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
    goView(btn.dataset.view);
    $$('.bottom-nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }));

  $$('.stat[data-view]').forEach(btn=>btn.addEventListener('click',()=>goView(btn.dataset.view)));

  setupInstall();
  setupHistoryButtons();
  persist();
  render();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
