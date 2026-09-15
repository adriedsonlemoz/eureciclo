<template>
  <div class="min-h-screen pt-safe">
    <header class="px-5 pt-4 pb-3 sticky top-0 z-30 app-sticky-header">
      <div class="flex items-center justify-between mb-3">
        <h1 class="font-app font-extrabold text-xl text-gradient">Calculadora</h1>
        <button @click="clearAll" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-app font-semibold text-xs text-slate-500 active:scale-95" style="background:#f8fafc;border:1px solid #e2e8f0;">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Limpar
        </button>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button v-for="cat in categories" :key="cat.key" @click="selectCategory(cat.key)" class="cat-tab shrink-0" :class="activeCategory === cat.key ? 'active' : ''">
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>
    </header>

    <section class="px-5 mt-4">
      <transition-group name="calc-list" tag="div" class="flex flex-col gap-3">
        <div v-for="mat in currentMaterials" :key="mat.id" class="glass-card rounded-2xl overflow-hidden transition-all duration-200"
             :style="quantities[String(mat.id)] > 0 ? `border-color:${mat.accentColor}50;box-shadow:0 4px 16px ${mat.accentColor}12` : ''">
          <div class="h-0.5 w-full" :style="{ background: quantities[String(mat.id)] > 0 ? mat.accentColor : 'transparent' }"></div>
          <div class="px-4 pt-4 pb-3 flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" :style="{ background: `${mat.accentColor}18` }">{{ mat.icon }}</div>
            <div class="flex-1 min-w-0">
              <p class="font-app font-bold text-sm text-slate-700">{{ mat.name }}</p>
              <p class="text-slate-400 text-xs font-app mt-0.5 truncate">{{ mat.description }}</p>
            </div>
            <div class="shrink-0 text-right">
              <template v-if="mat.pricePerKg > 0">
                <p class="font-app font-bold text-sm text-gradient-amber">{{ formatCurrency(mat.pricePerKg) }}/kg</p>
                <p v-if="mat.unitType === 'units'" class="text-slate-400 text-xs font-app">≈ {{ formatCurrency(getPricePerUnit(mat)) }}/un</p>
              </template>
              <router-link v-else :to="`/materials/${mat.id}/edit`" class="font-app font-bold text-xs text-eco-700">Definir preço</router-link>
            </div>
          </div>

          <div style="height:1px;background:#f1f5f9;margin:0 16px;"></div>

          <div class="px-4 pt-3 pb-4">
            <div class="flex items-center gap-3">
              <button @click="adjustQty(mat.id, mat)" class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 active:scale-90" :style="{ background: `${mat.accentColor}15`, color: mat.accentColor }">−</button>
              <div class="flex-1 relative">
                <input :value="displayQty[String(mat.id)] || ''" @input="onInput(mat.id, $event, mat)" @blur="onBlur(mat.id, mat)"
                       type="text" :inputmode="mat.unitType === 'units' ? 'numeric' : 'decimal'" :placeholder="mat.unitType === 'units' ? 'Unidades' : 'Kg'"
                       class="input-eco w-full px-4 py-3 text-center text-lg" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-app text-slate-400 pointer-events-none">{{ mat.unitType === 'units' ? 'un' : 'kg' }}</span>
              </div>
              <button @click="addQty(mat.id, mat)" class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 active:scale-90" :style="{ background: `${mat.accentColor}15`, color: mat.accentColor }">+</button>
            </div>

            <transition name="result-row">
              <div v-if="quantities[String(mat.id)] > 0" class="mt-3">
                <div class="rounded-xl px-4 py-2.5 flex items-center justify-between" :style="{ background: `${mat.accentColor}0d`, border: `1px solid ${mat.accentColor}20` }">
                  <div class="text-xs font-app text-slate-500">
                    <template v-if="mat.unitType === 'units'">
                      {{ formatInteger(quantities[String(mat.id)]) }} un → {{ formatDecimal(quantityToKg(mat, quantities[String(mat.id)]), 3) }} kg
                    </template>
                    <template v-else>{{ formatDecimal(quantities[String(mat.id)], 3) }} kg</template>
                  </div>
                  <div class="font-app font-extrabold text-base" :class="mat.pricePerKg > 0 ? 'text-gradient-amber' : 'text-slate-400'">
                    {{ mat.pricePerKg > 0 ? formatCurrency(calcValue(mat, quantities[String(mat.id)])) : 'Preço não definido' }}
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </transition-group>

      <div v-if="!currentMaterials.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4" style="background:#f0fdf4;border:2px dashed #d1fae5;">🗂️</div>
        <p class="font-app font-semibold text-slate-400 text-sm">Nenhum material nesta categoria.</p>
        <router-link to="/materials/add" class="mt-3 text-eco-600 text-xs font-app font-semibold underline">Adicionar material →</router-link>
      </div>
    </section>

    <transition name="total-bar">
      <div v-if="grandTotal > 0" class="fixed left-0 right-0 z-40 px-5 py-3 calc-total-bar">
        <div class="rounded-2xl px-5 py-3 flex items-center justify-between" style="background:linear-gradient(135deg,#16a34a,#15803d);">
          <div class="min-w-0 flex-1">
            <p class="text-white/60 text-xs font-app font-semibold uppercase tracking-wider">Total estimado</p>
            <p class="font-app font-extrabold text-2xl text-white mt-0.5">{{ formatCurrency(grandTotal) }}</p>
            <p class="text-white/55 text-xs font-app">{{ formatDecimal(totalKg, 2) }} kg · {{ filledCount }} material{{ filledCount !== 1 ? 'is' : '' }}</p>
          </div>
          <button @click="saveSale" class="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl active:scale-95" style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.25);">
            <svg class="w-5 h-5 text-white" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            <span class="text-white text-xs font-app font-bold">Salvar</span>
          </button>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="saveFeedback" class="fixed left-5 right-5 z-50 rounded-2xl p-4 text-white save-feedback" :style="saveFeedback.type === 'duplicate' ? 'background:#92400e' : 'background:#15803d'">
        <div class="flex items-start gap-3">
          <span class="text-lg">{{ saveFeedback.type === 'duplicate' ? '⚠️' : '✅' }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-app font-bold text-sm">{{ saveFeedback.message }}</p>
            <p v-if="saveFeedback.type === 'saved'" class="font-app text-xs text-white/75 mt-1">Você pode limpar as quantidades ou continuar calculando.</p>
          </div>
        </div>
        <div v-if="saveFeedback.type === 'saved'" class="grid grid-cols-2 gap-2 mt-3">
          <button @click="clearAfterSave" class="py-2 rounded-xl font-app font-bold text-xs" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.22);">Limpar calculadora</button>
          <button @click="saveFeedback = null" class="py-2 rounded-xl font-app font-bold text-xs" style="background:#fff;color:#15803d;">Continuar</button>
        </div>
      </div>
    </transition>

    <div :class="grandTotal > 0 ? 'h-36' : 'h-6'"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMaterials } from '@/composables/useMaterials'
import { useSales } from '@/composables/useSales'
import { useCalculator } from '@/composables/useCalculator'
import { normalizeLocaleInput, formatLocaleNumber } from '@/utils/number'
import { quantityToKg } from '@/utils/recycling'

const route = useRoute()
const { materials, byCategory, categories, formatCurrency, getPricePerUnit, calcValue } = useMaterials()
const { addSale } = useSales()
const { quantities, totalEstimate: grandTotal, totalKg, totalItems, setQty: setSharedQty, clearAll: clearShared } = useCalculator()

const activeCategory = ref(route.query.cat || categories[0]?.key || 'metais')
watch(() => route.query.cat, value => { if (value) activeCategory.value = value })
function selectCategory(key) { activeCategory.value = key }
const currentMaterials = computed(() => byCategory.value[activeCategory.value] ?? [])

const displayQty = ref({})
for (const [id, value] of Object.entries(quantities.value)) {
  if (value > 0) displayQty.value[id] = formatLocaleNumber(value, { maximumFractionDigits: 3 })
}

function formatDecimal(value, maximumFractionDigits = 3) {
  return formatLocaleNumber(value, { minimumFractionDigits: 0, maximumFractionDigits })
}
function formatInteger(value) {
  return formatLocaleNumber(Math.round(Number(value) || 0), { maximumFractionDigits: 0 })
}
function stepFor(material) { return material.unitType === 'units' ? 1 : 0.1 }

function setQty(id, numericValue, material) {
  const value = material.unitType === 'units' ? Math.max(0, Math.round(numericValue)) : Math.max(0, Number(numericValue.toFixed(3)))
  setSharedQty(id, value)
  displayQty.value[String(id)] = value > 0 ? formatDecimal(value, material.unitType === 'units' ? 0 : 3) : ''
}

function onInput(id, event, material) {
  const normalized = normalizeLocaleInput(event.target.value, {
    allowDecimals: material.unitType !== 'units',
    maxDecimals: material.unitType === 'units' ? 0 : 3
  })
  displayQty.value[String(id)] = normalized.display
  event.target.value = normalized.display
  const value = material.unitType === 'units' ? Math.round(normalized.value) : Number(normalized.value.toFixed(3))
  setSharedQty(id, Math.max(0, value))
}

function onBlur(id, material) {
  const value = Number(quantities.value[String(id)] || 0)
  displayQty.value[String(id)] = value > 0 ? formatDecimal(value, material.unitType === 'units' ? 0 : 3) : ''
}

function adjustQty(id, material) {
  const current = Number(quantities.value[String(id)] || 0)
  setQty(id, current - stepFor(material), material)
}
function addQty(id, material) {
  const current = Number(quantities.value[String(id)] || 0)
  setQty(id, current + stepFor(material), material)
}
function clearAll() {
  clearShared()
  displayQty.value = {}
  saveFeedback.value = null
}

const filledCount = computed(() => totalItems.value)
const saveFeedback = ref(null)
const lastSavedSignature = ref('')
const currentSignature = computed(() => JSON.stringify(
  materials.value
    .map(material => [String(material.id), Number(quantities.value[String(material.id)] || 0)])
    .filter(([, quantity]) => quantity > 0)
))

watch(currentSignature, signature => {
  if (lastSavedSignature.value && signature !== lastSavedSignature.value) saveFeedback.value = null
})

function saveSale() {
  if (!currentSignature.value || currentSignature.value === '[]') return
  if (currentSignature.value === lastSavedSignature.value) {
    saveFeedback.value = { type: 'duplicate', message: 'Esta mesma venda já foi salva. Altere alguma quantidade antes de salvar novamente.' }
    return
  }

  const items = materials.value
    .filter(material => Number(quantities.value[String(material.id)] || 0) > 0)
    .map(material => {
      const qty = Number(quantities.value[String(material.id)])
      return {
        materialId: material.id,
        name: material.name,
        icon: material.icon,
        qty,
        unitType: material.unitType,
        unit: material.unitType === 'units' ? 'un' : 'kg',
        value: calcValue(material, qty)
      }
    })

  addSale({ items, total: grandTotal.value, totalKg: totalKg.value })
  lastSavedSignature.value = currentSignature.value
  saveFeedback.value = { type: 'saved', message: 'Venda salva com sucesso.' }
}

function clearAfterSave() {
  clearAll()
  lastSavedSignature.value = ''
}
</script>

<style scoped>
.result-row-enter-active { transition: all .25s ease-out; }
.result-row-leave-active { transition: all .2s ease-in; }
.result-row-enter-from, .result-row-leave-to { opacity:0; transform:translateY(-8px); }
.total-bar-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.total-bar-leave-active { transition: all .2s ease-in; }
.total-bar-enter-from, .total-bar-leave-to { opacity:0; transform:translateY(20px); }
.calc-list-enter-active { transition: all .3s ease-out; }
.calc-list-leave-active { transition: all .2s ease-in; }
.calc-list-enter-from { opacity:0; transform:translateY(16px); }
.calc-list-leave-to { opacity:0; transform:translateY(-8px); }
.toast-enter-active { transition: all .25s ease-out; }
.toast-leave-active { transition: all .2s ease-in; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(10px); }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { scrollbar-width:none; }
</style>
