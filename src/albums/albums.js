import { getTopAlbums, updateTopAlbums } from './src/db/dbHelper.js';

const albumsList = document.getElementById('albumsList');
const profilePreview = document.getElementById('profilePreview');

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

function getFormData(){
  const arr = [];
  for(let i=0;i<4;i++){
    const title = (document.querySelector(`[name=title-${i}]`)?.value || '').trim();
    const artist = (document.querySelector(`[name=artist-${i}]`)?.value || '').trim();
    arr.push({title, artist});
  }
  return arr;
}

async function saveProfile(){
  try {
    const data = getFormData();
    // basic validation - require at least one non-empty title
    if(!data.some(a=>a.title || a.artist)){
      alert('Please enter at least one album or artist.');
      return;
    }
    
    // Save to Appwrite database instead of localStorage
    await updateTopAlbums(data);
    await renderProfile();
    alert('Profile saved successfully!');
  } catch (error) {
    console.error('Save error:', error);
    alert('Failed to save profile: ' + error.message);
  }
}

async function clearProfile(){
  if(confirm('Clear saved profile and form?')){
    try {
      // Clear by saving empty array to database
      await updateTopAlbums([]);
      buildForm();
      await renderProfile();
    } catch (error) {
      console.error('Clear error:', error);
      alert('Failed to clear profile: ' + error.message);
    }
  }
}

async function renderProfile(){
  try {
    profilePreview.innerHTML = '<p class="empty">Loading...</p>';
    
    // Get data from Appwrite database instead of localStorage
    const data = await getTopAlbums();
    
    profilePreview.innerHTML = '';
    
    if(!data || !Array.isArray(data) || data.length === 0 || !data.some(a => a.title || a.artist)){
      profilePreview.innerHTML = '<p class="empty">No albums saved yet.</p>';
      return;
    }

    data.forEach((entry, i)=>{
      // Only render entries that have content
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
    profilePreview.innerHTML = '<p class="empty">Error loading profile.</p>';
  }
}

async function exportProfile(){
  try {
    // Get data from database instead of localStorage
    const data = await getTopAlbums();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top4Albums.json';
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
      
      // Save to database instead of localStorage
      await updateTopAlbums(data.slice(0,4));
      await populateFormFromDatabase();
      await renderProfile();
      alert('Imported profile successfully.');
    }catch(err){
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

async function populateFormFromDatabase(){
  try {
    // Get data from database instead of localStorage
    const data = await getTopAlbums();
    
    buildForm();
    
    if(!data || !Array.isArray(data)) return;
    
    for(let i=0; i<4; i++){
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

// init
document.addEventListener('DOMContentLoaded', async ()=>{
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importInput = document.getElementById('importInput');

  buildForm();
  await populateFormFromDatabase();
  await renderProfile();

  saveBtn.addEventListener('click', saveProfile);
  clearBtn.addEventListener('click', clearProfile);
  exportBtn.addEventListener('click', exportProfile);
  importInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) importProfile(f);
    e.target.value = null;
  });
});