<template>
  <div class="min-h-screen pt-safe">
    <!-- Header -->
    <header class="px-5 pt-4 pb-4 flex items-center gap-3 sticky top-0 z-30"
            style="background: rgba(245,254,248,0.96); backdrop-filter: blur(16px); border-bottom: 1px solid #e2f5e8;">
      <button @click="goBack"
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90"
              style="background: #f0fdf4; border: 1px solid #d1fae5;">
        <svg class="w-4 h-4" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="font-app font-extrabold text-xl text-gradient flex-1">
        {{ isEdit ? 'Editar Material' : 'Novo Material' }}
      </h1>
      <!-- Icon preview -->
      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-sm"
           :style="{ background: `${form.accentColor}20`, border: `1.5px solid ${form.accentColor}40` }">
        {{ form.icon || '♻️' }}
      </div>
    </header>

    <!-- Form -->
    <form @submit.prevent="save" class="px-5 pt-5 pb-8">
      <!-- Success toast -->
      <transition name="toast">
        <div v-if="showToast"
             class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-app font-bold text-sm text-white flex items-center gap-2"
             style="background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 6px 24px rgba(22,163,74,0.35);">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ isEdit ? 'Material atualizado!' : 'Material salvo!' }}
        </div>
      </transition>

      <!-- SECTION: Identificação -->
      <div class="mb-5 animate-fade-up">
        <label class="block font-app font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">
          Identificação
        </label>
        <div class="glass-card rounded-2xl overflow-hidden">
          <!-- Icon picker -->
          <div class="px-4 py-3 border-b border-eco-50">
            <p class="text-slate-400 text-xs font-app mb-2">Ícone (emoji)</p>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="em in iconOptions"
                :key="em"
                type="button"
                @click="form.icon = em"
                class="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90"
                :style="form.icon === em
                  ? `background:${form.accentColor}25; border: 2px solid ${form.accentColor}70`
                  : 'background: #f0fdf4; border: 1.5px solid #e2f5e8'"
              >{{ em }}</button>
            </div>
          </div>

          <!-- Name -->
          <div class="px-4 py-3 border-b border-eco-50">
            <p class="text-slate-400 text-xs font-app mb-1.5">Nome do material *</p>
            <input v-model="form.name" type="text" placeholder="Ex: Alumínio / Latas"
                   required
                   class="input-eco w-full px-3 py-2.5 text-sm" />
            <p v-if="errors.name" class="text-red-500 text-xs font-app mt-1">{{ errors.name }}</p>
          </div>

          <!-- Description -->
          <div class="px-4 py-3">
            <p class="text-slate-400 text-xs font-app mb-1.5">Descrição (opcional)</p>
            <input v-model="form.description" type="text" placeholder="Ex: 70 latas = 1 kg"
                   class="input-eco w-full px-3 py-2.5 text-sm" />
          </div>
        </div>
      </div>

      <!-- SECTION: Categoria & Cor -->
      <div class="mb-5 animate-fade-up stagger-2">
        <label class="block font-app font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">
          Categoria e Cor
        </label>
        <div class="glass-card rounded-2xl overflow-hidden">
          <!-- Category -->
          <div class="px-4 py-3 border-b border-eco-50">
            <p class="text-slate-400 text-xs font-app mb-2">Categoria *</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="cat in categories"
                :key="cat.key"
                type="button"
                @click="form.category = cat.key"
                class="py-2 px-3 rounded-xl text-xs font-app font-bold transition-all active:scale-95 flex items-center gap-2"
                :style="form.category === cat.key
                  ? `background: ${categoryColors[cat.key].bg}; border: 1.5px solid ${categoryColors[cat.key].border}; color: ${categoryColors[cat.key].text}`
                  : 'background: #f8fafc; border: 1.5px solid #e2e8f0; color: #94a3b8'"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- Accent color -->
          <div class="px-4 py-3">
            <p class="text-slate-400 text-xs font-app mb-2">Cor de destaque</p>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="col in colorOptions"
                :key="col"
                type="button"
                @click="form.accentColor = col"
                class="w-8 h-8 rounded-xl transition-all active:scale-90 relative shadow-sm"
                :style="{ background: col, border: form.accentColor === col ? `2.5px solid #0f172a` : '2px solid transparent' }"
              >
                <span v-if="form.accentColor === col"
                      class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">✓</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION: Precificação -->
      <div class="mb-6 animate-fade-up stagger-3">
        <label class="block font-app font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">
          Precificação
        </label>
        <div class="glass-card rounded-2xl overflow-hidden">
          <!-- Price per kg -->
          <div class="px-4 py-3 border-b border-eco-50">
            <p class="text-slate-400 text-xs font-app mb-1.5">Preço por kg (R$) *</p>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-app font-bold text-slate-400 text-sm pointer-events-none">R$</span>
              <input
                :value="displayPrice"
                type="text"
                inputmode="decimal"
                placeholder="3,00"
                maxlength="10"
                class="input-eco w-full pl-10 pr-4 py-3 text-sm"
                @input="onPriceInput"
                @focus="e => e.target.style.borderColor = '#22c55e'"
                @blur="onPriceBlur"
              />
            </div>
            <p v-if="errors.pricePerKg" class="text-red-500 text-xs font-app mt-1">{{ errors.pricePerKg }}</p>
          </div>

          <!-- Unit type toggle -->
          <div class="px-4 py-3 border-b border-eco-50">
            <p class="text-slate-400 text-xs font-app mb-2">Tipo de medição *</p>
            <div class="flex gap-2">
              <button
                v-for="ut in unitTypes"
                :key="ut.value"
                type="button"
                @click="form.unitType = ut.value"
                class="flex-1 py-2.5 rounded-xl text-xs font-app font-bold transition-all active:scale-95"
                :style="form.unitType === ut.value
                  ? 'background: #16a34a; border: 1.5px solid #16a34a; color: #ffffff'
                  : 'background: #f8fafc; border: 1.5px solid #e2e8f0; color: #94a3b8'"
              >{{ ut.label }}</button>
            </div>
          </div>

          <!-- Units per kg -->
          <transition name="field-toggle">
            <div v-if="form.unitType === 'units'" class="px-4 py-3 border-b border-eco-50">
              <p class="text-slate-400 text-xs font-app mb-1.5">Unidades por kg *</p>
              <input :value="form.unitsPerKg ? Number(form.unitsPerKg).toLocaleString('pt-BR') : ''" type="text" inputmode="numeric"
                     placeholder="Ex.: 70 para latas, 25 para PET"
                     :required="form.unitType === 'units'"
                     class="input-eco w-full px-4 py-3 text-sm"
                     @input="onUnitsPerKgInput" />
              <p v-if="errors.unitsPerKg" class="text-red-500 text-xs font-app mt-1">{{ errors.unitsPerKg }}</p>
            </div>
          </transition>

          <!-- Price preview -->
          <div v-if="form.pricePerKg > 0" class="px-4 py-3">
            <p class="text-slate-400 text-xs font-app mb-1.5">Prévia de preço</p>
            <div class="flex gap-2">
              <div class="flex-1 rounded-xl px-3 py-2 text-center"
                   style="background: #fffbeb; border: 1px solid #fde68a;">
                <p class="font-app font-extrabold text-base text-gradient-amber">
                  {{ formatCurrency(form.pricePerKg) }}
                </p>
                <p class="text-slate-400 text-xs font-app">por kg</p>
              </div>
              <div v-if="form.unitType === 'units' && form.unitsPerKg > 0"
                   class="flex-1 rounded-xl px-3 py-2 text-center"
                   style="background: #f0fdf4; border: 1px solid #d1fae5;">
                <p class="font-app font-extrabold text-base text-eco-600">
                  {{ formatCurrency(form.pricePerKg / form.unitsPerKg) }}
                </p>
                <p class="text-slate-400 text-xs font-app">por unidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SAVE BUTTON -->
      <div class="animate-fade-up stagger-4">
        <button
          type="submit"
          :disabled="saving"
          class="w-full py-4 rounded-2xl font-app font-extrabold text-base text-white transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
          style="background: linear-gradient(135deg, #22c55e, #15803d); box-shadow: 0 6px 20px rgba(22,163,74,0.35);"
          :style="saving ? 'opacity:0.75' : ''"
        >
          <transition name="btn-icon" mode="out-in">
            <svg v-if="!saving" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="17 21 17 13 7 13 7 21" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7 3 7 8 15 8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </transition>
          {{ saving ? 'Salvando...' : (isEdit ? 'Salvar alterações' : 'Salvar material') }}
        </button>

        <button v-if="isEdit" type="button" @click="goBack"
                class="w-full mt-3 py-3.5 rounded-2xl font-app font-semibold text-sm text-slate-400 transition-all active:scale-95"
                style="background: #f8fafc; border: 1px solid #e2e8f0;">
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMaterials } from '@/composables/useMaterials'
import { formatPriceInput, normalizeLocaleInput } from '@/utils/number'

const route = useRoute()
const router = useRouter()
const { categories, categoryColors, getMaterial, addMaterial, updateMaterial, formatCurrency } = useMaterials()

const isEdit = computed(() => route.meta.mode === 'edit')
const matId = computed(() => route.params.id)

const form = ref({
  name: '', description: '', category: 'outros',
  pricePerKg: 3, unitType: 'weight', unitsPerKg: '',
  icon: '♻️', accentColor: '#22c55e'
})
const errors = ref({})
const saving = ref(false)
const showToast = ref(false)

// Price mask display
const displayPrice = ref(formatPriceInput(3))

function onPriceInput(event) {
  const normalized = normalizeLocaleInput(event.target.value, { allowDecimals: true, maxDecimals: 2 })
  displayPrice.value = normalized.display
  form.value.pricePerKg = normalized.value
  event.target.value = normalized.display
}

function onPriceBlur(event) {
  displayPrice.value = formatPriceInput(form.value.pricePerKg || 0)
  event.target.value = displayPrice.value
}

function onUnitsPerKgInput(event) {
  const normalized = normalizeLocaleInput(event.target.value, { allowDecimals: false, maxDecimals: 0 })
  form.value.unitsPerKg = Math.round(normalized.value || 0) || ''
  event.target.value = normalized.display
}

const iconOptions = ['♻️','🥫','🧴','⚡','🔧','📦','🫙','🔩','🌿','💎','🪨','🔋','📱','🖥️','🚗']
const colorOptions = ['#22c55e','#60a5fa','#f59e0b','#f87171','#a78bfa','#5eead4','#fb7185','#d97706','#9ca3af','#c084fc','#34d399','#fcd34d']
const unitTypes = [
  { value: 'weight', label: '⚖️ Por Peso (kg)' },
  { value: 'units',  label: '🔢 Por Unidade (un)' }
]

onMounted(() => {
  if (isEdit.value && matId.value) {
    const mat = getMaterial(matId.value)
    if (mat) {
      form.value = {
        name: mat.name, description: mat.description || '',
        category: mat.category, pricePerKg: mat.pricePerKg,
        unitType: mat.unitType, unitsPerKg: mat.unitsPerKg || '',
        icon: mat.icon || '♻️', accentColor: mat.accentColor || '#22c55e'
      }
      displayPrice.value = formatPriceInput(mat.pricePerKg)
    }
  }
})

function validate() {
  errors.value = {}
  if (!form.value.name?.trim()) errors.value.name = 'Nome obrigatório'
  if (!form.value.pricePerKg || form.value.pricePerKg <= 0) errors.value.pricePerKg = 'Preço deve ser maior que zero'
  if (form.value.unitType === 'units' && (!form.value.unitsPerKg || form.value.unitsPerKg < 1)) {
    errors.value.unitsPerKg = 'Informe quantas unidades formam 1 kg'
  }
  return Object.keys(errors.value).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  await new Promise(r => setTimeout(r, 400))
  if (isEdit.value) updateMaterial(matId.value, form.value)
  else addMaterial(form.value)
  saving.value = false
  showToast.value = true
  setTimeout(() => { showToast.value = false; router.push('/materials') }, 1200)
}

function goBack() { router.back() }
</script>

<style scoped>
.border-eco-50 { border-color: #f0fdf4; }

.field-toggle-enter-active, .field-toggle-leave-active { transition: all 0.25s ease; }
.field-toggle-enter-from, .field-toggle-leave-to { opacity: 0; max-height: 0; overflow: hidden; }
.field-toggle-enter-to, .field-toggle-leave-from { opacity: 1; max-height: 200px; }

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translate(-50%,-12px) scale(0.9); }
.toast-leave-to   { opacity: 0; transform: translate(-50%,-8px); }

.btn-icon-enter-active, .btn-icon-leave-active { transition: all 0.15s ease; }
.btn-icon-enter-from, .btn-icon-leave-to { opacity: 0; transform: scale(0.7); }
</style>
