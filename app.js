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

const PLAYER_NAMES = {
  'P001-03':'Emiliano Martínez','P001-04':'Lionel Messi','P001-05':'Nico González','P001-06':'Giuliano Simeone','P001-07':'Julián Álvarez','P001-08':'Lautaro Martínez','P001-09':'Franco Mastantuono','P001-10':'Enzo Fernández','P001-11':'Alexis Mac Allister','P001-12':'Nico Paz','P001-13':'Leandro Paredes','P001-14':'Rodrigo De Paul','P001-15':'Exequiel Palacios','P001-16':'Cristian Romero',
  'P002-01':'Leonardo Balerdi','P002-02':'Nicolás Otamendi','P002-03':'Nahuel Molina','P002-04':'Nicolás Tagliafico',
  'P004-01':'Neymar Jr','P004-02':'Mohamed Salah','P004-03':'Luis Díaz','P004-04':'Federico Valverde','P004-05':'Arda Güler','P004-06':'Erling Haaland','P004-07':'Cristiano Ronaldo','P004-08':'Thibaut Courtois','P004-09':'Luka Modrić','P004-10':'Sadio Mané','P004-13':'Lionel Messi','P004-14':'Christian Pulisic',
  'P005-01':'Cole Palmer','P005-02':'Kylian Mbappé','P005-03':'Riyad Mahrez','P005-04':'Lamine Yamal','P005-05':'Jamal Musiala','P005-06':'Gilberto Mora','P005-07':'Diego Gómez','P005-08':'Moisés Caicedo','P005-09':'Leandro Bacuna','P005-10':'Brahim Díaz','P005-13':'Son Heung-min','P005-14':'Viktor Gyökeres','P005-15':'Takefusa Kubo',
  'P012-02':'Neymar Jr','P012-03':'Neymar Jr','P012-04':'Neymar Jr','P012-05':'Neymar Jr','P012-06':'Neymar Jr','P012-07':'Neymar Jr','P012-08':'Neymar Jr','P012-09':'Neymar Jr','P012-10':'Neymar Jr','P012-11':'Neymar Jr','P012-12':'Neymar Jr','P012-13':'Neymar Jr','P012-14':'Neymar Jr','P012-15':'Neymar Jr','P012-16':'Neymar Jr',
  'P014-03':'Jordan Pickford','P014-04':'Harry Kane','P014-05':'Marcus Rashford','P014-06':'Phil Foden','P014-07':'Ollie Watkins','P014-08':'Bukayo Saka','P014-09':'Anthony Gordon','P014-10':'Morgan Rogers','P014-11':'Jude Bellingham','P014-12':'Jordan Henderson','P014-13':'Cole Palmer','P014-14':'Declan Rice','P014-15':'Dan Burn','P014-16':'John Stones',
  'P018-03':'Ørjan Nyland','P018-04':'Erling Haaland','P018-05':'Jørgen Strand Larsen','P018-06':'Alexander Sørloth','P018-07':'Antonio Nusa','P018-08':'Oscar Bobb','P018-13':'Sander Berge',
  'P020-03':'Marc-André ter Stegen','P020-04':'Joshua Kimmich','P020-05':'Nick Woltemade','P020-06':'Serge Gnabry','P020-07':'Karim Adeyemi','P020-08':'Leroy Sané','P020-09':'Leon Goretzka','P020-10':'Florian Wirtz','P020-11':'Felix Nmecha','P020-12':'Joshua Kimmich','P020-13':'Jamal Musiala','P020-14':'David Raum','P020-15':'Ridle Baku','P020-16':'Nico Schlotterbeck',
  'P022-03':'Diogo Costa','P022-04':'Cristiano Ronaldo','P022-05':'João Félix','P022-06':'Francisco Trincão','P022-07':'João Neves','P022-08':'Vitinha','P022-09':'Rúben Neves','P022-10':'Bruno Fernandes','P022-11':'Bernardo Silva','P022-12':'Gonçalo Inácio','P022-13':'Nuno Mendes','P022-14':'Diogo Dalot','P022-15':'João Cancelo','P022-16':'Rúben Dias',
  'P033-01':'Rodrygo','P033-02':'João Pedro','P033-06':'Malik Tillman','P033-07':'Haji Wright','P033-09':'Pervis Estupiñán','P033-10':'Willian Pacho','P033-11':'Piero Hincapié','P033-12':'Angelo Preciado','P033-14':'Luka Modrić',
  'P034-01':'Alisson Becker','P034-02':'Bento','P034-03':'Marquinhos','P034-04':'Wesley','P034-05':'Éder Militão','P034-06':'Gabriel Magalhães','P034-07':'Danilo','P034-08':'Bruno Guimarães','P034-09':'Lucas Paquetá','P034-10':'Casemiro','P034-11':'Luiz Henrique','P034-12':'Vinícius Júnior','P034-13':'Gabriel Martinelli','P034-14':'Raphinha','P034-15':'Estêvão','P034-16':'Matheus Cunha',
  'P036-02':'Alphonso Davies','P036-03':'Cristoph Baumgartner','P036-04':'Cyle Larin','P036-09':'Samuel Adekugbe','P036-14':'Jonathan David',
  'P039-02':'Hyeonmo Jo','P039-03':'Youngwoo Seol','P039-04':'Minjae Kim','P039-05':'Myungjae Lee','P039-10':'Son Heung-min','P039-16':'Jude Bellingham',
  'P044-03':'Mohamed Salah','P044-04':'Khaled Sobhi','P044-09':'Ahmed Fatouh','P044-11':'Trézéguet',
  'P046-03':'Unai Simón','P046-04':'Lamine Yamal','P046-05':'Ferran Torres','P046-06':'Nico Williams','P046-07':'Dani Olmo','P046-08':'Álvaro Morata','P046-09':'Mikel Oyarzabal','P046-10':'Mikel Merino','P046-11':'Fabián Ruiz','P046-12':'Pedri','P046-13':'Rodri','P046-14':'Martín Zubimendi','P046-15':'Marc Cucurella','P046-16':'Dani Carvajal',
  'P048-02':'Weston McKennie','P048-04':'Diego Luna','P048-06':'Christian Pulisic','P048-10':'Antonee Robinson','P048-13':'Ricardo Pepi','P048-14':'Mark McKenzie','P048-15':'Tyler Adams','P048-16':'Matt Freese',
  'P049-03':'Mike Maignan','P049-04':'Kylian Mbappé','P049-06':'Kingsley Coman','P049-07':'Désiré Doué','P049-08':'Bradley Barcola','P049-09':'Ousmane Dembélé','P049-10':'Adrien Rabiot','P049-11':'Manu Koné','P049-12':'Eduardo Camavinga','P049-13':'Aurélien Tchouaméni','P049-14':'Michael Olise','P049-15':'Lucas Digne','P049-16':'Dayot Upamecano',
  'P055-02':'Yuto Soma','P055-03':'Daichi Kamada','P055-06':'Takefusa Kubo','P055-14':'Junya Ito',
  'P057-02':'Ayoube El Kaabi','P057-03':'Elyes Ben Seghir','P057-04':'Youssef En-Nesyri','P057-07':'Ismail Saibari','P057-13':'Yassine Bounou','P057-14':'Nayef Aguerd',
  'P058-03':'Luis Malagón','P058-04':'Jesús Gallardo','P058-05':'Johan Vásquez','P058-06':'César Montes','P058-07':'Israel Reyes','P058-08':'Jorge Sánchez','P058-09':'Orbelín Pineda','P058-10':'Diego Lainez','P058-11':'Edson Álvarez','P058-12':'Érick Sánchez','P058-13':'Carlos Rodríguez','P058-14':'Marcel Ruiz','P058-15':'Raúl Jiménez','P058-16':'Santiago Giménez',
  'P062-03':'Bart Verbruggen','P062-04':'Memphis Depay','P062-06':'Wout Weghorst','P062-07':'Justin Kluivert','P062-08':'Xavi Simons','P062-09':'Denzel Dumfries','P062-10':'Tijjani Reijnders','P062-11':'Teun Koopmeiners','P062-12':'Frenkie de Jong','P062-14':'Jan Paul van Hecke','P062-15':'Virgil van Dijk',
  'P065-03':'Diogo Costa','P065-04':'Cristiano Ronaldo','P065-05':'João Félix','P065-06':'Francisco Trincão','P065-07':'João Neves','P065-08':'Vitinha','P065-09':'Rúben Neves','P065-10':'Bruno Fernandes','P065-11':'Bernardo Silva','P065-12':'Gonçalo Inácio','P065-13':'Nuno Mendes','P065-14':'Diogo Dalot','P065-15':'João Cancelo','P065-16':'Rúben Dias'
};

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
      const id = `P${String(p).padStart(3,'0')}-${String(s).padStart(2,'0')}`;
      const name = PLAYER_NAMES[id] || `Figurinha ${code}`;
      arr.push({id, code, name, page:p, slot:s, team, group:groupNameForTeam(team), img:pageImage(p)});
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
  return norm(x.code).includes(q)||norm(x.id).includes(q)||norm(x.name).includes(q)||norm(x.team).includes(q)||norm(x.group).includes(q)||String(x.page).includes(q)||norm(x.code.replace('-','')).includes(raw)||norm(x.id.replace('-','')).includes(raw);
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
  $('#cards').innerHTML=list.map(x=>cardHTML(x)).join('') || '<div class="notice">Nenhuma figurinha encontrada. Tente buscar por jogador, seleção, grupo, página ou código. Exemplo: Messi, BRA-01, Argentina, Grupo A.</div>';
}
function cardHTML(x){
  const st=getStatus(x.id);
  return `<article class="card"><div class="sticker-thumb" style="${stickerStyle(x)}" onclick="openSheet(${x.page})"></div><div class="card-body"><div class="code">${x.code}</div><b>${x.name}</b><p class="muted">${x.team} · ${x.group} · Página ${x.page} · posição ${x.slot}</p><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button class="${st==='have'?'active':''}" onclick="setStatus('${x.id}','have')">✅ Tenho</button><button class="${st==='missing'?'active':''}" onclick="setStatus('${x.id}','missing')">❌ Falta</button><button class="${st==='repeat'?'active':''}" onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button></div></div></article>`
}
function renderSheets(){
  $('#sheetGrid').innerHTML=Array.from({length:TOTAL_PAGES},(_,i)=>i+1).map(p=>`<div class="sheet" onclick="openSheet(${p})"><img src="${pageImage(p)}" loading="lazy" alt="Página ${p}"><div>Página ${String(p).padStart(3,'0')} · ${pageTeam(p)[0]}</div></div>`).join('');
}
function listByStatus(status){return stickers.filter(x=>getStatus(x.id)===status).map(x=>`${x.code} - ${x.name} - ${x.team} (${x.group})`).join('\n')}
function renderTrades(){
  $('#repeatList').value=listByStatus('repeat')||'Nenhuma repetida marcada ainda.';
  $('#missingList').value=listByStatus('missing')||'Nenhuma faltante marcada ainda.';
}
function renderQuick(x){
  if(!x){ $('#quickResult').innerHTML='<div class="notice">Figurinha não encontrada. Use exemplo: Messi, ARG-01, BRA-12, P001-01, Brasil ou Grupo A.</div>'; return; }
  const st=getStatus(x.id);
  $('#quickResult').innerHTML=`<div class="card compact"><div class="sticker-thumb" style="${stickerStyle(x)}" onclick="openSheet(${x.page})"></div><div class="card-body"><div class="code">${x.code}</div><b>${x.name}</b><p class="muted">${x.team} · ${x.group} · Página ${x.page} · posição ${x.slot}</p><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button class="${st==='have'?'active':''}" onclick="setStatus('${x.id}','have')">✅ Tenho</button><button class="${st==='missing'?'active':''}" onclick="setStatus('${x.id}','missing')">❌ Falta</button><button class="${st==='repeat'?'active':''}" onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button><button onclick="setStatus('${x.id}','none')">Limpar</button></div></div></div>`;
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
