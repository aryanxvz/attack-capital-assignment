import ChatManager from "@/components/sections/chat-manager";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-20">
      <header className="mb-8 text-center">
        <h1 className="text-6xl md:text-7xl font-semibold text-white">Attack Capital Assignemnt</h1>
        <p className="text-gray-300 mt-3">AI Chat Agent - Chat with an AI that remembers your conversations</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <ChatManager />
      </div>
    </main>
  )
}
