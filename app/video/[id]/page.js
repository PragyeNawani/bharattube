'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function VideoPage() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

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
      // Refresh video data
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
      
      if (navigator.share) {
        navigator.share({
          title: video.title,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Video link copied to clipboard!');
      }
      
      fetchVideo();
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '50px', textAlign: 'center' }}>Video not found</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
        <div style={{ background: '#333', borderRadius: '15px', overflow: 'hidden', marginBottom: '30px' }}>
          {video.videoUrl && (
            <iframe
              width="100%"
              height="600"
              src={video.videoUrl}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>{video.title}</h1>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', color: '#666' }}>👁️ {video.views || 0} views</span>
          <button className="action-button like-button" onClick={handleLike}>
            👍 {video.likes || 0}
          </button>
          <button className="action-button share-button" onClick={handleShare}>
            🔗 Share ({video.shares || 0})
          </button>
        </div>
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Uploaded by <strong style={{ color: '#ff6600' }}>{video.username}</strong> • {new Date(video.createdAt).toLocaleDateString()}
            </p>
          </div>
          <h3 style={{ marginBottom: '15px', color: '#ff6600' }}>Description</h3>
          <p style={{ lineHeight: '1.6', color: '#333' }}>{video.description || 'No description available.'}</p>
          <div style={{ marginTop: '30px' }}>
            <h4 style={{ marginBottom: '10px', color: '#ff6600' }}>Tags</h4>
            <div className="video-tags">
              {video.tags && video.tags.length > 0 ? (
                video.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))
              ) : (
                <p style={{ color: '#999' }}>No tags</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}