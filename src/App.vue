<template>
  <div class="relative min-h-dvh flex flex-col app-shell overflow-hidden">
    <main class="flex-1 relative z-10 overflow-y-auto app-content">
      <router-view v-slot="{ Component, route: currentRoute }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="currentRoute.path" />
        </transition>
      </router-view>
    </main>
    <BottomNav v-if="route.name !== 'setup'" class="fixed bottom-0 left-0 right-0 z-50" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const transitionName = ref('fade')
const routeOrder = { '/':0, '/calculator':1, '/sales':2, '/meta-compra':2.5, '/materials':3, '/sobre':4 }
watch(() => route.path, (to, from) => {
  const toOrder = routeOrder[to] ?? -1
  const fromOrder = routeOrder[from] ?? -1
  if (toOrder === -1 || fromOrder === -1) transitionName.value = 'slide-up'
  else if (toOrder > fromOrder) transitionName.value = 'slide-left'
  else transitionName.value = 'slide-right'
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; }
.slide-left-enter-active, .slide-left-leave-active, .slide-right-enter-active, .slide-right-leave-active { transition:all .24s cubic-bezier(.4,0,.2,1); }
.slide-left-enter-from { opacity:0; transform:translateX(24px); }
.slide-left-leave-to { opacity:0; transform:translateX(-24px); }
.slide-right-enter-from { opacity:0; transform:translateX(-24px); }
.slide-right-leave-to { opacity:0; transform:translateX(24px); }
.slide-up-enter-active, .slide-up-leave-active { transition:all .22s cubic-bezier(.4,0,.2,1); }
.slide-up-enter-from { opacity:0; transform:translateY(18px); }
.slide-up-leave-to { opacity:0; transform:translateY(-8px); }
</style>
