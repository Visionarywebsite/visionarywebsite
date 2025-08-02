import React, { useState } from 'react';
import Header from './components/Header';

const App = () => {
    const [songs, setSongs] = useState([
        {
            title: 'Tiimbe Choir',
            artist: 'Cacoon Vocalist',
            producer: 'Prodby Vplus',
            audio: 'Cacoon Vocalist-Tiimbe Choir.Prodby Vplus.mp3',
            artwork: '@0060_Cacoon4.jpg',
            downloads: 0,
            views: 0,
            plays: 0,
            shares: 0,
        },
        {
            title: 'Liyana',
            artist: 'Inno Side',
            producer: 'Prodby Vplus',
            audio: 'Inno Side-Liyana.Prodby Vplus.mp3',
            artwork: '@0060_INNOSIDE.jpg',
            downloads: 0,
            views: 0,
            plays: 0,
            shares: 0,
        },
        {
            title: 'Guluu',
            artist: 'Lil Ells',
            producer: 'Prodby Vplus',
            audio: 'Lil Ellz-Guluu.Prodby Vplus.mp3',
            artwork: '@0063_Lilellz1.jpg',
            downloads: 0,
            views: 0,
            plays: 0,
            shares: 0,
        },
    ]);

    const handleDownload = (audio) => {
        const link = document.createElement('a');
        link.href = audio;
        link.download = audio;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <Header />
            <div className="song-list">
                {songs.map((song, index) => (
                    <div key={index} className="song">
                        <img src={song.artwork} alt={song.title} />
                        <h2>{song.title}</h2>
                        <p>{song.artist}</p>
                        <p>{song.producer}</p>
                        <button onClick={() => handleDownload(song.audio)}>Download</button>
                        <button onClick={() => {/* Play logic here */}}>Play Now</button>
                        <button onClick={() => {/* Share logic here */}}>Share</button>
                        <p>Downloads: {song.downloads}</p>
                        <p>Views: {song.views}</p>
                        <p>Plays: {song.plays}</p>
                        <p>Shares: {song.shares}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;