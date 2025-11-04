import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Upload, Smartphone, Zap, Shield, Users, Rocket, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { user, login } = useAuth()

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "One-Click Upload",
      description: "Upload videos directly to YouTube with automatic optimization"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile First",
      description: "Perfectly optimized for mobile devices and touch interactions"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Detection",
      description: "Auto-detect Shorts vs regular videos based on duration and orientation"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your credentials are never stored, encrypted with OAuth 2.0"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi Upload",
      description: "Upload up to 10 videos simultaneously with batch processing"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Fast Processing",
      description: "Optimized upload speeds with progress tracking"
    }
  ]

  const stats = [
    { value: "10x", label: "Faster Upload" },
    { value: "100%", label: "Secure" },
    { value: "∞", label: "Unlimited Videos" },
    { value: "24/7", label: "Available" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Upload to YouTube{' '}
            <span className="gradient-text">
              Faster, Smarter
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            YouLoad helps you upload both <span className="text-primary font-semibold">Shorts</span> & <span className="text-primary font-semibold">long videos</span> with style — even from your phone. 
            Fast, secure, and beautifully designed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            {user ? (
              <>
                <Link to="/upload" className="btn-primary text-lg px-8 py-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Single Upload
                </Link>
                <Link to="/multi-upload" className="btn-secondary text-lg px-8 py-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Multi Upload (10 Videos)
                </Link>
              </>
            ) : (
              <button onClick={login} className="btn-primary text-lg px-8 py-4 flex items-center">
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Free
              </button>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose YouLoad?</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Everything you need to manage your YouTube uploads efficiently and professionally
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass rounded-2xl p-6 group hover:border-primary/50 transition-all duration-300 border border-transparent"
              >
                <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-400 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Upload Experience?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of content creators who trust YouLoad for their YouTube uploads
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/multi-upload" className="btn-primary text-lg px-8 py-4">
                  Start Multi Upload
                </Link>
                <Link to="/dashboard" className="btn-secondary text-lg px-8 py-4">
                  View Dashboard
                </Link>
              </div>
            ) : (
              <button onClick={login} className="btn-primary text-lg px-8 py-4">
                Start Uploading Now
              </button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
