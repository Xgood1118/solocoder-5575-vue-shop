import { defineStore } from 'pinia'
import { applyTheme } from '@/styles/theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('app-theme') || 'light'
  }),
  actions: {
    setTheme(theme) {
      this.theme = theme
      applyTheme(theme)
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      applyTheme(this.theme)
    }
  },
  persist: {
    key: 'app-theme',
    storage: localStorage,
    paths: ['theme']
  }
})
