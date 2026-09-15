<template>
  <div class="min-h-screen pt-safe page-bottom-space">
    <header class="px-5 pt-4 pb-3">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-slate-400 text-xs font-app font-semibold tracking-widest uppercase mb-0.5 truncate">
            {{ greeting }}, {{ userName }}
          </p>
          <h1 class="font-app font-black text-2xl text-gradient leading-tight">Eu Reciclo</h1>
        </div>
        <div class="brand-mark" aria-label="Ícone Eu Reciclo">
          <img :src="appIcon" alt="" class="w-full h-full object-cover" />
        </div>
      </div>
    </header>

    <section class="px-5 mt-3 animate-fade-up">
      <div class="hero-card rounded-3xl p-5">
        <div class="relative z-10">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="text-white/60 text-xs font-app font-semibold uppercase tracking-widest mb-1">Estimativa atual</p>
              <div class="text-3xl font-app font-black text-white leading-none truncate">{{ formatCurrency(totalEstimate) }}</div>
              <p class="text-white/55 text-xs font-app mt-1.5">
                {{ formatDecimal(totalKg, 2) }} kg · {{ totalItems }} material{{ totalItems !== 1 ? 'is' : '' }} preenchido{{ totalItems !== 1 ? 's' : '' }}
              </p>
            </div>
            <button @click="router.push('/calculator')"
                    class="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-app font-bold text-xs transition-all active:scale-95 whitespace-nowrap"
                    style="background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.22);">
              Calcular
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2">
            <div v-for="stat in miniStats" :key="stat.label" class="rounded-xl px-2 py-2.5 text-center"
                 style="background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.09);">
              <div class="text-sm font-app font-black text-white truncate">{{ stat.value }}</div>
              <div class="text-white/50 text-[11px] font-app mt-0.5 truncate">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-5 mt-4 animate-fade-up">
      <button @click="router.push('/meta-compra')"
              class="w-full glass-card-bright rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-eco-600" style="background:#dcfce7;">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m14.5 9.5 5-5M16 4h4v4"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-app font-black text-sm text-slate-700">Meta de compra</h2>
            <span v-if="activeGoal" class="font-app font-black text-xs text-eco-700">{{ goalProgress }}%</span>
          </div>
          <template v-if="activeGoal">
            <p class="font-app text-xs text-slate-500 mt-1 truncate">{{ activeGoal.name }}</p>
            <div class="h-1.5 rounded-full mt-2 overflow-hidden" style="background:#dcfce7;">
              <div class="h-full rounded-full" style="background:#16a34a;" :style="{ width: `${goalProgress}%` }"></div>
            </div>
          </template>
          <p v-else class="font-app text-xs text-slate-400 mt-1 leading-relaxed">
            Transforme o preço de uma compra em latinhas, unidades ou kg de recicláveis.
          </p>
        </div>
        <svg class="w-5 h-5 text-eco-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </section>

    <section class="px-5 mt-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-app font-bold text-sm text-slate-500 tracking-wide uppercase">Categorias</h2>
        <router-link v-if="categories.length > visibleCategories.length" to="/calculator" class="text-eco-600 text-xs font-app font-semibold">Ver todas →</router-link>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button v-for="(cat, i) in visibleCategories" :key="cat.key" @click="goToCalcCategory(cat.key)"
                class="relative overflow-hidden rounded-2xl p-4 text-left transition-all active:scale-95 animate-fade-up glass-card"
                :class="`stagger-${Math.min(i + 1, 6)}`">
          <div class="absolute top-0 left-0 right-0 h-1" :style="{ background: cat.accentGradient }"></div>
          <div class="mt-1 w-9 h-9 rounded-xl flex items-center justify-center mb-2" :style="{ background: cat.iconBg, color: cat.pillText }">
            <MaterialIcon :category="cat.key" class="w-5 h-5" />
          </div>
          <div class="font-app font-bold text-sm text-slate-700">{{ cat.label }}</div>
          <div class="text-slate-400 text-xs font-app mt-0.5">{{ cat.materialCountLabel }}</div>
          <div class="mt-2 font-app text-[11px] font-bold truncate" :style="{ color: cat.pillText }">{{ cat.priceLabel }}</div>
        </button>
      </div>
    </section>

    <section class="px-5 mt-6 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-app font-bold text-sm text-slate-500 tracking-wide uppercase">Materiais em destaque</h2>
        <router-link to="/materials" class="text-eco-600 text-xs font-app font-semibold">Gerenciar →</router-link>
      </div>
      <div class="flex flex-col gap-2">
        <div v-for="(mat, i) in topMaterials" :key="mat.id"
             class="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-fade-up"
             :class="`stagger-${Math.min(i + 1, 6)}`">
          <div class="w-1 self-stretch rounded-full shrink-0" :style="{ background: mat.accentColor }"></div>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :style="{ background: `${mat.accentColor}18`, color: mat.accentColor }">
            <MaterialIcon :name="mat.name" :category="mat.category" :legacy-icon="mat.icon" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-app font-semibold text-sm text-slate-700 leading-tight truncate">{{ mat.name }}</p>
            <p class="text-slate-400 text-xs font-app mt-0.5 truncate">{{ mat.description }}</p>
          </div>
          <div class="text-right shrink-0">
            <p v-if="mat.pricePerKg > 0" class="font-app font-bold text-sm text-gradient-amber">{{ formatCurrency(mat.pricePerKg) }}/kg</p>
            <router-link v-else :to="`/materials/${mat.id}/edit`" class="font-app font-bold text-xs text-eco-700">Definir preço</router-link>
          </div>
        </div>
      </div>
    </section>

    <div class="px-5 mb-4">
      <div class="rounded-2xl px-4 py-3 flex gap-3 items-center" style="background:#f8fafc;border:1px solid #e2e8f0;">
        <svg class="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M8.5 14.5C7 13.4 6 11.7 6 9.8A6 6 0 0 1 18 10c0 1.8-.9 3.5-2.5 4.5-.8.5-1.3 1.3-1.5 2.5h-4c-.2-1.2-.7-2-1.5-2.5Z"/></svg>
        <p class="font-app text-xs text-slate-500 leading-relaxed">Atualize os <strong class="text-eco-700">preços de cada material</strong> conforme o valor pago na sua região.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MaterialIcon from '@/components/MaterialIcon.vue'
import appIcon from '@/assets/app-icon.png'
import { useMaterials, getUserName } from '@/composables/useMaterials'
import { useCalculator } from '@/composables/useCalculator'
import { usePurchaseGoals } from '@/composables/usePurchaseGoals'
import { calculateMaterialValue } from '@/utils/recycling'
import { formatLocaleNumber } from '@/utils/number'

const router = useRouter()
const { materials, byCategory, categories: categoryDefinitions, categoryColors, formatCurrency } = useMaterials()
const { totalEstimate, totalKg, totalItems, quantities } = useCalculator()
const { goals } = usePurchaseGoals()

const userName = getUserName() || 'Usuário'
const hour = new Date().getHours()
const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

function formatDecimal(value, decimals = 3) {
  return formatLocaleNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
}

const categories = computed(() => categoryDefinitions.map(category => {
  const colors = categoryColors[category.key]
  const categoryMaterials = byCategory.value[category.key] ?? []
  const priced = categoryMaterials.map(material => Number(material.pricePerKg)).filter(price => price > 0)
  let priceLabel = 'Preços a definir'
  if (priced.length === 1) priceLabel = `${formatCurrency(priced[0])}/kg`
  if (priced.length > 1) {
    const min = Math.min(...priced)
    const max = Math.max(...priced)
    priceLabel = min === max ? `${formatCurrency(max)}/kg` : `${formatCurrency(min)}–${formatCurrency(max)}/kg`
  }
  const count = categoryMaterials.length
  return {
    ...category,
    accentGradient: `linear-gradient(90deg, ${colors.text}, ${colors.border})`,
    iconBg: colors.bg,
    pillText: colors.text,
    priceLabel,
    count,
    materialCountLabel: `${count} material${count === 1 ? '' : 'is'}`
  }
}).filter(category => category.count > 0))

const visibleCategories = computed(() => categories.value.slice(0, 4))

const topMaterials = computed(() => {
  const priced = [...materials.value].filter(material => Number(material.pricePerKg) > 0).sort((a, b) => b.pricePerKg - a.pricePerKg)
  const unpriced = [...materials.value].filter(material => Number(material.pricePerKg) <= 0)
  return [...priced, ...unpriced].slice(0, 4)
})

const activeGoal = computed(() => goals.value[0] || null)
const goalProgress = computed(() => {
  const goal = activeGoal.value
  if (!goal) return 0
  const target = goal.items.reduce((sum, item) => sum + Number(item.price || 0), 0)
  const material = materials.value.find(item => String(item.id) === String(goal.materialId))
  if (!material || target <= 0) return 0
  const current = Number(quantities.value[String(material.id)] || 0)
  return Math.min(100, Math.round((calculateMaterialValue(material, current) / target) * 100))
})

const miniStats = computed(() => [
  { label: 'Peso', value: `${formatDecimal(totalKg.value, 2)} kg` },
  { label: 'Preenchidos', value: String(totalItems.value) },
  { label: 'Meta', value: activeGoal.value ? `${goalProgress.value}%` : '—' }
])

function goToCalcCategory(key) {
  router.push({ path: '/calculator', query: { cat: key } })
}
</script>
