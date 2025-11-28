// music-frontend/src/components/admin/ArtistFormModal.jsx
import React, { useEffect, useState } from "react";

const ArtistFormModal = ({
  isOpen,
  initialArtist, // { id?, stage_name, bio, avatar_url }
  title,
  onSubmit,       // (formData) => Promise | void
  onClose,
  loading = false,
}) => {
  const [form, setForm] = useState({
    stage_name: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Khi mở modal / đổi artist → fill form
  useEffect(() => {
    if (!isOpen) return;

    setForm({
      stage_name: initialArtist?.stage_name || "",
      bio: initialArtist?.bio || "",
    });

    if (initialArtist?.avatar_url) {
      setAvatarPreview(initialArtist.avatar_url);
    } else {
      setAvatarPreview("/images/default-artist.png");
    }

    setAvatarFile(null);
  }, [isOpen, initialArtist]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("HANDLE SUBMIT WAS CALLED!");
    if (!form.stage_name.trim()) {
      alert("Tên nghệ sĩ không được để trống!");
      return;
    }

    const data = new FormData();
    data.append("stage_name", form.stage_name);
    data.append("bio", form.bio || "");
    if (avatarFile) {
      data.append("avatarFile", avatarFile);
    }
    for (let p of data.entries()) {
      console.log("FORMDATA:", p);
    }

    await onSubmit(data); // cha tự lo gọi API / cập nhật state
  };

  if (!isOpen) return null;

  return (
    <div
    className="modal-overlay"
    onClick={(e) => {
      if (e.target.classList.contains("modal-overlay")) {
        onClose();
      }
    }}
  >

    <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title || (initialArtist?.id ? "Chỉnh sửa nghệ sĩ" : "Thêm nghệ sĩ mới")}</h3>

        <form onSubmit={handleSubmit} className="profile-edit-form">
          {/* Avatar */}
          <div className="form-group avatar-upload-section">
            <label>Ảnh đại diện (Avatar)</label>
            <div className="avatar-preview-box">
              <img
                src={avatarPreview || "/images/default-artist.png"}
                alt="Avatar Preview"
                className="avatar-preview"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Stage name */}
          <div className="form-group">
            <label>Nghệ danh (Stage Name):</label>
            <input
              type="text"
              name="stage_name"
              value={form.stage_name}
              onChange={handleChange}
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label>Tiểu sử (Bio):</label>
            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistFormModal;
