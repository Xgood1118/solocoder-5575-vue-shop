<template>
  <div class="tabbar safe-bottom">
    <div
      v-for="item in tabs"
      :key="item.name"
      class="tabbar-item"
      :class="{ active: route.name === item.name }"
      @click="handleClick(item)"
    >
      <div class="tabbar-icon">{{ route.name === item.name ? item.activeIcon : item.icon }}</div>
      <div class="tabbar-label">{{ item.label }}</div>
      <div v-if="item.name === 'cart' && cartStore.totalCount > 0" class="tabbar-badge">
        {{ cartStore.totalCount > 99 ? '99+' : cartStore.totalCount }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const tabs = [
  { name: 'home', label: '首页', icon: '🏠', activeIcon: '🏠' },
  { name: 'category', label: '分类', icon: '📋', activeIcon: '📋' },
  { name: 'cart', label: '购物车', icon: '🛒', activeIcon: '🛒' },
  { name: 'user', label: '我的', icon: '👤', activeIcon: '👤' }
]

function handleClick(item) {
  if (route.name === item.name) return
  router.push({ name: item.name })
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--tabbar-height);
  display: flex;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border-light);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tabbar-icon {
  font-size: 22px;
  line-height: 1;
  margin-bottom: 2px;
}

.tabbar-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.tabbar-item.active .tabbar-label {
  color: var(--color-primary);
  font-weight: 600;
}

.tabbar-item.active {
  transform: translateY(-1px);
}

.tabbar-badge {
  position: absolute;
  top: 4px;
  right: 50%;
  transform: translateX(16px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
}
</style>
