<template>
  <div class="min-h-screen pt-safe">
    <!-- Header -->
    <header class="px-5 pt-4 pb-3 sticky top-0 z-30"
            style="background: rgba(245,254,248,0.96); backdrop-filter: blur(16px); border-bottom: 1px solid #e2f5e8;">
      <div class="flex items-center justify-between mb-3">
        <h1 class="font-app font-extrabold text-xl text-gradient">Calculadora</h1>
        <button @click="clearAll"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-app font-semibold text-xs text-slate-500 transition-all active:scale-95"
                style="background: #f8fafc; border: 1px solid #e2e8f0;">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Limpar
        </button>
      </div>

      <!-- Category tabs -->
      <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          v-for="cat in categories"
          :key="cat.key"
          @click="selectCategory(cat.key)"
          class="cat-tab shrink-0"
          :class="activeCategory === cat.key ? 'active' : ''"
        >
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>
    </header>

    <!-- Calculator cards -->
    <section class="px-5 mt-4">
      <transition-group name="calc-list" tag="div" class="flex flex-col gap-3">
        <div
          v-for="mat in currentMaterials"
          :key="mat.id"
          class="glass-card rounded-3xl overflow-hidden transition-all duration-200"
          :style="quantities[mat.id] > 0 ? `border-color: ${mat.accentColor}50; box-shadow: 0 4px 20px ${mat.accentColor}18` : ''"
        >
          <!-- Colored top stripe -->
          <div class="h-0.5 w-full"
               :style="{ background: quantities[mat.id] > 0 ? mat.accentColor : 'transparent' }"></div>

          <!-- Card header -->
          <div class="px-4 pt-4 pb-3 flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                 :style="{ background: `${mat.accentColor}18` }">
              {{ mat.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-app font-bold text-sm text-slate-700">{{ mat.name }}</p>
              <p class="text-slate-400 text-xs font-app mt-0.5">{{ mat.description }}</p>
            </div>
            <!-- Price badge -->
            <div class="shrink-0 text-right">
              <p class="font-app font-bold text-sm text-gradient-amber">
                {{ formatCurrency(mat.pricePerKg) }}/kg
              </p>
              <p v-if="mat.unitType === 'units'" class="text-slate-400 text-xs font-app">
                ≈ {{ formatCurrency(getPricePerUnit(mat)) }}/un
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div style="height:1px; background: #f0fdf4; margin: 0 16px;"></div>

          <!-- Input area -->
          <div class="px-4 pt-3 pb-4">
            <div class="flex items-center gap-3">
              <!-- Minus -->
              <button
                @click="adjustQty(mat.id, mat)"
                class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-all active:scale-90"
                :style="{ background: `${mat.accentColor}15`, color: mat.accentColor }"
              >−</button>

              <!-- Input -->
              <div class="flex-1 relative">
                <input
                  :value="displayQty[mat.id] || ''"
                  @input="onInput(mat.id, $event, mat)"
                  @focus="onFocus(mat.id)"
                  @blur="onBlur(mat.id, mat)"
                  type="text"
                  inputmode="decimal"
                  :placeholder="mat.unitType === 'units' ? 'Unidades' : 'Kg'"
                  class="input-eco w-full px-4 py-3 text-center text-lg"
                  :style="`border-color: ${quantities[mat.id] > 0 ? mat.accentColor + '80' : '#d1fae5'}`"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-app text-slate-400 pointer-events-none">
                  {{ mat.unitType === 'units' ? 'un' : 'kg' }}
                </span>
              </div>

              <!-- Plus -->
              <button
                @click="addQty(mat.id, mat)"
                class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-all active:scale-90"
                :style="{ background: `${mat.accentColor}15`, color: mat.accentColor }"
              >+</button>
            </div>

            <!-- Result row -->
            <transition name="result-row">
              <div v-if="quantities[mat.id] > 0" class="mt-3">
                <div class="rounded-2xl px-4 py-2.5 flex items-center justify-between"
                     :style="{ background: `${mat.accentColor}10`, border: `1px solid ${mat.accentColor}25` }">
                  <div class="text-xs font-app text-slate-500">
                    <template v-if="mat.unitType === 'units'">
                      {{ displayQty[mat.id] || 0 }} un → {{ (quantities[mat.id] / mat.unitsPerKg).toFixed(3) }} kg
                    </template>
                    <template v-else>
                      {{ displayQty[mat.id] || 0 }} kg
                    </template>
                  </div>
                  <div class="font-app font-extrabold text-base text-gradient-amber">
                    {{ formatCurrency(calcValue(mat, quantities[mat.id])) }}
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </transition-group>

      <!-- Empty state -->
      <div v-if="!currentMaterials.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
             style="background: #f0fdf4; border: 2px dashed #d1fae5;">🗂️</div>
        <p class="font-app font-semibold text-slate-400 text-sm">Nenhum material nesta categoria.</p>
        <router-link to="/materials/add" class="mt-3 text-eco-600 text-xs font-app font-semibold underline">
          Adicionar material →
        </router-link>
      </div>
    </section>

    <!-- Grand total sticky bar -->
    <transition name="total-bar">
      <div v-if="grandTotal > 0"
           class="fixed left-0 right-0 z-40 px-5 py-3"
           style="bottom: 80px; background: rgba(245,254,248,0.97); backdrop-filter: blur(20px); border-top: 1px solid #d1fae5;">
        <div class="rounded-2xl px-5 py-3 flex items-center justify-between"
             style="background: linear-gradient(135deg, #16a34a, #15803d);">
          <div class="min-w-0 flex-1">
            <p class="text-white/60 text-xs font-app font-semibold uppercase tracking-wider">Total estimado</p>
            <p class="font-app font-extrabold text-2xl text-white mt-0.5">
              {{ formatCurrency(grandTotal) }}
            </p>
            <p class="text-white/50 text-xs font-app">
              {{ totalKgDisplay }} kg · {{ filledCount }} item{{ filledCount !== 1 ? 's' : '' }}
            </p>
          </div>
          <!-- Save button -->
          <button @click="saveSale"
                  class="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all active:scale-95"
                  style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);">
            <svg class="w-5 h-5 text-white" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="17 21 17 13 7 13 7 21" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7 3 7 8 15 8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-white text-xs font-app font-bold">Salvar</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Toast feedback -->
    <transition name="toast">
      <div v-if="showToast"
           class="fixed left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-app font-semibold text-sm text-white"
           style="bottom: 160px; background: #15803d; box-shadow: 0 8px 24px rgba(21,128,61,0.4);">
        ✅ Venda salva com sucesso!
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
import { useFormatNumber } from '@/composables/useFormatNumber'
import { useCalculator } from '@/composables/useCalculator'

const route = useRoute()
const { materials, byCategory, categories, formatCurrency, getPricePerUnit, calcValue } = useMaterials()
const { addSale } = useSales()
const { formatThousands, parseThousands } = useFormatNumber()

// Shared global state — HomeView reads totalEstimate/totalKg/totalItems from here
const { quantities, totalEstimate: grandTotal, totalKg, totalItems,
        setQty: _setQty, clearAll: _clearAll } = useCalculator()

const activeCategory = ref(route.query.cat || 'aluminio')
watch(() => route.query.cat, v => { if (v) activeCategory.value = v })
function selectCategory(key) { activeCategory.value = key }

const currentMaterials = computed(() => byCategory.value[activeCategory.value] ?? [])

// Display strings shown in inputs (formatted with thousand separator)
const displayQty = ref({})

// Sync displayQty from loaded quantities on mount
for (const [id, val] of Object.entries(quantities.value)) {
  if (val > 0) {
    const str = val % 1 === 0 ? String(val) : String(val).replace('.', ',')
    displayQty.value[id] = formatThousands(str)
  }
}

function stepFor(mat) { return mat.unitType === 'units' ? 1 : 0.1 }

function setQty(id, numericValue) {
  const v = Math.max(0, numericValue)
  _setQty(id, v)
  displayQty.value[id] = v > 0 ? formatThousands(String(v).replace('.', ',')) : ''
}

function onInput(id, event) {
  const raw = event.target.value
  const formatted = formatThousands(raw)
  displayQty.value[id] = formatted
  const numeric = parseThousands(formatted)
  _setQty(id, Math.max(0, +numeric.toFixed(3)))
}

function onBlur(id) {
  const n = quantities.value[id] || 0
  if (n > 0) {
    const str = n % 1 === 0 ? String(n) : String(n).replace('.', ',')
    displayQty.value[id] = formatThousands(str)
  } else {
    displayQty.value[id] = ''
  }
}

function adjustQty(id, mat) {
  const step = stepFor(mat)
  const cur  = quantities.value[id] || 0
  setQty(id, Math.max(0, +(cur - step).toFixed(3)))
}

function addQty(id, mat) {
  const step = stepFor(mat)
  const cur  = quantities.value[id] || 0
  setQty(id, +(cur + step).toFixed(3))
}

function clearAll() {
  _clearAll()
  displayQty.value = {}
}

const totalKgDisplay = computed(() => totalKg.value.toFixed(2))
const filledCount    = computed(() => totalItems.value)

// ── Save sale ──────────────────────────────────────────────
const showToast = ref(false)

function saveSale() {
  const items = materials.value
    .filter(m => (quantities.value[m.id] || 0) > 0)
    .map(m => {
      const qty = quantities.value[m.id]
      return {
        materialId: m.id,
        name:       m.name,
        icon:       m.icon,
        qty,
        unitType:   m.unitType,
        unit:       m.unitType === 'units' ? 'un' : 'kg',
        value:      calcValue(m, qty)
      }
    })

  addSale({
    items,
    total:   grandTotal.value,
    totalKg: parseFloat(totalKgDisplay.value)
  })

  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}
</script>

<style scoped>
.result-row-enter-active { transition: all 0.25s ease-out; }
.result-row-leave-active { transition: all 0.2s ease-in; }
.result-row-enter-from, .result-row-leave-to { opacity: 0; transform: translateY(-8px); }

.total-bar-enter-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.total-bar-leave-active { transition: all 0.2s ease-in; }
.total-bar-enter-from, .total-bar-leave-to { opacity: 0; transform: translateY(20px); }

.calc-list-enter-active { transition: all 0.3s ease-out; }
.calc-list-leave-active { transition: all 0.2s ease-in; }
.calc-list-enter-from   { opacity: 0; transform: translateY(16px); }
.calc-list-leave-to     { opacity: 0; transform: translateY(-8px); }

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>
