const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={games:[],category:"All"};

function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}
function page(id){$$(".page").forEach(x=>x.classList.toggle("active",x.id===id));$("#mobileMenu").classList.remove("open");scrollTo({top:0,behavior:"smooth"})}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>page(b.dataset.page)));

$("#menuBtn").addEventListener("click",()=>$("#mobileMenu").classList.toggle("open"));

async function loadGames(){
 try{state.games=await (await fetch("data/games.json")).json()}catch(e){state.games=[]}
 renderCategories();renderGames();
}
function renderCategories(){
 const cats=["All",...new Set(state.games.map(g=>g.category))];
 $("#categoryBar").innerHTML=cats.map(c=>`<button class="chip ${c===state.category?"active":""}" data-cat="${c}">${c}</button>`).join("");
 $$("#categoryBar .chip").forEach(b=>b.onclick=()=>{state.category=b.dataset.cat;renderCategories();renderGames()});
}
function renderGames(){
 const q=$("#gameSearch").value.toLowerCase();
 const list=state.games.filter(g=>(state.category==="All"||g.category===state.category)&&g.name.toLowerCase().includes(q));
 $("#gameGrid").innerHTML=list.map(g=>`<article class="game-card"><div class="game-art">${g.icon}</div><div class="game-info"><b>${g.name}</b><small>${g.category}</small><button class="primary play" data-url="${g.url}">Play</button></div></article>`).join("")||`<div class="empty-state">No games found.</div>`;
 $$("#gameGrid .play").forEach(b=>b.onclick=()=>window.open(b.dataset.url,"_blank","noopener"));
}
$("#gameSearch").addEventListener("input",renderGames);
$("#randomGame").onclick=()=>{if(!state.games.length)return;const g=state.games[Math.floor(Math.random()*state.games.length)];window.open(g.url,"_blank","noopener")};

$$("[data-studio]").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#blocksPanel").classList.toggle("active",b.dataset.studio==="blocks");$("#scenePanel").classList.toggle("active",b.dataset.studio==="scene")});
$$("[data-block]").forEach(b=>b.onclick=()=>{const c=$("#blockCanvas");c.querySelector(".empty-state")?.remove();const x=document.createElement("div");x.className="script-block";x.textContent=b.textContent;c.appendChild(x);});
$("#runScene").onclick=()=>toast("Test mode started — expand the 3D editor in the next build.");
$("#addCube").onclick=()=>{const x=$("#sceneCube").cloneNode(true);x.style.left=(25+Math.random()*50)+"%";x.style.top=(25+Math.random()*45)+"%";$("#sceneView").appendChild(x);toast("Cube added")};
$("#objectScale").oninput=e=>$("#sceneCube").style.transform=`translate(-50%,-50%) rotateX(20deg) rotateY(25deg) scale(${e.target.value})`;
$("#objectRotation").oninput=e=>$("#sceneCube").style.transform=`translate(-50%,-50%) rotateX(20deg) rotateY(${e.target.value}deg)`;
$("#objectName").oninput=e=>$("#sceneCube").title=e.target.value;

$("#runJS").onclick=()=>{const out=$("#output");try{const logs=[];const old=console.log;console.log=(...a)=>logs.push(a.join(" "));new Function($("#code").value)();console.log=old;out.textContent=logs.join("\n")||"Script finished."}catch(e){out.textContent="Error: "+e.message}};
function loadSettings(){
 const s=JSON.parse(localStorage.noobSettings||"{}");
 if(s.accent){document.documentElement.style.setProperty("--accent",s.accent);$("#accent").value=s.accent}
 if(s.background){document.documentElement.style.setProperty("--bg",s.background);$("#background").value=s.background}
 if(s.glow!=null){document.documentElement.style.setProperty("--glow",s.glow);$("#glow").value=s.glow}
 if(s.motion){$("#motion").value=s.motion;document.body.classList.toggle("reduced",s.motion==="off")}
 if(s.exitUrl)$("#exitUrl").value=s.exitUrl;
}
$("#saveSettings").onclick=()=>{const s={accent:$("#accent").value,background:$("#background").value,glow:$("#glow").value,motion:$("#motion").value,exitUrl:$("#exitUrl").value};localStorage.noobSettings=JSON.stringify(s);applySettings();toast("Settings saved")};
function applySettings(){document.documentElement.style.setProperty("--accent",$("#accent").value);document.documentElement.style.setProperty("--bg",$("#background").value);document.documentElement.style.setProperty("--glow",$("#glow").value);document.body.classList.toggle("reduced",$("#motion").value==="off")}
["accent","background","glow","motion"].forEach(id=>$("#"+id).addEventListener("input",applySettings));
$("#resetTheme").onclick=()=>{localStorage.removeItem("noobSettings");location.reload()};
$("#quickExit").onclick=()=>{let u=$("#exitUrl").value.trim();if(!/^https?:\/\//i.test(u))u="https://"+u;location.href=u};

loadSettings();loadGames();
let p=0;const bar=$("#loaderBar"),loader=$("#loader"),text=$("#loaderText");const timer=setInterval(()=>{p+=10;bar.style.width=p+"%";text.textContent=p<40?"Loading interface…":p<75?"Loading tools…":"Almost ready…";if(p>=100){clearInterval(timer);setTimeout(()=>loader.remove(),250)}},80);
