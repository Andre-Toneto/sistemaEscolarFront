import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function initSocket(token: string): Socket {
  socket = io("http://localhost:3000", {
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