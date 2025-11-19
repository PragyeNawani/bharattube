'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import VideoCard from '@/components/VideoCard';
import { Search, X } from 'lucide-react';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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

  const clearSearch = () => {
    setSearchQuery('');
    fetchVideos();
  };

  return (
    <>
      <Navbar />

      <div className="home-container">
        <div className="search-container">
          <form onSubmit={handleSearch} className="relative">
            <div
              className={`flex items-center bg-white rounded-full border-2 transition-all duration-300 ${
                isFocused ? 'border-red-500 shadow-lg' : 'border-gray-300 shadow-md'
              }`}
            >
              <Search
                className={`ml-4 transition-colors duration-300 ${
                  isFocused ? 'text-red-500' : 'text-gray-400'
                }`}
                size={22}
              />
              <input
                type="text"
                className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                placeholder="Search videos, channels, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="text-gray-400 hover:text-gray-600" size={20} />
                </button>
              )}
              <button
                type="submit"
                className="mr-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <h2 className="section-title">Trending Videos</h2>
        <div className="video-grid">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Search className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-lg">No videos found. Upload some videos to get started!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 