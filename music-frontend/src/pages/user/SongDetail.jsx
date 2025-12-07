// music-frontend/src/pages/SongDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import './SongDetail.css';
import { FaPlay, FaHeart, FaRedo, FaEllipsisV, FaPlus, FaFlag } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

import SongOptionsMenu from '../../components/user/SongOptionsMenu';
import AddToPlaylistModal from '../../components/user/AddToPlaylistModal';
import ReportModal from '../../components/user/ReportModal';

// ─────────────────────────
// FIX URL
// ─────────────────────────
const fixUrl = (url, type = 'image') => {
    if (!url) {
        if (type === 'artist') return '/images/default-artist.png';
        if (type === 'audio') return '';
        return '/images/default-album.png';
    }
    if (url.startsWith('http')) return url;

    const prefix = type === 'image' ? '/media/images' : '/media/audio';
    const original = type === 'image' ? '/images' : '/audio';

    if (url.startsWith(prefix)) return `http://localhost:3000${url}`;
    return `http://localhost:3000${url.replace(original, prefix)}`;
};

// ─────────────────────────
// COMPONENT
// ─────────────────────────
const SongDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { playTrack, currentTrack, isPlaying, setIsPlaying, audioRef } = usePlayer();
    const { isAuthenticated } = useAuth();

    const [song, setSong] = useState(null);
    const [lyrics, setLyrics] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingLyrics, setLoadingLyrics] = useState(true);

    const [isLiked, setIsLiked] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false);
    const [playlistModal, setPlaylistModal] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    // ─────────────────────────
    // LOAD SONG
    // ─────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setLoadingLyrics(true);

            try {
                const [songRes, lyricRes] = await Promise.all([
                    api.get(`/song/${id}`),
                    api.get(`/song/${id}/lyrics`).catch(() => null)
                ]);

                const data = songRes.data;

                data.file_url = fixUrl(data.file_url, 'audio');
                data.image_url = fixUrl(data.image_url, 'image');
                if (data.album) {
                    data.album.cover_url = fixUrl(data.album.cover_url, 'image');
                }

                setSong(data);

                if (isAuthenticated) {
                    const like = await api.get(`/like/${id}/status`);
                    setIsLiked(like.data.isLiked);
                }

                setLyrics(lyricRes?.data?.lyrics || 'Không có lời bài hát.');
                setLoadingLyrics(false);

            } catch {
                setSong(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, isAuthenticated]);

    // Tự động phát khi vào bài
    useEffect(() => {
        if (song && (!currentTrack || currentTrack.id !== song.id)) {
            playTrack(song);
        }
    }, [song]);

    // ─────────────────────────
    // EVENT
    // ─────────────────────────
    const replay = () => {
        if (!audioRef.current?.audio?.current) return;

        audioRef.current.audio.current.currentTime = 0;
        audioRef.current.audio.current.play();
        setIsPlaying(true);
    };

    const toggleLike = async () => {
        if (!isAuthenticated) {
            alert("Vui lòng đăng nhập!");
            navigate("/login");
            return;
        }
        const res = await api.post(`/like/${song.id}`);
        setIsLiked(res.data.isLiked);
    };

    // ─────────────────────────
    // RENDER
    // ─────────────────────────
    if (loading) return <div>Đang tải...</div>;
    if (!song) return <div>Không tìm thấy bài hát</div>;

    return (
        <div className="song-detail-container">

            {/* HEADER */}
            <div className="song-detail-header">

                <img
                    src={song.image_url || song.album?.cover_url}
                    className="song-cover"
                />

                <div className="song-info">

                    <p className="song-type">BÀI HÁT</p>
                    <h1>{song.title}</h1>

                    <p>
                        {song.artist?.stage_name} • {song.album?.title}
                    </p>

                    {/* ===================== CONTROLS ===================== */}
                    <div className="detail-controls">

                        {/* LEFT ONLY PLAY */}
                        <div className="controls-left">
                            <button className="btn-play" onClick={replay}>
                                <FaRedo /> PHÁT LẠI
                            </button>
                        </div>

                        {/* RIGHT ALL BUTTONS */}
                        <div className="controls-right">

                            <button className={`icon-btn ${isLiked ? 'liked' : ''}`}
                                    onClick={toggleLike}>
                                <FaHeart />
                            </button>

                            <button className="icon-btn"
                                    onClick={() => setPlaylistModal(true)}>
                                <FaPlus />
                            </button>

                            {isAuthenticated && (
                                <button className="icon-btn"
                                        onClick={() => setReportOpen(true)}>
                                    <FaFlag />
                                </button>
                            )}

                            {/* MENU */}
                            <div className="menu-box">
                                <button className="icon-btn"
                                        onClick={() => setMenuOpen(!menuOpen)}>
                                    <FaEllipsisV />
                                </button>

                                {menuOpen && (
                                    <SongOptionsMenu
                                        song={song}
                                        closeMenu={() => setMenuOpen(false)}
                                    />
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* LYRICS */}
            <div className="lyrics-box">
                <h3>Lời bài hát</h3>
                {loadingLyrics
                    ? <p>Đang tải...</p>
                    : <p>{lyrics}</p>
                }
            </div>

            {/* MODALS */}
            {playlistModal && (
                <AddToPlaylistModal
                    songId={song.id}
                    onClose={() => setPlaylistModal(false)}
                />
            )}

            {reportOpen && (
                <ReportModal
                    songId={song.id}
                    songTitle={song.title}
                    onClose={() => setReportOpen(false)}
                />
            )}

        </div>
    );
};

export default SongDetail;
