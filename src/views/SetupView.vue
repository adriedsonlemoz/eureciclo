<template>
  <div class="min-h-screen flex flex-col" style="background: linear-gradient(160deg, #052e16 0%, #14532d 40%, #15803d 100%);">

    <!-- Decorative blobs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
           style="background: radial-gradient(circle, #4ade80 0%, transparent 70%); filter: blur(48px);"></div>
      <div class="absolute bottom-0 -left-16 w-64 h-64 rounded-full opacity-15"
           style="background: radial-gradient(circle, #86efac 0%, transparent 70%); filter: blur(56px);"></div>
    </div>

    <div class="relative z-10 flex flex-col flex-1 px-6 pt-14 pb-10 overflow-y-auto">

      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-2xl"
             style="background: linear-gradient(135deg, #22c55e, #15803d); box-shadow: 0 8px 32px rgba(34,197,94,0.4);">
          <span class="text-4xl">🌿</span>
        </div>
        <h1 class="text-3xl font-black text-white tracking-tight">Eu Reciclo</h1>
        <p class="text-green-300 text-sm font-semibold mt-1">Configure sua conta em segundos</p>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div class="h-1.5 rounded-full transition-all duration-300"
             :style="step === 1 ? 'width:40px;background:#4ade80' : 'width:24px;background:rgba(255,255,255,0.3)'"></div>
        <div class="h-1.5 rounded-full transition-all duration-300"
             :style="step === 2 ? 'width:40px;background:#4ade80' : 'width:24px;background:rgba(255,255,255,0.3)'"></div>
      </div>

      <!-- ── STEP 1: Nome ── -->
      <transition name="slide-step" mode="out-in">
        <div v-if="step === 1" key="step1" class="flex flex-col flex-1">
          <div class="mb-6">
            <h2 class="text-2xl font-black text-white mb-1">Olá! Qual é o seu nome?</h2>
            <p class="text-green-300 text-sm font-medium">Vamos personalizar sua experiência.</p>
          </div>

          <div class="setup-card rounded-3xl p-5 mb-6">
            <label class="block text-xs font-bold text-green-700 uppercase tracking-widest mb-2">Seu nome</label>
            <input
              v-model="userName"
              type="text"
              placeholder="Ex: João Silva"
              maxlength="30"
              class="w-full px-4 py-3.5 rounded-2xl text-lg font-bold text-slate-800 outline-none transition-all duration-200"
              style="background: #f0fdf4; border: 2px solid #bbf7d0;"
              @focus="e => e.target.style.borderColor = '#22c55e'"
              @blur="e => e.target.style.borderColor = '#bbf7d0'"
              @keyup.enter="goToStep2"
            />
          </div>

          <div class="setup-card rounded-3xl p-4 flex items-center gap-3 mb-8">
            <span class="text-2xl shrink-0">💡</span>
            <p class="text-slate-600 text-sm font-medium leading-snug">
              Na próxima etapa, configure o preço por kg de cada material na sua cidade.
            </p>
          </div>

          <button
            @click="goToStep2"
            class="w-full py-4 rounded-2xl font-black text-base transition-all duration-150 active:scale-95 mt-auto"
            style="background: linear-gradient(135deg, #22c55e, #15803d); color: #fff; box-shadow: 0 6px 24px rgba(34,197,94,0.45);"
          >
            Continuar →
          </button>
        </div>
      </transition>

      <!-- ── STEP 2: Preços ── -->
      <transition name="slide-step" mode="out-in">
        <div v-if="step === 2" key="step2" class="flex flex-col flex-1">
          <div class="mb-5">
            <h2 class="text-2xl font-black text-white mb-1">Preços na sua cidade</h2>
            <p class="text-green-300 text-sm font-medium">Preço por kg de cada material. Ajuste conforme os valores da sua cidade.</p>
          </div>

          <div class="setup-card rounded-3xl p-5 mb-5 flex flex-col gap-3">
            <div v-for="item in priceFields" :key="item.key"
                 class="flex items-center gap-3">
              <span class="text-2xl w-8 text-center shrink-0">{{ item.icon }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">{{ item.label }}</p>
              </div>
              <!-- Masked price input -->
              <div class="flex items-center gap-1 shrink-0">
                <span class="text-slate-400 text-sm font-bold">R$</span>
                <input
                  :value="displayPrices[item.key]"
                  type="text"
                  inputmode="numeric"
                  placeholder="3,00"
                  maxlength="10"
                  class="w-24 px-2 py-2 rounded-xl text-base font-black text-slate-800 text-right outline-none transition-all duration-200"
                  style="background: #f0fdf4; border: 2px solid #bbf7d0;"
                  @focus="e => e.target.style.borderColor = '#22c55e'"
                  @blur="e => e.target.style.borderColor = '#bbf7d0'"
                  @input="e => onPriceInput(item.key, e)"
                />
              </div>
            </div>
          </div>

          <div class="setup-card rounded-3xl p-4 flex items-center gap-3 mb-6">
            <span class="text-2xl shrink-0">📍</span>
            <p class="text-slate-600 text-sm font-medium leading-snug">
              Os campos já começam com valores sugeridos e podem ser alterados livremente.
            </p>
          </div>

          <div class="flex gap-3 mt-auto">
            <button
              @click="step = 1"
              class="flex-1 py-4 rounded-2xl font-black text-base transition-all duration-150 active:scale-95"
              style="background: rgba(255,255,255,0.12); color: #fff; border: 1.5px solid rgba(255,255,255,0.2);"
            >
              ← Voltar
            </button>
            <button
              @click="finish"
              class="flex-[2] py-4 rounded-2xl font-black text-base transition-all duration-150 active:scale-95"
              style="background: linear-gradient(135deg, #22c55e, #15803d); color: #fff; box-shadow: 0 6px 24px rgba(34,197,94,0.45);"
            >
              Começar ♻️
            </button>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { applySetup, DEFAULT_CATEGORY_PRICES } from '@/composables/useMaterials'
import { numberToDisplay } from '@/composables/usePriceMask'

const router = useRouter()

const step     = ref(1)
const userName = ref('')

// Numeric values (actual price per kg)
const prices = reactive({
  latas:    DEFAULT_CATEGORY_PRICES.aluminio,
  pet:      DEFAULT_CATEGORY_PRICES.pet,
  cobre:    DEFAULT_CATEGORY_PRICES.cobre,
  papel:    DEFAULT_CATEGORY_PRICES.papel,
  baterias: DEFAULT_CATEGORY_PRICES.baterias,
  outros:   DEFAULT_CATEGORY_PRICES.outros
})

// Displayed strings in inputs
const displayPrices = reactive({
  latas:    numberToDisplay(DEFAULT_CATEGORY_PRICES.aluminio),
  pet:      numberToDisplay(DEFAULT_CATEGORY_PRICES.pet),
  cobre:    numberToDisplay(DEFAULT_CATEGORY_PRICES.cobre),
  papel:    numberToDisplay(DEFAULT_CATEGORY_PRICES.papel),
  baterias: numberToDisplay(DEFAULT_CATEGORY_PRICES.baterias),
  outros:   numberToDisplay(DEFAULT_CATEGORY_PRICES.outros)
})

const priceFields = [
  { key: 'latas',    icon: '🥫', label: 'Latas / Alumínio' },
  { key: 'pet',      icon: '🧴', label: 'PET (garrafas)'   },
  { key: 'cobre',    icon: '⚡', label: 'Cobre / Latão'    },
  { key: 'papel',    icon: '📦', label: 'Papel / Papelão'  },
  { key: 'baterias', icon: '🔋', label: 'Baterias / Pilhas'},
  { key: 'outros',   icon: '♻️', label: 'Outros plásticos' },
]

function onPriceInput(key, event) {
  const digits = event.target.value.replace(/\D/g, '')
  const cents  = parseInt(digits || '0', 10)
  // Build display string "X.XXX,XX"
  const str = String(cents).padStart(3, '0')
  const intPart = str.slice(0, -2).replace(/^0+/, '') || '0'
  const decPart = str.slice(-2)
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  displayPrices[key] = `${intFormatted},${decPart}`
  prices[key] = cents / 100
  // Keep cursor at end
  const el = event.target
  requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length))
}

function goToStep2() {
  step.value = 2
}

function finish() {
  applySetup({ userName: userName.value, prices })
  router.replace('/')
}
</script>

<style scoped>
.setup-card {
  background: #ffffff;
  border: 1px solid #e2f5e8;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.slide-step-enter-active,
.slide-step-leave-active { transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-step-enter-from { opacity: 0; transform: translateX(32px); }
.slide-step-leave-to   { opacity: 0; transform: translateX(-32px); }
</style>
