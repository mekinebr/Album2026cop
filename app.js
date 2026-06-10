const GROUP_DATA={"A": [["México", "MEX"], ["África do Sul", "RSA"], ["República da Coreia", "KOR"], ["Tchéquia", "CZE"]], "B": [["Canadá", "CAN"], ["Bósnia e Herzegovina", "BIH"], ["Catar", "QAT"], ["Suíça", "SUI"]], "C": [["Brasil", "BRA"], ["Marrocos", "MAR"], ["Haiti", "HAI"], ["Escócia", "SCO"]], "D": [["EUA", "USA"], ["Paraguai", "PAR"], ["Austrália", "AUS"], ["Turquia", "TUR"]], "E": [["Alemanha", "GER"], ["Curaçau", "CUW"], ["Costa do Marfim", "CIV"], ["Equador", "ECU"]], "F": [["Holanda", "NED"], ["Japão", "JPN"], ["Suécia", "SWE"], ["Tunísia", "TUN"]], "G": [["Bélgica", "BEL"], ["Egito", "EGY"], ["RI do Irã", "IRN"], ["Nova Zelândia", "NZL"]], "H": [["Espanha", "ESP"], ["Cabo Verde", "CPV"], ["Arábia Saudita", "KSA"], ["Uruguai", "URU"]], "I": [["França", "FRA"], ["Senegal", "SEN"], ["Iraque", "IRQ"], ["Noruega", "NOR"]], "J": [["Argentina", "ARG"], ["Argélia", "ALG"], ["Áustria", "AUT"], ["Jordânia", "JOR"]], "K": [["Portugal", "POR"], ["RD do Congo", "COD"], ["Uzbequistão", "UZB"], ["Colômbia", "COL"]], "L": [["Inglaterra", "ENG"], ["Croácia", "CRO"], ["Gana", "GHA"], ["Panamá", "PAN"]]};
const SPECIALS=[{group:'Extras',team:'História da Copa',code:'FWC',total:20}];
const GROUPS=Object.entries(GROUP_DATA).map(([letter,teams])=>({letter,name:'Grupo '+letter,teams:teams.map(([team,code])=>({team,code,total:20}))}));
let activeGroup='',activeTeam='',scannerStream=null,deferredInstallPrompt=null;
const state=JSON.parse(localStorage.getItem('albumCopa2026StatusV2')||'{}');
const theme=localStorage.getItem('albumTheme');if(theme==='dark')document.body.classList.add('dark');
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function makeStickers(){const arr=[];GROUPS.forEach(g=>g.teams.forEach(t=>{for(let n=1;n<=t.total;n++){const code=`${t.code}-${String(n).padStart(2,'0')}`;arr.push({id:code,code,number:n,team:t.team,teamCode:t.code,group:g.name,groupLetter:g.letter})}}));SPECIALS.forEach(s=>{for(let n=0;n<s.total;n++){const code=`${s.code}-${String(n).padStart(2,'0')}`;arr.push({id:code,code,number:n,team:s.team,teamCode:s.code,group:s.group,groupLetter:'Extras'})}});return arr}
const stickers=makeStickers(),VALID_CODES=Array.from(new Set(stickers.map(x=>x.teamCode)));
function save(){localStorage.setItem('albumCopa2026StatusV2',JSON.stringify(state));renderAll()}function setStatus(id,status){if(status==='none')delete state[id];else state[id]=status;save()}function cycleStatus(id){const order=['none','have','missing','repeat'];setStatus(id,order[(order.indexOf(getStatus(id))+1)%order.length])}function getStatus(id){return state[id]||'none'}function statusLabel(s){return{have:'Tenho',missing:'Falta',repeat:'Repetida',none:'Não marcada'}[s]}function statusEmoji(s){return{have:'✅',missing:'❌',repeat:'🔁',none:'⭕'}[s]}function counts(list=stickers){return{have:list.filter(x=>getStatus(x.id)==='have').length,repeat:list.filter(x=>getStatus(x.id)==='repeat').length,missing:list.filter(x=>getStatus(x.id)==='missing').length,none:list.filter(x=>getStatus(x.id)==='none').length,total:list.length}}function pct(h,t){return t?Math.round(h/t*100):0}function matchesText(x,q){q=norm(q).trim();if(!q)return true;const raw=q.replace(/\s/g,'').replace('-','');return norm(x.code).includes(q)||norm(x.code.replace('-','')).includes(raw)||norm(x.team).includes(q)||norm(x.teamCode).includes(q)||norm(x.group).includes(q)||String(x.number).padStart(2,'0')===raw||String(x.number)===raw}function findSticker(q){q=String(q||'').trim();if(!q)return null;const clean=norm(q).replace(/\s/g,'').replace('-','');return stickers.find(x=>norm(x.code.replace('-',''))===clean)||stickers.find(x=>matchesText(x,q))}
function levenshtein(a,b){const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)dp[i][0]=i;for(let j=0;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return dp[a.length][b.length]}
function cleanSigla(raw){let s=String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'').split('').map(ch=>({'0':'O','1':'I','2':'Z','4':'A','5':'S','6':'G','8':'B'}[ch]||ch)).join('');const manual={'0AN':'CAN','C4N':'CAN','CAH':'CAN','CAM':'CAN','8RA':'BRA','BR4':'BRA','AR6':'ARG','4RG':'ARG','P0R':'POR','PQR':'POR','FR4':'FRA','US4':'USA','U5A':'USA','K0R':'KOR','C0D':'COD'};if(manual[s])return manual[s];if(VALID_CODES.includes(s))return s;let best=s,dist=99;VALID_CODES.forEach(c=>{const d=levenshtein(s,c);if(d<dist){best=c;dist=d}});return dist<=1?best:s}
function normalizeOcrText(text){return String(text||'').toUpperCase().replace(/[€¢]/g,'C').replace(/[|!]/g,'I').replace(/[(){}\[\]]/g,' ').replace(/[^A-Z0-9\-\s]/g,' ').replace(/\s+/g,' ').trim()}
function extractStickerCode(text){
  const up=normalizeOcrText(text);
  const variants=[
    up,
    up.replace(/\s+/g,''),
    up.replace(/O(?=\d)/g,'0').replace(/I(?=\d)/g,'1').replace(/L(?=\d)/g,'1'),
    up.replace(/\s+/g,'').replace(/O(?=\d)/g,'0').replace(/I(?=\d)/g,'1').replace(/L(?=\d)/g,'1')
  ];
  const candidates=[];
  variants.forEach(v=>{
    let re=/([A-Z0-9]{3})\s*[-]?\s*(\d{1,2})/g,m;
    while((m=re.exec(v))!==null){
      const sig=cleanSigla(m[1]);
      let n=String(m[2]).replace(/[OIQL]/g,x=>x==='O'||x==='Q'?'0':'1');
      const num=Number(n);
      if(VALID_CODES.includes(sig)&&num>=0&&num<=99)candidates.push(`${sig}-${String(num).padStart(2,'0')}`);
    }
  });
  const existing=candidates.find(c=>stickers.some(x=>x.id===c));
  return existing||candidates[0]||'';
}
function autoEnhanceCanvas(src,mode='contrast'){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const ctx=c.getContext('2d');ctx.drawImage(src,0,0);const img=ctx.getImageData(0,0,c.width,c.height),d=img.data;let min=255,max=0;for(let i=0;i<d.length;i+=4){const g=d[i]*.299+d[i+1]*.587+d[i+2]*.114;min=Math.min(min,g);max=Math.max(max,g)}const range=Math.max(1,max-min);for(let i=0;i<d.length;i+=4){let g=d[i]*.299+d[i+1]*.587+d[i+2]*.114;g=(g-min)*255/range;if(mode==='binary')g=g<145?0:255;else if(mode==='invert')g=255-(g<145?0:255);else g=Math.max(0,Math.min(255,(g-115)*1.9+128));d[i]=d[i+1]=d[i+2]=g}ctx.putImageData(img,0,0);return c}
function crop(src,r,scale=3,mode='binary'){const c=document.createElement('canvas');const sx=Math.max(0,Math.floor(src.width*r.x)),sy=Math.max(0,Math.floor(src.height*r.y)),sw=Math.min(src.width-sx,Math.floor(src.width*r.w)),sh=Math.min(src.height-sy,Math.floor(src.height*r.h));c.width=Math.max(1,sw*scale);c.height=Math.max(1,sh*scale);const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(src,sx,sy,sw,sh,0,0,c.width,c.height);return autoEnhanceCanvas(c,mode)}
function digitizeCanvas(src){const out=document.createElement('canvas');const max=1800,ratio=Math.min(1,max/Math.max(src.width,src.height));out.width=Math.round(src.width*ratio);out.height=Math.round(src.height*ratio);out.getContext('2d').drawImage(src,0,0,out.width,out.height);return autoEnhanceCanvas(out,'contrast')}
function buildScanCanvases(src){
  const base=digitizeCanvas(src);
  const regions=[
    {x:.42,y:0,w:.56,h:.24},      // topo direito, código no verso
    {x:.36,y:0,w:.64,h:.28},      // topo direito mais amplo
    {x:.30,y:0,w:.70,h:.34},      // faixa superior direita
    {x:0,y:0,w:1,h:.30},          // faixa superior inteira
    {x:.50,y:0,w:.50,h:.45},      // lado direito alto
    {x:.55,y:.02,w:.42,h:.20},    // somente cápsula do código
    {x:.25,y:0,w:.75,h:.25},      // quando código vem mais ao centro
    {x:0,y:0,w:1,h:1},            // imagem inteira
    {x:0,y:.65,w:1,h:.35}         // rodapé fallback
  ];
  const arr=[];
  regions.forEach(r=>{
    arr.push(crop(base,r,5,'binary'));
    arr.push(crop(base,r,5,'contrast'));
    arr.push(crop(base,r,5,'invert'));
  });
  const preview=$('#previewCanvas');
  if(preview){
    preview.style.display='block';
    preview.width=base.width;preview.height=base.height;
    preview.getContext('2d').drawImage(base,0,0);
  }
  return arr;
}
async function runOcrOnCanvas(canvas){if(!window.Tesseract)throw new Error('OCR não carregou');const r=await Tesseract.recognize(canvas,'eng',{tessedit_char_whitelist:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ',tessedit_pageseg_mode:'6'});return r?.data?.text||''}
async function analyzeCanvasForCode(src){const canvases=buildScanCanvases(src);let all='';for(let i=0;i<canvases.length;i++){try{const t=await runOcrOnCanvas(canvases[i]);all+=' '+t;const code=extractStickerCode(all);if(code)return{code,text:all}}catch(e){}}return{code:'',text:all}}
function imageFileToCanvas(file){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');const max=1800,ratio=Math.min(1,max/Math.max(img.width,img.height));c.width=Math.round(img.width*ratio);c.height=Math.round(img.height*ratio);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);res(c)};img.onerror=rej;img.src=URL.createObjectURL(file)})}
function openFoundCode(code){$('#quickCode').value=code;const item=findSticker(code);renderQuick(item);$('#scannerStatus').textContent=item?`Código encontrado: ${code}.`:`Li ${code}, mas não achei na base.`;if(item)window.scrollTo({top:$('#quickResult').offsetTop-20,behavior:'smooth'})}
function applyFilters(x){const q=$('#search')?.value||'',status=$('#statusFilter')?.value||'all';return(!activeGroup||x.group===activeGroup)&&(!activeTeam||x.team===activeTeam)&&(status==='all'||getStatus(x.id)===status)&&matchesText(x,q)}
function renderDashboard(){const c=counts(),p=pct(c.have,c.total);$('#haveCount').textContent=c.have;$('#repeatCount').textContent=c.repeat;$('#missingCount').textContent=c.missing;$('#totalCount').textContent=c.total;$('#homeRepeatCount').textContent=c.repeat;$('#homeMissingCount').textContent=c.missing;$('#percent').textContent=p+'%';$('#barFill').style.width=p+'%';$('#progressText').textContent=`${c.have} de ${c.total} figurinhas marcadas como tenho`}
function openView(name){$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$$('.view').forEach(v=>v.classList.remove('active'));$('#'+name).classList.add('active');if(name==='album')renderCards();if(name==='trades')renderTrades();scrollTo({top:0,behavior:'smooth'})}
function selectGroup(group){activeGroup=group;activeTeam='';$('#search').value='';renderGroupSelector();renderTeamSelector();openView('home')}
function selectTeam(team){const f=stickers.find(x=>x.team===team);activeTeam=team;activeGroup=f?f.group:activeGroup;$('#search').value='';$('#statusFilter').value='all';renderGroupSelector();renderTeamSelector();openView('album')}
function clearSelection(){activeGroup='';activeTeam='';$('#search').value='';$('#statusFilter').value='all';renderGroupSelector();renderTeamSelector();renderCards()}
function renderGroupSelector(){$('#groupSelector').innerHTML=GROUPS.map(g=>{const items=stickers.filter(x=>x.group===g.name),c=counts(items),p=pct(c.have,c.total);return`<button class="group-btn ${activeGroup===g.name?'active':''}" onclick="selectGroup('${g.name}')"><b>${g.name}</b><br><small>✅ ${c.have}/${c.total} · ${p}%</small></button>`}).join('')}
function renderTeamSelector(){const gs=activeGroup?GROUPS.filter(g=>g.name===activeGroup):GROUPS;$('#teamSelector').innerHTML=gs.flatMap(g=>g.teams).map(t=>{const items=stickers.filter(x=>x.team===t.team),c=counts(items),p=pct(c.have,c.total);return`<button class="team-card ${activeTeam===t.team?'active':''}" onclick="selectTeam('${t.team}')"><header><b>${t.team}</b><span>${t.code}</span></header><div class="smallbar"><i style="width:${p}%"></i></div><div class="mini-counts">✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat} · ⭕ ${c.none}</div></button>`}).join('')}
function renderTeamProgress(){const teams=GROUPS.flatMap(g=>g.teams.map(t=>({...t,group:g.name})));$('#teamProgress').innerHTML=teams.map(t=>{const items=stickers.filter(x=>x.team===t.team),c=counts(items),p=pct(c.have,c.total);return`<div class="team-row" onclick="selectTeam('${t.team}')"><header><span>${t.team} <small class="muted">${t.code}</small></span><span>${p}%</span></header><div class="smallbar"><i style="width:${p}%"></i></div><small class="muted">${t.group} · ✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat}</small></div>`}).join('')}
function renderActiveFilters(){const chips=[];if(activeGroup)chips.push(`📌 ${activeGroup}`);if(activeTeam)chips.push(`⚽ ${activeTeam}`);const st=$('#statusFilter')?.value;if(st&&st!=='all')chips.push(`${statusEmoji(st)} ${statusLabel(st)}`);const q=$('#search')?.value;if(q)chips.push(`🔎 ${q}`);$('#activeFilters').innerHTML=chips.map(x=>`<span class="chip">${x}</span>`).join('')}
function renderCards(){const filtered=stickers.filter(applyFilters),list=filtered.slice(0,260),c=counts(filtered);$('#albumTitle').textContent=activeTeam||activeGroup||'Figurinhas';$('#albumSubtitle').textContent=`${filtered.length} figurinhas · ✅ ${c.have} · ❌ ${c.missing} · 🔁 ${c.repeat} · ⭕ ${c.none}`;renderActiveFilters();$('#cards').innerHTML=list.map(cardHTML).join('')||'<div class="notice">Nenhuma figurinha encontrada.</div>'}
function cardHTML(x){const st=getStatus(x.id);return`<article class="card"><div class="code" onclick="cycleStatus('${x.id}')">${x.code}</div><div class="team-name" onclick="cycleStatus('${x.id}')">${x.team}</div><small>${x.group} · Nº ${String(x.number).padStart(2,'0')}</small><span class="tag ${st}">${statusEmoji(st)} ${statusLabel(st)}</span><div class="status-actions"><button class="${st==='have'?'active':''}" onclick="setStatus('${x.id}','have')">✅ Tenho</button><button class="${st==='missing'?'active':''}" onclick="setStatus('${x.id}','missing')">❌ Falta</button><button class="${st==='repeat'?'active':''}" onclick="setStatus('${x.id}','repeat')">🔁 Repetida</button><button onclick="setStatus('${x.id}','none')">Limpar</button></div></article>`}
function listByStatus(status){return stickers.filter(x=>getStatus(x.id)===status).map(x=>`${x.code} - ${x.team} (${x.group})`).join('\n')}
function renderTrades(){$('#repeatList').value=listByStatus('repeat')||'Nenhuma repetida marcada ainda.';$('#missingList').value=listByStatus('missing')||'Nenhuma faltante marcada ainda.'}
function renderQuick(x){if(!x){const q=$('#quickCode').value.trim(),group=GROUPS.find(g=>norm(g.name).includes(norm(q))||norm(g.letter)===norm(q)),team=stickers.find(s=>norm(s.team).includes(norm(q))||norm(s.teamCode)===norm(q));if(group){selectGroup(group.name);return}if(team){selectTeam(team.team);return}$('#quickResult').innerHTML='<div class="notice">Figurinha não encontrada. Tente CAN 15, BRA-01 ou Grupo C.</div>';return}$('#quickResult').innerHTML=cardHTML(x)}
function tradeMessage(){return`🏆 Álbum Copa 2026\n\n🔁 Tenho repetidas:\n${$('#repeatList').value}\n\n❌ Preciso:\n${$('#missingList').value}`}function shareTrades(){open('https://wa.me/?text='+encodeURIComponent(tradeMessage()),'_blank')}async function copyTrades(){try{await navigator.clipboard.writeText(tradeMessage());alert('Lista copiada!')}catch(e){alert('Não consegui copiar.')}}
async function startScanner(){
  try{
    scannerStream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},focusMode:{ideal:'continuous'}},
      audio:false
    });
    const track=scannerStream.getVideoTracks()[0];
    if(track && track.applyConstraints){
      try{await track.applyConstraints({advanced:[{focusMode:'continuous'}]});}catch(e){}
    }
    $('#scannerVideo').srcObject=scannerStream;
    await $('#scannerVideo').play();
    $('#scannerStatus').textContent='Câmera aberta. Enquadre a figurinha inteira e toque em Ler com precisão.';
  }catch(e){
    $('#scannerStatus').textContent='Não consegui abrir a câmera. Confira permissão e use HTTPS.';
  }
}
async function toggleFlash(){
  if(!scannerStream){$('#scannerStatus').textContent='Abra a câmera primeiro.';return;}
  const track=scannerStream.getVideoTracks()[0];
  const caps=track.getCapabilities ? track.getCapabilities() : {};
  if(!caps.torch){$('#scannerStatus').textContent='Este aparelho/navegador não permite flash pelo site.';return;}
  const current=track._torchOn||false;
  try{
    await track.applyConstraints({advanced:[{torch:!current}]});
    track._torchOn=!current;
    $('#scannerStatus').textContent=track._torchOn?'Flash ligado.':'Flash desligado.';
  }catch(e){
    $('#scannerStatus').textContent='Não consegui controlar o flash neste navegador.';
  }
}
function stopScanner(){if(scannerStream)scannerStream.getTracks().forEach(t=>t.stop());scannerStream=null;$('#scannerVideo').srcObject=null;$('#scannerStatus').textContent='Scanner fechado.'}

function sharpenCanvas(sourceCanvas) {
  const src = sourceCanvas;
  const out = document.createElement('canvas');
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext('2d');
  ctx.drawImage(src, 0, 0);

  const img = ctx.getImageData(0, 0, out.width, out.height);
  const data = img.data;
  const copy = new Uint8ClampedArray(data);

  const w = out.width;
  const h = out.height;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            sum += copy[idx] * kernel[k++];
          }
        }
        data[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, sum));
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  return out;
}

function enhanceForDisplay(sourceCanvas) {
  const base = digitizeCanvas(sourceCanvas);
  const sharp = sharpenCanvas(base);
  const out = document.createElement('canvas');
  out.width = sharp.width;
  out.height = sharp.height;
  const ctx = out.getContext('2d');
  ctx.drawImage(sharp, 0, 0);

  const img = ctx.getImageData(0, 0, out.width, out.height);
  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    let gray = d[i] * .299 + d[i+1] * .587 + d[i+2] * .114;
    gray = (gray - 110) * 2.2 + 145;
    gray = Math.max(0, Math.min(255, gray));
    d[i] = d[i+1] = d[i+2] = gray;
  }

  ctx.putImageData(img, 0, 0);
  return out;
}

function showEnhancedCanvas(canvas) {
  const preview = $('#previewCanvas');
  if (!preview) return;
  preview.style.display = 'block';
  preview.classList.add('enhanced');
  preview.width = canvas.width;
  preview.height = canvas.height;
  preview.getContext('2d').drawImage(canvas, 0, 0);
}

async function enhanceCurrentImage() {
  const video = $('#scannerVideo');
  const canvas = $('#scannerCanvas');
  const status = $('#scannerStatus');

  if (!video.srcObject) {
    status.textContent = 'Abra a câmera ou envie uma foto para melhorar a imagem.';
    return;
  }

  status.textContent = 'Melhorando imagem: brilho, contraste e nitidez...';
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  const enhanced = enhanceForDisplay(canvas);
  showEnhancedCanvas(enhanced);

  try {
    const { code } = await analyzeCanvasForCode(enhanced);
    if (code) openFoundCode(code);
    else status.textContent = 'Imagem melhorada, mas ainda não consegui ler o código. Tente aproximar mais.';
  } catch(e) {
    status.textContent = 'Imagem melhorada. Tente tocar em Ler com precisão.';
  }
}


async function scanFrame(){const video=$('#scannerVideo'),canvas=$('#scannerCanvas'),status=$('#scannerStatus');if(!video.srcObject){status.textContent='Abra a câmera primeiro.';return}status.textContent='Digitalizando, melhorando foco e procurando código...';canvas.width=video.videoWidth||1280;canvas.height=video.videoHeight||720;canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);try{const {code}=await analyzeCanvasForCode(canvas);if(code)openFoundCode(code);else status.textContent='Não consegui ler. Tire uma foto mais perto da figurinha e use Enviar foto.'}catch(e){status.textContent='Erro na leitura. Tente mais luz e câmera firme.'}}
async function handlePhotoUpload(e){const file=e.target.files&&e.target.files[0];if(!file)return;$('#scannerStatus').textContent='Digitalizando foto enviada...';try{const canvas=await imageFileToCanvas(file);const enhanced=enhanceForDisplay(canvas);showEnhancedCanvas(enhanced);const {code}=await analyzeCanvasForCode(enhanced);if(code)openFoundCode(code);else $('#scannerStatus').textContent='Não encontrei código. Tire foto da figurinha inteira, bem reta e iluminada.'}catch(err){$('#scannerStatus').textContent='Não consegui analisar essa foto.'}finally{e.target.value=''}}
function setupInstall(){const btn=$('#installBtn');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e});btn.addEventListener('click',async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null}else alert('No Android: Chrome → 3 pontinhos → Instalar aplicativo ou Adicionar à tela inicial.')})}
function renderAll(){renderDashboard();renderGroupSelector();renderTeamSelector();renderTeamProgress();renderCards();renderTrades()}
$$('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.view)));$$('[data-open-view]').forEach(btn=>btn.addEventListener('click',()=>openView(btn.dataset.openView)));$('#findBtn').addEventListener('click',()=>renderQuick(findSticker($('#quickCode').value)));$('#quickCode').addEventListener('input',e=>{if(e.target.value.trim().length>=2)renderQuick(findSticker(e.target.value))});$('#quickCode').addEventListener('keydown',e=>{if(e.key==='Enter')renderQuick(findSticker(e.target.value))});$('#search').addEventListener('input',renderCards);$('#statusFilter').addEventListener('change',renderCards);$('#clearSelectionBtn').addEventListener('click',clearSelection);$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('albumTheme',document.body.classList.contains('dark')?'dark':'light');$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙'});$('#themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';$('#shareBtn').addEventListener('click',shareTrades);$('#copyBtn').addEventListener('click',copyTrades);$('#startScannerBtn').addEventListener('click',startScanner);$('#scanFrameBtn').addEventListener('click',scanFrame);$('#enhanceBtn').addEventListener('click',enhanceCurrentImage);$('#flashBtn').addEventListener('click',toggleFlash);$('#stopScannerBtn').addEventListener('click',stopScanner);$('#photoInput').addEventListener('change',handlePhotoUpload);setupInstall();if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});renderAll();
