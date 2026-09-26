<template>
  <div class="whats-new-page min-h-dvh flex flex-col">
    <div class="whats-new-scroll flex-1 flex flex-col px-5">
      <div class="mx-auto w-full max-w-md flex-1 flex flex-col">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shrink-0">
              <img :src="appIcon" alt="Ícone do Eu Reciclo" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <p class="text-green-200 text-xs font-bold uppercase tracking-[0.18em]">Atualização instalada</p>
              <h1 class="text-white text-2xl font-black tracking-tight truncate">Novidades e correções</h1>
            </div>
          </div>
          <span class="whats-new-version">v{{ APP_VERSION }}</span>
        </div>

        <section class="whats-new-hero rounded-3xl p-5 mb-4">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style="background:rgba(34,197,94,.14);color:#15803d;">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 4 4L19 6"/><path d="M12 22a10 10 0 1 0-10-10"/></svg>
          </div>
          <h2 class="text-slate-800 text-xl font-black">Ícone oficial garantido no APK</h2>
          <p class="text-slate-500 text-sm leading-relaxed mt-1.5">A versão 1.4.9 corrige o falso erro causado pela otimização de recursos do Android e mantém a validação do ícone oficial no APK final.</p>
        </section>

        <div class="grid gap-3">
          <article v-for="item in changes" :key="item.title" class="whats-new-card rounded-2xl p-4 flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :style="{ background:item.bg, color:item.color }">
              <svg v-if="item.icon === 'layout'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 17h18"/></svg>
              <svg v-else-if="item.icon === 'app'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M9 5h6M10 18h4"/></svg>
              <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/><path d="m17 16 2 2 3-4"/></svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-slate-700 text-sm font-black">{{ item.title }}</h3>
              <p class="text-slate-500 text-xs leading-relaxed mt-1">{{ item.text }}</p>
            </div>
          </article>
        </div>

        <div class="mt-auto pt-6">
          <button type="button" @click="continueToApp" class="w-full py-4 rounded-2xl font-black text-base text-white active:scale-[.98] transition-transform" style="background:linear-gradient(135deg,#22c55e,#15803d);box-shadow:0 12px 28px rgba(21,128,61,.25);">
            {{ isManual ? 'Voltar aos ajustes' : 'Continuar para o app →' }}
          </button>
          <p class="text-center text-green-100/70 text-[11px] mt-3">Você pode rever estas informações em Ajustes.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { APP_VERSION } from '@/config/app'
import appIcon from '@/assets/app-icon.png'
import { markWhatsNewSeen } from '@/composables/useWhatsNew'

const router = useRouter()
const route = useRoute()
const isManual = computed(() => route.query.manual === '1')

const changes = [
  {
    icon: 'app',
    title: 'Validação Release corrigida',
    text: 'O verificador não exige mais que o APK preserve nomes físicos como ic_launcher.png, pois o Android pode encurtá-los durante a otimização Release.',
    bg: '#ecfdf5',
    color: '#15803d'
  },
  {
    icon: 'list',
    title: 'Launcher confirmado no APK',
    text: 'A checagem lê o Manifest binário e a resources.arsc para confirmar ic_launcher, ic_launcher_round, foreground adaptativo e cor de fundo.',
    bg: '#eff6ff',
    color: '#2563eb'
  },
  {
    icon: 'layout',
    title: 'Pixels conferidos quando possível',
    text: 'Quando o caminho físico otimizado do PNG está disponível, o build ainda compara os pixels com o ícone oficial do Eu Reciclo.',
    bg: '#fffbeb',
    color: '#b45309'
  }
]

onMounted(() => {
  markWhatsNewSeen()
})

function continueToApp() {
  router.replace(isManual.value ? '/sobre' : '/')
}
</script>

<style scoped>
.whats-new-page {
  background: linear-gradient(160deg, #052e16 0%, #14532d 46%, #15803d 100%);
}
.whats-new-scroll {
  padding-top: max(1.25rem, env(safe-area-inset-top));
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
  overflow-y: auto;
}
.whats-new-version {
  flex-shrink: 0;
  padding: .35rem .65rem;
  border-radius: 999px;
  color: #dcfce7;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.16);
  font-size: .7rem;
  font-weight: 800;
}
.whats-new-hero,
.whats-new-card {
  background: rgba(255,255,255,.97);
  border: 1px solid rgba(255,255,255,.7);
  box-shadow: 0 8px 26px rgba(3, 31, 14, .12);
}
</style>
