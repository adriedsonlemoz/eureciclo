<template>
  <div class="relative min-h-dvh flex flex-col mesh-bg overflow-hidden">
    <!-- Ambient background decoration -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-60"
           style="background: radial-gradient(circle, #bbf7d0 0%, transparent 70%); filter: blur(48px);"></div>
      <div class="absolute top-1/3 -right-32 w-64 h-64 rounded-full opacity-40"
           style="background: radial-gradient(circle, #86efac 0%, transparent 70%); filter: blur(56px);"></div>
      <div class="absolute -bottom-16 left-1/3 w-72 h-48 rounded-full opacity-50"
           style="background: radial-gradient(circle, #d1fae5 0%, transparent 70%); filter: blur(44px);"></div>
    </div>

    <!-- Page content -->
    <main class="flex-1 relative z-10 overflow-y-auto" style="padding-bottom: 80px;">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Navigation (hidden on setup screen) -->
    <BottomNav v-if="route.name !== 'setup'" class="fixed bottom-0 left-0 right-0 z-50" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const transitionName = ref('fade')

const routeOrder = {
  '/': 0,
  '/calculator': 1,
  '/sales': 2,
  '/meta-compra': 2.5,
  '/materials': 3,
  '/sobre': 4
}

watch(() => route.path, (to, from) => {
  const toOrder  = routeOrder[to]   ?? -1
  const fromOrder = routeOrder[from] ?? -1
  if (toOrder === -1 || fromOrder === -1) {
    transitionName.value = 'slide-up'
  } else if (toOrder > fromOrder) {
    transitionName.value = 'slide-left'
  } else {
    transitionName.value = 'slide-right'
  }
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-left-enter-active, .slide-left-leave-active { transition: all 0.28s cubic-bezier(0.4,0,0.2,1); }
.slide-left-enter-from  { opacity: 0; transform: translateX(28px); }
.slide-left-leave-to    { opacity: 0; transform: translateX(-28px); }

.slide-right-enter-active, .slide-right-leave-active { transition: all 0.28s cubic-bezier(0.4,0,0.2,1); }
.slide-right-enter-from  { opacity: 0; transform: translateX(-28px); }
.slide-right-leave-to    { opacity: 0; transform: translateX(28px); }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }
.slide-up-leave-to   { opacity: 0; transform: translateY(-10px); }
</style>
