import Link from 'next/link';
import Image from 'next/image';

export default function VideoCard({ video }) {
  // Determine if video is a file upload or URL
  const isFileUpload = video.uploadType === 'file' || video.videoUrl.startsWith('/uploads/');
  
  // Get thumbnail
  const getThumbnail = () => {
    if (video.thumbnailUrl) {
      return video.thumbnailUrl;
    }
    
    // Default thumbnail for file uploads
    if (isFileUpload) {
      return '/default-video-thumbnail.png'; // You can create a default thumbnail
    }
    
    // For YouTube URLs, generate thumbnail
    if (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')) {
      const videoId = extractYouTubeId(video.videoUrl);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return '/default-video-thumbnail.png';
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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

  return (
    <Link href={`/video/${video._id}`} className="video-card">
      <div className="video-thumbnail-container">
        <img
          src={getThumbnail()}
          alt={video.title}
          className="video-thumbnail"
          onError={(e) => {
            e.target.src = '/default-video-thumbnail.png';
          }}
        />
        {isFileUpload && (
          <span className="video-badge">Local</span>
        )}
      </div>
      
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-username">{video.username}</p>
        <div className="video-stats">
          <span>{formatViews(video.views || 0)} views</span>
          <span className="dot">•</span>
          <span>{formatDate(video.createdAt)}</span>
        </div>
        {video.tags && video.tags.length > 0 && (
          <div className="video-tags">
            {video.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="video-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}