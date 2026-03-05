import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function initSocket(token: string): Socket {
  const { hostname, protocol } = window.location
  const socketUrl = `${protocol}//${hostname}:3000`

  socket = io(socketUrl, {
    auth: { token }
  })

  return socket
}

export function getSocket(): Socket {
  if (!socket) {
    throw new Error("Socket não inicializado. Chame initSocket primeiro.")
  }

  return socket
}
