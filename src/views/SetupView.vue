<template>
  <div class="min-h-screen flex flex-col" style="background:linear-gradient(160deg,#052e16 0%,#14532d 42%,#15803d 100%);">
    <div class="relative z-10 flex flex-col flex-1 px-6 pt-10 pb-10 overflow-y-auto">
      <div class="flex flex-col items-center mb-7">
        <div class="w-16 h-16 rounded-2xl overflow-hidden mb-3 shadow-xl"><img :src="appIcon" alt="" class="w-full h-full object-cover" /></div>
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
            <svg class="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M8.5 14.5C7 13.4 6 11.7 6 9.8A6 6 0 0 1 18 10c0 1.8-.9 3.5-2.5 4.5-.8.5-1.3 1.3-1.5 2.5h-4c-.2-1.2-.7-2-1.5-2.5Z"/></svg>
            <p class="text-slate-600 text-sm font-medium leading-snug">Na próxima etapa, cada reciclável terá seu próprio preço por kg. Você pode configurar só os principais e ajustar os demais depois.</p>
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

          <div class="rounded-2xl p-3.5 mb-4 flex items-start gap-3" style="background:#fffbeb;border:1px solid #fde68a;">
            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 17h.01"/></svg>
            <p class="text-amber-900 text-xs font-semibold leading-relaxed"><strong>Digite o valor em reais.</strong> Ex.: <strong>7</strong> ou <strong>7,00</strong> = R$ 7,00. Não digite 700 esperando que o app transforme em R$ 7,00.</p>
          </div>

          <div class="setup-card rounded-2xl p-4 mb-3 flex flex-col gap-2">
            <div class="flex items-center justify-between mb-1">
              <div>
                <p class="font-black text-sm text-slate-700">Materiais principais</p>
                <p class="text-[11px] text-slate-400 mt-0.5">Você pode alterar tudo depois em Materiais.</p>
              </div>
              <span class="pill" style="background:#f0fdf4;color:#15803d;">{{ primarySetupMaterials.length }}</span>
            </div>
            <PriceRow v-for="material in primarySetupMaterials" :key="material.id" :material="material" />
          </div>

          <button v-if="otherSetupMaterials.length" type="button" @click="showMoreMaterials = !showMoreMaterials"
                  class="w-full mb-3 px-4 py-3 rounded-2xl flex items-center justify-between text-left active:scale-[0.99]"
                  style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);color:#fff;">
            <div>
              <p class="font-black text-sm">{{ showMoreMaterials ? 'Ocultar outros materiais' : 'Configurar outros materiais' }}</p>
              <p class="text-[11px] text-white/60 mt-0.5">{{ otherSetupMaterials.length }} itens opcionais nesta etapa</p>
            </div>
            <svg class="w-4 h-4 transition-transform" :style="showMoreMaterials ? 'transform:rotate(180deg)' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          <transition name="expand">
            <div v-if="showMoreMaterials" class="setup-card rounded-2xl p-4 mb-5 flex flex-col gap-2">
              <PriceRow v-for="material in otherSetupMaterials" :key="material.id" :material="material" />
            </div>
          </transition>

          <div class="flex gap-3 mt-auto">
            <button @click="step = 1" class="flex-1 py-4 rounded-2xl font-black text-base active:scale-95" style="background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.2);">← Voltar</button>
            <button @click="finish" class="flex-[2] py-4 rounded-2xl font-black text-base active:scale-95" style="background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;">Começar</button>
          </div>
        </div>
      </transition>
    </div>

    <transition name="modal">
      <div v-if="priceWarning" class="fixed inset-0 z-50 flex items-end justify-center px-5 pb-6" style="background:rgba(0,0,0,.45);backdrop-filter:blur(4px);" @click.self="priceWarning = false">
        <div class="w-full max-w-sm bg-white rounded-3xl p-5">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-amber-600" style="background:#fffbeb;border:1px solid #fde68a;">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/></svg>
          </div>
          <h3 class="font-black text-lg text-slate-800">Confira estes preços</h3>
          <p class="text-sm text-slate-500 mt-1 leading-relaxed">Alguns valores ficaram muito acima dos preços iniciais do app. Isso pode estar correto, mas vale conferir antes de continuar.</p>
          <div class="mt-3 rounded-2xl p-3 flex flex-col gap-2" style="background:#f8fafc;border:1px solid #e2e8f0;">
            <div v-for="item in suspiciousPrices" :key="item.id" class="flex items-center justify-between gap-3 text-sm">
              <span class="font-semibold text-slate-600 truncate">{{ item.name }}</span>
              <strong class="text-amber-700 shrink-0">{{ formatCurrency(item.entered) }}/kg</strong>
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-3">Se você queria R$ 7,00, por exemplo, digite <strong>7</strong> ou <strong>7,00</strong>.</p>
          <div class="grid grid-cols-2 gap-3 mt-5">
            <button @click="priceWarning = false" class="py-3 rounded-2xl font-bold text-sm text-slate-600" style="background:#f1f5f9;border:1px solid #e2e8f0;">Revisar</button>
            <button @click="confirmUnusualPrices" class="py-3 rounded-2xl font-bold text-sm text-white" style="background:linear-gradient(135deg,#22c55e,#15803d);">Está correto</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import MaterialIcon from '@/components/MaterialIcon.vue'
import appIcon from '@/assets/app-icon.png'
import { applySetup, defaultMaterials } from '@/composables/useMaterials'
import { formatPriceInput, normalizeLocaleInput, formatLocaleCurrency } from '@/utils/number'
import { isSuspiciousSetupPrice } from '@/utils/pricing'

const router = useRouter()
const step = ref(1)
const userName = ref('')
const setupMaterials = defaultMaterials.map(material => ({ ...material }))
const pricesByMaterial = reactive({})
const displayPrices = reactive({})
const showMoreMaterials = ref(false)
const priceWarning = ref(false)
const unusualPricesConfirmed = ref(false)

const primaryIds = new Set(['1', '2', '3', '8', '5', '4'])
const primarySetupMaterials = computed(() => setupMaterials.filter(material => primaryIds.has(String(material.id))))
const otherSetupMaterials = computed(() => setupMaterials.filter(material => !primaryIds.has(String(material.id))))

for (const material of setupMaterials) {
  pricesByMaterial[String(material.id)] = Number(material.pricePerKg) || 0
  displayPrices[String(material.id)] = material.pricePerKg > 0 ? formatPriceInput(material.pricePerKg) : ''
}

function onPriceInput(id, event) {
  const normalized = normalizeLocaleInput(event.target.value, { allowDecimals: true, maxDecimals: 2 })
  displayPrices[String(id)] = normalized.display
  pricesByMaterial[String(id)] = normalized.value
  event.target.value = normalized.display
  unusualPricesConfirmed.value = false
}
function normalizePriceDisplay(id) {
  const value = Number(pricesByMaterial[String(id)] || 0)
  displayPrices[String(id)] = value > 0 ? formatPriceInput(value) : ''
}
function formatCurrency(value) { return formatLocaleCurrency(value) }
function goToStep2() { step.value = 2 }

const suspiciousPrices = computed(() => setupMaterials.flatMap(material => {
  const entered = Number(pricesByMaterial[String(material.id)] || 0)
  const reference = Number(material.pricePerKg || 0)
  if (!reference || entered <= 0) return []
  return isSuspiciousSetupPrice(entered, reference) ? [{ id: material.id, name: material.name, entered, reference }] : []
}))

function completeSetup() {
  applySetup({ userName: userName.value, pricesByMaterial })
  router.replace('/')
}
function finish() {
  if (suspiciousPrices.value.length && !unusualPricesConfirmed.value) {
    priceWarning.value = true
    return
  }
  completeSetup()
}
function confirmUnusualPrices() {
  unusualPricesConfirmed.value = true
  priceWarning.value = false
  completeSetup()
}

const PriceRow = defineComponent({
  props: { material: { type: Object, required: true } },
  setup(props) {
    return () => h('div', { class:'flex items-center gap-3 py-1.5' }, [
      h('div', { class:'w-8 h-8 rounded-lg flex items-center justify-center shrink-0', style:{ background:`${props.material.accentColor}18`, color:props.material.accentColor } }, [
        h(MaterialIcon, { name:props.material.name, category:props.material.category, legacyIcon:props.material.icon, class:'w-4 h-4' })
      ]),
      h('div', { class:'flex-1 min-w-0' }, [
        h('p', { class:'text-xs font-bold text-slate-600 leading-tight truncate' }, props.material.name),
        h('p', { class:'text-[10px] text-slate-400 mt-0.5' }, 'Preço por kg')
      ]),
      h('div', { class:'flex items-center gap-1 shrink-0' }, [
        h('span', { class:'text-slate-400 text-xs font-bold' }, 'R$'),
        h('input', {
          value: displayPrices[String(props.material.id)], type:'text', inputmode:'decimal', pattern:'[0-9.,]*', enterkeyhint:'done', autocomplete:'off', placeholder:'0,00', maxlength:'14',
          class:'w-24 px-2 py-2 rounded-xl text-sm font-black text-slate-800 text-right outline-none', style:'background:#f8fbf9;border:1.5px solid #dbe9df;',
          onInput: event => onPriceInput(props.material.id, event), onBlur: () => normalizePriceDisplay(props.material.id)
        })
      ])
    ])
  }
})
</script>

<style scoped>
.setup-card { background:#fff; border:1px solid #e5ece7; box-shadow:0 4px 16px rgba(0,0,0,.05); }
.slide-step-enter-active,.slide-step-leave-active { transition:all .26s cubic-bezier(.4,0,.2,1); }
.slide-step-enter-from { opacity:0; transform:translateX(28px); }
.slide-step-leave-to { opacity:0; transform:translateX(-28px); }
.expand-enter-active,.expand-leave-active { transition:all .22s ease; overflow:hidden; }
.expand-enter-from,.expand-leave-to { opacity:0; transform:translateY(-8px); max-height:0; }
.modal-enter-active,.modal-leave-active { transition:opacity .2s ease; }
.modal-enter-from,.modal-leave-to { opacity:0; }
</style>
