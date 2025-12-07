// music-frontend/src/pages/ArtistDashboard/ArtistAlbums.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyAlbumsApi, deleteMyAlbumApi } from '../../utils/api';
import './ArtistDashboard.css';
import { FaPlus, FaEdit, FaTrash, FaMusic } from 'react-icons/fa';
import AlbumFormModal from '../../components/user/AlbumFormModal';
import AddSinglesToAlbumModal from '../../components/user/AddSinglesToAlbumModal';

const showToast = m => alert(m);

const fixUrl = (url) => {
    if (!url) return '/images/default-album.png';
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
};

const ArtistAlbums = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null);

    const [showSinglesModal, setShowSinglesModal] = useState(false);
    const [targetAlbum, setTargetAlbum] = useState(null);

    const fetchAlbums = async () => {
        setLoading(true);
        try {
            const res = await getMyAlbumsApi();
            setAlbums(res.map(a => ({ ...a, cover_url: fixUrl(a.cover_url) })));
        } catch {
            showToast("Không tải được album", "error");
        }
        setLoading(false);
    };

    useEffect(() => { fetchAlbums(); }, []);

    const handleCreate = () => {
        setEditingAlbum(null);
        setShowAlbumModal(true);
    };

    const handleEdit = (album) => {
        setEditingAlbum(album);
        setShowAlbumModal(true);
    };

    const handleAddSingles = (album) => {
        setTargetAlbum(album);
        setShowSinglesModal(true);
    };

    const handleComplete = () => {
        setShowAlbumModal(false);
        setShowSinglesModal(false);
        fetchAlbums();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn muốn xóa album này?")) return;

        try {
            await deleteMyAlbumApi(id);
            showToast("Đã xóa album!");
            fetchAlbums();
        } catch {
            showToast("Xóa thất bại", "error");
        }
    };

    if (loading) return <p>Đang tải...</p>;

    return (
        <div className="artist-albums-container">

            <div className="artist-albums-header">
                <h2>Album của tôi ({albums.length})</h2>

                <button className="artist-btn-create" onClick={handleCreate}>
                    <FaPlus/> Tạo Album
                </button>
            </div>

            <div className="artist-albums-grid">

                {albums.map(album => (
                    <div className="artist-album-card" key={album.id}>

                        <img
                            src={album.cover_url}
                            className="artist-album-cover"
                            onClick={() => navigate(`/album/${album.id}`)}
                        />

                        <h4 className="artist-album-title">{album.title}</h4>
                        <p className="artist-album-year">
                            {new Date(album.release_date).getFullYear()}
                        </p>

                        <div className="artist-album-actions">

                            <button
                                className="artist-btn"
                                onClick={(e)=>{e.stopPropagation(); handleAddSingles(album);}}
                            >
                                <FaMusic />
                            </button>

                            <button
                                className="artist-btn"
                                onClick={(e)=>{e.stopPropagation(); handleEdit(album);}}
                            >
                                <FaEdit />
                            </button>

                            <button
                                className="artist-btn danger"
                                onClick={(e)=>{e.stopPropagation(); handleDelete(album.id);}}
                            >
                                <FaTrash />
                            </button>

                        </div>
                    </div>
                ))}

            </div>

            {showAlbumModal &&
                <AlbumFormModal
                    onClose={() => setShowAlbumModal(false)}
                    onComplete={handleComplete}
                    albumToEdit={editingAlbum}
                />
            }

            {showSinglesModal && targetAlbum &&
                <AddSinglesToAlbumModal
                    onClose={() => setShowSinglesModal(false)}
                    onComplete={handleComplete}
                    targetAlbum={targetAlbum}
                />
            }

        </div>
    );
};

export default ArtistAlbums;
