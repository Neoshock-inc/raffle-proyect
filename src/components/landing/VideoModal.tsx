'use client'
import { X, Play } from 'lucide-react'

type Props = { open: boolean; onClose: () => void }

const VideoModal = ({ open, onClose }: Props) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 max-w-4xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Demo de My Fortuna Cloud</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center">
          <div className="text-center"><Play className="w-20 h-20 text-white/50 mx-auto mb-4" /><p className="text-white/70">Video demo aquí</p></div>
        </div>
      </div>
    </div>
  )
}

export default VideoModal
