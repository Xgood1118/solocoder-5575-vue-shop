<template>
  <div class="user-page app-container">
    <div class="user-header">
      <div class="user-info" @click="goProfile">
        <div class="avatar">
          <img v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" alt="avatar" />
          <span v-else class="avatar-placeholder">👤</span>
        </div>
        <div class="user-meta">
          <div class="user-name-row">
            <span class="nickname">{{ userStore.userInfo.nickname }}</span>
            <span class="level-badge">{{ userStore.userInfo.levelIcon }} {{ userStore.userInfo.level }}</span>
          </div>
          <div class="user-points">
            <span class="points-icon">💰</span>
            <span>{{ userStore.userInfo.points }} 积分</span>
          </div>
        </div>
        <span class="arrow">›</span>
      </div>
    </div>

    <div class="order-section card">
      <div class="section-header">
        <span class="section-title">我的订单</span>
        <span class="section-more" @click="goOrders('all')">全部订单 ›</span>
      </div>
      <div class="order-grid">
        <div class="order-item" @click="goOrders('pending')">
          <div class="order-icon">💳</div>
          <div class="order-label">待付款</div>
        </div>
        <div class="order-item" @click="goOrders('paid')">
          <div class="order-icon">📦</div>
          <div class="order-label">待发货</div>
        </div>
        <div class="order-item" @click="goOrders('shipped')">
          <div class="order-icon">🚚</div>
          <div class="order-label">待收货</div>
        </div>
        <div class="order-item" @click="goOrders('review')">
          <div class="order-icon">⭐</div>
          <div class="order-label">待评价</div>
        </div>
        <div class="order-item" @click="goOrders('refund')">
          <div class="order-icon">↩️</div>
          <div class="order-label">退款/售后</div>
        </div>
        <div class="order-item" @click="goOrders('all')">
          <div class="order-icon">📋</div>
          <div class="order-label">全部</div>
        </div>
      </div>
    </div>

    <div class="menu-section card">
      <div class="menu-item" @click="goAddress">
        <span class="menu-icon">📍</span>
        <span class="menu-label">收货地址</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="goHistory">
        <span class="menu-icon">👁️</span>
        <span class="menu-label">浏览历史</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="goMyCoupons">
        <span class="menu-icon">🎟️</span>
        <span class="menu-label">我的优惠券</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="goCouponCenter">
        <span class="menu-icon">🎁</span>
        <span class="menu-label">领券中心</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <div class="settings-section card">
      <div class="menu-item">
        <span class="menu-icon">{{ themeStore.theme === 'light' ? '☀️' : '🌙' }}</span>
        <span class="menu-label">主题切换</span>
        <div class="switch-wrap">
          <div class="switch" :class="{ active: themeStore.theme === 'dark' }" @click="themeStore.toggleTheme">
            <div class="switch-dot"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="service-section card">
      <div class="service-item">
        <span class="menu-icon">📞</span>
        <span class="menu-label">客服电话</span>
        <span class="menu-value">400-888-8888</span>
      </div>
    </div>

    <Tabbar />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import Tabbar from '@/components/Tabbar.vue'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

function goProfile() {
  router.push({ name: 'user-profile' })
}

function goOrders(status) {
  router.push({ name: 'orders', query: { status } })
}

function goAddress() {
  router.push({ name: 'user-address' })
}

function goHistory() {
  router.push({ name: 'user-history' })
}

function goMyCoupons() {
  router.push({ name: 'user-coupons' })
}

function goCouponCenter() {
  router.push({ name: 'coupons' })
}
</script>

<style scoped>
.user-page {
  background: var(--color-bg);
}

.user-header {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  padding: var(--space-xxl) var(--space-lg) var(--space-xxl);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 32px;
}

.user-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nickname {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #fff;
}

.level-badge {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  background: #fff;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.user-points {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
}

.points-icon {
  font-size: var(--font-size-sm);
}

.arrow {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1;
}

.order-section,
.menu-section,
.settings-section,
.service-section {
  margin: var(--space-md);
  padding: var(--space-md);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.section-more {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-sm) 0;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
}

.order-icon {
  font-size: 24px;
}

.order-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.menu-arrow {
  font-size: 20px;
  color: var(--color-text-placeholder);
}

.menu-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.switch-wrap {
  display: flex;
  align-items: center;
}

.switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-border);
  position: relative;
  transition: background 0.2s ease;
  cursor: pointer;
}

.switch.active {
  background: var(--color-primary);
}

.switch-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.switch.active .switch-dot {
  left: 22px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
}
</style>
