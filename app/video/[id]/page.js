'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function VideoPage() {
  const params = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setVideo(data.video);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await fetch(`/api/videos/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'like' }),
      });
      fetchVideo();
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleShare = async () => {
    try {
      await fetch(`/api/videos/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'share' }),
      });
      
      // Copy link to clipboard
      const videoUrl = `${window.location.origin}/video/${params.id}`;
      await navigator.clipboard.writeText(videoUrl);
      alert('Link copied to clipboard!');
      
      fetchVideo();
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="video-page-container">
          <p>Loading video...</p>
        </div>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Navbar />
        <div className="video-page-container">
          <p>Video not found</p>
        </div>
      </>
    );
  }

  const isFileUpload = video.uploadType === 'file' || video.videoUrl.startsWith('/uploads/');

  return (
    <>
      <Navbar />
      <div className="video-page-container">
        <div className="video-player-section">
          {isFileUpload ? (
            // HTML5 Video Player for uploaded files
            <video
              controls
              className="video-player"
              style={{
                width: '100%',
                maxHeight: '600px',
                backgroundColor: '#000',
                borderRadius: '10px'
              }}
            >
              <source src={video.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // iFrame for URL videos (YouTube, etc.)
            <iframe
              className="video-player"
              src={video.videoUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        <div className="video-details">
          <h1 className="video-title-large">{video.title}</h1>
          
          <div className="video-meta">
            <div className="video-stats-large">
              <span>{video.views || 0} views</span>
              <span className="dot">•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="video-actions">
              <button className="action-button" onClick={handleLike}>
                👍 Like ({video.likes || 0})
              </button>
              <button className="action-button" onClick={handleShare}>
                📤 Share ({video.shares || 0})
              </button>
            </div>
          </div>

          <div className="video-owner">
            <div className="owner-avatar">
              {video.username ? video.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="owner-info">
              <p className="owner-name">{video.username}</p>
              {isFileUpload && (
                <span className="upload-badge">Local Upload</span>
              )}
            </div>
          </div>

          {video.description && (
            <div className="video-description">
              <h3>Description</h3>
              <p>{video.description}</p>
            </div>
          )}

          {video.tags && video.tags.length > 0 && (
            <div className="video-tags-section">
              <h3>Tags</h3>
              <div className="tags-container">
                {video.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}