<template>
  <v-container fluid>
    <v-row justify="center" align="center" v-if="!selecaoFeita">
      <v-col cols="12" md="10" lg="8">
        <cursoTurmaSelector 
          @curso-turma-selecionados="onSelecaoConfirmada"
        />
      </v-col>
    </v-row>

    <div v-else>
      <v-toolbar color="senai-red" dark flat rounded="lg" class="mb-4 px-4">
        <v-btn icon @click="voltar">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>{{ turmaNome }} - {{ cursoNome }}</v-toolbar-title>
        <v-spacer />
        <v-btn v-if="isAdmin" color="white" variant="elevated" class="text-primary" @click="abrirNovoAluno">
          Novo Aluno
        </v-btn>
      </v-toolbar>

      <carometroGrid 
        ref="gridRef"
        :turma="turmaId"
        :curso="cursoId"
        @select-pessoa="verAluno"
      />
    </div>

    <!-- Modal Detalhes Aluno -->
    <pessoaModal
      v-model="modalAluno"
      :pessoa="alunoAtivo"
      :curso="{ id: cursoId, nome: cursoNome }"
      :turma="{ id: turmaId, class_name: turmaNome }"
      @aluno-removido="onAlunoRemovido"
      @aluno-atualizado="onAlunoAtualizado"
    />

    <!-- Modal Novo Aluno (Admin) -->
    <v-dialog v-model="modalNovoAluno" max-width="600">
      <v-card rounded="lg">
        <v-card-title>Novo Aluno</v-card-title>
        <v-card-text>
          <v-form ref="formNovoAluno" @submit.prevent="salvarAluno">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.nome" label="Nome Completo" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.matricula" label="Matrícula" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.cpf" label="CPF" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.rg" label="RG" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.birth_date" label="Data de Nascimento" type="date" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.email" label="E-mail" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.mobile_phone" label="Celular" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.phone" label="Telefone" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.position" label="Cargo" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.company" label="Empresa" variant="outlined" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="novoAluno.address" label="Endereço" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="novoAluno.neighborhood" label="Bairro" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="novoAluno.city" label="Cidade" variant="outlined" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="novoAluno.postal_code" label="CEP" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.mother_name" label="Nome da Mãe" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoAluno.father_name" label="Nome do Pai" variant="outlined" />
              </v-col>
              <v-col cols="12">
                <v-file-input label="Foto do Aluno" variant="outlined" accept="image/*" @change="onFotoChange" />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-4">
              <v-btn variant="text" @click="modalNovoAluno = false" class="mr-2">Cancelar</v-btn>
              <v-btn color="senai-red" type="submit" :loading="loadingSalvar">Salvar</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as carometroService from '@/services/carometro.services'
import cursoTurmaSelector from '@/components/carometro/cursoTurmaSelector.vue'
import carometroGrid from '@/components/carometro/index.vue'
import pessoaModal from '@/components/carometro/pessoaModal.vue'

const user = ref({})
const isAdmin = computed(() => (user.value?.role || '').toLowerCase() === 'admin' || (user.value?.role || '').toLowerCase() === 'adm')

const loadingSalvar = ref(false)
const selecaoFeita = ref(false)
const gridRef = ref(null)

const cursoId = ref('')
const cursoNome = ref('')
const turmaId = ref('')
const turmaNome = ref('')

const modalAluno = ref(false)
const alunoAtivo = ref(null)
const modalNovoAluno = ref(false)

const novoAluno = ref({
  nome: '',
  matricula: '',
  email: '',
  foto: null,
  cpf: '',
  birth_date: '',
  mobile_phone: '',
  phone: '',
  address: '',
  neighborhood: '',
  city: '',
  postal_code: '',
  rg: '',
  position: '',
  mother_name: '',
  father_name: '',
  company: ''
})

const loadUser = () => {
  try {
    const userData = localStorage.getItem('user')
    user.value = userData ? JSON.parse(userData) : {}
  } catch {
    user.value = {}
  }
}

const onSelecaoConfirmada = (selecao) => {
  cursoId.value = selecao.curso.id
  cursoNome.value = selecao.curso.nome
  turmaId.value = selecao.turma.id
  turmaNome.value = selecao.turma.nome
  selecaoFeita.value = true
}

const voltar = () => {
  selecaoFeita.value = false
}

const verAluno = (aluno) => {
  // Mapear campos para compatibilidade com o componente pessoaModal
  alunoAtivo.value = {
    ...aluno,
    matricula: aluno.registration_number,
    mae: aluno.mother_name,
    pai: aluno.father_name,
    empresa: aluno.company,
    telefone: aluno.phone,
    celular: aluno.mobile_phone,
    cep: aluno.postal_code,
    turma: turmaNome.value,
    curso: cursoNome.value
  }
  modalAluno.value = true
}

const onAlunoRemovido = () => {
  gridRef.value?.recarregar()
}

const onAlunoAtualizado = () => {
  gridRef.value?.recarregar()
}

const abrirNovoAluno = () => {
  novoAluno.value = {
    nome: '',
    matricula: '',
    email: '',
    foto: null,
    cpf: '',
    birth_date: '',
    mobile_phone: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    postal_code: '',
    rg: '',
    position: '',
    mother_name: '',
    father_name: '',
    company: ''
  }
  modalNovoAluno.value = true
}

const onFotoChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      novoAluno.value.foto = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const salvarAluno = async () => {
  loadingSalvar.value = true
  try {
    const payload = {
      ...novoAluno.value,
      course_id: cursoId.value,
      class_id: turmaId.value,
      registration_number: novoAluno.value.matricula?.trim() || null
    }
    delete payload.matricula

    if (payload.birth_date) {
      payload.birth_date = new Date(payload.birth_date).toISOString()
    }

    // Garantir que campos vazios sejam null para evitar colisão de string vazia única
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string' && payload[key].trim() === '') {
        payload[key] = null
      }
    })

    await carometroService.createStudent(payload)
    modalNovoAluno.value = false
    gridRef.value?.recarregar()
  } catch (e) {
    console.error('Falha ao salvar aluno', e)
    alert('Erro ao salvar aluno')
  } finally {
    loadingSalvar.value = false
  }
}

onMounted(() => {
  loadUser()
})
</script>
