<template>
  <div class="min-h-screen pt-safe" :class="grandTotal > 0 ? 'calculator-with-total' : 'page-bottom-space'">
    <header class="px-5 pt-4 pb-3 sticky top-0 z-30 app-sticky-header">
      <div class="flex items-center justify-between mb-3">
        <h1 class="font-app font-extrabold text-xl text-gradient">Calculadora</h1>
        <button @click="clearAll" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-app font-semibold text-xs text-slate-500 active:scale-95" style="background:#f8fafc;border:1px solid #e2e8f0;">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Limpar
        </button>
      </div>
      <div class="relative category-scroller">
        <div class="flex gap-1.5 overflow-x-auto pb-1 pr-8 no-scrollbar">
          <button v-for="cat in visibleCategories" :key="cat.key" @click="selectCategory(cat.key)" class="cat-tab cat-tab-compact shrink-0" :class="activeCategory === cat.key ? 'active' : ''">
            <MaterialIcon :category="cat.key" class="w-3.5 h-3.5" />
            <span>{{ cat.label }}</span>
          </button>
        </div>
        <div class="category-scroll-fade" aria-hidden="true"></div>
      </div>
    </header>

    <section class="px-5 mt-3">
      <transition-group name="calc-list" tag="div" class="flex flex-col gap-2.5">
        <div v-for="mat in currentMaterials" :key="mat.id" class="glass-card rounded-2xl px-3 py-3 transition-all duration-200"
             :style="quantities[String(mat.id)] > 0 ? `border-color:${mat.accentColor}55;box-shadow:0 3px 12px ${mat.accentColor}10` : ''">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :style="{ background: `${mat.accentColor}18`, color: mat.accentColor }">
              <MaterialIcon :name="mat.name" :category="mat.category" :legacy-icon="mat.icon" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 min-w-0">
                <p class="font-app font-bold text-sm text-slate-700 truncate">{{ mat.name }}</p>
                <span v-if="quantities[String(mat.id)] > 0" class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ background: mat.accentColor }"></span>
              </div>
              <p class="text-slate-400 text-[11px] font-app mt-0.5 truncate">{{ mat.description }}</p>
            </div>
            <div class="shrink-0 text-right pl-1">
              <template v-if="mat.pricePerKg > 0">
                <p class="font-app font-bold text-xs text-gradient-amber">{{ formatCurrency(mat.pricePerKg) }}/kg</p>
                <p v-if="mat.unitType === 'units'" class="text-slate-400 text-[10px] font-app">≈ {{ formatCurrency(getPricePerUnit(mat)) }}/un</p>
              </template>
              <router-link v-else :to="`/materials/${mat.id}/edit`" class="font-app font-bold text-[11px] text-eco-700">Definir preço</router-link>
            </div>
          </div>

          <div class="mt-2.5 flex items-center gap-2">
            <button @click="adjustQty(mat.id, mat)" class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0 active:scale-90" :style="{ background: `${mat.accentColor}12`, color: mat.accentColor }" aria-label="Diminuir quantidade">−</button>
            <div class="flex-1 relative min-w-0">
              <input :value="displayQty[String(mat.id)] || ''" @input="onInput(mat.id, $event, mat)" @blur="onBlur(mat.id, mat)"
                     type="text" :inputmode="mat.unitType === 'units' ? 'numeric' : 'decimal'" pattern="[0-9.,]*" enterkeyhint="done" autocomplete="off" autocorrect="off" spellcheck="false"
                     :placeholder="mat.unitType === 'units' ? 'Unidades' : '0,000'"
                     class="input-eco w-full px-3 py-2 text-center text-base compact-number-input" />
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-app text-slate-400 pointer-events-none">{{ mat.unitType === 'units' ? 'un' : 'kg' }}</span>
            </div>
            <button @click="addQty(mat.id, mat)" class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0 active:scale-90" :style="{ background: `${mat.accentColor}12`, color: mat.accentColor }" aria-label="Aumentar quantidade">+</button>
          </div>

          <transition name="result-row">
            <div v-if="quantities[String(mat.id)] > 0" class="mt-2 flex items-center justify-between gap-3 rounded-xl px-3 py-2" :style="{ background: `${mat.accentColor}0b` }">
              <div class="text-[11px] font-app text-slate-500 truncate">
                <template v-if="mat.unitType === 'units'">
                  {{ formatInteger(quantities[String(mat.id)]) }} un → {{ formatDecimal(quantityToKg(mat, quantities[String(mat.id)]), 3) }} kg
                </template>
                <template v-else>{{ formatDecimal(quantities[String(mat.id)], 3) }} kg</template>
              </div>
              <div class="font-app font-extrabold text-sm shrink-0" :class="mat.pricePerKg > 0 ? 'text-gradient-amber' : 'text-slate-400'">
                {{ mat.pricePerKg > 0 ? formatCurrency(calcValue(mat, quantities[String(mat.id)])) : 'Sem preço' }}
              </div>
            </div>
          </transition>
        </div>
      </transition-group>

      <div v-if="!currentMaterials.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-eco-500" style="background:#f0fdf4;border:2px dashed #d1fae5;">
          <MaterialIcon category="outros" class="w-7 h-7" />
        </div>
        <p class="font-app font-semibold text-slate-400 text-sm">Nenhum material nesta categoria.</p>
        <router-link to="/materials/add" class="mt-3 text-eco-600 text-xs font-app font-semibold underline">Adicionar material →</router-link>
      </div>
    </section>

    <transition name="total-bar">
      <div v-if="grandTotal > 0" class="fixed left-0 right-0 z-40 px-4 py-2 calc-total-bar">
        <div class="rounded-2xl px-4 py-2.5 flex items-center gap-3" style="background:linear-gradient(135deg,#16a34a,#15803d);box-shadow:0 6px 18px rgba(21,128,61,.22);">
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2 min-w-0">
              <p class="font-app font-extrabold text-xl text-white truncate">{{ formatCurrency(grandTotal) }}</p>
              <p class="text-white/60 text-[10px] font-app whitespace-nowrap">{{ formatDecimal(totalKg, 2) }} kg</p>
            </div>
            <p class="text-white/55 text-[10px] font-app">{{ filledCount }} material{{ filledCount !== 1 ? 'is' : '' }} · total estimado</p>
          </div>
          <button @click="saveSale" class="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl active:scale-95" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);">
            <svg class="w-4 h-4 text-white" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            <span class="text-white text-xs font-app font-bold">Salvar</span>
          </button>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="saveFeedback" class="fixed left-5 right-5 z-50 rounded-2xl p-4 text-white save-feedback" :style="saveFeedback.type === 'duplicate' ? 'background:#92400e' : 'background:#15803d'">
        <div class="flex items-start gap-3">
          <svg v-if="saveFeedback.type === 'duplicate'" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/></svg>
          <svg v-else class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4 4L19 6"/></svg>
          <div class="flex-1 min-w-0">
            <p class="font-app font-bold text-sm">{{ saveFeedback.message }}</p>
            <p v-if="saveFeedback.type === 'saved'" class="font-app text-xs text-white/75 mt-1">Você pode limpar as quantidades ou continuar calculando.</p>
          </div>
        </div>
        <div v-if="saveFeedback.type === 'saved'" class="grid grid-cols-2 gap-2 mt-3">
          <button @click="clearAfterSave" class="py-2 rounded-xl font-app font-bold text-xs" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.22);">Limpar</button>
          <button @click="saveFeedback = null" class="py-2 rounded-xl font-app font-bold text-xs" style="background:#fff;color:#15803d;">Continuar</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import MaterialIcon from '@/components/MaterialIcon.vue'
import { useMaterials } from '@/composables/useMaterials'
import { useSales } from '@/composables/useSales'
import { useCalculator } from '@/composables/useCalculator'
import { normalizeLocaleInput, formatLocaleNumber } from '@/utils/number'
import { quantityToKg } from '@/utils/recycling'

const route = useRoute()
const { materials, byCategory, categories, formatCurrency, getPricePerUnit, calcValue } = useMaterials()
const { addSale } = useSales()
const { quantities, totalEstimate: grandTotal, totalKg, totalItems, setQty: setSharedQty, clearAll: clearShared } = useCalculator()

const visibleCategories = computed(() => categories.filter(category => (byCategory.value[category.key] ?? []).length > 0))
const activeCategory = ref(route.query.cat || visibleCategories.value[0]?.key || 'metais')
watch(() => route.query.cat, value => { if (value) activeCategory.value = value })
watch(visibleCategories, list => {
  if (!list.some(category => category.key === activeCategory.value)) activeCategory.value = list[0]?.key || 'metais'
})
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
        category: material.category,
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
.result-row-enter-active { transition: all .2s ease-out; }
.result-row-leave-active { transition: all .16s ease-in; }
.result-row-enter-from, .result-row-leave-to { opacity:0; transform:translateY(-5px); }
.total-bar-enter-active { transition: all .25s cubic-bezier(.34,1.56,.64,1); }
.total-bar-leave-active { transition: all .18s ease-in; }
.total-bar-enter-from, .total-bar-leave-to { opacity:0; transform:translateY(14px); }
.calc-list-enter-active { transition: all .25s ease-out; }
.calc-list-leave-active { transition: all .18s ease-in; }
.calc-list-enter-from { opacity:0; transform:translateY(10px); }
.calc-list-leave-to { opacity:0; transform:translateY(-6px); }
.toast-enter-active { transition: all .22s ease-out; }
.toast-leave-active { transition: all .18s ease-in; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(8px); }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { scrollbar-width:none; }
</style>
