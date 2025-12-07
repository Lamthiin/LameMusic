// music-frontend/src/pages/ArtistDashboard/ArtistInfo.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyArtistProfileApi, updateMyArtistProfileApi } from '../../utils/api';
import './ArtistDashboard.css';

// Toast đơn giản
const showToast = (msg) => alert(msg);

// Fix image
const fixUrl = (url) => {
    if (!url) return "/images/default-artist.png";
    if (url.startsWith("http")) return url;
    return `http://localhost:3000${url}`;
};

const ArtistInfo = () => {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [artist, setArtist] = useState(null);

    const [formData, setFormData] = useState({
        stage_name: '',
        bio: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Load data
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMyArtistProfileApi();
                setArtist(data);

                setFormData({
                    stage_name: data.stage_name,
                    bio: data.bio || ''
                });

                setPreview(fixUrl(data.avatar_url));

            } catch (err) {
                showToast("Không tải được Artist profile", "error");
            }
            setLoading(false);
        };

        load();
    }, []);

    // handle change
    const handleChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // upload avatar
    const handleFile = e => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarFile(file);
        setPreview(URL.createObjectURL(file));
    };

    // submit
    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("stage_name", formData.stage_name);
        data.append("bio", formData.bio);
        if (avatarFile) data.append("avatarFile", avatarFile);

        try {
            const res = await updateMyArtistProfileApi(data);
            setArtist(res);
            showToast("Cập nhật thành công!");
        } catch (err) {
            showToast(err.response?.data?.message || "Cập nhật thất bại", "error");
        }

        setLoading(false);
    };

    if (loading) return <p>Đang tải...</p>;
    if (!artist) return <p>Không tìm thấy Artist</p>;

    return (
        <div className="artist-info-container">

            <form className="artist-info-form" onSubmit={handleSubmit}>

                {/* Avatar */}
                <div className="artist-info-group">
                    <label>Ảnh đại diện</label>

                    <div className="artist-info-avatar-box">
                        <img
                            src={preview}
                            className="artist-info-avatar"
                            alt="preview"
                        />
                        <input type="file" accept="image/*" onChange={handleFile} />
                    </div>
                </div>

                {/* Stage name */}
                <div className="artist-info-group">
                    <label>Nghệ danh</label>
                    <input
                        type="text"
                        name="stage_name"
                        value={formData.stage_name}
                        onChange={handleChange}
                    />
                </div>

                {/* Bio */}
                <div className="artist-info-group">
                    <label>Tiểu sử</label>
                    <textarea
                        name="bio"
                        rows="5"
                        value={formData.bio}
                        onChange={handleChange}
                    />
                </div>

                {/* button */}
                <div className="artist-info-actions">
                    <button disabled={loading} className="btn-save">
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ArtistInfo;
