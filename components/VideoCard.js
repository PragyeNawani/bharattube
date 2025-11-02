'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function VideoCard({ video }) {
  const [imageError, setImageError] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeData = (url) => {
    if (!url) return { videoId: null, thumbnail: null };
    
    let videoId = null;
    
    // Format: https://www.youtube.com/embed/VIDEO_ID
    if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    }
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (videoId) {
      return {
        videoId,
        // Try maxresdefault first, fallback to hqdefault
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        fallbackThumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    }
    
    return { videoId: null, thumbnail: null };
  };

  const youtubeData = getYouTubeData(video.videoUrl);
  const thumbnailUrl = video.thumbnailUrl || youtubeData.thumbnail;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(`/api/videos/${video._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'like' }),
      });
      if (response.ok) {
        // Optionally refresh the page or update state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`/api/videos/${video._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'share' }),
      });
      
      const shareUrl = `${window.location.origin}/video/${video._id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Video link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="video-card">
      <Link href={`/video/${video._id}`}>
        <div className="video-thumbnail-container">
          {thumbnailUrl && !imageError ? (
            <div className="video-thumbnail-wrapper">
              <img 
                src={thumbnailUrl} 
                alt={video.title} 
                className="video-thumbnail-img"
                onError={handleImageError}
              />
              {/* <div className="play-overlay">
                <div className="play-button">
                  ▶
                </div>
              </div> */}
            </div>
          ) : (
            <div className="video-thumbnail-placeholder">
              <div className="play-icon-large">▶</div>
              <div className="video-title-overlay">{video.title}</div>
            </div>
          )}
        </div>
      </Link>
      <div className="video-info">
        <Link href={`/video/${video._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="video-title">{video.title}</h3>
        </Link>
        <div className="video-meta">
          <span className="video-author">{video.username || 'Anonymous'}</span>
        </div>
        <div className="video-stats">
          <span>👁️ {video.views || 0} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="video-tags">
          {video.tags && video.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="video-actions">
          <button className="action-button like-button" onClick={handleLike}>
            👍 {video.likes || 0}
          </button>
          <button className="action-button share-button" onClick={handleShare}>
            🔗 Share
          </button>
          <Link href={`/video/${video._id}`} onClick={(e) => e.stopPropagation()}>
            <button className="action-button join-button">
              ▶ Join
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}