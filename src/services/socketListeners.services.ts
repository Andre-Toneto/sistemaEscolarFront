import { getSocket } from "@/services/socket.services"
import { useMapaSalaStore } from "@/store/mapaSala"
import { useOccurrencesStore } from "@/store/occurrences"
import { useUsersStore } from "@/store/users"

export function registerSocketListeners() {
  const socket = getSocket()
  const mapaSalaStore = useMapaSalaStore()
  const occurrencesStore = useOccurrencesStore()
  const usersStore = useUsersStore()

//   socket.on("reserve:changed", async () => {
//     console.log("🔄 Reserva alterada - atualizando lista")
//     await mapaSalaStore.fetchData()
//   })
  const refreshMap: Record<string, () => Promise<void>> = {
    "reserve:changed": async () => {
      await Promise.all([
        mapaSalaStore.fetchData(),
        occurrencesStore.fetchData(),
      ])
    },

    "user:changed": async () => {
      await usersStore.fetchUsers()
    },
  }

  Object.keys(refreshMap).forEach((event) => {
    const handler = refreshMap[event]
    socket.on(event, async () => {
      console.log(`🔄 Evento ${event} recebido`)
      await handler()
    })
  })
}