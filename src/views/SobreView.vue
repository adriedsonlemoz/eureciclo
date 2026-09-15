<template>
  <div class="min-h-screen pt-safe">
    <header class="px-5 pt-4 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl glow-green" style="background: linear-gradient(135deg, #16a34a, #15803d);">🌿</div>
        <div>
          <h1 class="font-app font-extrabold text-xl text-gradient">Eu Reciclo</h1>
          <p class="font-app text-xs text-slate-400 mt-0.5">v{{ APP_VERSION }} · Calculadora de Reciclagem</p>
        </div>
      </div>
    </header>

    <div class="px-5 flex flex-col gap-4 pb-8">
      <section class="glass-card rounded-3xl p-5">
        <div class="flex items-center gap-2 mb-3"><span class="text-lg">📱</span><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Sobre o App</h2></div>
        <p class="font-app text-sm text-slate-500 leading-relaxed">
          O <strong class="text-eco-700">Eu Reciclo</strong> calcula valores de materiais recicláveis, mantém seus preços e histórico no próprio aparelho e funciona sem depender de internet.
        </p>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <div v-for="feat in features" :key="feat.label" class="rounded-2xl px-3 py-2.5 flex items-center gap-2" style="background:#f0fdf4;border:1px solid #d1fae5;">
            <span class="text-base">{{ feat.icon }}</span><span class="font-app text-xs text-slate-600 font-semibold">{{ feat.label }}</span>
          </div>
        </div>
      </section>

      <section class="glass-card rounded-3xl p-5">
        <div class="flex items-center gap-2 mb-2"><span class="text-lg">💾</span><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Backup dos dados</h2></div>
        <p class="font-app text-xs text-slate-400 leading-relaxed mb-4">Exporte materiais, preços, quantidades, nome e vendas para um arquivo JSON. Ao importar, os dados atuais são substituídos pelo backup.</p>
        <div class="grid grid-cols-2 gap-2">
          <button @click="doExport" class="py-3 rounded-2xl font-app font-bold text-sm text-white active:scale-95" style="background:linear-gradient(135deg,#22c55e,#15803d);">Exportar</button>
          <button @click="fileInput?.click()" class="py-3 rounded-2xl font-app font-bold text-sm text-eco-700 active:scale-95" style="background:#f0fdf4;border:1px solid #bbf7d0;">Importar</button>
          <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="doImport" />
        </div>
        <p v-if="backupMessage" class="font-app text-xs mt-3" :class="backupError ? 'text-red-500' : 'text-eco-700'">{{ backupMessage }}</p>
      </section>

      <section class="glass-card rounded-3xl p-5">
        <div class="flex items-center gap-2 mb-3"><span class="text-lg">📋</span><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Histórico de Mudanças</h2></div>
        <div class="flex flex-col gap-4">
          <div v-for="entry in changelog" :key="entry.version">
            <div class="flex items-center gap-2 mb-2"><span class="pill text-white" style="background:#16a34a;">v{{ entry.version }}</span><span class="font-app text-xs text-slate-400">{{ entry.date }}</span></div>
            <ul class="flex flex-col gap-1">
              <li v-for="change in entry.changes" :key="change" class="font-app text-xs text-slate-500 leading-relaxed flex items-start gap-2"><span class="text-eco-500 mt-0.5 shrink-0">•</span><span>{{ change }}</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section class="rounded-3xl p-5" style="background:#f0fdf4;border:1px solid #d1fae5;">
        <div class="flex items-start gap-3"><span class="text-xl">🔒</span><div><h2 class="font-app font-bold text-sm text-eco-800">Dados locais</h2><p class="font-app text-xs text-slate-500 leading-relaxed mt-1">O aplicativo não envia seu histórico para um servidor. Faça backups periódicos para não perder seus dados ao limpar ou reinstalar o app.</p></div></div>
      </section>

      <p class="font-app text-xs text-slate-300 text-center pb-2">Feito com 💚 para a comunidade recicladora</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { APP_VERSION } from '@/config/app'
import { exportBackup, importBackupFile } from '@/composables/useBackup'

const fileInput = ref(null)
const backupMessage = ref('')
const backupError = ref(false)

function doExport() {
  backupMessage.value = ''
  backupError.value = false
  try { exportBackup(); backupMessage.value = 'Backup exportado.' }
  catch (error) { backupError.value = true; backupMessage.value = error?.message || 'Não foi possível exportar o backup.' }
}

async function doImport(event) {
  const file = event.target.files?.[0]
  if (!file) return
  backupMessage.value = ''
  backupError.value = false
  try {
    await importBackupFile(file)
    backupMessage.value = 'Backup restaurado. Recarregando dados…'
    setTimeout(() => window.location.reload(), 500)
  } catch (error) {
    backupError.value = true
    backupMessage.value = error?.message || 'Backup inválido.'
  } finally {
    event.target.value = ''
  }
}

const features = [
  { icon:'📴', label:'Offline' }, { icon:'⚡', label:'Rápido' }, { icon:'🆓', label:'Gratuito' }, { icon:'🔒', label:'Privado' }
]

const changelog = [
  { version:'1.1.1', date:'Set 2026', changes:[
    'Corrigida reutilização de IDs ao excluir e criar materiais',
    'Quantidades vinculadas agora são removidas junto com o material',
    'Backup e restauração dos dados em JSON',
    'Versão do app centralizada e sincronizada com o Android',
    'Aplicativo totalmente independente de fontes externas',
    'Persistência mais defensiva e testes dos cálculos principais'
  ]},
  { version:'1.1.0', date:'Abr 2026', changes:[
    'Renomeado para Eu Reciclo', 'Formatação automática com separador de milhar nos inputs', 'Nova aba Vendas para salvar e gerenciar cálculos', 'Botão Salvar Venda na barra de total', 'Página Sobre com histórico', 'Refatoração em composables separados'
  ]},
  { version:'1.0.0', date:'Mar 2026', changes:[
    'Lançamento inicial do ReciclaCalc', 'Calculadora por categoria de material', 'Cadastro de materiais personalizados', 'Estimativa de valor total em tempo real', 'Suporte a Capacitor (Android)'
  ]}
]
</script>
