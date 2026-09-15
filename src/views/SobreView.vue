<template>
  <div class="min-h-screen pt-safe">
    <header class="px-5 pt-4 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl glow-green" style="background:linear-gradient(135deg,#16a34a,#15803d);">🌿</div>
        <div>
          <h1 class="font-app font-extrabold text-xl text-gradient">Eu Reciclo</h1>
          <p class="font-app text-xs text-slate-400 mt-0.5">v{{ APP_VERSION }} · Ajustes e informações</p>
        </div>
      </div>
    </header>

    <div class="px-5 flex flex-col gap-4 pb-8">
      <section class="glass-card rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-3"><span class="text-lg">⚙️</span><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Preferências</h2></div>
        <label class="font-app text-xs font-semibold text-slate-500">Seu nome</label>
        <div class="flex gap-2 mt-1.5">
          <input v-model="userName" type="text" maxlength="30" class="input-eco flex-1 min-w-0 px-3 py-2.5 text-sm" placeholder="Seu nome" />
          <button @click="saveName" class="px-4 rounded-xl font-app font-bold text-xs text-white active:scale-95" style="background:#16a34a;">Salvar</button>
        </div>
        <p v-if="settingsMessage" class="font-app text-xs text-eco-700 mt-2">{{ settingsMessage }}</p>
        <div class="mt-4 rounded-xl p-3" style="background:#f8fafc;border:1px solid #e2e8f0;">
          <p class="font-app text-xs text-slate-500 leading-relaxed"><strong>Números:</strong> preços e pesos aceitam vírgula ou ponto e são exibidos no padrão brasileiro.</p>
          <p class="font-app text-xs text-slate-500 leading-relaxed mt-1"><strong>Android:</strong> o APK usa modo tela cheia imersivo; as barras do sistema podem reaparecer temporariamente ao deslizar.</p>
        </div>
      </section>

      <section class="glass-card rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-2"><span class="text-lg">💚</span><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Apoie o projeto</h2></div>
        <p class="font-app text-xs text-slate-400 leading-relaxed">Se o Eu Reciclo for útil para você, é possível apoiar o desenvolvimento por PIX.</p>
        <div class="mt-3 rounded-xl p-3 flex items-center gap-3" style="background:#f0fdf4;border:1px solid #bbf7d0;">
          <div class="flex-1 min-w-0">
            <p class="font-app text-[10px] font-bold uppercase tracking-wider text-eco-700">Chave PIX</p>
            <p class="font-app font-bold text-sm text-slate-700 truncate">{{ PIX_KEY }}</p>
          </div>
          <button @click="copyPix" class="px-4 py-2.5 rounded-xl font-app font-bold text-xs text-white active:scale-95" style="background:linear-gradient(135deg,#22c55e,#15803d);">{{ pixCopied ? 'Copiado ✓' : 'Copiar' }}</button>
        </div>
      </section>

      <section class="glass-card rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-3"><span class="text-lg">📱</span><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Sobre o app</h2></div>
        <p class="font-app text-sm text-slate-500 leading-relaxed">O <strong class="text-eco-700">Eu Reciclo</strong> calcula valores de recicláveis, mantém preços por material, metas de compra e histórico no próprio aparelho.</p>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <div v-for="feat in features" :key="feat.label" class="rounded-xl px-3 py-2.5 flex items-center gap-2" style="background:#f8fafc;border:1px solid #e5e7eb;"><span>{{ feat.icon }}</span><span class="font-app text-xs text-slate-600 font-semibold">{{ feat.label }}</span></div>
        </div>
      </section>

      <section class="glass-card rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-2"><span class="text-lg">💾</span><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Backup dos dados</h2></div>
        <p class="font-app text-xs text-slate-400 leading-relaxed mb-4">Exporte materiais, preços, quantidades, nome, vendas e metas de compra. Ao importar, os dados atuais são substituídos.</p>
        <div class="grid grid-cols-2 gap-2">
          <button @click="doExport" class="py-3 rounded-xl font-app font-bold text-sm text-white active:scale-95" style="background:linear-gradient(135deg,#22c55e,#15803d);">Exportar</button>
          <button @click="fileInput?.click()" class="py-3 rounded-xl font-app font-bold text-sm text-eco-700 active:scale-95" style="background:#f0fdf4;border:1px solid #bbf7d0;">Importar</button>
          <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="doImport" />
        </div>
        <p v-if="backupMessage" class="font-app text-xs mt-3" :class="backupError ? 'text-red-500' : 'text-eco-700'">{{ backupMessage }}</p>
      </section>

      <section class="glass-card rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-3"><span class="text-lg">📋</span><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Histórico de mudanças</h2></div>
        <div class="flex flex-col gap-4">
          <div v-for="entry in changelog" :key="entry.version">
            <div class="flex items-center gap-2 mb-2"><span class="pill text-white" style="background:#16a34a;">v{{ entry.version }}</span><span class="font-app text-xs text-slate-400">{{ entry.date }}</span></div>
            <ul class="flex flex-col gap-1">
              <li v-for="change in entry.changes" :key="change" class="font-app text-xs text-slate-500 leading-relaxed flex items-start gap-2"><span class="text-eco-500 shrink-0">•</span><span>{{ change }}</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section class="rounded-2xl p-5" style="background:#f0fdf4;border:1px solid #d1fae5;">
        <div class="flex items-start gap-3"><span class="text-xl">🔒</span><div><h2 class="font-app font-bold text-sm text-eco-800">Dados locais</h2><p class="font-app text-xs text-slate-500 leading-relaxed mt-1">O aplicativo não envia seu histórico para um servidor. Faça backups periódicos para não perder dados ao limpar ou reinstalar o app.</p></div></div>
      </section>

      <p class="font-app text-xs text-slate-300 text-center pb-2">Feito com 💚 para a comunidade recicladora</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { APP_VERSION } from '@/config/app'
import { exportBackup, importBackupFile } from '@/composables/useBackup'
import { getUserName, USER_KEY } from '@/composables/useMaterials'
import { writeTextStorage } from '@/utils/storage'

const PIX_KEY = 'adriedson@outlook.com'
const fileInput = ref(null)
const backupMessage = ref('')
const backupError = ref(false)
const userName = ref(getUserName() || '')
const settingsMessage = ref('')
const pixCopied = ref(false)

function saveName() {
  writeTextStorage(USER_KEY, userName.value.trim() || 'Usuário')
  settingsMessage.value = 'Nome atualizado.'
  setTimeout(() => { settingsMessage.value = '' }, 1800)
}

async function copyPix() {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(PIX_KEY)
    else {
      const input = document.createElement('textarea')
      input.value = PIX_KEY
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    pixCopied.value = true
    setTimeout(() => { pixCopied.value = false }, 1800)
  } catch {
    pixCopied.value = false
  }
}

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
  { icon:'📴', label:'Offline' },
  { icon:'🎯', label:'Metas de compra' },
  { icon:'🧾', label:'Histórico de vendas' },
  { icon:'🔒', label:'Dados privados' }
]

const changelog = [
  { version:'1.3.0', date:'Set 2026', changes:[
    'Entradas numéricas aceitam vírgula ou ponto e exibem números no padrão pt-BR',
    'Preços passaram a ser independentes por material e as categorias foram reorganizadas',
    'Lista padrão ampliada com Inox, PEAD/HDPE, PP, Papel e Bateria automotiva sem inventar preços',
    'Home mais limpa, com progresso de meta e melhor hierarquia visual',
    'Vendas ganharam confirmação individual, proteção contra duplicidade e carregamento na Calculadora',
    'Doação via PIX com botão de copiar',
    'Modo Android em tela cheia imersivo e safe areas revisadas',
    'Identidade, versão e recursos sincronizados com o GitHub Manager'
  ]},
  { version:'1.2.2', date:'Set 2026', changes:[
    'GitHub Manager recebe identidade e versão explícitas pelo github-manager.json',
    'APK publicado diretamente como arquivo .apk em uma GitHub Release',
    'Validação automática impede divergência entre versões do projeto'
  ]},
  { version:'1.2.0', date:'Set 2026', changes:[
    'Meta de compra para transformar preços de produtos em quantidade de recicláveis',
    'Metas podem ser salvas e entram no backup do aplicativo'
  ]},
  { version:'1.1.1', date:'Set 2026', changes:[
    'IDs seguros, backup e restauração, versionamento Android sincronizado e persistência mais defensiva'
  ]},
  { version:'1.0.0', date:'Mar 2026', changes:[
    'Lançamento inicial da calculadora de reciclagem com materiais personalizados e Capacitor Android'
  ]}
]
</script>
