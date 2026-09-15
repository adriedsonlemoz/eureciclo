<template>
  <div class="min-h-screen pt-safe page-bottom-space">
    <header class="px-5 pt-4 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-2xl overflow-hidden glow-green"><img :src="appIcon" alt="" class="w-full h-full object-cover" /></div>
        <div>
          <h1 class="font-app font-extrabold text-xl text-gradient">Eu Reciclo</h1>
          <p class="font-app text-xs text-slate-400 mt-0.5">v{{ APP_VERSION }} · Ajustes e informações</p>
        </div>
      </div>
    </header>

    <div class="px-5 flex flex-col gap-4 pb-8">
      <section class="glass-card rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-3"><svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.4 7 7.2 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Preferências</h2></div>
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
        <div class="flex items-center gap-2 mb-2"><svg class="w-4 h-4 text-eco-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"/></svg><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Apoie o projeto</h2></div>
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
        <div class="flex items-center gap-2 mb-3"><svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/></svg><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Sobre o app</h2></div>
        <p class="font-app text-sm text-slate-500 leading-relaxed">O <strong class="text-eco-700">Eu Reciclo</strong> calcula valores de recicláveis, mantém preços por material, metas de compra e histórico no próprio aparelho.</p>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <div v-for="feat in features" :key="feat.label" class="rounded-xl px-3 py-2.5 flex items-center gap-2" style="background:#f8fafc;border:1px solid #e5e7eb;"><svg class="w-4 h-4 text-eco-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path :d="feat.path"/></svg><span class="font-app text-xs text-slate-600 font-semibold">{{ feat.label }}</span></div>
        </div>
      </section>

      <section class="glass-card rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-2"><svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 15h8v6H8z"/></svg><h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Backup dos dados</h2></div>
        <p class="font-app text-xs text-slate-400 leading-relaxed mb-4">Exporte materiais, preços, quantidades, nome, vendas e metas de compra. Ao importar, os dados atuais são substituídos.</p>
        <div class="grid grid-cols-2 gap-2">
          <button @click="doExport" class="py-3 rounded-xl font-app font-bold text-sm text-white active:scale-95" style="background:linear-gradient(135deg,#22c55e,#15803d);">Exportar</button>
          <button @click="fileInput?.click()" class="py-3 rounded-xl font-app font-bold text-sm text-eco-700 active:scale-95" style="background:#f0fdf4;border:1px solid #bbf7d0;">Importar</button>
          <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="doImport" />
        </div>
        <p v-if="backupMessage" class="font-app text-xs mt-3" :class="backupError ? 'text-red-500' : 'text-eco-700'">{{ backupMessage }}</p>
      </section>

      <section class="glass-card rounded-2xl p-5">
        <button @click="changelogOpen = !changelogOpen" class="w-full flex items-center justify-between gap-3 text-left">
          <div class="flex items-center gap-2 min-w-0">
            <svg class="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/></svg>
            <div class="min-w-0">
              <h2 class="font-app font-bold text-sm text-slate-600 uppercase tracking-wide">Histórico de mudanças</h2>
              <p class="font-app text-[11px] text-slate-400 mt-0.5">Versão atual v{{ APP_VERSION }} · toque para {{ changelogOpen ? 'recolher' : 'ver detalhes' }}</p>
            </div>
          </div>
          <svg class="w-4 h-4 text-slate-400 shrink-0 transition-transform" :style="changelogOpen ? 'transform:rotate(180deg)' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <transition name="expand">
          <div v-if="changelogOpen" class="flex flex-col gap-4 mt-4 pt-4" style="border-top:1px solid #eef2f7;">
            <div v-for="entry in changelog" :key="entry.version">
              <div class="flex items-center gap-2 mb-2"><span class="pill text-white" style="background:#16a34a;">v{{ entry.version }}</span><span class="font-app text-xs text-slate-400">{{ entry.date }}</span></div>
              <ul class="flex flex-col gap-1">
                <li v-for="change in entry.changes" :key="change" class="font-app text-xs text-slate-500 leading-relaxed flex items-start gap-2"><span class="text-eco-500 shrink-0">•</span><span>{{ change }}</span></li>
              </ul>
            </div>
          </div>
        </transition>
      </section>

      <section class="rounded-2xl p-5" style="background:#f0fdf4;border:1px solid #d1fae5;">
        <div class="flex items-start gap-3"><svg class="w-5 h-5 text-eco-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><div><h2 class="font-app font-bold text-sm text-eco-800">Dados locais</h2><p class="font-app text-xs text-slate-500 leading-relaxed mt-1">O aplicativo não envia seu histórico para um servidor. Faça backups periódicos para não perder dados ao limpar ou reinstalar o app.</p></div></div>
      </section>

      <p class="font-app text-xs text-slate-300 text-center pb-2">Feito para a comunidade recicladora</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { APP_VERSION } from '@/config/app'
import appIcon from '@/assets/app-icon.png'
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
const changelogOpen = ref(false)

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
  { label:'Offline', path:'M7 18a4.6 4.6 0 0 1-.6-9.2A7 7 0 0 1 19.5 11 4 4 0 0 1 19 19H8' },
  { label:'Metas de compra', path:'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M14.5 9.5l5-5M16 4h4v4' },
  { label:'Histórico de vendas', path:'M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6' },
  { label:'Dados privados', path:'M5 10h14v11H5V10ZM8 10V7a4 4 0 0 1 8 0v3' }
]

const changelog = [
  { version:'1.4.3', date:'Set 2026', changes:[
    'Launcher e splash nativa corrigidos para usar a identidade oficial do Eu Reciclo',
    'Onboarding compactado e protegido contra preços digitados muito acima das referências iniciais',
    'Vendas agora separam estimativa, valor recebido e comprador/local opcional',
    'Filtros horizontais ganharam controle de continuação e exclusão de material foi movida para a edição',
    'Personalização visual ficou opcional e o histórico de mudanças passa a ficar recolhido'
  ]},
  { version:'1.4.2', date:'Set 2026', changes:[
    'Corrigido o pacote-fonte para incluir todos os recursos binários do launcher Android',
    'Validação agora confere ícones normal/redondo em todas as densidades e foreground adaptativo',
    'Build deixa de falhar na checagem inicial por recursos do ícone ausentes'
  ]},
  { version:'1.4.1', date:'Set 2026', changes:[
    'Corrigido o build Android que falhava por recurso duplicado do fundo do ícone',
    'Aplicação do ícone reutiliza o recurso padrão do Capacitor sem criar duplicidade',
    'Ícone oficial, tela cheia e melhorias da 1.4.0 preservados'
  ]},
  { version:'1.4.0', date:'Set 2026', changes:[
    'Calculadora compactada para exibir mais materiais por tela',
    'Safe area e espaçamento inferior corrigidos para evitar conteúdo sob a navegação',
    'Ícone oficial integrado ao app e ao Android',
    'Ícones vetoriais consistentes substituem emojis nas telas principais',
    'Categorias vazias são ocultadas e a Home mostra somente quatro atalhos antes de Ver todas',
    'Campos numéricos reforçados para vírgula ou ponto com teclado decimal do sistema',
    'Vendas e Meta de compra revisadas e mantidas compatíveis com o novo visual'
  ]},
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

<style scoped>
.expand-enter-active,.expand-leave-active { transition:all .22s ease; overflow:hidden; }
.expand-enter-from,.expand-leave-to { opacity:0; transform:translateY(-6px); max-height:0; }
</style>
