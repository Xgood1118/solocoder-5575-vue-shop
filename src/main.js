import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import { initTheme } from './styles/theme'
import { initMSW } from './mock'

initTheme()

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

initMSW().then(() => {
  app.mount('#app')
})
