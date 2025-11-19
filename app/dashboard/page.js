// app/dashboard/page.js
"use client"
import React, { useState, useEffect } from 'react';
import { Eye, ThumbsUp, Share2, Users, Clock, TrendingUp, Video, AlertCircle, Bell, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function CreatorDashboard() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [channelsData, setChannelsData] = useState({});
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const tokenKeys = ['token', 'authToken', 'jwt', 'accessToken', 'bharattube_token'];
        let token = null;
        let foundKey = null;
        
        for (const key of tokenKeys) {
          const value = localStorage.getItem(key);
          if (value) {
            token = value;
            foundKey = key;
            break;
          }
        }
        
        const allKeys = Object.keys(localStorage);
        setDebugInfo({
          hasToken: !!token,
          tokenKey: foundKey,
          allLocalStorageKeys: allKeys,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
        });
        
        if (!token) {
          setError('No authentication token found. Please log in first.');
          setLoading(false);
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        // Fetch user profile
        const userResponse = await fetch('/api/user/profile', {
          method: 'GET',
          headers: headers,
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user's videos
        const videosResponse = await fetch('/api/user/videos', {
          method: 'GET',
          headers: headers,
        });

        if (!videosResponse.ok) {
          const errorData = await videosResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch videos');
        }

        const videosData = await videosResponse.json();
        setVideos(videosData.videos || []);

        // Fetch subscriber count
        const subCountResponse = await fetch(`/api/subscriptions/count?username=${userData.username}`);
        if (subCountResponse.ok) {
          const subCountData = await subCountResponse.json();
          setSubscriberCount(subCountData.count || 0);
        }

        // Fetch user's subscriptions
        const subsResponse = await fetch('/api/subscriptions', {
          method: 'GET',
          headers: headers,
        });

        if (subsResponse.ok) {
          const subsData = await subsResponse.json();
          setSubscriptions(subsData.subscriptions || []);
          
          // Fetch channel data for each subscription
          await fetchChannelsData(subsData.subscriptions || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchChannelsData = async (subs) => {
    const channelsInfo = {};
    
    for (const sub of subs) {
      try {
        // Fetch subscriber count for each channel
        const countResponse = await fetch(`/api/subscriptions/count?username=${sub.channelUsername}`);
        if (countResponse.ok) {
          const countData = await countResponse.json();
          channelsInfo[sub.channelUsername] = {
            subscriberCount: countData.count || 0
          };
        }

        // Fetch channel's videos
        const videosResponse = await fetch(`/api/search?q=${encodeURIComponent(sub.channelUsername)}`);
        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          const channelVideos = videosData.videos.filter(v => v.username === sub.channelUsername);
          channelsInfo[sub.channelUsername] = {
            ...channelsInfo[sub.channelUsername],
            videoCount: channelVideos.length,
            latestVideos: channelVideos.slice(0, 3)
          };
        }
      } catch (error) {
        console.error(`Error fetching data for ${sub.channelUsername}:`, error);
      }
    }
    
    setChannelsData(channelsInfo);
  };

  const handleUnsubscribe = async (channelUsername) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscriptions/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channelUsername })
      });

      if (response.ok) {
        setSubscriptions(subs => subs.filter(sub => sub.channelUsername !== channelUsername));
        const newChannelsData = { ...channelsData };
        delete newChannelsData[channelUsername];
        setChannelsData(newChannelsData);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalShares = videos.reduce((sum, v) => sum + (v.shares || 0), 0);
  const totalWatchTime = videos.reduce((sum, v) => sum + (v.watchTime || 0), 0);

  const formatWatchTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()} hrs`;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
      <Navbar/>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <Navbar/> 
    <div className="min-h-screen bg-gray-50">
      {debugInfo && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-blue-900 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Debug Information (Click to expand)
            </summary>
            <div className="mt-3 text-sm space-y-2 text-blue-800">
              <p><strong>Has Token:</strong> {debugInfo.hasToken ? 'Yes ✓' : 'No ✗'}</p>
              <p><strong>Token Key:</strong> {debugInfo.tokenKey || 'None found'}</p>
              <p><strong>Token Preview:</strong> {debugInfo.tokenPreview}</p>
              <p><strong>All localStorage Keys:</strong> {debugInfo.allLocalStorageKeys.length > 0 ? debugInfo.allLocalStorageKeys.join(', ') : 'Empty'}</p>
            </div>
          </details>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Error loading dashboard data</p>
                <p className="text-sm mt-1 text-red-700">{error}</p>
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Go to Login
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-white hover:bg-gray-50 text-red-700 border border-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {user && (
        <>
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Member since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Channel Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={Users} 
                  label="Subscribers" 
                  value={subscriberCount.toLocaleString()} 
                  color="bg-red-600" 
                />
                <StatCard 
                  icon={Eye} 
                  label="Total Views" 
                  value={totalViews.toLocaleString()} 
                  trend="+8%" 
                  color="bg-blue-600" 
                />
                <StatCard 
                  icon={Clock} 
                  label="Watch Time" 
                  value={formatWatchTime(totalWatchTime)} 
                  trend="+15%" 
                  color="bg-green-600" 
                />
                <StatCard 
                  icon={ThumbsUp} 
                  label="Total Likes" 
                  value={totalLikes.toLocaleString()} 
                  trend="+5%" 
                  color="bg-purple-600" 
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'videos'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4" />
                      <span>Your Videos ({videos.length})</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'subscriptions'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span>Subscriptions ({subscriptions.length})</span>
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === 'videos' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Your Videos</h2>
                  <button 
                    onClick={() => window.location.href = '/upload'}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Upload Video</span>
                  </button>
                </div>

                {videos.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos yet</h3>
                    <p className="text-gray-600 mb-6">Upload your first video to get started!</p>
                    <button 
                      onClick={() => window.location.href = '/upload'}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                    >
                      <Video className="w-5 h-5" />
                      <span>Upload Video</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Video
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Views
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Likes
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Shares
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Watch Time
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Published
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {videos.map((video) => (
                            <tr key={video._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-4">
                                  <img
                                    src={video.thumbnailUrl || 'https://via.placeholder.com/320x180/6366f1/ffffff?text=No+Thumbnail'}
                                    alt={video.title}
                                    className="w-32 h-18 object-cover rounded"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/320x180/6366f1/ffffff?text=No+Thumbnail';
                                    }}
                                  />
                                  <div className="max-w-sm">
                                    <p className="font-semibold text-gray-900 mb-1">{video.title}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {video.description || 'No description'}
                                    </p>
                                    {video.tags && video.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {video.tags.map((tag, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {(video.views || 0).toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <ThumbsUp className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {(video.likes || 0).toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <Share2 className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {(video.shares || 0).toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {formatWatchTime(video.watchTime || 0)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-600">
                                  {formatDate(video.createdAt)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Subscriptions</h2>
                {subscriptions.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No subscriptions yet</h3>
                    <p className="text-gray-600 mb-6">Subscribe to channels to see their content here!</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Explore Videos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {subscriptions.map((sub) => {
                      const channelInfo = channelsData[sub.channelUsername] || {};
                      return (
                        <div key={sub._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                                  {sub.channelUsername.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900 text-xl mb-1">{sub.channelUsername}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                      <Users className="w-4 h-4 mr-1" />
                                      {(channelInfo.subscriberCount || 0).toLocaleString()} subscribers
                                    </span>
                                    <span className="flex items-center">
                                      <Video className="w-4 h-4 mr-1" />
                                      {channelInfo.videoCount || 0} videos
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Subscribed on {formatDate(sub.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUnsubscribe(sub.channelUsername)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                              >
                                Unsubscribe
                              </button>
                            </div>

                            {channelInfo.latestVideos && channelInfo.latestVideos.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Latest Videos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {channelInfo.latestVideos.map((video) => (
                                    <a
                                      key={video._id}
                                      href={`/video/${video._id}`}
                                      className="group cursor-pointer"
                                    >
                                      <div className="relative overflow-hidden rounded-lg mb-2">
                                        <img
                                          src={video.thumbnailUrl || 'https://via.placeholder.com/320x180/6366f1/ffffff?text=No+Thumbnail'}
                                          alt={video.title}
                                          className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                                          onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/320x180/6366f1/ffffff?text=No+Thumbnail';
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                      </div>
                                      <h5 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                                        {video.title}
                                      </h5>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {(video.views || 0).toLocaleString()} views • {formatDate(video.createdAt)}
                                      </p>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => window.location.href = `/search?q=${sub.channelUsername}`}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                              >
                                View Channel
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
    </>
  );
}