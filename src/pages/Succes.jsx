import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { CheckCircle, Youtube, Share2, Copy, Upload, Twitter, Facebook, Link2 } from 'lucide-react'

const Success = () => {
  const [searchParams] = useSearchParams()
  const [videoData, setVideoData] = useState(null)
  const [copied, setCopied] = useState(false)
  const videoId = searchParams.get('videoId')
  const videoTitle = searchParams.get('title')

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }))
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }))
    }, 250)

    // Set video data
    if (videoId) {
      setVideoData({
        title: videoTitle || 'Your Uploaded Video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        url: `https://youtube.com/watch?v=${videoId}`,
        id: videoId
      })
    }

    return () => clearInterval(interval)
  }, [videoId, videoTitle])

  const copyToClipboard = async () => {
    if (videoData?.url) {
      try {
        await navigator.clipboard.writeText(videoData.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy: ', err)
      }
    }
  }

  const shareToTwitter = () => {
    if (videoData?.url) {
      const text = `Check out my new video on YouTube! 🎥`
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoData.url)}`, '_blank')
    }
  }

  const shareToFacebook = () => {
    if (videoData?.url) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoData.url)}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary/10 to-purple-500/5">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30"
        >
          <CheckCircle className="w-12 h-12 text-green-500" />
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2 gradient-text"
        >
          Upload Successful!
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-8"
        >
          Your video has been uploaded to YouTube successfully and is now processing.
        </motion.p>

        {/* Video Preview */}
        {videoData && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 mb-6 border border-green-500/20"
          >
            <div className="relative rounded-xl overflow-hidden mb-4 bg-black">
              <img
                src={videoData.thumbnail}
                alt={videoData.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-semibold text-white text-left text-sm line-clamp-2">
                  {videoData.title}
                </h3>
              </div>
            </div>
            
            <div className="space-y-3">
              <a
                href={videoData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary flex items-center justify-center"
              >
                <Youtube className="w-5 h-5 mr-2" />
                Watch on YouTube
              </a>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center btn-secondary py-2"
                  title="Copy Link"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={shareToTwitter}
                  className="flex items-center justify-center btn-secondary py-2"
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                
                <button
                  onClick={shareToFacebook}
                  className="flex items-center justify-center btn-secondary py-2"
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          <Link to="/multi-upload" className="btn-primary flex items-center justify-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload More Videos
          </Link>
          
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-gray-500"
        >
          <p>Your video is being processed by YouTube and will be available soon.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Success
