'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function UploadPage() {
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'video/mp4') {
        setError('Please select an MP4 video file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('Video file size should be less than 100MB');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file for thumbnail');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Thumbnail file size should be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to upload videos');
        setLoading(false);
        return;
      }

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      if (uploadType === 'url') {
        // URL Upload
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
            tags: tagsArray,
            uploadType: 'url'
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Video uploaded successfully!');
          resetForm();
          setTimeout(() => router.push('/'), 2000);
        } else {
          setError(data.message || 'Upload failed');
        }
      } else {
        // File Upload
        if (!videoFile) {
          setError('Please select a video file');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('videoFile', videoFile);
        if (thumbnailFile) {
          formData.append('thumbnailFile', thumbnailFile);
        }
        formData.append('tags', JSON.stringify(tagsArray));
        formData.append('uploadType', 'file');

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 201) {
            setSuccess('Video uploaded successfully!');
            resetForm();
            setTimeout(() => router.push('/'), 2000);
          } else {
            const data = JSON.parse(xhr.responseText);
            setError(data.message || 'Upload failed');
          }
          setLoading(false);
        });

        xhr.addEventListener('error', () => {
          setError('An error occurred during upload');
          setLoading(false);
        });

        xhr.open('POST', '/api/videos/upload-file');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);

        return;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      if (uploadType === 'url') {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setThumbnailUrl('');
    setVideoFile(null);
    setThumbnailFile(null);
    setTags('');
    setUploadProgress(0);
  };

  return (
    <>
      <Navbar />
      <div className="upload-container">
        <h1 className="upload-title">Upload Video</h1>

        {/* Upload Type Selector */}
        <div className="upload-type-selector" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setUploadType('url')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: uploadType === 'url' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Upload via URL
          </button>
          <button
            type="button"
            onClick={() => setUploadType('file')}
            style={{
              padding: '10px 20px',
              backgroundColor: uploadType === 'file' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Upload File
          </button>
        </div>

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

          {uploadType === 'url' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Select Video File (MP4)
                </label>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleVideoFileChange}
                  required
                  style={{ display: 'block', marginBottom: '5px' }}
                />
                {videoFile && (
                  <small style={{ color: '#28a745', fontSize: '12px' }}>
                    Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </small>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Select Thumbnail (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  style={{ display: 'block', marginBottom: '5px' }}
                />
                {thumbnailFile && (
                  <small style={{ color: '#28a745', fontSize: '12px' }}>
                    Selected: {thumbnailFile.name}
                  </small>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Tags (comma separated, e.g., music, dance, bollywood)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {loading && uploadType === 'file' && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: '#007bff',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <small style={{ display: 'block', textAlign: 'center', marginTop: '5px' }}>
                Uploading: {uploadProgress}%
              </small>
            </div>
          )}

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