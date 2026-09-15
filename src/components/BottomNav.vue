<template>
  <nav class="bottom-nav pb-safe">
    <div class="flex items-center justify-around px-1 pt-2 pb-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200"
        :class="isActive(item) ? 'active-tab' : ''"
      >
        <div class="nav-icon relative w-6 h-6 flex items-center justify-center">
          <component :is="item.icon" :active="isActive(item)" />
        </div>
        <span class="text-xs font-app font-bold tracking-wide transition-all duration-200"
              :class="isActive(item) ? 'text-eco-600' : 'text-slate-400'">
          {{ item.label }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { h } from 'vue'

const route = useRoute()

function isActive(item) {
  if (item.exact) return route.path === item.path
  return route.path === item.path || route.path.startsWith(item.path + '/')
}

/* ── Icons ── */
const HomeIcon = ({ active }) => h('svg', {
  viewBox: '0 0 24 24', fill: active ? 'rgba(22,163,74,0.15)' : 'none', strokeWidth: '2',
  stroke: active ? '#16a34a' : '#94a3b8', class: 'w-6 h-6 transition-all duration-200'
}, [
  h('path', { d: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z', strokeLinecap: 'round', strokeLinejoin: 'round' }),
  h('path', { d: 'M9 21V12h6v9', strokeLinecap: 'round', strokeLinejoin: 'round', stroke: active ? '#15803d' : '#94a3b8', fill: 'none' })
])

const CalcIcon = ({ active }) => h('svg', {
  viewBox: '0 0 24 24', fill: 'none', strokeWidth: '2',
  stroke: active ? '#16a34a' : '#94a3b8', class: 'w-6 h-6 transition-all duration-200'
}, [
  h('rect', { x: '4', y: '2', width: '16', height: '20', rx: '3', fill: active ? 'rgba(22,163,74,0.12)' : 'none' }),
  h('line', { x1: '8',  y1: '8',  x2: '16', y2: '8',  strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('line', { x1: '8',  y1: '12', x2: '10', y2: '12', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('line', { x1: '12', y1: '12', x2: '14', y2: '12', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('line', { x1: '16', y1: '12', x2: '16', y2: '16', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('line', { x1: '8',  y1: '16', x2: '10', y2: '16', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('line', { x1: '12', y1: '16', x2: '14', y2: '16', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
])

const SalesIcon = ({ active }) => h('svg', {
  viewBox: '0 0 24 24', fill: 'none', strokeWidth: '2',
  stroke: active ? '#16a34a' : '#94a3b8', class: 'w-6 h-6 transition-all duration-200'
}, [
  h('rect', { x: '2', y: '3', width: '20', height: '18', rx: '3', fill: active ? 'rgba(22,163,74,0.12)' : 'none' }),
  h('path', { d: 'M8 10h8M8 14h5', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('circle', { cx: '17', cy: '14', r: '3', fill: active ? '#16a34a' : 'none', stroke: active ? '#16a34a' : '#94a3b8' }),
  h('path', { d: 'M16 14l.7.7L18 13', strokeLinecap: 'round', strokeLinejoin: 'round', stroke: active ? '#fff' : 'none', strokeWidth: '1.5' }),
])

const ListIcon = ({ active }) => h('svg', {
  viewBox: '0 0 24 24', fill: 'none', strokeWidth: '2',
  stroke: active ? '#16a34a' : '#94a3b8', class: 'w-6 h-6 transition-all duration-200'
}, [
  h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '4', fill: active ? 'rgba(22,163,74,0.12)' : 'none' }),
  h('line', { x1: '8', y1: '9',  x2: '16', y2: '9',  strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('line', { x1: '8', y1: '13', x2: '16', y2: '13', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('line', { x1: '8', y1: '17', x2: '12', y2: '17', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
])

const AboutIcon = ({ active }) => h('svg', {
  viewBox: '0 0 24 24', fill: 'none', strokeWidth: '2',
  stroke: active ? '#16a34a' : '#94a3b8', class: 'w-6 h-6 transition-all duration-200'
}, [
  h('circle', { cx: '12', cy: '12', r: '9', fill: active ? 'rgba(22,163,74,0.12)' : 'none', stroke: active ? '#16a34a' : '#94a3b8' }),
  h('line', { x1: '12', y1: '11', x2: '12', y2: '16', strokeLinecap: 'round', stroke: active ? '#15803d' : '#94a3b8' }),
  h('circle', { cx: '12', cy: '8', r: '0.5', fill: active ? '#15803d' : '#94a3b8', stroke: active ? '#15803d' : '#94a3b8', strokeWidth: '1' }),
])

const navItems = [
  { path: '/',           label: 'Início',    icon: HomeIcon,  exact: true },
  { path: '/calculator', label: 'Calcular',  icon: CalcIcon },
  { path: '/sales',      label: 'Vendas',    icon: SalesIcon },
  { path: '/materials',  label: 'Materiais', icon: ListIcon },
  { path: '/sobre',      label: 'Sobre',     icon: AboutIcon },
]
</script>

<style scoped>
.nav-item { min-width: 52px; cursor: pointer; }
.active-tab { background: #f0fdf4; }
.active-tab .nav-icon { filter: drop-shadow(0 2px 6px rgba(22,163,74,0.3)); }
</style>
