// src/pages/AllArtistsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllArtists } from "../../utils/api";
import "./AllArtistsPage.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PER_PAGE = 30;   //phan trang

const fixUrl = (url) => {
    if (!url) return "/images/default-artist.png";
    if (url.startsWith("http")) return url;

    return `http://localhost:3000${
        url.startsWith("/media")
        ? url
        : url.replace("/images", "/media/images")
    }`;
};

const AllArtistsPage = () => {
    const navigate = useNavigate();

    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchAllArtists();
            setArtists(data.map(a => ({ ...a, avatar_url: fixUrl(a.avatar_url) })));
            setLoading(false);
        };
        load();
    }, []);

    const totalPages = Math.ceil(artists.length / PER_PAGE);

    const slice = artists.slice(
        (page - 1) * PER_PAGE,
        page * PER_PAGE
    );

    const go = (n) => {
        if (n < 1 || n > totalPages) return;
        setPage(n);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="artists-wrapper">

            <div className="artists-header">
                <h1>Danh sách Nghệ sĩ</h1>
                <span className="artists-count">{artists.length} nghệ sĩ</span>
            </div>

            {loading ? (
                <div className="artists-loading">
                    <div className="artists-spinner"></div>
                </div>
            ) : (
                <>
                    <div className="artists-grid">

                        {slice.map(artist => (
                            <div
                                key={artist.id}
                                className="artists-card"
                                onClick={() => navigate(`/artist/${artist.id}`)}
                            >
                                <div className="artists-avatar-box">
                                    <img src={artist.avatar_url} alt={artist.stage_name} />
                                    <div className="artists-hover"></div>
                                </div>
                                <p className="artists-name">{artist.stage_name}</p>
                            </div>
                        ))}

                    </div>

                    {totalPages > 1 && (
                        <div className="artists-pagination">

                            <button onClick={() => go(page - 1)} disabled={page === 1}>
                                <FaChevronLeft />
                            </button>

                            {Array.from({ length: totalPages })
                                .slice(
                                    Math.max(0, page - 3),
                                    Math.min(totalPages, page + 2)
                                )
                                .map((_, i) => {
                                    const n = i + Math.max(1, page - 2);
                                    return (
                                        <button
                                            key={n}
                                            onClick={() => go(n)}
                                            className={page === n ? "active" : ""}
                                        >
                                            {n}
                                        </button>
                                    );
                                })}

                            <button onClick={() => go(page + 1)} disabled={page === totalPages}>
                                <FaChevronRight />
                            </button>

                        </div>
                    )}

                </>
            )}

        </div>
    );
};

export default AllArtistsPage;
