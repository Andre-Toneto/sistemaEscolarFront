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
    meta: { requiresAuth: true, excludeFic: true }
  },
  {
    path: "/mapa-sala",
    component: () => import("@/views/mapa-sala/index.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/mapa-sala-bi",
    component: () => import("@/views/mapa-sala/mapa-sala-BI.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/users",
    component: () => import("@/views/users/index.vue"),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: "/admin",
    component: () => import("@/views/admin/index.vue"),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: "/calendario-escolar",
    component: () => import("@/views/calendario-escolar/index.vue"),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const role = (auth.user?.role || '').toLowerCase()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ path: "/login", query: { redirect: to.fullPath } })
  } else if (to.meta.adminOnly && !auth.isAdmin) {
    next("/home")
  } else if (to.meta.excludeFic && role === 'fic') {
    next("/home")
  } else {
    next()
  }
})

export default router
