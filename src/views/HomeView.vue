<template>
  <div class="min-h-screen pt-safe">

    <!-- Header -->
    <header class="px-5 pt-4 pb-3">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-slate-400 text-xs font-app font-semibold tracking-widest uppercase mb-0.5">
            {{ greeting }}, {{ userName }}
          </p>
          <h1 class="font-app font-black text-2xl text-gradient leading-tight">
            Eu Reciclo
          </h1>
        </div>
        <!-- Logo pill -->
        <div class="h-11 px-4 rounded-2xl flex items-center gap-2 glow-green"
             style="background: linear-gradient(135deg, #16a34a, #15803d);">
          <span class="text-xl">🌿</span>
          <span class="font-app font-bold text-white text-xs tracking-wide">Eco</span>
        </div>
      </div>
    </header>

    <!-- Hero card — Estimativa atual -->
    <section class="px-5 mt-3 animate-fade-up">
      <div class="hero-card rounded-3xl p-5">
        <div class="relative z-10">
          <!-- Top row: value + button -->
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="text-white/60 text-xs font-app font-semibold uppercase tracking-widest mb-1">
                Estimativa atual
              </p>
              <div class="text-3xl font-app font-black text-white leading-none truncate">
                {{ formatCurrency(totalEstimate) }}
              </div>
              <p class="text-white/50 text-xs font-app mt-1.5">
                {{ totalKg.toFixed(2) }} kg ·
                {{ totalItems }} ite{{ totalItems !== 1 ? 'ns' : 'm' }}
                calculado{{ totalItems !== 1 ? 's' : '' }}
              </p>
            </div>
            <button @click="goToCalculator"
                    class="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-app font-bold text-xs transition-all duration-150 active:scale-95 whitespace-nowrap"
                    style="background: rgba(255,255,255,0.2); color: #ffffff; border: 1px solid rgba(255,255,255,0.25); backdrop-filter: blur(8px);">
              Calcular
              <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Mini stats row -->
          <div class="mt-4 grid grid-cols-3 gap-2">
            <div v-for="stat in miniStats" :key="stat.label"
                 class="rounded-2xl px-2 py-2.5 text-center"
                 style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.1);">
              <div class="text-sm font-app font-black text-white truncate">{{ stat.value }}</div>
              <div class="text-white/45 text-xs font-app mt-0.5 truncate">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Category quick-access -->
    <section class="px-5 mt-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-app font-bold text-sm text-slate-500 tracking-wide uppercase">Categorias</h2>
        <router-link to="/calculator" class="text-eco-600 text-xs font-app font-semibold">Ver todas →</router-link>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="(cat, i) in categories"
          :key="cat.key"
          @click="goToCalcCategory(cat.key)"
          class="relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-150 active:scale-95 animate-fade-up glass-card"
          :class="`stagger-${i+1}`"
        >
          <div class="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
               :style="{ background: cat.accentGradient }"></div>
          <div class="mt-1 text-3xl mb-2">{{ cat.icon }}</div>
          <div class="font-app font-bold text-sm text-slate-700">{{ cat.label }}</div>
          <div class="text-slate-400 text-xs font-app mt-0.5">
            {{ byCategory[cat.key]?.length ?? 0 }} material{{ (byCategory[cat.key]?.length ?? 0) !== 1 ? 'is' : '' }}
          </div>
          <div class="absolute top-4 right-3 pill"
               :style="{ background: cat.pillBg, color: cat.pillText }">
            {{ cat.priceLabel }}
          </div>
        </button>
      </div>
    </section>

    <!-- Top Materials preview -->
    <section class="px-5 mt-6 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-app font-bold text-sm text-slate-500 tracking-wide uppercase">Top Materiais</h2>
        <router-link to="/materials" class="text-eco-600 text-xs font-app font-semibold">Gerenciar →</router-link>
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="(mat, i) in topMaterials"
          :key="mat.id"
          class="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-fade-up"
          :class="`stagger-${i+1}`"
        >
          <div class="w-1 self-stretch rounded-full shrink-0"
               :style="{ background: mat.accentColor }"></div>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
               :style="{ background: `${mat.accentColor}18` }">
            {{ mat.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-app font-semibold text-sm text-slate-700 leading-tight truncate">{{ mat.name }}</p>
            <p class="text-slate-400 text-xs font-app mt-0.5 truncate">{{ mat.description }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="font-app font-bold text-sm text-gradient-amber">
              {{ formatCurrency(mat.pricePerKg) }}/kg
            </p>
            <p v-if="mat.unitType === 'units'" class="text-slate-400 text-xs font-app">
              {{ formatCurrency(mat.pricePerKg / mat.unitsPerKg) }}/un
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tip chip -->
    <div class="px-5 mb-6">
      <div class="rounded-2xl px-4 py-3 flex gap-3 items-center"
           style="background: #f0fdf4; border: 1px solid #d1fae5;">
        <span class="text-xl shrink-0">💡</span>
        <p class="font-app text-xs text-slate-500 leading-relaxed">
          <span class="font-semibold text-eco-600">Dica:</span>
          Vá para <strong class="text-eco-600">Calcular</strong> para inserir as quantidades e descobrir o valor total da sua reciclagem.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMaterials, getUserName } from '@/composables/useMaterials'
import { useCalculator } from '@/composables/useCalculator'

const router = useRouter()
const { materials, byCategory, categories: catDefs, categoryColors, formatCurrency } = useMaterials()
const { totalEstimate, totalKg, totalItems } = useCalculator()

const userName = getUserName() || 'Usuário'
const hour = new Date().getHours()
const greeting = hour < 12 ? 'Bom dia 👋' : hour < 18 ? 'Boa tarde 👋' : 'Boa noite 👋'

const categories = computed(() => catDefs.map(c => {
  const cols = categoryColors[c.key]
  const mats = byCategory.value[c.key] ?? []
  const maxPrice = mats.length ? Math.max(...mats.map(m => m.pricePerKg)) : 0
  return {
    ...c,
    accentGradient: `linear-gradient(90deg, ${cols.text}, ${cols.border})`,
    pillBg: `${cols.text}18`,
    pillText: cols.text,
    priceLabel: mats.length ? `até ${formatCurrency(maxPrice)}/kg` : '—'
  }
}))

const topMaterials = computed(() =>
  [...materials.value].sort((a, b) => b.pricePerKg - a.pricePerKg).slice(0, 4)
)

const miniStats = computed(() => {
  const prices = materials.value.map(m => m.pricePerKg)
  const topPrice = prices.length ? Math.max(...prices) : 0
  return [
    { label: 'Materiais',  value: materials.value.length },
    { label: 'Categorias', value: catDefs.length },
    { label: 'Top preço',  value: formatCurrency(topPrice) }
  ]
})

function goToCalculator()      { router.push('/calculator') }
function goToCalcCategory(key) { router.push({ path: '/calculator', query: { cat: key } }) }
</script>
