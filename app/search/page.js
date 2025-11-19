// app/search/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Users, Video, Eye, ThumbsUp, Calendar, Bell, BellOff } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelInfo, setChannelInfo] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'channel'

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
    if (query) {
      searchVideos();
    }
  }, [query]);

  useEffect(() => {
    if (channelInfo && isLoggedIn) {
      checkSubscriptionStatus();
    }
  }, [channelInfo, isLoggedIn]);

  const searchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok) {
        setVideos(data.videos || []);
        
        // Check if search is for a specific channel
        const channelVideos = data.videos.filter(v => 
          v.username.toLowerCase() === query.toLowerCase()
        );
        
        if (channelVideos.length > 0) {
          setChannelInfo({
            username: channelVideos[0].username,
            videoCount: channelVideos.length
          });
          fetchSubscriberCount(channelVideos[0].username);
          setViewMode('channel');
        } else {
          setChannelInfo(null);
          setViewMode('all');
        }
      }
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriberCount = async (username) => {
    try {
      const response = await fetch(`/api/subscriptions/count?username=${username}`);
      const data = await response.json();
      if (response.ok) {
        setSubscriberCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/subscriptions/check?channel=${channelInfo.username}`, {
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

    if (currentUsername === channelInfo.username) {
      alert('You cannot subscribe to yourself');
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
        body: JSON.stringify({ channelUsername: channelInfo.username })
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

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views;
  };

  const formatDate = (date) => {
    const now = new Date();
    const videoDate = new Date(date);
    const diffTime = Math.abs(now - videoDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getTotalViews = () => {
    return videos
      .filter(v => v.username === channelInfo?.username)
      .reduce((sum, v) => sum + (v.views || 0), 0);
  };

  const getTotalLikes = () => {
    return videos
      .filter(v => v.username === channelInfo?.username)
      .reduce((sum, v) => sum + (v.likes || 0), 0);
  };

  const displayVideos = viewMode === 'channel' 
    ? videos.filter(v => v.username === channelInfo?.username)
    : videos;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {viewMode === 'channel' ? 'Channel' : 'Search Results'} for "{query}"
            </h1>
            <p className="text-gray-600 mt-1">
              {displayVideos.length} {displayVideos.length === 1 ? 'result' : 'results'} found
            </p>
          </div>

          {/* Channel Header (if viewing a channel) */}
          {viewMode === 'channel' && channelInfo && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-5xl">
                    {channelInfo.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {channelInfo.username}
                    </h2>
                    <div className="flex items-center space-x-6 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{subscriberCount.toLocaleString()}</span>
                        <span className="ml-1">subscribers</span>
                      </div>
                      <div className="flex items-center">
                        <Video className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{channelInfo.videoCount}</span>
                        <span className="ml-1">videos</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{formatViews(getTotalViews())}</span>
                        <span className="ml-1">total views</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600">
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        <span>{getTotalLikes().toLocaleString()} total likes</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {currentUsername !== channelInfo.username && (
                  <button
                    onClick={handleSubscribe}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isSubscribed
                        ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isSubscribed ? (
                      <>
                        <BellOff className="w-5 h-5" />
                        <span>Subscribed</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5" />
                        <span>Subscribe</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {displayVideos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
              <p className="text-gray-600">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayVideos.map((video) => {
                const isFileUpload = video.uploadType === 'file' || video.videoUrl.startsWith('/uploads/');
                
                const getThumbnail = () => {
                  if (video.thumbnailUrl) {
                    return video.thumbnailUrl;
                  }
                  return 'https://via.placeholder.com/320x180/6366f1/ffffff?text=No+Thumbnail';
                };

                return (
                  <a
                    key={video._id}
                    href={`/video/${video._id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      <img
                        src={getThumbnail()}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/320x180/6366f1/ffffff?text=No+Thumbnail';
                        }}
                      />
                      {isFileUpload && (
                        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                          Local
                        </span>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(Math.random() * 20) + 1}:00
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors">
                        {video.title}
                      </h3>
                      
                      {viewMode !== 'channel' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {video.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {video.username}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{formatViews(video.views || 0)} views</span>
                        <span>•</span>
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                      
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {video.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}