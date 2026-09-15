<template>
  <div class="min-h-screen flex flex-col" style="background:linear-gradient(160deg,#052e16 0%,#14532d 42%,#15803d 100%);">
    <div class="relative z-10 flex flex-col flex-1 px-6 pt-10 pb-10 overflow-y-auto">
      <div class="flex flex-col items-center mb-7">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-xl" style="background:linear-gradient(135deg,#22c55e,#15803d);"><span class="text-3xl">🌿</span></div>
        <h1 class="text-3xl font-black text-white tracking-tight">Eu Reciclo</h1>
        <p class="text-green-300 text-sm font-semibold mt-1">Configure seus dados e preços</p>
      </div>

      <div class="flex items-center justify-center gap-2 mb-7">
        <div class="h-1.5 rounded-full transition-all" :style="step === 1 ? 'width:40px;background:#4ade80' : 'width:24px;background:rgba(255,255,255,.3)'"></div>
        <div class="h-1.5 rounded-full transition-all" :style="step === 2 ? 'width:40px;background:#4ade80' : 'width:24px;background:rgba(255,255,255,.3)'"></div>
      </div>

      <transition name="slide-step" mode="out-in">
        <div v-if="step === 1" key="step1" class="flex flex-col flex-1">
          <div class="mb-6">
            <h2 class="text-2xl font-black text-white mb-1">Olá! Qual é o seu nome?</h2>
            <p class="text-green-300 text-sm font-medium">Vamos personalizar sua experiência.</p>
          </div>
          <div class="setup-card rounded-2xl p-5 mb-5">
            <label class="block text-xs font-bold text-green-700 uppercase tracking-widest mb-2">Seu nome</label>
            <input v-model="userName" type="text" placeholder="Ex.: João Silva" maxlength="30" class="w-full px-4 py-3.5 rounded-xl text-lg font-bold text-slate-800 outline-none" style="background:#f8fbf9;border:2px solid #bbf7d0;" @keyup.enter="goToStep2" />
          </div>
          <div class="setup-card rounded-2xl p-4 flex items-center gap-3 mb-7">
            <span class="text-xl shrink-0">💡</span>
            <p class="text-slate-600 text-sm font-medium leading-snug">Na próxima etapa, cada reciclável terá seu próprio preço por kg. Você pode deixar os que não conhece para definir depois.</p>
          </div>
          <button @click="goToStep2" class="w-full py-4 rounded-2xl font-black text-base active:scale-95 mt-auto" style="background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;">Continuar →</button>
        </div>
      </transition>

      <transition name="slide-step" mode="out-in">
        <div v-if="step === 2" key="step2" class="flex flex-col flex-1">
          <div class="mb-4">
            <h2 class="text-2xl font-black text-white mb-1">Preços dos materiais</h2>
            <p class="text-green-300 text-sm font-medium">Use o valor pago na sua região. Cada material é independente.</p>
          </div>

          <div class="setup-card rounded-2xl p-4 mb-5 flex flex-col gap-2">
            <div v-for="material in setupMaterials" :key="material.id" class="flex items-center gap-3 py-1.5">
              <span class="text-xl w-7 text-center shrink-0">{{ material.icon }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-600 leading-tight truncate">{{ material.name }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">Preço por kg</p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span class="text-slate-400 text-xs font-bold">R$</span>
                <input :value="displayPrices[String(material.id)]" type="text" inputmode="decimal" placeholder="0,00" maxlength="14"
                       class="w-24 px-2 py-2 rounded-xl text-sm font-black text-slate-800 text-right outline-none"
                       style="background:#f8fbf9;border:1.5px solid #dbe9df;" @input="event => onPriceInput(material.id, event)" @blur="() => normalizePriceDisplay(material.id)" />
              </div>
            </div>
          </div>

          <div class="setup-card rounded-2xl p-4 flex items-start gap-3 mb-6">
            <span class="text-xl shrink-0">📍</span>
            <p class="text-slate-600 text-xs font-medium leading-relaxed">Valores que já existiam no app foram mantidos. Materiais novos sem referência começam em zero para você definir, sem inventar preço de mercado.</p>
          </div>

          <div class="flex gap-3 mt-auto">
            <button @click="step = 1" class="flex-1 py-4 rounded-2xl font-black text-base active:scale-95" style="background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.2);">← Voltar</button>
            <button @click="finish" class="flex-[2] py-4 rounded-2xl font-black text-base active:scale-95" style="background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;">Começar ♻️</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { applySetup, defaultMaterials } from '@/composables/useMaterials'
import { formatPriceInput, normalizeLocaleInput } from '@/utils/number'

const router = useRouter()
const step = ref(1)
const userName = ref('')
const setupMaterials = defaultMaterials.map(material => ({ ...material }))
const pricesByMaterial = reactive({})
const displayPrices = reactive({})

for (const material of setupMaterials) {
  pricesByMaterial[String(material.id)] = Number(material.pricePerKg) || 0
  displayPrices[String(material.id)] = material.pricePerKg > 0 ? formatPriceInput(material.pricePerKg) : ''
}

function onPriceInput(id, event) {
  const normalized = normalizeLocaleInput(event.target.value, { allowDecimals: true, maxDecimals: 2 })
  displayPrices[String(id)] = normalized.display
  pricesByMaterial[String(id)] = normalized.value
  event.target.value = normalized.display
}
function normalizePriceDisplay(id) {
  const value = Number(pricesByMaterial[String(id)] || 0)
  displayPrices[String(id)] = value > 0 ? formatPriceInput(value) : ''
}
function goToStep2() { step.value = 2 }
function finish() {
  applySetup({ userName: userName.value, pricesByMaterial })
  router.replace('/')
}
</script>

<style scoped>
.setup-card { background:#fff; border:1px solid #e5ece7; box-shadow:0 4px 16px rgba(0,0,0,.05); }
.slide-step-enter-active,.slide-step-leave-active { transition:all .26s cubic-bezier(.4,0,.2,1); }
.slide-step-enter-from { opacity:0; transform:translateX(28px); }
.slide-step-leave-to { opacity:0; transform:translateX(-28px); }
</style>
