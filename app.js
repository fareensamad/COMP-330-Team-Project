import { getTopAlbums, updateTopAlbums, getTopSongs, updateTopSongs, createReview, getUserReviews, updateReview, deleteReview as dbDeleteReview, getCurrentUserId, getOrCreateProfile, updateProfilePicture, getProfilePicture } from './src/db/dbHelper.js';
import { databases } from './src/appwrite.js';

const albumsList = document.getElementById('albumsList');
const profilePreview = document.getElementById('profilePreview');
const songsList = document.getElementById('songsList');
const songsPreview = document.getElementById('songsPreview');

// Avatar/profile image - now using Appwrite database
const avatarInput = document.getElementById('avatarInput');
const avatarPreviewImg = document.getElementById('avatarPreviewImg');

// Reviews
let editingReviewId = null;
let currentReviewRating = 0;

// ========== ALBUMS ==========

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
  for(let i=0;i<5;i++){
    albumsList.appendChild(createAlbumRow(i));
  }
}

function getFormData(){
  const arr = [];
  for(let i=0;i<5;i++){
    const title = (document.querySelector(`[name=title-${i}]`)?.value || '').trim();
    const artist = (document.querySelector(`[name=artist-${i}]`)?.value || '').trim();
    arr.push({title, artist});
  }
  return arr;
}

async function saveProfile(){
  try {
    const data = getFormData();
    if(!data.some(a=>a.title || a.artist)){
      alert('Please enter at least one album or artist.');
      return;
    }
    
    await updateTopAlbums(data);
    await renderProfile();
    alert('Albums saved successfully!');
  } catch (error) {
    console.error('Save error:', error);
    alert('Failed to save albums: ' + error.message);
  }
}

async function clearProfile(){
  if(confirm('Clear saved profile and form?')){
    try {
      await updateTopAlbums([]);
      buildForm();
      await renderProfile();
    } catch (error) {
      console.error('Clear error:', error);
      alert('Failed to clear albums: ' + error.message);
    }
  }
}

async function renderProfile(){
  try {
    profilePreview.innerHTML = '<p class="empty">Loading...</p>';
    const data = await getTopAlbums();
    
    profilePreview.innerHTML = '';
    
    if(!data || !Array.isArray(data) || data.length === 0 || !data.some(a => a.title || a.artist)){
      profilePreview.innerHTML = '<p class="empty">No albums saved yet.</p>';
      return;
    }

    data.forEach((entry, i)=>{
      if(!entry.title && !entry.artist) return;
      
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
  } catch (error) {
    console.error('Render error:', error);
    profilePreview.innerHTML = '<p class="empty">Error loading albums.</p>';
  }
}

async function exportProfile(){
  try {
    const data = await getTopAlbums();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top5Albums.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export: ' + error.message);
  }
}

async function importProfile(file){
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{
      const data = JSON.parse(e.target.result);
      if(!Array.isArray(data)) throw new Error('JSON must be an array');
      
      await updateTopAlbums(data.slice(0,5));
      await populateFormFromDatabase();
      await renderProfile();
      alert('Imported albums successfully.');
    }catch(err){
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

async function populateFormFromDatabase(){
  try {
    const data = await getTopAlbums();
    buildForm();
    
    if(!data || !Array.isArray(data)) return;
    
    for(let i=0; i<5; i++){
      const t = document.querySelector(`[name=title-${i}]`);
      const a = document.querySelector(`[name=artist-${i}]`);
      if(t) t.value = (data[i] && data[i].title) ? data[i].title : '';
      if(a) a.value = (data[i] && data[i].artist) ? data[i].artist : '';
    }
  } catch (error) {
    console.error('Populate error:', error);
    buildForm();
  }
}

// ========== SONGS ==========

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

function getSongsFormData(){
  const arr = [];
  for(let i=0;i<5;i++){
    const title = (document.querySelector(`[name=song-title-${i}]`)?.value || '').trim();
    const artist = (document.querySelector(`[name=song-artist-${i}]`)?.value || '').trim();
    arr.push({title, artist});
  }
  return arr;
}

async function saveSongs(){
  try {
    const data = getSongsFormData();
    if(!data.some(s=>s.title || s.artist)){
      alert('Please enter at least one song or artist.');
      return;
    }
    
    await updateTopSongs(data);
    await renderSongs();
    alert('Songs saved successfully!');
  } catch (error) {
    console.error('Save songs error:', error);
    alert('Failed to save songs: ' + error.message);
  }
}

async function clearSongs(){
  if(confirm('Clear saved songs and form?')){
    try {
      await updateTopSongs([]);
      buildSongsForm();
      await renderSongs();
    } catch (error) {
      console.error('Clear songs error:', error);
      alert('Failed to clear songs: ' + error.message);
    }
  }
}

async function renderSongs(){
  try {
    songsPreview.innerHTML = '<p class="empty">Loading...</p>';
    const data = await getTopSongs();
    
    songsPreview.innerHTML = '';
    
    if(!data || !Array.isArray(data) || data.length === 0 || !data.some(s => s.title || s.artist)){
      songsPreview.innerHTML = '<p class="empty">No songs saved yet.</p>';
      return;
    }

    data.forEach((entry, i)=>{
      if(!entry.title && !entry.artist) return;
      
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
  } catch (error) {
    console.error('Render songs error:', error);
    songsPreview.innerHTML = '<p class="empty">Error loading songs.</p>';
  }
}

async function populateSongsFromDatabase(){
  try {
    const data = await getTopSongs();
    buildSongsForm();
    
    if(!data || !Array.isArray(data)) return;
    
    for(let i=0; i<5; i++){
      const t = document.querySelector(`[name=song-title-${i}]`);
      const a = document.querySelector(`[name=song-artist-${i}]`);
      if(t) t.value = (data[i] && data[i].title) ? data[i].title : '';
      if(a) a.value = (data[i] && data[i].artist) ? data[i].artist : '';
    }
  } catch (error) {
    console.error('Populate songs error:', error);
    buildSongsForm();
  }
}

async function importSongs(file){
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{
      const data = JSON.parse(e.target.result);
      if(!Array.isArray(data)) throw new Error('JSON must be an array');
      
      await updateTopSongs(data.slice(0,5));
      await populateSongsFromDatabase();
      await renderSongs();
      alert('Imported songs successfully.');
    }catch(err){
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ========== AVATAR (Using Appwrite Database) ==========

function handleAvatarFile(file, cb){
  if(!file) return cb && cb(new Error('No file'));
  const maxBytes = 2 * 1024 * 1024;
  if(file.size > maxBytes) return cb && cb(new Error('File too large (max 2MB)'));
  const reader = new FileReader();
  reader.onload = e => cb && cb(null, e.target.result);
  reader.onerror = e => cb && cb(new Error('Failed reading file'));
  reader.readAsDataURL(file);
}

async function saveAvatar(dataUrl){
  if(!dataUrl) return;
  try {
    await updateProfilePicture(dataUrl);
    await renderAvatar();
    alert('Profile picture saved!');
  } catch (error) {
    console.error('Save avatar error:', error);
    alert('Failed to save profile picture: ' + error.message);
  }
}

async function removeAvatar(){
  try {
    await updateProfilePicture('');
    await renderAvatar();
  } catch (error) {
    console.error('Remove avatar error:', error);
    alert('Failed to remove avatar: ' + error.message);
  }
}

async function renderAvatar(){
  try {
    const data = await getProfilePicture();
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
  } catch (error) {
    console.error('Render avatar error:', error);
  }
}

async function exportAvatar(){
  try {
    const data = await getProfilePicture();
    if(!data){ alert('No avatar to export'); return; }
    const response = await fetch(data);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile-image.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export avatar error:', error);
    alert('Export failed: ' + error.message);
  }
}

function importAvatar(file){
  handleAvatarFile(file, async (err, dataUrl)=>{
    if(err){ alert('Import failed: ' + err.message); return; }
    await saveAvatar(dataUrl);
  });
}

// ========== REVIEWS (Using Appwrite Database) ==========

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
  const nameEl = document.getElementById('reviewTargetName');
  const artistEl = document.getElementById('reviewTargetArtist');
  if(nameEl) nameEl.value = '';
  if(artistEl) artistEl.value = '';
  buildReviewRatingControl();
  const addBtn = document.getElementById('addReviewBtn');
  if(addBtn) addBtn.textContent = 'Add Review';
}

async function addOrSaveReview(){
  const typeSel = document.getElementById('reviewTargetType');
  const nameEl = document.getElementById('reviewTargetName');
  const artistEl = document.getElementById('reviewTargetArtist');
  const textEl = document.getElementById('reviewText');
  if(!typeSel || !nameEl || !artistEl || !textEl) return;
  
  const targetName = (nameEl.value || '').trim();
  const targetArtist = (artistEl.value || '').trim();
  const text = textEl.value.trim();
  const rating = Number(currentReviewRating || 0);
  
  if(!targetName){ alert('Please enter the album or song title.'); return; }
  if(!text && rating===0){ alert('Please add a rating or some review text.'); return; }
  
  try {
    if(editingReviewId){
      // Update existing review
      await updateReview(editingReviewId, {
        albumName: targetName,
        artistName: targetArtist,
        reviewText: text,
        rating: rating
      });
      editingReviewId = null;
    } else {
      // Create new review
      await createReview(targetName, targetArtist, text, rating);
    }
    
    await renderReviews();
    clearReviewForm();
  } catch (error) {
    console.error('Review save error:', error);
    alert('Failed to save review: ' + error.message);
  }
}

async function renderReviews(){
  const container = document.getElementById('reviewsList');
  if(!container) return;
  
  try {
    container.innerHTML = '<p class="empty">Loading...</p>';
    const reviews = await getUserReviews();
    
    container.innerHTML = '';
    
    if(!reviews || reviews.length===0){ 
      container.innerHTML = '<p class="empty">No reviews yet.</p>'; 
      return; 
    }
    
    reviews.forEach(r => {
      const item = document.createElement('div'); 
      item.className = 'review-item';
      const meta = document.createElement('div'); 
      meta.className = 'meta';
      const target = document.createElement('div'); 
      target.className = 'target';
      
      const title = r.albumName + (r.artistName ? ` — ${r.artistName}` : '');
      target.textContent = `${r.albumName ? 'Album/Song' : 'Review'} — ${title}`;
      meta.appendChild(target);
      
      // Stars
      const ratingWrap = document.createElement('div'); 
      ratingWrap.className = 'rating';
      for(let s=1;s<=5;s++){ 
        const star = document.createElement('span'); 
        star.className = 'star' + ((r.rating||0) >= s ? ' filled':''); 
        star.textContent = '★'; 
        ratingWrap.appendChild(star); 
      }
      meta.appendChild(ratingWrap);
      
      // Text
      const txt = document.createElement('div'); 
      txt.className = 'review-text'; 
      txt.textContent = r.reviewText || '';
      meta.appendChild(txt);
      
      // Controls
      const controls = document.createElement('div'); 
      controls.className = 'review-controls';
      const editBtn = document.createElement('button'); 
      editBtn.className = 'btn'; 
      editBtn.textContent = 'Edit'; 
      editBtn.addEventListener('click', ()=> editReview(r.$id));
      const delBtn = document.createElement('button'); 
      delBtn.className = 'btn'; 
      delBtn.textContent = 'Delete'; 
      delBtn.addEventListener('click', async ()=>{ 
        if(confirm('Delete this review?')){ 
          await deleteReview(r.$id); 
        } 
      });
      controls.appendChild(editBtn); 
      controls.appendChild(delBtn);
      item.appendChild(meta); 
      item.appendChild(controls);
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Render reviews error:', error);
    container.innerHTML = '<p class="empty">Error loading reviews.</p>';
  }
}

async function editReview(id){
  try {
    const reviews = await getUserReviews();
    const r = reviews.find(rr=> rr.$id === id); 
    if(!r) return;
    
    editingReviewId = id;
    const typeSel = document.getElementById('reviewTargetType');
    const nameEl = document.getElementById('reviewTargetName');
    const artistEl = document.getElementById('reviewTargetArtist');
    const textEl = document.getElementById('reviewText');
    
    if(typeSel) typeSel.value = 'album'; // Default to album
    if(nameEl) nameEl.value = r.albumName || '';
    if(artistEl) artistEl.value = r.artistName || '';
    if(textEl) textEl.value = r.reviewText || '';
    
    currentReviewRating = Number(r.rating || 0);
    const container = document.getElementById('reviewRating');
    if(container){ 
      [...container.querySelectorAll('.star')].forEach(sp=> 
        sp.classList.toggle('filled', Number(sp.dataset.value) <= currentReviewRating)
      ); 
    }
    const addBtn = document.getElementById('addReviewBtn'); 
    if(addBtn) addBtn.textContent = 'Save Review';
  } catch (error) {
    console.error('Edit review error:', error);
  }
}

async function deleteReview(id){
  try {
    await dbDeleteReview(id);
    await renderReviews();
  } catch (error) {
    console.error('Delete review error:', error);
    alert('Failed to delete review: ' + error.message);
  }
}

async function exportReviews(){
  try {
    const reviews = await getUserReviews();
    const json = JSON.stringify(reviews, null, 2);
    const blob = new Blob([json], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviews.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export reviews error:', error);
    alert('Failed to export reviews: ' + error.message);
  }
}

async function importReviews(file){
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{ 
      const data = JSON.parse(e.target.result); 
      if(!Array.isArray(data)) throw new Error('JSON must be an array');
      
      // Import each review
      for(const review of data) {
        await createReview(
          review.albumName || review.targetName || '',
          review.artistName || review.targetArtist || '',
          review.reviewText || review.text || '',
          review.rating || 0
        );
      }
      
      await renderReviews(); 
      alert('Imported reviews'); 
    } catch(err){ 
      alert('Import failed: ' + err.message); 
    }
  };
  reader.readAsText(file);
}

// ========== INITIALIZATION ==========

// Wait for authentication before initializing the app
window.addEventListener('appwrite-authenticated', async (e) => {
  console.log('User authenticated, initializing app for:', e.detail.user.email);
  await initializeApp();
});

async function initializeApp() {
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importInput = document.getElementById('importInput');
  const saveSongsBtn = document.getElementById('saveSongsBtn');
  const clearSongsBtn = document.getElementById('clearSongsBtn');
  const exportSongsBtn = document.getElementById('exportSongsBtn');
  const importSongsInput = document.getElementById('importSongsInput');
  const saveAvatarBtn = document.getElementById('saveAvatarBtn');
  const removeAvatarBtn = document.getElementById('removeAvatarBtn');
  const exportAvatarBtn = document.getElementById('exportAvatarBtn');
  const importAvatarInput = document.getElementById('importAvatarInput');

  // Initialize forms
  buildForm();
  await populateFormFromDatabase();
  await renderProfile();
  
  buildSongsForm();
  await populateSongsFromDatabase();
  await renderSongs();

  // Wire album events
  if(saveBtn) saveBtn.addEventListener('click', saveProfile);
  if(clearBtn) clearBtn.addEventListener('click', clearProfile);
  if(exportBtn) exportBtn.addEventListener('click', exportProfile);
  if(importInput) importInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) importProfile(f);
    e.target.value = null;
  });

  // Wire song events
  if(saveSongsBtn) saveSongsBtn.addEventListener('click', saveSongs);
  if(clearSongsBtn) clearSongsBtn.addEventListener('click', clearSongs);
  if(exportSongsBtn) exportSongsBtn.addEventListener('click', async ()=>{
    try {
      const data = await getTopSongs();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'top5Songs.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Export failed: ' + error.message);
    }
  });
  if(importSongsInput) importSongsInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) importSongs(f);
    e.target.value = null;
  });

  // Wire avatar events
  if(avatarInput){
    avatarInput.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if(f) handleAvatarFile(f, (err, dataUrl)=>{ 
        if(err) alert(err.message); 
        else avatarPreviewImg.src = dataUrl; 
      });
      e.target.value = null;
    });
  }
  if(saveAvatarBtn) saveAvatarBtn.addEventListener('click', async ()=>{
    if(avatarPreviewImg && avatarPreviewImg.src && avatarPreviewImg.src.startsWith('data:')) {
      await saveAvatar(avatarPreviewImg.src);
    } else {
      alert('Please choose an image first.');
    }
  });
  if(removeAvatarBtn) removeAvatarBtn.addEventListener('click', removeAvatar);
  if(exportAvatarBtn) exportAvatarBtn.addEventListener('click', exportAvatar);
  if(importAvatarInput) importAvatarInput.addEventListener('change', (e)=>{ 
    const f = e.target.files && e.target.files[0]; 
    if(f) importAvatar(f); 
    e.target.value = null; 
  });
  await renderAvatar();

  // Wire review events
  const reviewType = document.getElementById('reviewTargetType');
  const reviewAddBtn = document.getElementById('addReviewBtn');
  const reviewClearBtn = document.getElementById('clearReviewFormBtn');
  const reviewExportBtn = document.getElementById('exportReviewsBtn');
  const reviewImportInput = document.getElementById('importReviewsInput');
  
  buildReviewRatingControl();
  await renderReviews();
  
  if(reviewAddBtn) reviewAddBtn.addEventListener('click', addOrSaveReview);
  if(reviewClearBtn) reviewClearBtn.addEventListener('click', clearReviewForm);
  if(reviewExportBtn) reviewExportBtn.addEventListener('click', exportReviews);
  if(reviewImportInput) reviewImportInput.addEventListener('change', (e)=>{ 
    const f = e.target.files && e.target.files[0]; 
    if(f) importReviews(f); 
    e.target.value = null; 
  });
  
  console.log('App fully initialized!');
}