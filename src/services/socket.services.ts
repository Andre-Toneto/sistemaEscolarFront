import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function initSocket(token: string): Socket {
  // Ao usar proxy no Vite ou Nginx, podemos usar a mesma origem do navegador (auto-detect)
  socket = io({
    auth: { token },
    // O path padrão do Socket.io já é /socket.io, então não precisamos especificar
    // a menos que queiramos ser explícitos.
  })

  return socket
}

export function getSocket(): Socket {
  if (!socket) {
    throw new Error("Socket não inicializado. Chame initSocket primeiro.")
  }

  return socket
}
