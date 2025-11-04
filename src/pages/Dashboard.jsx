import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Video, Users, Upload, BarChart3, Calendar, Eye, Clock } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUploads: 0,
    shortsCount: 0,
    videosCount: 0,
    thisMonth: 0
  })
  const [recentUploads, setRecentUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user upload data
    const timer = setTimeout(() => {
      setStats({
        totalUploads: 24,
        shortsCount: 18,
        videosCount: 6,
        thisMonth: 8
      })
      
      setRecentUploads([
        {
          id: '1',
          title: 'My Amazing Short Video',
          type: 'shorts',
          date: '2024-01-15',
          views: '1.2K',
          status: 'public'
        },
        {
          id: '2',
          title: 'Travel Vlog Episode 5',
          type: 'video',
          date: '2024-01-14',
          views: '5.4K',
          status: 'public'
        },
        {
          id: '3',
          title: 'Cooking Tutorial - Pasta',
          type: 'video',
          date: '2024-01-12',
          views: '8.7K',
          status: 'public'
        },
        {
          id: '4',
          title: 'Quick Workout Routine',
          type: 'shorts',
          date: '2024-01-10',
          views: '15.2K',
          status: 'public'
        }
      ])
      
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please login to view your dashboard</p>
          <button onClick={() => window.authContext?.login()} className="btn-primary">
            Login with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {user.name}! Here's your upload overview.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Upload className="w-6 h-6" />}
            title="Total Uploads"
            value={stats.totalUploads}
            color="primary"
            loading={loading}
          />
          <StatCard
            icon={<Video className="w-6 h-6" />}
            title="Shorts"
            value={stats.shortsCount}
            color="green"
            loading={loading}
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Videos"
            value={stats.videosCount}
            color="blue"
            loading={loading}
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="This Month"
            value={stats.thisMonth}
            color="purple"
            loading={loading}
          />
        </div>

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              Recent Uploads
            </h2>
            <span className="text-gray-400 text-sm">
              Last 30 days
            </span>
          </div>

          <div className="space-y-4">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : recentUploads.length > 0 ? (
              recentUploads.map((upload, index) => (
                <UploadItem key={upload.id} upload={upload} index={index} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No uploads yet</p>
                <p className="text-sm mt-1">Start uploading to see your content here</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mt-8"
        >
          <div className="glass rounded-2xl p-6 text-center">
            <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Single Upload</h3>
            <p className="text-gray-400 text-sm mb-4">
              Upload one video at a time with full customization
            </p>
            <a href="/upload" className="btn-primary w-full">
              Start Single Upload
            </a>
          </div>

          <div className="glass rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Multi Upload</h3>
            <p className="text-gray-400 text-sm mb-4">
              Upload up to 10 videos simultaneously (Batch processing)
            </p>
            <a href="/multi-upload" className="btn-primary w-full">
              Start Multi Upload
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, title, value, color, loading }) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/20',
    green: 'text-green-500 bg-green-500/20',
    blue: 'text-blue-500 bg-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

const UploadItem = ({ upload, index }) => {
  const getTypeColor = (type) => {
    return type === 'shorts' ? 'text-red-500 bg-red-500/20' : 'text-blue-500 bg-blue-500/20'
  }

  const getTypeIcon = (type) => {
    return type === 'shorts' ? <Video className="w-4 h-4" /> : <Users className="w-4 h-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors"
    >
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(upload.type)}`}>
          {getTypeIcon(upload.type)}
        </div>
        <div>
          <h3 className="font-semibold text-sm">{upload.title}</h3>
          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{upload.date}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{upload.views} views</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs ${
          upload.status === 'public' ? 'bg-green-500/20 text-green-500' :
          upload.status === 'private' ? 'bg-gray-500/20 text-gray-500' :
          'bg-yellow-500/20 text-yellow-500'
        }`}>
          {upload.status}
        </span>
      </div>
    </motion.div>
  )
}

export default Dashboard
