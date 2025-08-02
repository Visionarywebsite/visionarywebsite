// --- SONG DATA ---
// You can later fetch this from a backend/database.
let songs = [];

// Fetch songs from backend
async function fetchSongs() {
  const res = await fetch('/api/songs');
  songs = await res.json();
  renderSongs(songs);
}
fetchSongs();

// ...existing renderSongs, openSongModal, etc...

// Admin upload
document.getElementById('uploadForm').onsubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: data
  });
  const result = await res.json();
  if (result.success) {
    document.getElementById('uploadResult').innerHTML = `
      <div>Song uploaded! Share this link:<br>
      <input style="width:90%;" value="${window.location.origin}${window.location.pathname}?song=${result.song.id}" readonly></div>
    `;
    fetchSongs();
    form.reset();
  } else {
    document.getElementById('uploadResult').textContent = result.error || 'Upload failed.';
  }
};

// --- ADMIN LOGIN (for demo, use a simple prompt) ---
let isAdmin = false;
function checkAdmin() {
  // For demo: type "admin" as password
  if (prompt('Admin login. Enter password:') === 'admin') {
    isAdmin = true;
    document.getElementById('adminUpload').style.display = 'block';
  } else {
    alert('Incorrect password.');
  }
}

// --- RENDER SONGS ---
function renderSongs(list) {
  const container = document.getElementById('songsList');
  container.innerHTML = '';
  list.forEach(song => {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.onclick = () => openSongModal(song.id);

    card.innerHTML = `
      <img src="${song.artwork}" alt="Artwork" class="song-artwork">
      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">Artist: ${song.artist}</div>
        <div class="song-producer">Producer: ${song.producer}</div>
      </div>
      <div class="song-stats">
        <div class="song-stat">Views: <span id="views-${song.id}">${song.views}</span></div>
        <div class="song-stat">Downloads: <span id="downloads-${song.id}">${song.downloads}</span></div>
        <div class="song-stat">Plays: <span id="plays-${song.id}">${song.plays}</span></div>
        <div class="song-stat">Shares: <span id="shares-${song.id}">${song.shares}</span></div>
      </div>
    `;
    container.appendChild(card);
  });
}
renderSongs(songs);

// --- SONG MODAL ---
function openSongModal(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  song.views++;
  updateStats(song);

  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <button class="close-modal" onclick="closeModal()">&times;</button>
    <img src="${song.artwork}" alt="Artwork" class="modal-artwork">
    <div class="modal-song-title">${song.title}</div>
    <div class="modal-song-artist">Artist: ${song.artist}</div>
    <div class="modal-song-producer">Producer: ${song.producer}</div>
    <div class="modal-actions">
      <button onclick="playSong('${song.id}')">Play Now</button>
      <a href="${song.audio}" download="${song.title} - ${song.artist}.mp3">
        <button onclick="downloadSong('${song.id}')">Download</button>
      </a>
      <button onclick="shareSong('${song.id}')">Share</button>
    </div>
    <audio id="audioPlayer" style="width:100%;margin-top:1rem;" controls hidden></audio>
    <div class="song-stats" style="margin-top:1rem;">
      <div class="song-stat">Views: <span id="modal-views">${song.views}</span></div>
      <div class="song-stat">Downloads: <span id="modal-downloads">${song.downloads}</span></div>
      <div class="song-stat">Plays: <span id="modal-plays">${song.plays}</span></div>
      <div class="song-stat">Shares: <span id="modal-shares">${song.shares}</span></div>
    </div>
  `;
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  const audio = document.getElementById('audioPlayer');
  if (audio) audio.pause();
}

// --- PLAY SONG ---
function playSong(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  song.plays++;
  updateStats(song);

  const audio = document.getElementById('audioPlayer');
  audio.src = song.audio;
  audio.hidden = false;
  audio.play();
}

// --- DOWNLOAD SONG ---
function downloadSong(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  song.downloads++;
  updateStats(song);
  // Download handled by <a download> for browser compatibility
}

// --- SHARE SONG ---
function shareSong(songId) {
  const song = songs.find(s => s.id === songId);
  if (!song) return;
  song.shares++;
  updateStats(song);

  // Generate shareable link (simulate with current URL + ?song=ID)
  const url = `${window.location.origin}${window.location.pathname}?song=${song.id}`;
  if (navigator.share) {
    navigator.share({
      title: `${song.title} by ${song.artist}`,
      text: `Listen to "${song.title}" by ${song.artist} on Visionary Website!`,
      url
    });
  } else {
    prompt('Copy and share this link:', url);
  }
}

// --- UPDATE STATS ---
function updateStats(song) {
  document.getElementById(`views-${song.id}`).textContent = song.views;
  document.getElementById(`downloads-${song.id}`).textContent = song.downloads;
  document.getElementById(`plays-${song.id}`).textContent = song.plays;
  document.getElementById(`shares-${song.id}`).textContent = song.shares;

  // Modal stats if open
  if (document.getElementById('modal').style.display === 'flex') {
    document.getElementById('modal-views').textContent = song.views;
    document.getElementById('modal-downloads').textContent = song.downloads;
    document.getElementById('modal-plays').textContent = song.plays;
    document.getElementById('modal-shares').textContent = song.shares;
  }
}

// --- SEARCH ---
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
searchInput.addEventListener('input', function() {
  const val = this.value.trim().toLowerCase();
  if (!val) {
    renderSongs(songs);
    suggestions.innerHTML = '';
    return;
  }
  const filtered = songs.filter(song =>
    song.artist.toLowerCase().includes(val) ||
    song.title.toLowerCase().includes(val)
  );
  renderSongs(filtered);

  // Suggestions
  const sugg = songs
    .filter(song =>
      song.artist.toLowerCase().startsWith(val) ||
      song.title.toLowerCase().startsWith(val)
    )
    .slice(0, 5)
    .map(song => `<div class="suggestion-item" onclick="selectSuggestion('${song.id}')">${song.artist} - ${song.title}</div>`)
    .join('');
  suggestions.innerHTML = sugg;
});

window.selectSuggestion = function(songId) {
  const song = songs.find(s => s.id === songId);
  if (song) openSongModal(song.id);
  suggestions.innerHTML = '';
  searchInput.value = '';
};

// --- CONTACT & ABOUT ---
document.getElementById('contactBtn').onclick = function() {
  showModal(`
    <button class="close-modal" onclick="closeModal()">&times;</button>
    <h2 style="color:#ffd700;text-align:center;">Contact Us</h2>
    <div style="text-align:center;margin:1.5rem 0;">
      <button id="uploadSongBtn" style="background:#ffd700;color:#111;padding:0.7rem 2rem;border-radius:12px;font-size:1.1rem;font-weight:bold;cursor:pointer;">Upload your song today</button>
    </div>
  `);
  document.getElementById('uploadSongBtn').onclick = function() {
    showModal(`
      <button class="close-modal" onclick="closeModal()">&times;</button>
      <h2 style="color:#ffd700;text-align:center;">Upload your song today</h2>
      <div style="text-align:center;margin:1.5rem 0;">
        <a href="https://wa.me/265998662690?text=How%20much%20is%20song%20upload%20today%3F" target="_blank" style="display:block;margin-bottom:1rem;font-size:1.1rem;color:#25D366;text-decoration:none;">
          WhatsApp: +265 998 662 690
        </a>
        <a href="mailto:lukevplusnzima@gmail.com" style="display:block;font-size:1.1rem;color:#ffd700;text-decoration:none;">
          Email: lukevplusnzima@gmail.com
        </a>
      </div>
    `);
  };
};

document.getElementById('aboutBtn').onclick = function() {
  showModal(`
    <button class="close-modal" onclick="closeModal()">&times;</button>
    <h2 style="color:#ffd700;text-align:center;">About Us</h2>
    <div style="text-align:center;margin:1.5rem 0;">
      <p>Visionary Website is your home for the best music from Vision Plus Records.<br>
      Discover, play, download, and share the latest tracks from our talented artists.<br>
      Powered by VPLUS.</p>
    </div>
  `);
};

function showModal(html) {
  const modal = document.getElementById('modal');
  document.getElementById('modalContent').innerHTML = html;
  modal.style.display = 'flex';
}

// --- ADMIN UPLOAD (for demo, only visible to admin) ---
document.addEventListener('keydown', function(e) {
  // Press Ctrl+Shift+U to login as admin
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
    checkAdmin();
  }
});

document.getElementById('uploadForm').onsubmit = function(e) {
  e.preventDefault();
  const artist = document.getElementById('artistName').value.trim();
  const title = document.getElementById('songTitle').value.trim();
  const producer = document.getElementById('producerName').value.trim();
  const audioFile = document.getElementById('audioFile').files[0];
  const artworkFile = document.getElementById('artworkFile').files[0];

  if (!artist || !title || !producer || !audioFile || !artworkFile) {
    alert('Please fill all fields.');
    return;
  }

  // For demo: Use FileReader to preview, but in real deployment, upload to server
  const readerAudio = new FileReader();
  const readerArtwork = new FileReader();

  readerAudio.onload = function(eAudio) {
    readerArtwork.onload = function(eArtwork) {
      const newSong = {
        id: `${artist.toLowerCase().replace(/\s/g,'-')}-${title.toLowerCase().replace(/\s/g,'-')}`,
        artist,
        title,
        producer,
        audio: eAudio.target.result,
        artwork: eArtwork.target.result,
        downloads: 0,
        views: 0,
        plays: 0,
        shares: 0
      };
      songs.push(newSong);
      renderSongs(songs);
      document.getElementById('uploadResult').innerHTML = `
        <div>Song uploaded! Share this link:<br>
        <input style="width:90%;" value="${window.location.origin}${window.location.pathname}?song=${newSong.id}" readonly></div>
      `;
      document.getElementById('uploadForm').reset();
    };
    readerArtwork.readAsDataURL(artworkFile);
  };
  readerAudio.readAsDataURL(audioFile);
};

// --- HANDLE SHARED LINKS ---
window.onload = function() {
  const params = new URLSearchParams(window.location.search);
  const songId = params.get('song');
  if (songId) {
    const song = songs.find(s => s.id === songId);
    if (song) openSongModal(song.id);
  }
};
