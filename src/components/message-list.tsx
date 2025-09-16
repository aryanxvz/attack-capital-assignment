'use client'

type Message = {
  id: number
  text: string
  sender: string
  timestamp: Date | string
  isBot?: boolean
  isSystem?: boolean
  isUser?: boolean
}

type MessageListProps = {
  messages: Message[]
  currentUser: string
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const formatTime = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getMessageStyle = (message: Message) => {
    if (message.isSystem) {
      return 'bg-gray-100 text-gray-600 text-center italic'
    }
    if (message.isBot) {
      return 'bg-blue-100 text-blue-900 ml-0 mr-12'
    }
    if (message.isUser || message.sender === currentUser) {
      return 'bg-green-100 text-green-900 ml-12 mr-0'
    }
    return 'bg-gray-100 text-gray-900 ml-0 mr-12'
  }

  const getSenderLabel = (message: Message) => {
    if (message.isSystem) return null
    if (message.isBot) return 'AI Assistant'
    if (message.isUser || message.sender === currentUser) return 'You'
    return message.sender
  }

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">💬</div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className="message-enter">
            {message.isSystem ? (
              <div className={`p-2 rounded-md text-sm ${getMessageStyle(message)}`}>
                {message.text}
              </div>
            ) : (
              <div className={`p-3 rounded-lg shadow-sm ${getMessageStyle(message)}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">
                    {getSenderLabel(message)}
                    {message.isBot && (
                      <span className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                        🤖 AI
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}