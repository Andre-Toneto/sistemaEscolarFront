import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/store/auth"
import Home from "@/views/home/index.vue"
import Encaminhamentos from "@/views/encaminhamentos/index.vue"
import Login from "@/views/login.vue"
import Carometro from "@/views/carometro/index.vue"


const routes = [
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/home",
    component: Home
  },
  {
    path: "/login",
    component: Login
  },
  {
    path: "/encaminhamentos/abertos",
    component: Encaminhamentos,
    meta: { requiresAuth: true }
  },
  {
    path: "/carometro",
    component: Carometro,
    meta: { requiresAuth: true }
  },
  {
    path: "/users",
    component: () => import("@/views/users/index.vue"),
  },
  {
    path: "/admin",
    component: () => import("@/views/admin/index.vue"),
    meta: { requiresAuth: true, adminOnly: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next("/login")
  } else if (to.meta.adminOnly && !auth.isAdmin) {
    next("/home")
  } else {
    next()
  }
})

export default router
