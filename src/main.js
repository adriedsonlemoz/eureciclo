import { createApp } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import App from './App.vue'
import router from './router'
import './assets/main.css'

async function enableNativeFullscreen() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await StatusBar.hide()
  } catch (error) {
    console.warn('[Eu Reciclo] Não foi possível ocultar a barra de status:', error)
  }
}

enableNativeFullscreen()
createApp(App).use(router).mount('#app')
