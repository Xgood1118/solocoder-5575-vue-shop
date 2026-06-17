<template>
  <div class="history-page app-container">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <span class="navbar-title">浏览历史</span>
      <button v-if="groupedHistory.size > 0" class="clear-btn" @click="handleClear">清空</button>
      <span v-else style="width: 48px;"></span>
    </div>

    <div class="page">
      <div v-if="userStore.history.length === 0" class="empty">
        <div class="empty-icon">👁️</div>
        <p>暂无浏览历史</p>
        <button class="btn btn-outline go-home-btn" @click="goHome">去逛逛</button>
      </div>

      <div v-else class="history-content">
        <div v-for="(items, date) in groupedHistory" :key="date" class="history-group">
          <div class="group-date">{{ date }}</div>
          <div class="product-list">
            <div v-for="item in items" :key="item.id" class="product-item card" @click="goDetail(item.id)">
              <div class="product-img">
                <img v-if="item.image" :src="item.image" :alt="item.name" />
                <span v-else class="img-placeholder">📦</span>
              </div>
              <div class="product-info">
                <div class="product-name text-ellipsis-2">{{ item.name }}</div>
                <div class="product-price">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ formatPrice(item.price) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { formatPrice } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

const groupedHistory = computed(() => {
  const map = new Map()
  userStore.history.forEach(item => {
    const date = new Date(item.viewTime)
    const key = formatDateKey(date)
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key).push(item)
  })
  return map
})

function formatDateKey(date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (target.getTime() === today.getTime()) {
    return '今天'
  } else if (target.getTime() === yesterday.getTime()) {
    return '昨天'
  } else {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
}

function goBack() {
  router.back()
}

function goHome() {
  router.push({ name: 'home' })
}

function goDetail(id) {
  router.push({ name: 'product-detail', params: { id } })
}

function handleClear() {
  if (window.confirm('确定要清空浏览历史吗？')) {
    userStore.clearHistory()
  }
}
</script>

<style scoped>
.history-page {
  background: var(--color-bg);
  min-height: 100vh;
}

.clear-btn {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--space-xs) var(--space-sm);
}

.page {
  padding: var(--space-md);
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.history-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.group-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
  padding-left: var(--space-xs);
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.product-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  cursor: pointer;
}

.product-img {
  width: 90px;
  height: 90px;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-placeholder {
  font-size: 36px;
  opacity: 0.5;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.product-name {
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: 1.4;
}

.product-price {
  color: var(--color-primary);
  font-weight: 600;
}

.price-symbol {
  font-size: var(--font-size-sm);
}

.price-value {
  font-size: var(--font-size-md);
}

.go-home-btn {
  margin-top: var(--space-md);
}
</style>
