// app/video/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUsername(userData.username);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  useEffect(() => {
    if (video && video.username) {
      fetchSubscriberCount();
      if (isLoggedIn) {
        checkSubscriptionStatus();
      }
    }
  }, [video, isLoggedIn]);

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

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch(`/api/subscriptions/count?username=${video.username}`);
      const data = await response.json();
      if (response.ok) {
        setSubscriberCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/subscriptions/check?channel=${video.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setIsSubscribed(data.subscribed);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      alert('Please login to subscribe');
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = isSubscribed ? '/api/subscriptions/unsubscribe' : '/api/subscriptions';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channelUsername: video.username })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(!isSubscribed);
        setSubscriberCount(prev => isSubscribed ? prev - 1 : prev + 1);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      alert('Failed to update subscription');
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
      <Navbar/>
        <div className="video-page-container">
          <p>Loading video...</p>
        </div>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Navbar/>
        <div className="video-page-container">
          <p>Video not found</p>
        </div>
      </>
    );
  }

  const isFileUpload = video.uploadType === 'file' || video.videoUrl.startsWith('/uploads/');
  const isOwnVideo = currentUsername === video.username;

  return (
    <>
      <Navbar/>
      <div className="video-page-container">
        <div className="video-player-section">
          {isFileUpload ? (
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
              <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
              </p>
              {isFileUpload && (
                <span className="upload-badge">Local Upload</span>
              )}
            </div>
            {!isOwnVideo && (
              <button
                onClick={handleSubscribe}
                style={{
                  marginLeft: 'auto',
                  padding: '10px 24px',
                  backgroundColor: isSubscribed ? '#e0e0e0' : '#ff0000',
                  color: isSubscribed ? '#333' : 'white',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubscribed) {
                    e.target.style.backgroundColor = '#cc0000';
                  } else {
                    e.target.style.backgroundColor = '#d0d0d0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubscribed) {
                    e.target.style.backgroundColor = '#ff0000';
                  } else {
                    e.target.style.backgroundColor = '#e0e0e0';
                  }
                }}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
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