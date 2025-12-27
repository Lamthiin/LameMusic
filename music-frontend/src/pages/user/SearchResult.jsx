import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchApi } from "../../utils/api";
import "./SearchResult.css";

const fixImageUrl = (url) => {
  if (!url) return "/images/default.png";
  if (url.startsWith("http")) return url;
  return `http://localhost:3000${url}`;
};

const SearchResult = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await searchApi(q, "full");

        res.songs = res.songs.map(s => ({
          ...s,
          image_url: fixImageUrl(s.image_url || s.album?.cover_url)
        }));
        res.artists = res.artists.map(a => ({
          ...a,
          avatar_url: fixImageUrl(a.avatar_url)
        }));
        res.albums = res.albums.map(a => ({
          ...a,
          cover_url: fixImageUrl(a.cover_url)
        }));

        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [q]);

  if (loading) return <div className="search-page">Đang tìm kiếm...</div>;
  if (!data) return <div className="search-page">Không có kết quả</div>;

  return (
    <div className="search-page">
      <h2>Kết quả tìm kiếm cho: "{q}"</h2>

      {/* SONGS */}
      {data.songs.length > 0 && (
        <>
          <h3>Bài hát</h3>
          <div className="grid">
            {data.songs.map(song => (
              <div
                key={song.id}
                className="card"
                onClick={() => navigate(`/song/${song.id}`)}
              >
                <img src={song.image_url} />
                <p>{song.title}</p>
                <span>{song.artist?.stage_name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ARTISTS */}
      {data.artists.length > 0 && (
        <>
          <h3>Nghệ sĩ</h3>
          <div className="grid">
            {data.artists.map(a => (
              <div
                key={a.id}
                className="card"
                onClick={() => navigate(`/artist/${a.id}`)}
              >
                <img src={a.avatar_url} />
                <p>{a.stage_name}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ALBUMS */}
      {data.albums.length > 0 && (
        <>
          <h3>Album</h3>
          <div className="grid">
            {data.albums.map(alb => (
              <div
                key={alb.id}
                className="card"
                onClick={() => navigate(`/album/${alb.id}`)}
              >
                <img src={alb.cover_url} />
                <p>{alb.title}</p>
                <span>{alb.artist?.stage_name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResult;
