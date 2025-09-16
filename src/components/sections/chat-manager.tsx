'use client'
import { useState } from "react"
import JoinForm from "@/components/join-form"
import ChatRoom from "@/components/chat-room"

type RoomData = {
  token: string
  wsUrl: string
  roomName: string
  username: string
}

export default function ChatManager() {
  const [roomData, setRoomData] = useState<RoomData | null>(null)

  const handleJoinRoom = (data: RoomData) => setRoomData(data)
  const handleLeaveRoom = () => setRoomData(null)

  return (
    <div>
      {!roomData ? (
        <div className="bg-[#18181B] rounded-lg shadow-md px-12 pt-12 pb-16">
          <JoinForm onJoin={handleJoinRoom} />
        </div>
      ) : (
        <div className="bg-[#18181B] rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl text-neutral-200 font-semibold">{roomData.roomName}</h2>
            <button onClick={handleLeaveRoom}
              className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
              Leave Room
            </button>
          </div>

          <ChatRoom
            token={roomData.token}
            serverUrl={roomData.wsUrl} 
            username={roomData.username} 
            roomName={roomData.roomName}
          />
        </div>
      )}
    </div>
  )
}
