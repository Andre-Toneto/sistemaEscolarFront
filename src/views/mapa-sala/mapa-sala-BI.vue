<template>
    <v-container fluid>
        <v-btn color="senai-red" icon="mdi-door-open" text="Voltar" class="position-fixed" size="x-small" @click="goMapaSala()">
        </v-btn>
        <iframe title="OcupacaoDeSala" width="100%" style="height: 90vh;" src="https://app.powerbi.com/view?r=eyJrIjoiYWZiYWNmMjAtYmQzNC00OTg3LTg0NjgtYTM5ZmNmMGNlM2YxIiwidCI6ImIxMDUxYzRiLTNiOTQtNDFhYi05NDQxLWU3M2E3MjM0MmZkZCJ9" frameborder="0" allowFullScreen="true">
            
        </iframe>
    </v-container>
</template>
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goMapaSala = () => {
    router.push('/mapa-sala')
}

</script>