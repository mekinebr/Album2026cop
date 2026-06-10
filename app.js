const groups = Array.from({length:12},(_,i)=>`Grupo ${String.fromCharCode(65+i)}`);
const sample = [
 {num:1,player:'Figurinha 001',team:'Seleção A',group:'Grupo A',status:'falta',photo:'',badge:''},
 {num:2,player:'Figurinha 002',team:'Seleção A',group:'Grupo A',status:'tenho',photo:'',badge:''},
 {num:3,player:'Figurinha 003',team:'Seleção B',group:'Grupo B',status:'repetida',photo:'',badge:''},
 {num:4,player:'Figurinha 004',team:'Seleção C',group:'Grupo C',status:'falta',photo:'',badge:''}
];
let stickers = JSON.parse(localStorage.getItem('copa2026_stickers') || 'null') || sample;
const save=()=>localStorage.setItem('copa2026_stickers',JSON.stringify(stickers));
function init(){
 const gf=document.getElementById('groupFilter'); groups.forEach(g=>{const o=document.createElement('option');o.value=g;o.textContent=g;gf.appendChild(o)});
 document.getElementById('searchInput').addEventListener('input',render);
 document.getElementById('groupFilter').addEventListener('change',render);
 document.getElementById('statusFilter').addEventListener('change',render);
 document.getElementById('themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light')};
 if(localStorage.getItem('theme')==='dark')document.body.classList.add('dark');
 render();
 if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}
function addSticker(){
 const s={num:+num.value,player:player.value.trim()||`Figurinha ${num.value}`,team:team.value.trim()||'Sem seleção',group:group.value,status:status.value,photo:photo.value.trim(),badge:badge.value.trim()};
 if(!s.num)return alert('Digite o número da figurinha');
 const i=stickers.findIndex(x=>x.num===s.num); if(i>=0) stickers[i]=s; else stickers.push(s);
 stickers.sort((a,b)=>a.num-b.num); save(); render(); document.querySelectorAll('.form-grid input').forEach(i=>i.value='');
}
function setStatus(num,status){const s=stickers.find(x=>x.num===num); if(!s)return; s.status=status; save(); render(); quickFind();}
function filtered(){
 const q=searchInput.value.toLowerCase().trim(), g=groupFilter.value, st=statusFilter.value;
 return stickers.filter(s=>(!q||String(s.num).includes(q)||s.player.toLowerCase().includes(q)||s.team.toLowerCase().includes(q))&&(g==='all'||s.group===g)&&(st==='all'||s.status===st));
}
function render(){
 const total=stickers.length, have=stickers.filter(s=>s.status==='tenho').length, miss=stickers.filter(s=>s.status==='falta').length, dup=stickers.filter(s=>s.status==='repetida').length;
 const pct=total?Math.round((have/total)*100):0; progressText.textContent=pct+'%'; progressBar.style.width=pct+'%'; summaryText.textContent=`${have} de ${total} figurinhas marcadas como tenho`;
 haveCount.textContent=have; missingCount.textContent=miss; duplicateCount.textContent=dup; totalCount.textContent=total;
 groupsProgress.innerHTML=groups.map(g=>{const arr=stickers.filter(s=>s.group===g), h=arr.filter(s=>s.status==='tenho').length, p=arr.length?Math.round(h/arr.length*100):0;return `<div class="group-mini"><b>${g}</b><div class="mini-line"><div style="width:${p}%"></div></div><small>${h}/${arr.length} • ${p}%</small></div>`}).join('');
 duplicatesList.innerHTML=stickers.filter(s=>s.status==='repetida').map(s=>`<span class="pill">${String(s.num).padStart(3,'0')}</span>`).join('')||'Nenhuma repetida';
 needList.innerHTML=stickers.filter(s=>s.status==='falta').map(s=>`<span class="pill">${String(s.num).padStart(3,'0')}</span>`).join('')||'Nada faltando';
 list.innerHTML=filtered().map(card).join('');
}
function card(s){
 const img=s.photo?`<img src="${s.photo}" onerror="this.remove()">`:'👤', bd=s.badge?`<img src="${s.badge}" onerror="this.remove()">`:'🏳️';
 return `<article class="card"><div class="card-top"><div class="photo">${img}</div><div><div class="badge">${bd}</div></div></div><div class="card-body"><div class="num">Nº ${String(s.num).padStart(3,'0')} • ${s.group}</div><div class="name">${s.player}</div><div class="team">${s.team}</div><div class="status-row"><button class="btn-green ${s.status==='tenho'?'active-tenho':''}" onclick="setStatus(${s.num},'tenho')">Tenho</button><button class="btn-red ${s.status==='falta'?'active-falta':''}" onclick="setStatus(${s.num},'falta')">Falta</button><button class="btn-yellow ${s.status==='repetida'?'active-repetida':''}" onclick="setStatus(${s.num},'repetida')">Repetida</button></div></div></article>`;
}
function quickFind(){
 const n=+quickNumber.value, s=stickers.find(x=>x.num===n); if(!n){quickResult.innerHTML='';return}
 if(!s){quickResult.innerHTML=`<div class="quick-box"><b>Nº ${n} não cadastrado</b><button onclick="num.value=${n}; location.hash='add'">Adicionar</button></div>`;return}
 quickResult.innerHTML=`<div class="quick-box"><div><b>${String(s.num).padStart(3,'0')} - ${s.player}</b><br><small>${s.team} • ${s.group}</small></div><div class="quick-actions"><button class="btn-green" onclick="setStatus(${s.num},'tenho')">Tenho</button><button class="btn-red" onclick="setStatus(${s.num},'falta')">Falta</button><button class="btn-yellow" onclick="setStatus(${s.num},'repetida')">Repetida</button></div></div>`;
}
function shareTrades(){
 const rep=stickers.filter(s=>s.status==='repetida').map(s=>String(s.num).padStart(3,'0')).join(', ')||'Nenhuma';
 const falta=stickers.filter(s=>s.status==='falta').map(s=>String(s.num).padStart(3,'0')).join(', ')||'Nenhuma';
 const msg=`Álbum Copa 2026%0A%0ATenho repetidas:%0A${rep}%0A%0APreciso:%0A${falta}`;
 window.open(`https://wa.me/?text=${msg}`,'_blank');
}
window.onload=init;
