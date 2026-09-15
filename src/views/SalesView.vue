<template>
  <div class="min-h-screen pt-safe">

    <!-- Header -->
    <header class="px-5 pt-4 pb-3 sticky top-0 z-30"
            style="background: rgba(245,254,248,0.96); backdrop-filter: blur(16px); border-bottom: 1px solid #e2f5e8;">
      <div class="flex items-center justify-between">
        <h1 class="font-app font-extrabold text-xl text-gradient">Vendas</h1>
        <button v-if="sales.length" @click="confirmClear = true"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-app font-semibold text-xs text-slate-500 transition-all active:scale-95"
                style="background: #f8fafc; border: 1px solid #e2e8f0;">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Limpar tudo
        </button>
      </div>
    </header>

    <!-- Empty state -->
    <div v-if="!sales.length" class="flex flex-col items-center justify-center px-5 py-20 text-center">
      <div class="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-5"
           style="background: #f0fdf4; border: 2px dashed #d1fae5;">🧾</div>
      <p class="font-app font-bold text-slate-500 text-base">Nenhuma venda salva</p>
      <p class="font-app text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
        Calcule seus materiais e toque em <strong class="text-eco-600">Salvar</strong> para registrar uma venda aqui.
      </p>
      <router-link to="/calculator"
                   class="mt-5 px-5 py-2.5 rounded-xl font-app font-bold text-sm text-white transition-all active:scale-95"
                   style="background: linear-gradient(135deg, #16a34a, #15803d);">
        Ir para Calculadora →
      </router-link>
    </div>

    <!-- Sales list -->
    <section v-else class="px-5 mt-4 pb-6">
      <!-- Summary chip -->
      <div class="glass-card rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
        <div>
          <p class="text-slate-400 text-xs font-app font-semibold uppercase tracking-wider">Total geral</p>
          <p class="font-app font-extrabold text-xl text-gradient mt-0.5">
            {{ formatCurrency(grandTotal) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-slate-400 text-xs font-app">{{ sales.length }} venda{{ sales.length !== 1 ? 's' : '' }}</p>
          <p class="text-slate-500 text-xs font-app font-semibold mt-0.5">{{ totalKgAll.toFixed(2) }} kg total</p>
        </div>
      </div>

      <!-- Sale cards -->
      <transition-group name="sale-list" tag="div" class="flex flex-col gap-3">
        <div
          v-for="sale in sales"
          :key="sale.id"
          class="glass-card rounded-3xl overflow-hidden"
        >
          <!-- Header row -->
          <div class="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-app font-bold text-base text-gradient-amber">{{ formatCurrency(sale.total) }}</p>
              <p class="text-slate-400 text-xs font-app mt-0.5">
                {{ formatDate(sale.date) }} · {{ sale.totalKg.toFixed(2) }} kg ·
                {{ sale.items.length }} ite{{ sale.items.length !== 1 ? 'ns' : 'm' }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <!-- Expand/collapse -->
              <button @click="toggleSale(sale.id)"
                      class="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                      style="background: #f0fdf4; border: 1px solid #d1fae5;">
                <svg class="w-4 h-4 text-slate-500 transition-transform duration-200"
                     :style="expandedIds.has(sale.id) ? 'transform: rotate(180deg)' : ''"
                     fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <!-- Delete -->
              <button @click="deleteSale(sale.id)"
                      class="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                      style="background: #fff1f2; border: 1px solid #fecdd3;">
                <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Expandable items -->
          <transition name="expand">
            <div v-if="expandedIds.has(sale.id)">
              <div style="height:1px; background: #f0fdf4; margin: 0 16px;"></div>
              <div class="px-4 py-3 flex flex-col gap-2">
                <div v-for="item in sale.items" :key="item.materialId"
                     class="flex items-center gap-3 py-1.5 rounded-xl px-2"
                     style="background: #f8fffe;">
                  <span class="text-xl shrink-0">{{ item.icon }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="font-app font-semibold text-sm text-slate-700 truncate">{{ item.name }}</p>
                    <p class="text-slate-400 text-xs font-app">
                      {{ formatItemQty(item) }}
                    </p>
                  </div>
                  <p class="font-app font-bold text-sm text-gradient-amber shrink-0">
                    {{ formatCurrency(item.value) }}
                  </p>
                </div>
              </div>
            </div>
          </transition>

          <!-- Items icon strip (when collapsed) -->
          <div v-if="!expandedIds.has(sale.id)" class="px-4 pb-3 flex gap-1.5">
            <span v-for="item in sale.items.slice(0, 6)" :key="item.materialId"
                  class="text-lg">{{ item.icon }}</span>
            <span v-if="sale.items.length > 6" class="text-xs font-app text-slate-400 self-center">
              +{{ sale.items.length - 6 }}
            </span>
          </div>
        </div>
      </transition-group>
    </section>

    <!-- Confirm clear modal -->
    <transition name="modal">
      <div v-if="confirmClear"
           class="fixed inset-0 z-50 flex items-end justify-center px-5 pb-8"
           style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);"
           @click.self="confirmClear = false">
        <div class="w-full bg-white rounded-3xl p-5 max-w-sm">
          <p class="font-app font-bold text-base text-slate-700">Limpar todas as vendas?</p>
          <p class="font-app text-sm text-slate-400 mt-1 mb-5">Esta ação não pode ser desfeita.</p>
          <div class="flex gap-3">
            <button @click="confirmClear = false"
                    class="flex-1 py-3 rounded-2xl font-app font-bold text-sm text-slate-500 transition-all active:scale-95"
                    style="background: #f1f5f9; border: 1px solid #e2e8f0;">
              Cancelar
            </button>
            <button @click="doClearAll"
                    class="flex-1 py-3 rounded-2xl font-app font-bold text-sm text-white transition-all active:scale-95"
                    style="background: linear-gradient(135deg, #ef4444, #dc2626);">
              Limpar tudo
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSales } from '@/composables/useSales'
import { useMaterials } from '@/composables/useMaterials'

const { sales, deleteSale: doDelete, clearAllSales } = useSales()
const { formatCurrency } = useMaterials()

const expandedIds = ref(new Set())
const confirmClear = ref(false)

function toggleSale(id) {
  const s = new Set(expandedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expandedIds.value = s
}

function deleteSale(id) {
  doDelete(id)
  const s = new Set(expandedIds.value)
  s.delete(id)
  expandedIds.value = s
}

function doClearAll() {
  clearAllSales()
  expandedIds.value = new Set()
  confirmClear.value = false
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatItemQty(item) {
  const qty = item.qty
  const str = qty % 1 === 0 ? qty.toLocaleString('pt-BR') : qty.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
  return `${str} ${item.unit}`
}

const grandTotal = computed(() => sales.value.reduce((s, v) => s + v.total, 0))
const totalKgAll = computed(() => sales.value.reduce((s, v) => s + (v.totalKg || 0), 0))
</script>

<style scoped>
.sale-list-enter-active { transition: all 0.3s ease-out; }
.sale-list-leave-active { transition: all 0.2s ease-in; }
.sale-list-enter-from   { opacity: 0; transform: translateY(16px); }
.sale-list-leave-to     { opacity: 0; transform: translateY(-8px); }

.expand-enter-active { transition: all 0.25s ease-out; }
.expand-leave-active { transition: all 0.2s ease-in; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: scaleY(0); transform-origin: top; }

.modal-enter-active { transition: all 0.25s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
