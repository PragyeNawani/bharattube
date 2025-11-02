'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import VideoCard from '@/components/VideoCard';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos/trending');
      const data = await response.json();
      if (response.ok) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchVideos();
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (response.ok) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search videos by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        <h2 className="section-title">Trending Videos</h2>
        <div className="video-grid">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))
          ) : (
            <p>No videos found. Upload some videos to get started!</p>
          )}
        </div>
      </div>
    </>
  );
}