'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to upload videos');
        setLoading(false);
        return;
      }

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          thumbnailUrl,
          tags: tagsArray
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Video uploaded successfully!');
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setThumbnailUrl('');
        setTags('');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="upload-container">
        <h1 className="upload-title">Upload Video</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-input"
              placeholder="Video Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="form-group">
            <input
              type="url"
              className="form-input"
              placeholder="Video URL (e.g., https://www.youtube.com/embed/VIDEO_ID)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              For YouTube: Use embed URL format (https://www.youtube.com/embed/VIDEO_ID)
            </small>
          </div>
          <div className="form-group">
            <input
              type="url"
              className="form-input"
              placeholder="Thumbnail URL (optional)"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Tags (comma separated, e.g., music, dance, bollywood)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </>
  );
}