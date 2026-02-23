import { createRouter, createWebHistory } from "vue-router"
import Home from "@/views/home/index.vue"
import Encaminhamentos from "@/views/encaminhamentos/index.vue"
import Login from "@/views/login.vue"
import Carometro from "@/views/carometro/index.vue"


const routes = [
  {
    path: "/",
    redirect: "/home",
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")

  if (to.meta.requiresAuth && !token) {
    next("/login")
  } else {
    next()
  }
})

export default router
