import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { isSetupDone } from '@/composables/useMaterials'
import { shouldShowWhatsNew } from '@/composables/useWhatsNew'

const routes = [
  {
    path: '/setup',
    name: 'setup',
    component: () => import('@/views/SetupView.vue'),
    meta: { title: 'Configuração inicial' }
  },
  {
    path: '/novidades',
    name: 'whats-new',
    component: () => import('@/views/WhatsNewView.vue'),
    meta: { title: 'Novidades e correções' }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Início' }
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import('@/views/CalculatorView.vue'),
    meta: { title: 'Calculadora' }
  },
  {
    path: '/sales',
    name: 'sales',
    component: () => import('@/views/SalesView.vue'),
    meta: { title: 'Vendas' }
  },
  {
    path: '/meta-compra',
    name: 'purchase-goal',
    component: () => import('@/views/PurchaseGoalView.vue'),
    meta: { title: 'Meta de compra' }
  },
  {
    path: '/materials',
    name: 'materials',
    component: () => import('@/views/MaterialsView.vue'),
    meta: { title: 'Materiais' }
  },
  {
    path: '/materials/add',
    name: 'materials-add',
    component: () => import('@/views/AddEditMaterialView.vue'),
    meta: { title: 'Novo Material', mode: 'add' }
  },
  {
    path: '/materials/:id/edit',
    name: 'materials-edit',
    component: () => import('@/views/AddEditMaterialView.vue'),
    meta: { title: 'Editar Material', mode: 'edit' }
  },
  {
    path: '/sobre',
    name: 'sobre',
    component: () => import('@/views/SobreView.vue'),
    meta: { title: 'Sobre' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Fluxo inicial: configuração primeiro; depois, as novidades da versão aparecem uma única vez.
router.beforeEach((to) => {
  const setupDone = isSetupDone()
  if (to.name !== 'setup' && !setupDone) {
    return { name: 'setup' }
  }
  if (setupDone && to.name !== 'setup' && to.name !== 'whats-new' && shouldShowWhatsNew()) {
    return { name: 'whats-new' }
  }
})

export default router
