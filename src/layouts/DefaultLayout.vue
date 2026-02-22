<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Sistema Escolar</v-toolbar-title>

      <v-spacer />

      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from "vue-router"

const router = useRouter()

function logout() {
  localStorage.removeItem("token")
  router.push("/login")
}
</script>