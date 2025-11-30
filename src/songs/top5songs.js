/*
const KEY_SONGS = 'top5Songs';
const songsList = document.getElementById('songsList');
const songsPreview = document.getElementById('songsPreview');

function createSongRow(index, data = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'song-row';

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
  removeBtn.addEventListener('click', () => {
    titleInput.value = '';
    artistInput.value = '';
  });
  actions.appendChild(removeBtn);

  wrapper.appendChild(titleWrap);
  wrapper.appendChild(artistWrap);
  wrapper.appendChild(actions);

  return wrapper;
}

function buildSongsForm() {
  songsList.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    songsList.appendChild(createSongRow(i));
  }
}

function getSongsFormData() {
  const arr = [];
  for (let i = 0; i < 5; i++) {
    const title = (document.querySelector(`[name=song-title-${i}]`)?.value || '').trim();
    const artist = (document.querySelector(`[name=song-artist-${i}]`)?.value || '').trim();
    arr.push({ title, artist });
  }
  return arr;
}

function saveSongs() {
  const data = getSongsFormData();
  if (!data.some(s => s.title || s.artist)) {
    alert('Please enter at least one song or artist.');
    return;
  }
  localStorage.setItem(KEY_SONGS, JSON.stringify(data));
  renderSongs();
  alert('Songs saved locally.');
}

function clearSongs() {
  if (confirm('Clear saved songs and form?')) {
    localStorage.removeItem(KEY_SONGS);
    buildSongsForm();
    renderSongs();
  }
}

function renderSongs() {
  const raw = localStorage.getItem(KEY_SONGS);
  songsPreview.innerHTML = '';
  if (!raw) {
    songsPreview.innerHTML = '<p class="empty">No songs saved yet.</p>';
    return;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    songsPreview.innerHTML = '<p class="empty">Bad saved data</p>';
    return;
  }
  if (!Array.isArray(data) || data.length === 0) {
    songsPreview.innerHTML = '<p class="empty">No songs saved yet.</p>';
    return;
  }
  data.forEach((entry, i) => {
    const item = document.createElement('div');
    item.className = 'item';
    const idx = document.createElement('div');
    idx.className = 'idx';
    idx.textContent = `${i + 1}.`;
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

// Initialize the form and preview
document.addEventListener('DOMContentLoaded', () => {
  buildSongsForm();
  renderSongs();

  const saveSongsBtn = document.getElementById('saveSongsBtn');
  const clearSongsBtn = document.getElementById('clearSongsBtn');
  const exportSongsBtn = document.getElementById('exportSongsBtn');
  const importSongsInput = document.getElementById('importSongsInput');

  saveSongsBtn.addEventListener('click', saveSongs);
  clearSongsBtn.addEventListener('click', clearSongs);
  exportSongsBtn.addEventListener('click', () => {
    const raw = localStorage.getItem(KEY_SONGS) || '[]';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top5Songs.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
  importSongsInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!Array.isArray(data)) throw new Error('JSON must be an array');
          localStorage.setItem(KEY_SONGS, JSON.stringify(data.slice(0, 5)));
          buildSongsForm();
          renderSongs();
          alert('Imported songs successfully.');
        } catch (err) {
          alert('Import failed: ' + err.message);
        }
      };
      reader.readAsText(f);
    }
    e.target.value = null;
  });
});

*/