<template>
  <div class="min-h-screen pt-safe">
    <!-- Header -->
    <header class="px-5 pt-4 pb-3 sticky top-0 z-30"
            style="background: rgba(245,254,248,0.96); backdrop-filter: blur(16px); border-bottom: 1px solid #e2f5e8;">
      <div class="flex items-center justify-between mb-3">
        <h1 class="font-app font-extrabold text-xl text-gradient">Materiais</h1>
        <router-link to="/materials/add"
                     class="fab" style="width:44px; height:44px; border-radius:14px;">
          <svg class="w-5 h-5 text-white" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
          </svg>
        </router-link>
      </div>
      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
             fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Buscar material..."
               class="input-eco w-full pl-9 pr-4 py-2.5 text-sm" />
      </div>
    </header>

    <!-- Category filter tabs -->
    <div class="px-5 pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        @click="filterCat = tab.key"
        class="cat-tab shrink-0"
        :class="filterCat === tab.key ? 'active' : ''"
      >{{ tab.icon }} {{ tab.label }}</button>
    </div>

    <!-- Materials list -->
    <section class="px-5 mt-2 pb-6">
      <transition-group name="mat-list" tag="div" class="flex flex-col gap-2">
        <div
          v-for="mat in filteredMaterials"
          :key="mat.id"
          class="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-fade-up"
        >
          <!-- Left accent -->
          <div class="w-1 self-stretch rounded-full shrink-0"
               :style="{ background: mat.accentColor }"></div>

          <!-- Icon -->
          <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
               :style="{ background: `${mat.accentColor}18` }">
            {{ mat.icon }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-app font-bold text-sm text-slate-700 leading-tight">{{ mat.name }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="pill text-xs"
                    :style="{ background: categoryColors[mat.category]?.bg, color: categoryColors[mat.category]?.text }">
                {{ categoryLabel(mat.category) }}
              </span>
              <span v-if="mat.unitType === 'units'" class="text-slate-400 text-xs font-app">
                {{ mat.unitsPerKg }} un/kg
              </span>
            </div>
          </div>

          <!-- Price -->
          <div class="text-right shrink-0 mr-1">
            <template v-if="mat.pricePerKg > 0">
              <p class="font-app font-bold text-sm text-gradient-amber">{{ formatCurrency(mat.pricePerKg) }}/kg</p>
              <p v-if="mat.unitType === 'units'" class="text-slate-400 text-xs font-app">{{ formatCurrency(getPricePerUnit(mat)) }}/un</p>
            </template>
            <router-link v-else :to="`/materials/${mat.id}/edit`" class="font-app font-bold text-xs text-eco-700">Definir preço</router-link>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-1.5 shrink-0">
            <router-link :to="`/materials/${mat.id}/edit`"
                         class="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                         style="background: #f0fdf4; border: 1px solid #d1fae5;">
              <svg class="w-3.5 h-3.5 text-eco-600" fill="none" stroke="#16a34a" stroke-width="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
            <button @click="confirmDelete(mat)"
                    class="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                    style="background: #fff5f5; border: 1px solid #fecaca;">
              <svg class="w-3.5 h-3.5" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </transition-group>

      <!-- Empty state -->
      <div v-if="!filteredMaterials.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
             style="background: #f0fdf4; border: 2px dashed #d1fae5;">🔍</div>
        <p class="font-app font-semibold text-slate-400 text-sm">
          {{ search ? 'Nenhum resultado encontrado.' : 'Nenhum material nesta categoria.' }}
        </p>
        <router-link to="/materials/add" class="mt-3 text-eco-600 text-xs font-app font-semibold underline">
          Adicionar material →
        </router-link>
      </div>
    </section>

    <!-- Delete confirmation modal -->
    <transition name="modal">
      <div v-if="deleteTarget"
           class="fixed inset-0 z-50 flex items-end justify-center px-5 pb-8"
           style="background: rgba(0,0,0,0.35);"
           @click.self="deleteTarget = null">
        <div class="w-full max-w-sm glass-card-bright rounded-3xl p-6 animate-bounce-in">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"
               style="background: #fff5f5; border: 2px solid #fecaca;">🗑️</div>
          <h3 class="font-app font-bold text-lg text-slate-700 text-center">Excluir material?</h3>
          <p class="text-slate-400 text-sm font-app text-center mt-1 mb-5">
            "{{ deleteTarget?.name }}" será removido permanentemente.
          </p>
          <div class="flex gap-3">
            <button @click="deleteTarget = null"
                    class="flex-1 py-3 rounded-2xl font-app font-bold text-sm text-slate-500 transition-all active:scale-95"
                    style="background: #f8fafc; border: 1px solid #e2e8f0;">
              Cancelar
            </button>
            <button @click="doDelete"
                    class="flex-1 py-3 rounded-2xl font-app font-bold text-sm text-white transition-all active:scale-95"
                    style="background: linear-gradient(135deg, #ef4444, #dc2626);">
              Excluir
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMaterials } from '@/composables/useMaterials'

const {
  materials, byCategory, categories, categoryColors,
  formatCurrency, getPricePerUnit, deleteMaterial
} = useMaterials()

const search = ref('')
const filterCat = ref('all')
const deleteTarget = ref(null)

const filterTabs = [
  { key: 'all', label: 'Todos', icon: '🌿' },
  ...categories
]

function categoryLabel(key) {
  return categories.find(c => c.key === key)?.label ?? key
}

const filteredMaterials = computed(() => {
  let list = materials.value
  if (filterCat.value !== 'all') list = list.filter(m => m.category === filterCat.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(m => m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q))
  }
  return list
})

function confirmDelete(mat) { deleteTarget.value = mat }
function doDelete() {
  if (!deleteTarget.value) return
  deleteMaterial(deleteTarget.value.id)
  deleteTarget.value = null
}
</script>

<style scoped>
.mat-list-enter-active { transition: all 0.25s ease-out; }
.mat-list-leave-active { transition: all 0.2s ease-in; }
.mat-list-enter-from { opacity: 0; transform: translateX(16px); }
.mat-list-leave-to { opacity: 0; transform: translateX(-16px); height: 0; margin: 0; overflow: hidden; }

.modal-enter-active { transition: all 0.25s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>
