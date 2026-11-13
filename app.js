const IA='https://archive.org',PAGE=30;
const state={page:'home',query:'',pageNo:1,total:0,items:[],list:JSON.parse(localStorage.getItem('mb_archive_list')||'[]'),busy:false};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}
function status(s){$('status').textContent=s}
function rights(u){return /publicdomain|creativecommons\.org\/(?:publicdomain\/zero|licenses\/by\/|licenses\/by-sa\/)/i.test(String(u||''))}
function poster(id){return IA+'/services/img/'+encodeURIComponent(id)}
function card(x){return '<article class="movie-card" data-id="'+esc(x.identifier)+'"><div class="poster-wrap"><img loading="lazy" src="'+poster(x.identifier)+'" alt="'+esc(x.title||'Film artwork')+'" onerror="this.style.opacity=.12"><span class="rating">▶ PLAY</span></div><div class="card-title">'+esc(x.title||x.identifier)+'</div><div class="card-meta">'+esc(x.year||'Year unavailable')+' · '+esc(x.creator||'Internet Archive')+'</div></article>'}
function queryForPage(){
 let q='mediatype:movies AND (licenseurl:*publicdomain* OR licenseurl:*creativecommons.org*)';
 if(state.page==='tv')q+=' AND (subject:television OR subject:"TV series" OR title:television)';
 if(state.query){const words=state.query.replace(/[()+\-!{}\[\]^"~*?:\\/]/g,' ').trim().split(/\s+/).filter(Boolean);if(words.length)q+=' AND title:('+words.map(w=>'"'+w+'"').join(' AND ')+')'}
 return q;
}
async function load(reset=true){
 if(state.busy)return;if(reset){state.pageNo=1;state.items=[];$('grid').innerHTML=''}
 $('loadMore').classList.add('hidden');state.busy=true;status('Loading full-length films…');
 try{
  const p=new URLSearchParams();p.set('q',queryForPage());['identifier','title','year','creator','licenseurl','description'].forEach(f=>p.append('fl[]',f));p.set('rows',PAGE);p.set('page',state.pageNo);p.set('output','json');p.set('sort[]','downloads desc');
  const r=await fetch(IA+'/advancedsearch.php?'+p.toString());if(!r.ok)throw Error('Internet Archive catalogue returned HTTP '+r.status);
  const d=await r.json();const docs=(d.response?.docs||[]).filter(x=>x.identifier&&rights(x.licenseurl));
  state.total=d.response?.numFound||0;state.items.push(...docs);$('grid').innerHTML=state.items.map(card).join('');
  status(docs.length?state.total.toLocaleString()+' rights-labelled records found. Select a title to open its full-length player.':'No matching films returned. Try another search.');
  $('loadMore').classList.toggle('hidden',!docs.length||state.items.length>=state.total);
 }catch(e){status('Catalogue error: '+e.message);toast(e.message)}
 finally{state.busy=false}
}
function page(p){
 state.page=p;state.query='';$('searchInput').value='';document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===p));
 $('hero').classList.toggle('hidden',p!=='home');$('rightsFootnote').classList.toggle('hidden',p!=='freefilms');
 $('sortSelect').parentElement.classList.add('hidden');
 $('sectionTitle').textContent=({home:'Featured full-length films',trending:'Popular on the Archive',movies:'Movies',tv:'Television & series',freefilms:'Free full-length films',watchlist:'My List'})[p]||'Films';
 $('sectionEyebrow').textContent=p==='watchlist'?'YOUR SAVED TITLES':'PUBLIC DOMAIN & CREATIVE COMMONS';
 if(p==='watchlist'){renderList();return}load();
}
function renderList(){const items=state.list;$('grid').innerHTML=items.map(card).join('');status(items.length?items.length+' saved film(s)':'Your list is empty. Open a film and save it to My List.')}
function search(q){state.query=q.trim();if(state.page==='watchlist')state.page='home';$('hero').classList.add('hidden');$('sectionTitle').textContent=state.query?'Search results':'Featured full-length films';$('sectionEyebrow').textContent='SEARCH THE ARCHIVE';document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));load()}
async function openFilm(id){
 $('detailContent').innerHTML='<div class="player-loading">Loading the Internet Archive player…</div>';$('detailModal').classList.remove('hidden');
 try{
  const r=await fetch(IA+'/metadata/'+encodeURIComponent(id));if(!r.ok)throw Error('Could not retrieve this film record (HTTP '+r.status+').');
  const item=await r.json(),m=item.metadata||{},lic=m.licenseurl||'';
  if(!rights(lic))throw Error('No public-domain or Creative Commons rights label was found. Playback is disabled.');
  const files=(item.files||[]).filter(f=>f.name&&!f.name.includes('__ia_thumb')&&/\.(mp4|webm|ogv|m3u8)$/i.test(f.name));
  if(!files.length)throw Error('The record has no recognised browser video file. Open the source record to check available formats.');
  const name=m.title||id,desc=String(m.description||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,900);
  const saved=state.list.some(x=>x.identifier===id);
  $('detailContent').innerHTML='<div class="watch-layout"><div class="watch-player"><iframe class="archive-frame" src="'+IA+'/embed/'+encodeURIComponent(id)+'?autoplay=0&play=1" title="'+esc(name)+' full-length film player" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="watch-info"><span class="eyebrow">FULL-LENGTH FILM · INTERNET ARCHIVE</span><h2>'+esc(name)+'</h2><div class="detail-meta">'+esc(m.year||m.date||'Year unavailable')+' · '+esc(m.runtime||'Runtime not listed')+'</div><p>'+esc(desc||'No description supplied.')+'</p><div class="license-note"><b>Rights label:</b> <a href="'+esc(lic)+'" target="_blank" rel="noopener">View licence ↗</a><br><small>Rights are declared by the uploader. Verify the licence and applicable local law.</small></div><div class="detail-actions"><button class="secondary-btn" id="saveFilm">'+(saved?'♥ Saved to My List':'♡ Add to My List')+'</button><a class="secondary-btn" href="'+IA+'/details/'+encodeURIComponent(id)+'" target="_blank" rel="noopener">Source record ↗</a></div><p class="player-help">If the embedded player is blocked by your browser, use Source record to play the film on Internet Archive.</p></div></div>';
  $('saveFilm').addEventListener('click',()=>{const i=state.list.findIndex(x=>x.identifier===id);if(i>=0)state.list.splice(i,1);else state.list.unshift({identifier:id,title:m.title,year:m.year,creator:m.creator,licenseurl:lic});localStorage.setItem('mb_archive_list',JSON.stringify(state.list));$('saveFilm').textContent=i>=0?'♡ Add to My List':'♥ Saved to My List';toast(i>=0?'Removed from My List':'Saved to My List');if(state.page==='watchlist')renderList()});
 }catch(e){$('detailContent').innerHTML='<div class="player-loading">'+esc(e.message)+'</div>';toast(e.message)}
}
let timer;$('searchInput').addEventListener('input',e=>{clearTimeout(timer);timer=setTimeout(()=>search(e.target.value),500)});
document.querySelectorAll('.nav').forEach(n=>n.addEventListener('click',()=>page(n.dataset.page)));
$('heroExplore').addEventListener('click',()=>page('trending'));
$('loadMore').addEventListener('click',()=>{state.pageNo++;load(false)});
$('sortSelect').parentElement.classList.add('hidden');
document.addEventListener('click',e=>{if(e.target.dataset.close)$('detailModal').classList.add('hidden');const c=e.target.closest('.movie-card');if(c)openFilm(c.dataset.id)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('detailModal').classList.add('hidden')});
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
load();
