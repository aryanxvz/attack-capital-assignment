'use client'
import { useState, useEffect } from "react"
import JoinForm from "@/components/join-form"
import ChatRoom from "@/components/chat-room"
import { LogOut, Hash, User, Clock, ArrowLeft } from 'lucide-react'

type RoomData = {
  token: string
  wsUrl: string
  roomName: string
  username: string
}

export default function ChatManager() {
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)

  const handleJoinRoom = (data: RoomData) => setRoomData(data)
  
  const handleLeaveRoom = () => {
    setRoomData(null)
    setShowLeaveConfirm(false)
    setSessionTime(0)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (roomData) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [roomData])

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative">
      {!roomData ? (
        <div className="bg-[#18181B] rounded-2xl shadow-2xl border border-neutral-700/50 backdrop-blur-sm overflow-hidden">
          <div className="px-12 py-12">
            <JoinForm onJoin={handleJoinRoom} />
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
        </div>
      ) : (
        <div className="bg-[#18181B] rounded-2xl shadow-2xl border border-neutral-700/50 backdrop-blur-sm overflow-hidden">
          <div className="py-2 px-3 bg-gradient-to-r from-neutral-800/80 to-neutral-700/80 backdrop-blur-sm border-b border-neutral-600/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <span>{roomData.roomName}</span>
                    </h2>
                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{roomData.username}</span>
                      </div>
                      <div className="w-1 h-1 bg-neutral-500 rounded-full"></div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatSessionTime(sessionTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!showLeaveConfirm ? (
                  <button onClick={() => setShowLeaveConfirm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-400/20 transition-all duration-200 hover:scale-105 active:scale-95">
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Leave</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 bg-neutral-800/50 rounded-xl p-1 border border-neutral-600/30">
                    <button onClick={() => setShowLeaveConfirm(false)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-slate-300 hover:bg-neutral-700/50 rounded-lg transition-colors">
                      <ArrowLeft className="w-3 h-3" />
                      <span className="text-sm">Cancel</span>
                    </button>
                    <button onClick={handleLeaveRoom}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium">
                      <LogOut className="w-3 h-3" />
                      <span className="text-sm">Confirm</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ChatRoom
            token={roomData.token}
            serverUrl={roomData.wsUrl} 
            username={roomData.username} 
            roomName={roomData.roomName}
          />
          
          <div className="px-6 py-2 bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 backdrop-blur-sm border-t border-neutral-600/30">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <span>Session: {formatSessionTime(sessionTime)}</span>
                <div className="w-1 h-1 bg-neutral-500 rounded-full"></div>
                <span>Room: {roomData.roomName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Connected as {roomData.username}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
