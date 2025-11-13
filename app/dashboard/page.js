"use client"
import React, { useState, useEffect } from 'react';
import { Eye, ThumbsUp, Share2, Users, Clock, TrendingUp, Video, AlertCircle } from 'lucide-react';

export default function CreatorDashboard() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage and check different possible keys
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
        
        // Debug info
        const allKeys = Object.keys(localStorage);
        setDebugInfo({
          hasToken: !!token,
          tokenKey: foundKey,
          allLocalStorageKeys: allKeys,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
        });
        
        console.log('=== Dashboard Debug Info ===');
        console.log('Token found:', !!token);
        console.log('Token key used:', foundKey);
        console.log('All localStorage keys:', allKeys);
        console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
        
        if (!token) {
          setError('No authentication token found. Please log in first.');
          setLoading(false);
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        console.log('Fetching user profile...');
        
        // Fetch user profile
        const userResponse = await fetch('/api/user/profile', {
          method: 'GET',
          headers: headers,
        });

        console.log('User response status:', userResponse.status);

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({}));
          console.error('User fetch error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch user data');
        }

        const userData = await userResponse.json();
        console.log('User data received:', userData);
        setUser(userData);

        console.log('Fetching user videos...');

        // Fetch user's videos
        const videosResponse = await fetch('/api/user/videos', {
          method: 'GET',
          headers: headers,
        });

        console.log('Videos response status:', videosResponse.status);

        if (!videosResponse.ok) {
          const errorData = await videosResponse.json().catch(() => ({}));
          console.error('Videos fetch error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch videos');
        }

        const videosData = await videosResponse.json();
        console.log('Videos data received:', videosData);
        setVideos(videosData.videos || []);
        
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

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalShares = videos.reduce((sum, v) => sum + (v.shares || 0), 0);
  const totalWatchTime = videos.reduce((sum, v) => sum + (v.watchTime || 0), 0);
  const subscribers = 2847; // This should come from your user data

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info Panel */}
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

      {/* Error Panel */}
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
          {/* Header */}
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

          {/* Dashboard Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Stats */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Channel Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={Users} 
                  label="Subscribers" 
                  value={subscribers.toLocaleString()} 
                  trend="+12%" 
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

            {/* Videos Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Videos ({videos.length})</h2>
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
          </div>
        </>
      )}
    </div>
  );
}