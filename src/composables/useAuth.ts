import { ref } from "vue"
import * as authService from "@/services/auth.services"

const user = ref(null)

export function useAuth() {

  async function login(email: string, password: string) {
    user.value = await authService.login(email, password)
  }

  function logout() {
    localStorage.removeItem("token")
    user.value = null
  }

  return {
    user,
    login,
    logout
  }
}