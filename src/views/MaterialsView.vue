<template>
  <div class="min-h-screen pt-safe page-bottom-space">
    <header class="px-5 pt-4 pb-3 sticky top-0 z-30 app-sticky-header">
      <div class="flex items-center justify-between mb-3">
        <h1 class="font-app font-extrabold text-xl text-gradient">Materiais</h1>
        <router-link to="/materials/add" class="fab" style="width:44px;height:44px;border-radius:14px;" aria-label="Adicionar material">
          <svg class="w-5 h-5 text-white" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
        </router-link>
      </div>
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/></svg>
        <input v-model="search" type="search" placeholder="Buscar material..." autocomplete="off" class="input-eco w-full pl-9 pr-4 py-2.5 text-sm" />
      </div>
    </header>

    <div class="px-5 pt-3 pb-2 relative category-scroller">
      <div ref="filterScroller" class="flex gap-1.5 overflow-x-auto no-scrollbar pr-10 scroll-smooth">
        <button v-for="tab in filterTabs" :key="tab.key" @click="filterCat = tab.key" class="cat-tab cat-tab-compact shrink-0" :class="filterCat === tab.key ? 'active' : ''">
          <MaterialIcon :category="tab.key === 'all' ? 'outros' : tab.key" class="w-3.5 h-3.5" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
      <button v-if="filterTabs.length > 5" type="button" @click="scrollFilters" class="category-scroll-control" style="right:20px;" aria-label="Ver mais filtros">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>

    <section class="px-5 mt-2 pb-6">
      <transition-group name="mat-list" tag="div" class="flex flex-col gap-2">
        <div v-for="mat in filteredMaterials" :key="mat.id" class="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-fade-up">
          <div class="w-1 self-stretch rounded-full shrink-0" :style="{ background: mat.accentColor }"></div>
          <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" :style="{ background: `${mat.accentColor}18`, color: mat.accentColor }">
            <MaterialIcon :name="mat.name" :category="mat.category" :legacy-icon="mat.icon" class="w-5 h-5" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-app font-bold text-sm text-slate-700 leading-tight truncate">{{ mat.name }}</p>
            <div class="flex items-center gap-2 mt-1 min-w-0">
              <span class="pill text-xs" :style="{ background: categoryColors[mat.category]?.bg, color: categoryColors[mat.category]?.text }">{{ categoryLabel(mat.category) }}</span>
              <span v-if="mat.unitType === 'units'" class="text-slate-400 text-xs font-app whitespace-nowrap">{{ formatInteger(mat.unitsPerKg) }} un/kg</span>
            </div>
          </div>

          <div class="text-right shrink-0 mr-0.5">
            <template v-if="mat.pricePerKg > 0">
              <p class="font-app font-bold text-sm text-gradient-amber">{{ formatCurrency(mat.pricePerKg) }}/kg</p>
              <p v-if="mat.unitType === 'units'" class="text-slate-400 text-[11px] font-app">{{ formatCurrency(getPricePerUnit(mat)) }}/un</p>
            </template>
            <router-link v-else :to="`/materials/${mat.id}/edit`" class="font-app font-bold text-xs text-eco-700">Definir preço</router-link>
          </div>

          <router-link :to="`/materials/${mat.id}/edit`" class="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0" style="background:#f0fdf4;border:1px solid #d1fae5;" aria-label="Editar material">
            <svg class="w-4 h-4" fill="none" stroke="#16a34a" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>
          </router-link>
        </div>
      </transition-group>

      <div v-if="!filteredMaterials.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-eco-500" style="background:#f0fdf4;border:2px dashed #d1fae5;">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
        </div>
        <p class="font-app font-semibold text-slate-400 text-sm">{{ search ? 'Nenhum resultado encontrado.' : 'Nenhum material nesta categoria.' }}</p>
        <router-link to="/materials/add" class="mt-3 text-eco-600 text-xs font-app font-semibold underline">Adicionar material →</router-link>
      </div>
    </section>


  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MaterialIcon from '@/components/MaterialIcon.vue'
import { useMaterials } from '@/composables/useMaterials'
import { formatLocaleNumber } from '@/utils/number'

const { materials, byCategory, categories, categoryColors, formatCurrency, getPricePerUnit } = useMaterials()
const search = ref('')
const filterCat = ref('all')
const filterScroller = ref(null)

const filterTabs = computed(() => [
  { key:'all', label:'Todos' },
  ...categories.filter(category => (byCategory.value[category.key] ?? []).length > 0)
])

function categoryLabel(key) { return categories.find(c => c.key === key)?.label ?? key }
function formatInteger(value) { return formatLocaleNumber(Number(value) || 0, { maximumFractionDigits:0 }) }

const filteredMaterials = computed(() => {
  let list = materials.value
  if (filterCat.value !== 'all') list = list.filter(m => m.category === filterCat.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLocaleLowerCase('pt-BR')
    list = list.filter(m => m.name.toLocaleLowerCase('pt-BR').includes(q) || m.description?.toLocaleLowerCase('pt-BR').includes(q))
  }
  return list
})

function scrollFilters() { filterScroller.value?.scrollBy({ left: 180, behavior: 'smooth' }) }
</script>

<style scoped>
.mat-list-enter-active { transition:all .25s ease-out; }
.mat-list-leave-active { transition:all .2s ease-in; }
.mat-list-enter-from { opacity:0; transform:translateX(12px); }
.mat-list-leave-to { opacity:0; transform:translateX(-12px); height:0; margin:0; overflow:hidden; }
.modal-enter-active { transition:all .25s ease-out; }
.modal-leave-active { transition:all .2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity:0; }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { scrollbar-width:none; }
</style>
