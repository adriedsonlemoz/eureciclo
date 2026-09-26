<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="kind === 'can'">
      <path d="M8 3h8M9 5h6l1 2v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7l1-2Z"/>
      <path d="M8 9h8M8 16h8"/><path d="M10 3v2M14 3v2"/>
    </template>
    <template v-else-if="kind === 'bottle'">
      <path d="M10 3h4v4l2 2v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-2V3Z"/>
      <path d="M10 6h4M9 12h6"/>
    </template>
    <template v-else-if="kind === 'battery'">
      <rect x="6" y="5" width="12" height="16" rx="2"/><path d="M10 2h4v3M12 9v8M9 12h6"/>
    </template>
    <template v-else-if="kind === 'paper'">
      <path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/>
    </template>
    <template v-else-if="kind === 'glass'">
      <path d="M9 3h6M10 3v4l-2 3v8a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-8l-2-3V3"/>
      <path d="M9 12h6"/>
    </template>
    <template v-else-if="kind === 'metal'">
      <path d="M8 4h8l4 8-4 8H8l-4-8 4-8Z"/><path d="M9 9h6M9 12h6M9 15h4"/>
    </template>
    <template v-else-if="kind === 'box'">
      <path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="M4 8v8l8 4 8-4V8M12 12v8"/>
    </template>
    <template v-else-if="kind === 'electronics'">
      <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 6h6M10 18h4"/>
    </template>
    <template v-else-if="kind === 'car'">
      <path d="M5 15h14l-1.5-5h-11L5 15Z"/><path d="M3 15v3h2M21 15v3h-2M7 18h10"/><circle cx="7" cy="17" r="1"/><circle cx="17" cy="17" r="1"/>
    </template>
    <template v-else-if="kind === 'recycle'">
      <path d="m10 4 2-2 3 4M15 6h-5a3 3 0 0 0-2.6 1.5L6 10"/>
      <path d="m19 10 1 3-4 2M16 15l2.5-4.3a3 3 0 0 0 0-3L17 5"/>
      <path d="m9 20-3-1 1-4M7 15l2.5 4.3a3 3 0 0 0 2.6 1.5H16"/>
    </template>
    <template v-else>
      <path d="M12 21c4-3 7-6.5 7-11a7 7 0 0 0-14 0c0 4.5 3 8 7 11Z"/><path d="M9 12c2 0 4-1 6-4-1 4-2 7-6 8"/>
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  category: { type: String, default: '' },
  legacyIcon: { type: String, default: '' }
})

const kind = computed(() => {
  const name = props.name.toLowerCase()
  const icon = props.legacyIcon
  if (icon === '🥫') return 'can'
  if (icon === '🧴') return 'bottle'
  if (icon === '🔋') return 'battery'
  if (icon === '📦') return 'box'
  if (icon === '📄') return 'paper'
  if (icon === '🫙') return 'glass'
  if (['⚡','🔧','🔩','✨','💎','🪨'].includes(icon)) return 'metal'
  if (['📱','🖥️'].includes(icon)) return 'electronics'
  if (icon === '🚗') return 'car'
  if (name.includes('alum') || name.includes('lata')) return 'can'
  if (name.includes('pet') || name.includes('pead') || name === 'pp' || name.includes('plástico') || name.includes('plastico')) return 'bottle'
  if (name.includes('bater') || name.includes('pilha')) return 'battery'
  if (name.includes('papelão') || name.includes('papelao')) return 'box'
  if (name.includes('papel')) return 'paper'
  if (name.includes('vidro')) return 'glass'
  if (['metais','metal'].includes(props.category) || /cobre|latão|latao|ferro|aço|aco|inox/.test(name)) return 'metal'
  if (['plasticos','papel','vidro','baterias'].includes(props.category)) {
    return { plasticos:'bottle', papel:'paper', vidro:'glass', baterias:'battery' }[props.category]
  }
  return 'recycle'
})
</script>
