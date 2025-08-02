const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Storage config for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// Load or initialize songs.json
const songsFile = path.join(__dirname, 'songs.json');
function loadSongs() {
  if (!fs.existsSync(songsFile)) return [];
  return JSON.parse(fs.readFileSync(songsFile));
}
function saveSongs(songs) {
  fs.writeFileSync(songsFile, JSON.stringify(songs, null, 2));
}

// Get all songs
app.get('/api/songs', (req, res) => {
  res.json(loadSongs());
});

// Upload new song
app.post('/api/upload', upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'artworkFile', maxCount: 1 }
]), (req, res) => {
  const { artistName, songTitle, producerName } = req.body;
  const audio = req.files['audioFile'] ? req.files['audioFile'][0].filename : null;
  const artwork = req.files['artworkFile'] ? req.files['artworkFile'][0].filename : null;

  if (!artistName || !songTitle || !producerName || !audio || !artwork) {
    return res.status(400).json({ error: 'All fields required.' });
  }

  const songs = loadSongs();
  const id = `${artistName.toLowerCase().replace(/\s/g,'-')}-${songTitle.toLowerCase().replace(/\s/g,'-')}-${Date.now()}`;
  const newSong = {
    id,
    artist: artistName,
    title: songTitle,
    producer: producerName,
    audio: `assets/${audio}`,
    artwork: `assets/${artwork}`,
    downloads: 0,
    views: 0,
    plays: 0,
    shares: 0
  };
  songs.push(newSong);
  saveSongs(songs);

  res.json({ success: true, song: newSong });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});