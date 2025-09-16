import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

export async function POST(request: NextRequest) {
  try {
    const { roomName, username } = await request.json() as { roomName?: string; username?: string }

    if (!roomName || !username) {
      return NextResponse.json(
        { error: 'Room name and username are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create room service client
    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret)

    // Create or get room
    try {
      await roomService.createRoom({
        name: roomName,
        maxParticipants: 50,
      })
    } catch (error: any) {
      // Room might already exist, which is fine
      console.log('Room might already exist:', error?.message)
    }

    // Create access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: false, // We only need chat, not audio/video
      canSubscribe: false, // We only need chat, not audio/video
      canPublishData: true, // Allow sending chat messages
    })

    const token = await at.toJwt()

    return NextResponse.json({
      token,
      wsUrl,
      roomName,
      username,
    })
  } catch (error: any) {
    console.error('Error generating token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}