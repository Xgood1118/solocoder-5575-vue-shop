<template>
  <div class="order-success-page safe-bottom">
    <div class="navbar">
      <button class="navbar-back" @click="goHome">‹</button>
      <div class="navbar-title">提交成功</div>
      <div class="navbar-placeholder"></div>
    </div>

    <div class="success-content">
      <div class="success-icon-wrap">
        <div class="success-icon">✓</div>
        <div class="success-icon-ring"></div>
      </div>
      <div class="success-title">订单提交成功</div>
      <div class="success-amount">
        <span class="amount-label">支付金额</span>
        <span class="amount-value">
          <span class="amount-symbol">¥</span>{{ formatPrice(amount) }}
        </span>
      </div>

      <div class="order-info card">
        <div class="order-row">
          <span class="order-label">订单编号</span>
          <span class="order-value order-no">{{ orderId }}</span>
        </div>
        <div class="order-row">
          <span class="order-label">支付方式</span>
          <span class="order-value">在线支付</span>
        </div>
        <div class="order-row">
          <span class="order-label">订单状态</span>
          <span class="order-value status-pending">待付款</span>
        </div>
      </div>

      <div class="countdown-tip">
        <span class="countdown-icon">⏰</span>
        请在 <span class="countdown-time">{{ formatCountdown(countdown) }}</span> 内完成支付
      </div>

      <div class="action-buttons">
        <button class="btn btn-outline action-btn-half" @click="goHome">
          继续购物
        </button>
        <button class="btn btn-primary action-btn-half" @click="goOrderDetail">
          查看订单
        </button>
      </div>

      <div class="auto-jump-tip">
        <span>{{ countdownSeconds }}秒后自动跳转到订单详情</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { formatPrice, padZero } from '@/utils'

const router = useRouter()
const route = useRoute()

const orderId = ref(route.query.orderId || '')
const amount = ref(Number(route.query.amount) || 0)

const countdown = ref(30 * 60 * 1000)
let timer = null

const countdownSeconds = computed(() => Math.ceil(countdown.value / 1000))

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${padZero(minutes)}:${padZero(seconds)}`
}

function goHome() {
  router.replace({ name: 'home' })
}

function goOrderDetail() {
  if (orderId.value) {
    router.replace({ name: 'order-detail', params: { id: orderId.value } })
  } else {
    router.replace({ name: 'orders' })
  }
}

onMounted(() => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1000
    } else {
      clearInterval(timer)
    }
  }, 1000)

  setTimeout(() => {
    goOrderDetail()
  }, countdownSeconds.value * 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.order-success-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.navbar-placeholder {
  width: 32px;
}

.success-content {
  padding: var(--space-xxl) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: var(--space-lg);
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #52c41a, #73d13d);
  color: #fff;
  font-size: 40px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  animation: iconPop 0.5s ease;
}

@keyframes iconPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.success-icon-ring {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 2px solid rgba(82, 196, 26, 0.3);
  animation: ringPulse 1.5s ease-out infinite;
}

@keyframes ringPulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.success-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.success-amount {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.amount-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.amount-value {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--color-primary);
}

.amount-symbol {
  font-size: var(--font-size-lg);
}

.order-info {
  width: 100%;
  padding: var(--space-md);
  margin-bottom: var(--space-xl);
}

.order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.order-row:last-child {
  border-bottom: none;
}

.order-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.order-value {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.order-no {
  font-family: 'Courier New', monospace;
  word-break: break-all;
  max-width: 60%;
  text-align: right;
}

.status-pending {
  color: var(--color-warning);
  font-weight: 500;
}

.countdown-tip {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.countdown-icon {
  margin-right: var(--space-xs);
}

.countdown-time {
  color: var(--color-primary);
  font-weight: 600;
  margin: 0 2px;
}

.action-buttons {
  width: 100%;
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.action-btn-half {
  flex: 1;
  height: 44px;
  font-size: var(--font-size-base);
  font-weight: 500;
}

.auto-jump-tip {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}
</style>
