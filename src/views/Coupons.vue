<template>
  <div class="coupon-center-page app-container">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <span class="navbar-title">领券中心</span>
      <span style="width: 32px;"></span>
    </div>

    <div class="page">
      <div v-if="couponStore.loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="couponStore.availableCoupons.length === 0" class="empty">
        <div class="empty-icon">🎁</div>
        <p>暂无可领取的优惠券</p>
      </div>

      <div v-else class="coupon-list">
        <div
          v-for="coupon in couponStore.availableCoupons"
          :key="coupon.id"
          class="coupon-card"
        >
          <div class="coupon-left">
            <div class="coupon-amount">
              <span v-if="coupon.type === 'amount'" class="amount-symbol">¥</span>
              <span class="amount-value">{{ coupon.type === 'amount' ? coupon.value : (coupon.value * 10).toFixed(1) }}</span>
              <span v-if="coupon.type === 'discount'" class="amount-unit">折</span>
            </div>
            <div class="coupon-condition">满{{ coupon.minAmount }}元可用</div>
          </div>
          <div class="coupon-divider">
            <span class="divider-dot top"></span>
            <span class="divider-dot bottom"></span>
          </div>
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-date">有效期至 {{ formatDate(coupon.endTime, 'YYYY-MM-DD') }}</div>
            <div class="coupon-desc text-ellipsis">{{ coupon.desc || '全场通用，可叠加其他优惠' }}</div>
            <button
              class="btn btn-primary receive-btn"
              :class="{ disabled: receivedIds.includes(coupon.id) }"
              :disabled="receivedIds.includes(coupon.id)"
              @click="handleReceive(coupon.id)"
            >
              {{ receivedIds.includes(coupon.id) ? '已领取' : '立即领取' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCouponStore } from '@/stores/coupon'
import { formatDate } from '@/utils'

const router = useRouter()
const couponStore = useCouponStore()

const receivedIds = ref([])

onMounted(() => {
  couponStore.fetchAvailableCoupons()
})

function goBack() {
  router.back()
}

async function handleReceive(couponId) {
  if (receivedIds.value.includes(couponId)) return
  const success = await couponStore.receiveCoupon(couponId)
  if (success) {
    receivedIds.value.push(couponId)
  }
}
</script>

<style scoped>
.coupon-center-page {
  background: var(--color-bg);
  min-height: 100vh;
}

.page {
  padding: var(--space-md);
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.coupon-card {
  display: flex;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.coupon-left {
  width: 110px;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: #fff;
  position: relative;
}

.coupon-amount {
  display: flex;
  align-items: baseline;
  line-height: 1;
}

.amount-symbol {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.amount-value {
  font-size: 32px;
  font-weight: 700;
}

.amount-unit {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.coupon-condition {
  font-size: var(--font-size-xs);
  margin-top: var(--space-xs);
  opacity: 0.9;
}

.coupon-divider {
  width: 0;
  position: relative;
}

.divider-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-bg);
  left: -5px;
}

.divider-dot.top {
  top: -5px;
}

.divider-dot.bottom {
  bottom: -5px;
}

.coupon-right {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.coupon-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.coupon-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-bottom: var(--space-xs);
}

.coupon-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.receive-btn {
  align-self: flex-start;
  padding: 4px 16px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.receive-btn.disabled {
  background: var(--color-bg-disabled);
  color: var(--color-text-disabled);
}
</style>
