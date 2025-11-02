const KEY = 'top4Albums';
const KEY_SONGS = 'top5Songs';
const albumsList = document.getElementById('albumsList');
const profilePreview = document.getElementById('profilePreview');
const songsList = document.getElementById('songsList');
const songsPreview = document.getElementById('songsPreview');
// avatar/profile image
const KEY_AVATAR = 'profileImage';
const avatarInput = document.getElementById('avatarInput');
const avatarPreviewImg = document.getElementById('avatarPreviewImg');
// reviews
const KEY_REVIEWS = 'reviews';
let editingReviewId = null;
let currentReviewRating = 0;


function createAlbumRow(index, data = {}){
  const wrapper = document.createElement('div');
  wrapper.className = 'album-row';

  const titleWrap = document.createElement('div');
  const titleLabel = document.createElement('label');
  titleLabel.textContent = `Album ${index + 1} title`;
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.name = `title-${index}`;
  titleInput.value = data.title || '';

  titleWrap.appendChild(titleLabel);
  titleWrap.appendChild(titleInput);

  const artistWrap = document.createElement('div');
  const artistLabel = document.createElement('label');
  artistLabel.textContent = `Artist`;
  const artistInput = document.createElement('input');
  artistInput.type = 'text';
  artistInput.name = `artist-${index}`;
  artistInput.value = data.artist || '';

  artistWrap.appendChild(artistLabel);
  artistWrap.appendChild(artistInput);

  const actions = document.createElement('div');
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn';
  removeBtn.textContent = 'Clear';
  removeBtn.addEventListener('click', ()=>{
    titleInput.value = '';
    artistInput.value = '';
  });
  actions.appendChild(removeBtn);

  wrapper.appendChild(titleWrap);
  wrapper.appendChild(artistWrap);
  wrapper.appendChild(actions);
  return wrapper;
}

function buildForm(){
  albumsList.innerHTML = '';
  for(let i=0;i<4;i++){
    albumsList.appendChild(createAlbumRow(i));
  }
}

function createSongRow(index, data = {}){
  const wrapper = document.createElement('div');
  wrapper.className = 'album-row';

  const titleWrap = document.createElement('div');
  const titleLabel = document.createElement('label');
  titleLabel.textContent = `Song ${index + 1} title`;
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.name = `song-title-${index}`;
  titleInput.value = data.title || '';

  titleWrap.appendChild(titleLabel);
  titleWrap.appendChild(titleInput);

  const artistWrap = document.createElement('div');
  const artistLabel = document.createElement('label');
  artistLabel.textContent = `Artist`;
  const artistInput = document.createElement('input');
  artistInput.type = 'text';
  artistInput.name = `song-artist-${index}`;
  artistInput.value = data.artist || '';

  artistWrap.appendChild(artistLabel);
  artistWrap.appendChild(artistInput);

  const actions = document.createElement('div');
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn';
  removeBtn.textContent = 'Clear';
  removeBtn.addEventListener('click', ()=>{
    titleInput.value = '';
    artistInput.value = '';
  });
  actions.appendChild(removeBtn);

  wrapper.appendChild(titleWrap);
  wrapper.appendChild(artistWrap);
  wrapper.appendChild(actions);
  return wrapper;
}

function buildSongsForm(){
  songsList.innerHTML = '';
  for(let i=0;i<5;i++){
    songsList.appendChild(createSongRow(i));
  }
}

function getFormData(){
  const arr = [];
  for(let i=0;i<4;i++){
    const title = (document.querySelector(`[name=title-${i}]`)?.value || '').trim();
    const artist = (document.querySelector(`[name=artist-${i}]`)?.value || '').trim();
    arr.push({title, artist});
  }
  return arr;
}

function getSongsFormData(){
  const arr = [];
  for(let i=0;i<5;i++){
    const title = (document.querySelector(`[name=song-title-${i}]`)?.value || '').trim();
    const artist = (document.querySelector(`[name=song-artist-${i}]`)?.value || '').trim();
    arr.push({title, artist});
  }
  return arr;
}

function saveProfile(){
  const data = getFormData();
  // basic validation - require at least one non-empty title
  if(!data.some(a=>a.title || a.artist)){
    alert('Please enter at least one album or artist.');
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(data));
  renderProfile();
  // refresh review target dropdowns
  try{ populateReviewTargetItems(); }catch(e){}
  alert('Profile saved locally.');
}

function saveSongs(){
  const data = getSongsFormData();
  if(!data.some(s=>s.title || s.artist)){
    alert('Please enter at least one song or artist.');
    return;
  }
  localStorage.setItem(KEY_SONGS, JSON.stringify(data));
  renderSongs();
  try{ populateReviewTargetItems(); }catch(e){}
  alert('Songs saved locally.');
}

function clearProfile(){
  if(confirm('Clear saved profile and form?')){
    localStorage.removeItem(KEY);
    buildForm();
    renderProfile();
  }
}

function clearSongs(){
  if(confirm('Clear saved songs and form?')){
    localStorage.removeItem(KEY_SONGS);
    buildSongsForm();
    renderSongs();
  }
}

function renderProfile(){
  const raw = localStorage.getItem(KEY);
  profilePreview.innerHTML = '';
  if(!raw){
    profilePreview.innerHTML = '<p class="empty">No profile saved yet.</p>';
    return;
  }
  let data;
  try{ data = JSON.parse(raw); }catch(e){ profilePreview.innerHTML = '<p class="empty">Bad saved data</p>'; return; }
  if(!Array.isArray(data) || data.length===0){ profilePreview.innerHTML = '<p class="empty">No profile saved yet.</p>'; return; }

  data.forEach((entry, i)=>{
    const item = document.createElement('div');
    item.className = 'item';
    const idx = document.createElement('div');
    idx.className = 'idx';
    idx.textContent = `${i+1}.`;
    const meta = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = entry.title || '(untitled)';
    const artist = document.createElement('div');
    artist.className = 'artist';
    artist.textContent = entry.artist ? `by ${entry.artist}` : '';
    meta.appendChild(title);
    meta.appendChild(artist);
    item.appendChild(idx);
    item.appendChild(meta);
    profilePreview.appendChild(item);
  });
}

function renderSongs(){
  const raw = localStorage.getItem(KEY_SONGS);
  songsPreview.innerHTML = '';
  if(!raw){
    songsPreview.innerHTML = '<p class="empty">No songs saved yet.</p>';
    return;
  }
  let data;
  try{ data = JSON.parse(raw); }catch(e){ songsPreview.innerHTML = '<p class="empty">Bad saved data</p>'; return; }
  if(!Array.isArray(data) || data.length===0){ songsPreview.innerHTML = '<p class="empty">No songs saved yet.</p>'; return; }

  data.forEach((entry, i)=>{
    const item = document.createElement('div');
    item.className = 'item';
    const idx = document.createElement('div');
    idx.className = 'idx';
    idx.textContent = `${i+1}.`;
    const meta = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = entry.title || '(untitled)';
    const artist = document.createElement('div');
    artist.className = 'artist';
    artist.textContent = entry.artist ? `by ${entry.artist}` : '';

    meta.appendChild(title);
    meta.appendChild(artist);
    item.appendChild(idx);
    item.appendChild(meta);
    songsPreview.appendChild(item);
  });
}

// Avatar handling: store image as data URL in localStorage
function handleAvatarFile(file, cb){
  if(!file) return cb && cb(new Error('No file'));
  // limit size to ~2MB for localStorage friendliness
  const maxBytes = 2 * 1024 * 1024;
  if(file.size > maxBytes) return cb && cb(new Error('File too large (max 2MB)'));
  const reader = new FileReader();
  reader.onload = e => cb && cb(null, e.target.result);
  reader.onerror = e => cb && cb(new Error('Failed reading file'));
  reader.readAsDataURL(file);
}

function saveAvatar(dataUrl){
  if(!dataUrl) return;
  localStorage.setItem(KEY_AVATAR, dataUrl);
  renderAvatar();
}

function removeAvatar(){
  localStorage.removeItem(KEY_AVATAR);
  renderAvatar();
}

function renderAvatar(){
  const data = localStorage.getItem(KEY_AVATAR);
  if(!data){
    avatarPreviewImg.style.display = 'none';
    const empty = avatarPreviewImg.parentElement.querySelector('.avatar-empty');
    if(empty) empty.style.display = 'block';
    return;
  }
  avatarPreviewImg.src = data;
  avatarPreviewImg.style.display = 'block';
  const empty = avatarPreviewImg.parentElement.querySelector('.avatar-empty');
  if(empty) empty.style.display = 'none';
}

function exportAvatar(){
  const data = localStorage.getItem(KEY_AVATAR);
  if(!data){ alert('No avatar to export'); return; }
  // data is a Data URL: convert to blob
  fetch(data).then(res=>res.blob()).then(blob=>{
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile-image.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }).catch(()=>alert('Export failed'));
}

function importAvatar(file){
  handleAvatarFile(file, (err, dataUrl)=>{
    if(err){ alert('Import failed: ' + err.message); return; }
    saveAvatar(dataUrl);
    alert('Imported avatar.');
  });
}

function exportProfile(){
  const raw = localStorage.getItem(KEY) || '[]';
  const blob = new Blob([raw], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'top4Albums.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importProfile(file){
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const data = JSON.parse(e.target.result);
      if(!Array.isArray(data)) throw new Error('JSON must be an array');
      // write to storage and populate form
      localStorage.setItem(KEY, JSON.stringify(data.slice(0,4)));
      populateFormFromStorage();
      renderProfile();
      alert('Imported profile successfully.');
    }catch(err){
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function populateFormFromStorage(){
  const raw = localStorage.getItem(KEY);
  if(!raw){ buildForm(); return; }
  let data;
  try{ data = JSON.parse(raw); }catch(e){ buildForm(); return; }
  buildForm();
  data = data || [];
  for(let i=0;i<4;i++){
    const t = document.querySelector(`[name=title-${i}]`);
    const a = document.querySelector(`[name=artist-${i}]`);
    if(t) t.value = (data[i] && data[i].title) ? data[i].title : '';
    if(a) a.value = (data[i] && data[i].artist) ? data[i].artist : '';
    // only populate title and artist for albums (reviews are managed in the Reviews section)
  }
}

// init
document.addEventListener('DOMContentLoaded', ()=>{
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importInput = document.getElementById('importInput');
  const saveSongsBtn = document.getElementById('saveSongsBtn');
  const clearSongsBtn = document.getElementById('clearSongsBtn');
  const exportSongsBtn = document.getElementById('exportSongsBtn');
  const importSongsInput = document.getElementById('importSongsInput');
  // avatar controls
  const saveAvatarBtn = document.getElementById('saveAvatarBtn');
  const removeAvatarBtn = document.getElementById('removeAvatarBtn');
  const exportAvatarBtn = document.getElementById('exportAvatarBtn');
  const importAvatarInput = document.getElementById('importAvatarInput');

  buildForm();
  populateFormFromStorage();
  renderProfile();
  buildSongsForm();
  populateSongsFromStorage();
  renderSongs();
  // avatar init
  populateSongsFromStorage();
  // wire avatar events
  if(avatarInput){
    avatarInput.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if(f) handleAvatarFile(f, (err, dataUrl)=>{ if(err) alert(err.message); else avatarPreviewImg.src = dataUrl; });
      e.target.value = null;
    });
  }
  if(saveAvatarBtn) saveAvatarBtn.addEventListener('click', ()=>{
    // if preview has src use it
    if(avatarPreviewImg && avatarPreviewImg.src) saveAvatar(avatarPreviewImg.src);
    else alert('Please choose an image first.');
  });
  if(removeAvatarBtn) removeAvatarBtn.addEventListener('click', removeAvatar);
  if(exportAvatarBtn) exportAvatarBtn.addEventListener('click', exportAvatar);
  if(importAvatarInput) importAvatarInput.addEventListener('change', (e)=>{ const f = e.target.files && e.target.files[0]; if(f) importAvatar(f); e.target.value = null; });
  renderAvatar();

  saveBtn.addEventListener('click', saveProfile);
  clearBtn.addEventListener('click', clearProfile);
  exportBtn.addEventListener('click', exportProfile);
  importInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) importProfile(f);
    e.target.value = null;
  });
  saveSongsBtn.addEventListener('click', saveSongs);
  clearSongsBtn.addEventListener('click', clearSongs);
  exportSongsBtn.addEventListener('click', ()=>{
    const raw = localStorage.getItem(KEY_SONGS) || '[]';
    const blob = new Blob([raw], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top5Songs.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
  importSongsInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) importSongs(f);
    e.target.value = null;
  });
  // reviews wiring
  const reviewType = document.getElementById('reviewTargetType');
  const reviewAddBtn = document.getElementById('addReviewBtn');
  const reviewClearBtn = document.getElementById('clearReviewFormBtn');
  const reviewExportBtn = document.getElementById('exportReviewsBtn');
  const reviewImportInput = document.getElementById('importReviewsInput');
  if(reviewType) reviewType.addEventListener('change', populateReviewTargetItems);
  buildReviewRatingControl();
  populateReviewTargetItems();
  renderReviews();
  if(reviewAddBtn) reviewAddBtn.addEventListener('click', addOrSaveReview);
  if(reviewClearBtn) reviewClearBtn.addEventListener('click', clearReviewForm);
  if(reviewExportBtn) reviewExportBtn.addEventListener('click', exportReviews);
  if(reviewImportInput) reviewImportInput.addEventListener('change', (e)=>{ const f = e.target.files && e.target.files[0]; if(f) importReviews(f); e.target.value = null; });
});

function populateSongsFromStorage(){
  const raw = localStorage.getItem(KEY_SONGS);
  if(!raw){ buildSongsForm(); return; }
  let data;
  try{ data = JSON.parse(raw); }catch(e){ buildSongsForm(); return; }
  buildSongsForm();
  data = data || [];
  for(let i=0;i<5;i++){
    const t = document.querySelector(`[name=song-title-${i}]`);
    const a = document.querySelector(`[name=song-artist-${i}]`);
    if(t) t.value = (data[i] && data[i].title) ? data[i].title : '';
    if(a) a.value = (data[i] && data[i].artist) ? data[i].artist : '';
    // only populate title and artist for songs (reviews are managed in the Reviews section)
  }
}

function importSongs(file){
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const data = JSON.parse(e.target.result);
      if(!Array.isArray(data)) throw new Error('JSON must be an array');
      localStorage.setItem(KEY_SONGS, JSON.stringify(data.slice(0,5)));
      populateSongsFromStorage();
      renderSongs();
      alert('Imported songs successfully.');
    }catch(err){
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* -------- Reviews functionality -------- */
function loadReviews(){
  try{ return JSON.parse(localStorage.getItem(KEY_REVIEWS) || '[]'); }catch(e){ return []; }
}
function saveReviews(arr){ localStorage.setItem(KEY_REVIEWS, JSON.stringify(arr)); }

function populateReviewTargetItems(){
  const typeSel = document.getElementById('reviewTargetType');
  const itemSel = document.getElementById('reviewTargetItem');
  if(!typeSel || !itemSel) return;
  const type = typeSel.value;
  itemSel.innerHTML = '';
  if(type === 'album'){
    const raw = localStorage.getItem(KEY) || '[]';
    let arr = [];
    try{ arr = JSON.parse(raw); }catch(e){ arr = []; }
    if(arr.length===0){ const opt = document.createElement('option'); opt.value='0'; opt.textContent='(no albums saved)'; itemSel.appendChild(opt); return; }
    arr.forEach((a,i)=>{ const opt = document.createElement('option'); opt.value = i; opt.textContent = `${i+1}. ${a.title || '(untitled)'}`; itemSel.appendChild(opt); });
  } else {
    const raw = localStorage.getItem(KEY_SONGS) || '[]';
    let arr = [];
    try{ arr = JSON.parse(raw); }catch(e){ arr = []; }
    if(arr.length===0){ const opt = document.createElement('option'); opt.value='0'; opt.textContent='(no songs saved)'; itemSel.appendChild(opt); return; }
    arr.forEach((s,i)=>{ const opt = document.createElement('option'); opt.value = i; opt.textContent = `${i+1}. ${s.title || '(untitled)'}`; itemSel.appendChild(opt); });
  }
}

function buildReviewRatingControl(){
  const container = document.getElementById('reviewRating');
  if(!container) return;
  container.innerHTML = '';
  currentReviewRating = 0;
  for(let s=1;s<=5;s++){
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '★';
    star.dataset.value = s;
    star.addEventListener('click', ()=>{
      currentReviewRating = s;
      [...container.querySelectorAll('.star')].forEach(sp=> sp.classList.toggle('filled', Number(sp.dataset.value) <= s));
    });
    container.appendChild(star);
  }
}

function clearReviewForm(){
  editingReviewId = null;
  currentReviewRating = 0;
  const typeSel = document.getElementById('reviewTargetType');
  const text = document.getElementById('reviewText');
  if(typeSel) typeSel.value = 'album';
  if(text) text.value = '';
  buildReviewRatingControl();
  const addBtn = document.getElementById('addReviewBtn');
  if(addBtn) addBtn.textContent = 'Add Review';
  populateReviewTargetItems();
}

function addOrSaveReview(){
  const typeSel = document.getElementById('reviewTargetType');
  const itemSel = document.getElementById('reviewTargetItem');
  const textEl = document.getElementById('reviewText');
  if(!typeSel || !itemSel || !textEl) return;
  const targetType = typeSel.value;
  const targetIndex = Number(itemSel.value || 0);
  const text = textEl.value.trim();
  const rating = Number(currentReviewRating || 0);
  if(!text && rating===0){ alert('Please add a rating or some review text.'); return; }
  const reviews = loadReviews();
  if(editingReviewId){
    const idx = reviews.findIndex(r=> r.id === editingReviewId);
    if(idx >= 0){ reviews[idx].targetType = targetType; reviews[idx].targetIndex = targetIndex; reviews[idx].rating = rating; reviews[idx].text = text; reviews[idx].updatedAt = new Date().toISOString(); }
    editingReviewId = null;
  } else {
    const review = { id: Date.now().toString(), targetType, targetIndex, rating, text, createdAt: new Date().toISOString() };
    reviews.unshift(review);
  }
  saveReviews(reviews);
  renderReviews();
  clearReviewForm();
}

function renderReviews(){
  const container = document.getElementById('reviewsList');
  if(!container) return;
  const reviews = loadReviews();
  container.innerHTML = '';
  if(!reviews || reviews.length===0){ container.innerHTML = '<p class="empty">No reviews yet.</p>'; return; }
  reviews.forEach(r => {
    const item = document.createElement('div'); item.className = 'review-item';
    const meta = document.createElement('div'); meta.className = 'meta';
    const target = document.createElement('div'); target.className = 'target';
    // resolve target title
    let title = '(unknown)';
    if(r.targetType === 'album'){
      try{ const arr = JSON.parse(localStorage.getItem(KEY) || '[]'); if(arr[r.targetIndex]) title = `${r.targetIndex+1}. ${arr[r.targetIndex].title || '(untitled)'}`; }
      catch(e){}
    } else {
      try{ const arr = JSON.parse(localStorage.getItem(KEY_SONGS) || '[]'); if(arr[r.targetIndex]) title = `${r.targetIndex+1}. ${arr[r.targetIndex].title || '(untitled)'}`; }
      catch(e){}
    }
    target.textContent = `${r.targetType === 'album' ? 'Album' : 'Song'} — ${title}`;
    meta.appendChild(target);
    // stars
    const ratingWrap = document.createElement('div'); ratingWrap.className = 'rating';
    for(let s=1;s<=5;s++){ const star = document.createElement('span'); star.className = 'star' + ((r.rating||0) >= s ? ' filled':''); star.textContent = '★'; ratingWrap.appendChild(star); }
    meta.appendChild(ratingWrap);
    // text
    const txt = document.createElement('div'); txt.className = 'review-text'; txt.textContent = r.text || '';
    meta.appendChild(txt);
    // controls
    const controls = document.createElement('div'); controls.className = 'review-controls';
    const editBtn = document.createElement('button'); editBtn.className = 'btn'; editBtn.textContent = 'Edit'; editBtn.addEventListener('click', ()=> editReview(r.id));
    const delBtn = document.createElement('button'); delBtn.className = 'btn'; delBtn.textContent = 'Delete'; delBtn.addEventListener('click', ()=>{ if(confirm('Delete this review?')){ deleteReview(r.id); } });
    controls.appendChild(editBtn); controls.appendChild(delBtn);
    item.appendChild(meta); item.appendChild(controls);
    container.appendChild(item);
  });
}

function editReview(id){
  const reviews = loadReviews();
  const r = reviews.find(rr=> rr.id === id); if(!r) return;
  editingReviewId = id;
  const typeSel = document.getElementById('reviewTargetType');
  const itemSel = document.getElementById('reviewTargetItem');
  const textEl = document.getElementById('reviewText');
  if(typeSel) typeSel.value = r.targetType;
  populateReviewTargetItems();
  if(itemSel) itemSel.value = r.targetIndex;
  if(textEl) textEl.value = r.text || '';
  // set rating visuals
  currentReviewRating = Number(r.rating || 0);
  const container = document.getElementById('reviewRating');
  if(container){ [...container.querySelectorAll('.star')].forEach(sp=> sp.classList.toggle('filled', Number(sp.dataset.value) <= currentReviewRating)); }
  const addBtn = document.getElementById('addReviewBtn'); if(addBtn) addBtn.textContent = 'Save Review';
}

function deleteReview(id){
  const arr = loadReviews().filter(r=> r.id !== id);
  saveReviews(arr);
  renderReviews();
}

function exportReviews(){
  const raw = localStorage.getItem(KEY_REVIEWS) || '[]';
  const blob = new Blob([raw], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'reviews.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function importReviews(file){
  const reader = new FileReader();
  reader.onload = e => {
    try{ const data = JSON.parse(e.target.result); if(!Array.isArray(data)) throw new Error('JSON must be an array'); saveReviews(data); renderReviews(); alert('Imported reviews'); }
    catch(err){ alert('Import failed: '+err.message); }
  };
  reader.readAsText(file);
}
