const IA='https://archive.org', PAGE_SIZE=30;
const state={page:1,query:'',total:0,items:[],busy:false};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allowedLicense=u=>/publicdomain|creativecommons\.org\/publicdomain\/zero|creativecommons\.org\/licenses\/by\/|creativecommons\.org\/licenses\/by-sa\//i.test(String(u||''));
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function status(s){$('status').textContent=s}
function poster(id){return IA+'/services/img/'+encodeURIComponent(id)}
function card(x){return '<article class="movie-card" data-id="'+esc(x.identifier)+'"><div class="poster-wrap"><img loading="lazy" src="'+poster(x.identifier)+'" alt="'+esc(x.title||'Film poster')+'" onerror="this.style.display=\'none\'"><span class="rating">FREE</span></div><div class="card-title">'+esc(x.title||x.identifier)+'</div><div class="card-meta">'+esc(x.year||'Year unknown')+' · '+esc(x.creator||'Internet Archive')+'</div></article>'}
async function search(reset=true){
 if(state.busy)return;
 if(reset){state.page=1;state.items=[];$('grid').innerHTML=''}
 state.busy=true;$('loadMore').classList.add('hidden');status('Finding full-length films with reusable rights…');
 try{
  const terms='mediatype:movies AND (licenseurl:http*publicdomain* OR licenseurl:http*zero/1.0* OR licenseurl:http*licenses/by/* OR licenseurl:http*licenses/by-sa/*)';
  const q=state.query?terms+' AND (title:"'+state.query.replace(/[()+\-!{}\[\]^"~*?:\\/]/g,' ').replace(/\s+/g,' ').trim()+'" OR subject:"'+state.query.replace(/[()+\-!{}\[\]^"~*?:\\/]/g,' ').trim()+'")':terms;
  const url=IA+'/advancedsearch.php?q='+encodeURIComponent(q)+'&fl[]=identifier&fl[]=title&fl[]=year&fl[]=creator&fl[]=licenseurl&rows='+PAGE_SIZE+'&page='+state.page+'&output=json';
  const res=await fetch(url);if(!res.ok)throw Error('Internet Archive search failed ('+res.status+').');
  const data=await res.json();const docs=(data.response?.docs||[]).filter(x=>x.identifier&&allowedLicense(x.licenseurl));
  state.total=data.response?.numFound||0;state.items.push(...docs);
  $('grid').innerHTML=state.items.map(card).join('');
  status(docs.length?state.total.toLocaleString()+' rights-labelled film records found. Open a title to check its video file and play.':'No matching films found. Try a broader search.');
  $('loadMore').classList.toggle('hidden',state.items.length>=state.total||docs.length===0);
 }catch(e){status(e.message);toast(e.message)}
 finally{state.busy=false}
}
function videoFiles(files){
 const vids=(files||[]).filter(f=>f.name&&!f.name.includes('__ia_thumb')&&(/\.mp4$/i.test(f.name)||/\.webm$/i.test(f.name)||/\.ogv$/i.test(f.name))&&(/mpeg4|h\.264|webm|ogg|video/i.test(f.format||'')||/\.(mp4|webm|ogv)$/i.test(f.name)));
 vids.sort((a,b)=>{const score=f=>(/\.mp4$/i.test(f.name)?100:0)+(/512kb|360p|480p|720p/i.test(f.name)?20:0)-(/original/i.test(f.name)?0:0);return score(b)-score(a)});
 return vids;
}
async function openFilm(id){
 try{
  $('detailContent').innerHTML='<div class="player-loading">Checking rights and playable video files…</div>';$('detailModal').classList.remove('hidden');
  const r=await fetch(IA+'/metadata/'+encodeURIComponent(id));if(!r.ok)throw Error('Could not load this Archive record.');
  const item=await r.json(),m=item.metadata||{},lic=m.licenseurl||'';
  if(!allowedLicense(lic))throw Error('This item does not show a supported public-domain or Creative Commons licence, so playback is disabled.');
  const files=videoFiles(item.files),chosen=files[0];
  if(!chosen)throw Error('No browser-playable MP4, WebM or OGV file was found for this record.');
  const stream=IA+'/download/'+encodeURIComponent(id)+'/'+chosen.name.split('/').map(encodeURIComponent).join('/');
  const title=m.title||id,desc=String(m.description||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,1000);
  const captions=(item.files||[]).filter(f=>/\.vtt$/i.test(f.name||'')).slice(0,4);
  $('detailContent').innerHTML='<div class="watch-layout"><div class="watch-player"><video id="filmPlayer" controls playsinline preload="metadata" poster="'+poster(id)+'"><source src="'+stream+'" type="'+(chosen.name.toLowerCase().endsWith('.webm')?'video/webm':chosen.name.toLowerCase().endsWith('.ogv')?'video/ogg':'video/mp4')+'">'+captions.map(c=>'<track kind="subtitles" src="'+IA+'/download/'+encodeURIComponent(id)+'/'+c.name.split('/').map(encodeURIComponent).join('/')+'" srclang="en" label="English">').join('')+'</video></div><div class="watch-info"><span class="eyebrow">FULL-LENGTH FILM · INTERNET ARCHIVE</span><h2>'+esc(title)+'</h2><div class="detail-meta">'+esc(m.year||m.date||'Date unknown')+' · '+esc(m.runtime||'Runtime not listed')+'</div><p>'+esc(desc||'No description supplied.')+'</p><div class="license-note"><b>Rights label:</b> <a href="'+esc(lic)+'" target="_blank" rel="noopener">View licence ↗</a><br><small>Licence information is supplied by the uploader. Verify the rights before reuse or redistribution.</small></div><div class="detail-actions"><a class="secondary-btn" href="'+IA+'/details/'+encodeURIComponent(id)+'" target="_blank" rel="noopener">Open Archive record ↗</a></div></div></div>';
  $('filmPlayer').addEventListener('error',()=>toast('This file could not be played in this browser. Try the Archive record link.'));
 }catch(e){$('detailContent').innerHTML='<div class="player-loading">'+esc(e.message)+'</div>';toast(e.message)}
}
function doSearch(){state.query=$('searchInput').value.trim();$('sectionTitle').textContent=state.query?'Search results':'Free full-length films';$('sectionEyebrow').textContent='PUBLIC DOMAIN & CREATIVE COMMONS';search(true)}
$('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch()});
$('searchInput').addEventListener('input',()=>{clearTimeout(window._searchTimer);window._searchTimer=setTimeout(doSearch,650)});
$('loadMore').addEventListener('click',()=>{state.page++;search(false)});
$('refreshBtn').addEventListener('click',()=>{state.query='';$('searchInput').value='';doSearch()});
document.addEventListener('click',e=>{if(e.target.dataset.close)$('detailModal').classList.add('hidden');const c=e.target.closest('.movie-card');if(c)openFilm(c.dataset.id)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('detailModal').classList.add('hidden')});
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
search();
