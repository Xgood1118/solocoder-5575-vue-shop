<template>
  <div class="app-container" :class="{ 'theme-dark': themeStore.theme === 'dark' }">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Tabbar v-if="showTabbar" />
    <CustomerService />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Tabbar from './components/Tabbar.vue'
import CustomerService from './components/CustomerService.vue'
import { useThemeStore } from './stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

const tabbarRoutes = ['home', 'category', 'cart', 'user']
const showTabbar = computed(() => tabbarRoutes.includes(route.name))
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
