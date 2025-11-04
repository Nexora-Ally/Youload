import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../contexts/AuthContext'
import { Upload, Video, Settings, CheckCircle, Play, Edit3 } from 'lucide-react'

const Upload = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoFile, setVideoFile] = useState(null)
  const [videoInfo, setVideoInfo] = useState({
    title: '',
    description: '',
    tags: '',
    visibility: 'public'
  })
  const [isShorts, setIsShorts] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      
      // Create object URL for preview
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
      
      // Auto-detect if it's a Short
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        const isVertical = video.videoHeight > video.videoWidth
        const isShort = video.duration <= 60
        setIsShorts(isVertical && isShort)
        
        // Set default title
        setVideoInfo(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, "")
        }))
      }
      video.src = url
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!videoFile || !user) return

    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('title', videoInfo.title)
    formData.append('description', videoInfo.description)
    formData.append('tags', videoInfo.tags)
    formData.append('visibility', videoInfo.visibility)
    formData.append('isShorts', isShorts)

    try {
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

      const data = await response.json()
      // Redirect to success page
      window.location.href = `/success?videoId=${data.videoId}&title=${encodeURIComponent(data.title)}`
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass rounded-2xl p-8 max-w-md w-full">
          <Video className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please login with Google to upload videos</p>
          <button onClick={() => window.authContext?.login()} className="btn-primary w-full">
            Login with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Upload Your Video</h1>
          <p className="text-gray-400">Share your content with the world in just a few clicks</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-gray-600 hover:border-primary/50'
              } ${videoFile ? 'bg-green-500/10 border-green-500' : ''}`}
            >
              <input {...getInputProps()} />
              <AnimatePresence>
                {videoFile ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <p className="font-semibold text-lg">{videoFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {formatFileSize(videoFile.size)}
                      </p>
                    </div>
                    <p className="text-gray-400">Click or drag to replace</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                  >
                    <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-semibold text-lg">
                        {isDragActive ? 'Drop the video here' : 'Drag & drop your video'}
                      </p>
                      <p className="text-gray-400">or click to browse</p>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Supports MP4, MOV, AVI, MKV, WebM
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Video Preview */}
            {videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-primary" />
                  Video Preview
                </h3>
                <video
                  src={videoUrl}
                  className="w-full rounded-lg max-h-64 object-cover"
                  controls
                />
              </motion.div>
            )}

            {/* Shorts Toggle */}
            {videoFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-semibold">Shorts Mode</p>
                      <p className="text-gray-400 text-sm">
                        {isShorts ? 'This will be uploaded as a Short' : 'Regular video upload'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsShorts(!isShorts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isShorts ? 'bg-primary' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isShorts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Video Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Video Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={videoInfo.title}
                    onChange={(e) => setVideoInfo(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Enter video title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={videoInfo.description}
                    onChange={(e) => setVideoInfo(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Enter video description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={videoInfo.tags}
                    onChange={(e) => setVideoInfo(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="tag1, tag2, tag3..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visibility
                  </label>
                  <select
                    value={videoInfo.visibility}
                    onChange={(e) => setVideoInfo(prev => ({ ...prev, visibility: e.target.value }))}
                    className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            {videoFile && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleUpload}
                disabled={uploading || !videoInfo.title.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {uploading ? (
                  <>
                    <div 
                      className="absolute left-0 top-0 h-full bg-primary/50 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                    <span className="relative z-10 flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Uploading... {Math.round(progress)}%
                    </span>
                  </>
                ) : (
                  'Upload to YouTube'
                )}
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Upload
