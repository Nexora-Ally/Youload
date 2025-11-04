import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../contexts/AuthContext'
import { Upload, Video, Settings, CheckCircle, X, Play, Edit3, Users, AlertCircle } from 'lucide-react'

const MultiUpload = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [videos, setVideos] = useState([])
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const newVideos = acceptedFiles.slice(0, 10 - videos.length).map(file => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: '',
        tags: '',
        visibility: 'public',
        isShorts: false,
        progress: 0,
        status: 'pending', // pending, uploading, completed, error
        duration: 0,
        isVertical: false,
        size: file.size
      }
    })

    setVideos(prev => [...prev, ...newVideos])

    // Detect video properties for each new video
    newVideos.forEach(video => {
      detectVideoProperties(video.id, video.file)
    })
  }, [videos.length])

  const detectVideoProperties = (videoId, file) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const isVertical = video.videoHeight > video.videoWidth
      const isShort = video.duration <= 60
      const duration = video.duration
      
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { 
              ...v, 
              isShorts: isVertical && isShort,
              duration,
              isVertical 
            } 
          : v
      ))
    }
    video.src = URL.createObjectURL(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    multiple: true,
    maxFiles: 10
  })

  const removeVideo = (videoId) => {
    setVideos(prev => prev.filter(v => v.id !== videoId))
    if (currentEditingIndex !== null) {
      setCurrentEditingIndex(null)
    }
  }

  const updateVideo = (videoId, updates) => {
    setVideos(prev => prev.map(v => 
      v.id === videoId ? { ...v, ...updates } : v
    ))
  }

  const startEditing = (index) => {
    setCurrentEditingIndex(index)
  }

  const handleMultiUpload = async () => {
    if (!videos.length || !user) return

    setUploading(true)
    setOverallProgress(0)

    const totalVideos = videos.length
    let completedVideos = 0

    // Upload videos sequentially
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      
      // Update video status to uploading
      updateVideo(video.id, { status: 'uploading', progress: 0 })

      try {
        await uploadSingleVideo(video, (progress) => {
          updateVideo(video.id, { progress })
        })

        // Update video status to completed
        updateVideo(video.id, { status: 'completed', progress: 100 })
        completedVideos++
        
        // Update overall progress
        setOverallProgress((completedVideos / totalVideos) * 100)

      } catch (error) {
        console.error(`Upload failed for ${video.title}:`, error)
        updateVideo(video.id, { status: 'error' })
        completedVideos++
        setOverallProgress((completedVideos / totalVideos) * 100)
      }
    }

    setUploading(false)
    
    // Show success message when all videos are processed
    if (completedVideos === totalVideos) {
      const successfulUploads = videos.filter(v => v.status === 'completed').length
      alert(`Upload completed! ${successfulUploads}/${totalVideos} videos uploaded successfully.`)
    }
  }

  const uploadSingleVideo = async (video, onProgress) => {
    const formData = new FormData()
    formData.append('video', video.file)
    formData.append('title', video.title)
    formData.append('description', video.description)
    formData.append('tags', video.tags)
    formData.append('visibility', video.visibility)
    formData.append('isShorts', video.isShorts)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787'
    const token = localStorage.getItem('youload_token')

    const response = await fetch(`${backendUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Upload failed')
    }

    return await response.json()
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'uploading': return 'text-blue-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'uploading': return <div className="spinner"></div>
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass rounded-2xl p-8 max-w-md w-full">
          <Users className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please login with Google to upload multiple videos</p>
          <button onClick={() => window.authContext?.login()} className="btn-primary w-full">
            Login with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Multi Video Upload</h1>
          <p className="text-gray-400">Upload up to 10 videos at once. Perfect for batch content creation.</p>
        </motion.div>

        {/* Upload Area */}
        {videos.length < 10 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-600 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="font-semibold text-lg mb-2">
                {isDragActive ? 'Drop videos here' : 'Drag & drop videos here'}
              </p>
              <p className="text-gray-400 mb-2">or click to browse</p>
              <p className="text-gray-400 text-sm">
                {videos.length}/10 videos selected • Supports MP4, MOV, AVI, MKV, WebM
              </p>
            </div>
          </motion.div>
        )}

        {/* Overall Progress */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Overall Progress
              </h3>
              <span className="text-primary font-semibold">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                {videos.filter(v => v.status === 'completed').length} of {videos.length} videos completed
              </span>
              <span>
                {videos.filter(v => v.status === 'uploading').length} uploading
              </span>
            </div>
          </motion.div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
            {videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index}
                isEditing={currentEditingIndex === index}
                onEdit={() => startEditing(index)}
                onUpdate={(updates) => updateVideo(video.id, updates)}
                onRemove={() => removeVideo(video.id)}
                formatDuration={formatDuration}
                formatFileSize={formatFileSize}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </div>
        )}

        {/* Upload Button */}
        {videos.length > 0 && !uploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <button
              onClick={handleMultiUpload}
              disabled={videos.some(v => !v.title.trim())}
              className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload All Videos ({videos.length})
            </button>
            <p className="text-gray-400 text-sm mt-2">
              {videos.filter(v => v.isShorts).length} Shorts ready • {videos.filter(v => !v.isShorts).length} Regular videos
            </p>
            
            {videos.some(v => !v.title.trim()) && (
              <p className="text-red-400 text-sm mt-2 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Please add titles to all videos before uploading
              </p>
            )}
          </motion.div>
        )}

        {/* Quick Stats */}
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mt-8"
          >
            <h3 className="font-semibold mb-4">Upload Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{videos.length}</div>
                <div className="text-gray-400">Total Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{videos.filter(v => v.isShorts).length}</div>
                <div className="text-gray-400">Shorts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{videos.filter(v => !v.isShorts).length}</div>
                <div className="text-gray-400">Regular Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {formatFileSize(videos.reduce((acc, video) => acc + video.size, 0))}
                </div>
                <div className="text-gray-400">Total Size</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const VideoCard = ({ video, index, isEditing, onEdit, onUpdate, onRemove, formatDuration, formatFileSize, getStatusColor, getStatusIcon }) => {
  const [videoUrl, setVideoUrl] = useState('')

  React.useEffect(() => {
    const url = URL.createObjectURL(video.file)
    setVideoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [video.file])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${
        video.status === 'completed' ? 'border-2 border-green-500' :
        video.status === 'error' ? 'border-2 border-red-500' :
        video.status === 'uploading' ? 'border-2 border-blue-500' :
        'border border-white/10'
      }`}
    >
      {/* Video Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{index + 1}</span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(video.status)} flex items-center space-x-1`}>
              {getStatusIcon(video.status)}
              <span>{video.status.charAt(0).toUpperCase() + video.status.slice(1)}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {video.isShorts && video.status === 'pending' && (
              <button
                onClick={onEdit}
                className={`p-1 rounded transition-colors ${
                  isEditing ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
                title="Edit Shorts Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {video.status === 'pending' && (
              <button
                onClick={onRemove}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Remove Video"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Video Preview */}
        <div className="relative rounded-lg overflow-hidden bg-black mb-2">
          {videoUrl && (
            <video
              src={videoUrl}
              className={`w-full ${video.isVertical ? 'h-48' : 'h-32'} object-cover`}
              muted
            />
          )}
          <div className="absolute bottom-2 right-2 bg-black/80 rounded px-2 py-1 text-xs">
            {formatDuration(video.duration)}
          </div>
          <div className="absolute top-2 left-2">
            {video.isShorts && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">SHORTS</span>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded">
              {video.isVertical ? 'Vertical' : 'Horizontal'}
            </span>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        {isEditing && video.isShorts ? (
          <ShortsEditForm video={video} onUpdate={onUpdate} />
        ) : (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm mb-1 truncate" title={video.title}>
                {video.title}
              </h3>
              <p className="text-gray-400 text-xs">
                {formatFileSize(video.size)}
              </p>
            </div>

            {/* Progress Bar */}
            {video.status === 'uploading' && (
              <div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${video.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-right">{Math.round(video.progress)}%</p>
              </div>
            )}

            {video.status === 'completed' && (
              <div className="flex items-center space-x-2 text-green-500 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Successfully uploaded</span>
              </div>
            )}

            {video.status === 'error' && (
              <div className="text-red-500 text-sm flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>Upload failed</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const ShortsEditForm = ({ video, onUpdate }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={video.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          placeholder="Enter video title..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={video.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows="2"
          className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Enter video description..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={video.tags}
          onChange={(e) => onUpdate({ tags: e.target.value })}
          className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          placeholder="tag1, tag2, tag3..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Visibility
        </label>
        <select
          value={video.visibility}
          onChange={(e) => onUpdate({ visibility: e.target.value })}
          className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </div>
    </div>
  )
}

export default MultiUpload
