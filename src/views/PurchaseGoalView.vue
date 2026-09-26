<template>
  <div class="min-h-screen pt-safe page-bottom-space">
    <header class="px-5 pt-4 pb-4 sticky top-0 z-30 app-sticky-header">
      <div class="flex items-center gap-3">
        <button @click="router.back()"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 active:scale-95"
                style="background:#fff;border:1px solid #e2f5e8;">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div>
          <h1 class="font-app font-extrabold text-xl text-gradient">Meta de compra</h1>
          <p class="font-app text-xs text-slate-400 mt-0.5">Transforme o preço das compras em recicláveis</p>
        </div>
      </div>
    </header>

    <div class="px-5 pt-4 pb-8 flex flex-col gap-4">
      <section class="hero-card rounded-3xl p-5 text-white">
        <div class="relative z-10">
          <p class="text-white/60 text-xs font-app font-semibold uppercase tracking-widest">Quanto preciso reciclar?</p>
          <h2 class="font-app font-black text-2xl mt-1 leading-tight">O que você quer comprar?</h2>
          <p class="font-app text-xs text-white/60 mt-2 leading-relaxed">
            Adicione arroz, óleo ou qualquer outro produto. O app soma os preços e calcula quanto do material escolhido você precisa juntar.
          </p>
        </div>
      </section>

      <section class="glass-card rounded-3xl p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-app font-bold text-sm text-slate-700">Lista de compras</h2>
            <p class="font-app text-xs text-slate-400 mt-0.5">Você pode adicionar vários produtos.</p>
          </div>
          <span class="pill" style="background:#f0fdf4;color:#15803d;">{{ items.length }} item{{ items.length === 1 ? '' : 's' }}</span>
        </div>

        <div class="grid grid-cols-[1fr_112px] gap-2">
          <input v-model.trim="draftName"
                 @keyup.enter="addItem"
                 class="input-eco w-full px-3 py-3"
                 type="text"
                 maxlength="50"
                 placeholder="Ex.: Arroz 5 kg" />
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-app font-bold text-slate-400">R$</span>
            <input :value="draftPriceDisplay"
                   @input="onPriceInput"
                   @blur="normalizeDraftPrice"
                   @keyup.enter="addItem"
                   class="input-eco w-full pl-9 pr-3 py-3 text-right"
                   inputmode="decimal" pattern="[0-9.,]*" enterkeyhint="done" autocomplete="off"
                   placeholder="0,00" />
          </div>
        </div>

        <button @click="addItem"
                :disabled="!canAdd"
                class="mt-3 w-full py-3 rounded-2xl font-app font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100"
                style="background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;">
          + Adicionar produto
        </button>

        <div v-if="items.length" class="mt-4 flex flex-col gap-2">
          <div v-for="(item, index) in items" :key="item.id"
               class="rounded-2xl px-3 py-3 flex items-center gap-3"
               style="background:#f8fafc;border:1px solid #eef2f7;">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-eco-600" style="background:#f0fdf4;"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2 11h10l2-7H7"/><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg></div>
            <div class="flex-1 min-w-0">
              <p class="font-app font-semibold text-sm text-slate-700 truncate">{{ item.name }}</p>
              <p class="font-app text-xs text-slate-400">Produto {{ index + 1 }}</p>
            </div>
            <span class="font-app font-black text-sm text-slate-700">{{ formatCurrency(item.price) }}</span>
            <button @click="removeItem(item.id)" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 active:scale-90" aria-label="Remover produto">×</button>
          </div>
        </div>

        <div class="section-divider my-4"></div>
        <div class="flex items-center justify-between">
          <span class="font-app font-semibold text-sm text-slate-500">Total da compra</span>
          <span class="font-app font-black text-xl text-gradient">{{ formatCurrency(totalTarget) }}</span>
        </div>
      </section>

      <section class="glass-card rounded-3xl p-5">
        <div class="mb-3">
          <h2 class="font-app font-bold text-sm text-slate-700">Pagar com reciclagem</h2>
          <p class="font-app text-xs text-slate-400 mt-0.5">Escolha qual material pretende juntar.</p>
        </div>

        <select v-model="selectedMaterialId" class="input-eco w-full px-3 py-3">
          <option v-for="material in materials" :key="material.id" :value="String(material.id)">
            {{ material.name }} — {{ material.pricePerKg > 0 ? `${formatCurrency(material.pricePerKg)}/kg` : 'preço a definir' }}
          </option>
        </select>

        <div v-if="selectedMaterial && selectedMaterial.pricePerKg > 0 && totalTarget > 0" class="mt-4 rounded-3xl p-5" style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #bbf7d0;">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" :style="{ background:'#fff', border:'1px solid #dcfce7', color:selectedMaterial.accentColor }">
              <MaterialIcon :name="selectedMaterial.name" :category="selectedMaterial.category" :legacy-icon="selectedMaterial.icon" class="w-6 h-6" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-app text-xs font-bold uppercase tracking-wide text-eco-700">Você precisa juntar</p>
              <p class="font-app font-black text-2xl text-slate-800 leading-tight mt-1">{{ requiredPrimaryText }}</p>
              <p class="font-app text-xs text-slate-500 mt-1">≈ {{ formatKg(requiredKg) }} · valor estimado {{ formatCurrency(requiredValue) }}</p>
            </div>
          </div>

          <div class="mt-4 rounded-2xl p-3" style="background:#fff;border:1px solid #dcfce7;">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-app font-semibold text-xs text-slate-600">Já informado na Calculadora</p>
                <p class="font-app text-xs text-slate-400 mt-0.5">{{ currentPrimaryText }}</p>
              </div>
              <span class="font-app font-black text-sm" :class="missingQuantity <= 0 ? 'text-eco-700' : 'text-slate-700'">
                {{ missingQuantity <= 0 ? 'Meta atingida ✓' : `Faltam ${missingPrimaryText}` }}
              </span>
            </div>
            <div class="h-2 rounded-full mt-3 overflow-hidden" style="background:#dcfce7;">
              <div class="h-full rounded-full transition-all duration-300" style="background:#16a34a;" :style="{ width: `${progressPercent}%` }"></div>
            </div>
            <p class="font-app text-[11px] text-slate-400 mt-1.5 text-right">{{ formatPercent(progressPercent) }}% da meta</p>
          </div>

          <button @click="saveCurrentGoal"
                  class="mt-3 w-full py-3 rounded-2xl font-app font-bold text-sm text-white active:scale-95"
                  style="background:linear-gradient(135deg,#22c55e,#15803d);">
            Salvar esta meta
          </button>
          <p v-if="saveMessage" class="font-app text-xs text-center text-eco-700 mt-2">{{ saveMessage }}</p>
        </div>

        <div v-else class="mt-4 rounded-2xl p-4 text-center" style="background:#f8fafc;border:1px dashed #cbd5e1;">
          <p class="font-app text-xs text-slate-400">{{ selectedMaterial && selectedMaterial.pricePerKg <= 0 ? 'Defina o preço deste material em Materiais antes de calcular a meta.' : 'Adicione pelo menos um produto com preço para ver o cálculo.' }}</p>
        </div>
      </section>

      <section v-if="goals.length" class="glass-card rounded-3xl p-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-app font-bold text-sm text-slate-700">Metas salvas</h2>
            <p class="font-app text-xs text-slate-400 mt-0.5">Toque em uma meta para calcular novamente com os preços atuais.</p>
          </div>
          <span class="pill" style="background:#f0fdf4;color:#15803d;">{{ goals.length }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <div v-for="goal in goals" :key="goal.id" @click="loadGoal(goal)" role="button" tabindex="0"
               @keyup.enter="loadGoal(goal)"
               class="w-full rounded-2xl p-3 flex items-center gap-3 text-left active:scale-[0.99] cursor-pointer"
               style="background:#f8fafc;border:1px solid #eef2f7;">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-eco-600" style="background:#f0fdf4;"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m14.5 9.5 5-5M16 4h4v4"/></svg></div>
            <div class="flex-1 min-w-0">
              <p class="font-app font-semibold text-sm text-slate-700 truncate">{{ goal.name }}</p>
              <p class="font-app text-xs text-slate-400">{{ goal.items.length }} item{{ goal.items.length === 1 ? '' : 's' }} · {{ formatCurrency(goal.items.reduce((sum, item) => sum + Number(item.price || 0), 0)) }}</p>
            </div>
            <button @click.stop="deleteGoal(goal.id)" class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 active:scale-90" style="background:#fff;border:1px solid #e2e8f0;" aria-label="Excluir meta"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
          </div>
        </div>
      </section>

      <div class="rounded-2xl px-4 py-3 flex gap-3 items-start" style="background:#fff7ed;border:1px solid #fed7aa;">
        <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
        <p class="font-app text-xs text-slate-500 leading-relaxed">
          O cálculo usa o <strong>preço por kg cadastrado no app</strong>. Como o valor pago por recicláveis pode variar, atualize seus preços em Materiais para manter a estimativa próxima da realidade.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MaterialIcon from '@/components/MaterialIcon.vue'
import { useMaterials } from '@/composables/useMaterials'
import { useCalculator } from '@/composables/useCalculator'
import { usePurchaseGoals } from '@/composables/usePurchaseGoals'
import { normalizeLocaleInput, formatPriceInput, formatLocaleNumber } from '@/utils/number'
import { calculateMaterialValue, calculateRequiredQuantity, quantityToKg } from '@/utils/recycling'

const router = useRouter()
const { materials, formatCurrency } = useMaterials()
const { quantities } = useCalculator()
const { goals, saveGoal, deleteGoal } = usePurchaseGoals()

const items = ref([])
const draftName = ref('')
const draftPrice = ref(0)
const draftPriceDisplay = ref('')
const selectedMaterialId = ref(String(materials.value.find(material => material.name.toLowerCase().includes('alum'))?.id ?? materials.value[0]?.id ?? ''))
const saveMessage = ref('')

const canAdd = computed(() => draftName.value.trim().length > 0 && draftPrice.value > 0)
const totalTarget = computed(() => items.value.reduce((sum, item) => sum + Number(item.price || 0), 0))
const selectedMaterial = computed(() => materials.value.find(material => String(material.id) === String(selectedMaterialId.value)) || null)
const requiredQuantity = computed(() => calculateRequiredQuantity(selectedMaterial.value, totalTarget.value))
const requiredKg = computed(() => quantityToKg(selectedMaterial.value, requiredQuantity.value))
const requiredValue = computed(() => calculateMaterialValue(selectedMaterial.value, requiredQuantity.value))
const currentQuantity = computed(() => selectedMaterial.value ? Number(quantities.value[String(selectedMaterial.value.id)] || 0) : 0)
const missingQuantity = computed(() => Math.max(0, requiredQuantity.value - currentQuantity.value))
const progressPercent = computed(() => {
  if (!selectedMaterial.value || totalTarget.value <= 0) return 0
  const currentValue = calculateMaterialValue(selectedMaterial.value, currentQuantity.value)
  return Math.min(100, (currentValue / totalTarget.value) * 100)
})

const unitLabel = computed(() => {
  if (!selectedMaterial.value || selectedMaterial.value.unitType !== 'units') return 'kg'
  const name = selectedMaterial.value.name.toLowerCase()
  if (name.includes('lata') || name.includes('alum')) return 'latinhas'
  if (name.includes('pet')) return 'garrafas'
  return 'unidades'
})

const requiredPrimaryText = computed(() => formatPrimary(requiredQuantity.value))
const currentPrimaryText = computed(() => formatPrimary(currentQuantity.value))
const missingPrimaryText = computed(() => formatPrimary(missingQuantity.value))

function formatPrimary(quantity) {
  if (!selectedMaterial.value) return '—'
  if (selectedMaterial.value.unitType === 'units') {
    return `${Math.ceil(Number(quantity) || 0).toLocaleString('pt-BR')} ${unitLabel.value}`
  }
  return `${Number(quantity || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })} kg`
}

function formatKg(value) {
  return `${formatLocaleNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 3 })} kg`
}

function formatPercent(value) {
  return formatLocaleNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function onPriceInput(event) {
  const normalized = normalizeLocaleInput(event.target.value, { allowDecimals: true, maxDecimals: 2 })
  draftPrice.value = normalized.value
  draftPriceDisplay.value = normalized.display
  event.target.value = normalized.display
}

function normalizeDraftPrice() {
  draftPriceDisplay.value = draftPrice.value > 0 ? formatPriceInput(draftPrice.value) : ''
}

function addItem() {
  if (!canAdd.value) return
  items.value.push({
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: draftName.value.trim(),
    price: draftPrice.value
  })
  draftName.value = ''
  draftPrice.value = 0
  draftPriceDisplay.value = ''
  saveMessage.value = ''
}

function removeItem(id) {
  items.value = items.value.filter(item => item.id !== id)
  saveMessage.value = ''
}

function saveCurrentGoal() {
  const saved = saveGoal({
    name: items.value.map(item => item.name).join(' + '),
    items: items.value,
    materialId: selectedMaterialId.value
  })
  saveMessage.value = saved ? 'Meta salva neste aparelho.' : 'Adicione produtos antes de salvar.'
  setTimeout(() => { saveMessage.value = '' }, 2200)
}

function loadGoal(goal) {
  items.value = goal.items.map((item, index) => ({ ...item, id: `loaded-${Date.now()}-${index}` }))
  if (materials.value.some(material => String(material.id) === String(goal.materialId))) {
    selectedMaterialId.value = String(goal.materialId)
  }
  saveMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
