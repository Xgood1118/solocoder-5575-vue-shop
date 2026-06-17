<template>
  <div class="coupons-page app-container">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <span class="navbar-title">我的优惠券</span>
      <span style="width: 32px;"></span>
    </div>

    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="page">
      <div v-if="filteredCoupons.length === 0" class="empty">
        <div class="empty-icon">🎟️</div>
        <p>{{ emptyText }}</p>
        <button v-if="activeTab === 'unused'" class="btn btn-outline go-btn" @click="goCouponCenter">去领券</button>
      </div>

      <div v-else class="coupon-list">
        <div
          v-for="coupon in filteredCoupons"
          :key="coupon.id"
          class="coupon-card"
          :class="{ disabled: activeTab !== 'unused' }"
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
            <div class="coupon-status">
              <span v-if="activeTab === 'unused'" class="status-tag unused">未使用</span>
              <span v-else-if="activeTab === 'used'" class="status-tag used">已使用</span>
              <span v-else class="status-tag expired">已过期</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCouponStore } from '@/stores/coupon'
import { formatDate } from '@/utils'

const router = useRouter()
const couponStore = useCouponStore()

const activeTab = ref('unused')

const tabs = [
  { key: 'unused', label: '未使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' }
]

const filteredCoupons = computed(() => {
  const now = Date.now()
  return couponStore.myCoupons.filter(c => {
    if (activeTab.value === 'unused') {
      return !c.used && now < c.endTime
    } else if (activeTab.value === 'used') {
      return c.used
    } else {
      return !c.used && now >= c.endTime
    }
  })
})

const emptyText = computed(() => {
  if (activeTab.value === 'unused') return '暂无可用优惠券'
  if (activeTab.value === 'used') return '暂无已使用的优惠券'
  return '暂无已过期的优惠券'
})

function goBack() {
  router.back()
}

function goCouponCenter() {
  router.push({ name: 'coupons' })
}
</script>

<style scoped>
.coupons-page {
  background: var(--color-bg);
  min-height: 100vh;
}

.tabs {
  display: flex;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: var(--navbar-height);
  z-index: 50;
}

.tab-item {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}

.tab-item.active {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
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

.coupon-card.disabled {
  opacity: 0.6;
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

.coupon-card.disabled .coupon-left {
  background: linear-gradient(135deg, var(--color-text-placeholder), var(--color-text-disabled));
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
  justify-content: center;
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

.coupon-status {
  display: flex;
}

.status-tag {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  align-self: flex-start;
}

.status-tag.unused {
  background: rgba(82, 196, 26, 0.1);
  color: var(--color-success);
}

.status-tag.used {
  background: rgba(153, 153, 153, 0.1);
  color: var(--color-text-placeholder);
}

.status-tag.expired {
  background: rgba(153, 153, 153, 0.1);
  color: var(--color-text-placeholder);
}

.go-btn {
  margin-top: var(--space-md);
}
</style>
