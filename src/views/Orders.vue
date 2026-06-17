<template>
  <div class="orders-page safe-bottom">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <div class="navbar-title">我的订单</div>
      <div class="navbar-placeholder"></div>
    </div>

    <div class="tabs-bar">
      <div class="tabs-scroll" ref="tabsScrollRef">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
          <span v-if="currentTab === tab.value" class="tab-underline"></span>
        </button>
      </div>
    </div>

    <div v-if="orderStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <div v-if="filteredOrders.length === 0" class="empty">
        <div class="empty-icon">📦</div>
        <div class="empty-text">暂无相关订单</div>
      </div>

      <div v-else class="order-list">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-card card"
          @click="goDetail(order)"
        >
          <div class="order-header">
            <span class="order-no">订单号: {{ order.orderNo }}</span>
            <span class="order-status" :class="order.status">{{ order.statusText }}</span>
          </div>

          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.productId"
              class="order-item"
            >
              <img :src="item.image" :alt="item.name" class="item-image" />
              <div class="item-info">
                <div class="item-name text-ellipsis-2">{{ item.name }}</div>
                <div v-if="item.skuSpec && Object.keys(item.skuSpec).length" class="item-sku">
                  {{ Object.values(item.skuSpec).join(' / ') }}
                </div>
                <div class="item-bottom">
                  <div class="item-price-wrap">
                    <span class="price-symbol">¥</span>
                    <span class="item-price">{{ formatPrice(item.price) }}</span>
                  </div>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-summary">
              共{{ order.items.reduce((s, i) => s + i.quantity, 0) }}件商品 实付:
              <span class="price-symbol">¥</span>
              <span class="summary-price">{{ formatPrice(order.totalAmount) }}</span>
            </div>
            <div class="order-actions" @click.stop>
              <template v-if="order.status === 'pending'">
                <button class="btn btn-outline" @click="handleCancel(order)">取消订单</button>
                <button class="btn btn-primary" @click="handlePay(order)">去付款</button>
              </template>
              <template v-else-if="order.status === 'paid'">
                <button class="btn btn-outline" @click="handleRemindShip(order)">提醒发货</button>
              </template>
              <template v-else-if="order.status === 'shipped'">
                <button class="btn btn-outline" @click="handleConfirm(order)">确认收货</button>
                <button class="btn btn-outline" @click="handleViewLogistics(order)">查看物流</button>
                <button class="btn btn-primary" @click="handleBuyAgain(order)">再次购买</button>
              </template>
              <template v-else-if="order.status === 'completed'">
                <button class="btn btn-primary" @click="handleBuyAgain(order)">再次购买</button>
                <button class="btn btn-outline" @click="handleRefund(order)">申请退款</button>
                <button class="btn btn-outline" @click="handleReview(order)">评价</button>
              </template>
              <template v-else-if="order.status === 'cancelled'">
                <button class="btn btn-primary" @click="handleBuyAgain(order)">再次购买</button>
                <button class="btn btn-outline" @click="handleDelete(order)">删除订单</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <PayModal
      v-model:visible="payModalVisible"
      :amount="currentPayOrder?.totalAmount || 0"
      :submitting="paySubmitting"
      @pay="handleConfirmPay"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { formatPrice, showToast } from '@/utils'
import PayModal from '@/components/PayModal.vue'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const tabsScrollRef = ref(null)
const currentTab = ref('all')
const payModalVisible = ref(false)
const currentPayOrder = ref(null)
const paySubmitting = ref(false)

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待付款' },
  { value: 'paid', label: '待发货' },
  { value: 'shipped', label: '待收货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') return orderStore.orders
  return orderStore.orders.filter(o => o.status === currentTab.value)
})

function goBack() {
  router.back()
}

function handleTabChange(tab) {
  currentTab.value = tab
  orderStore.fetchOrders(tab)
}

function goDetail(order) {
  router.push({ name: 'order-detail', params: { id: order.id } })
}

async function handleCancel(order) {
  const success = await orderStore.cancelOrder(order.id)
  if (success) {
    orderStore.fetchOrders(currentTab.value)
  }
}

function handlePay(order) {
  currentPayOrder.value = order
  payModalVisible.value = true
}

async function handleConfirmPay(method) {
  if (!currentPayOrder.value) return
  paySubmitting.value = true
  try {
    const success = await orderStore.payOrder(currentPayOrder.value.id)
    if (success) {
      payModalVisible.value = false
      currentPayOrder.value = null
      orderStore.fetchOrders(currentTab.value)
    }
  } finally {
    paySubmitting.value = false
  }
}

function handleRemindShip(order) {
  showToast('已提醒商家发货')
}

async function handleConfirm(order) {
  const success = await orderStore.confirmOrder(order.id)
  if (success) {
    orderStore.fetchOrders(currentTab.value)
  }
}

function handleViewLogistics(order) {
  router.push({ name: 'order-detail', params: { id: order.id } })
}

function handleBuyAgain(order) {
  if (order.items && order.items.length) {
    router.push({ name: 'product-detail', params: { id: order.items[0].productId } })
  }
}

function handleRefund(order) {
  showToast('申请退款功能开发中')
}

function handleReview(order) {
  showToast('评价功能开发中')
}

function handleDelete(order) {
  showToast('删除订单功能开发中')
}

onMounted(() => {
  const status = route.query.status || 'all'
  currentTab.value = status
  orderStore.fetchOrders(status)
})

watch(() => route.query.status, (status) => {
  if (status) {
    currentTab.value = status
    orderStore.fetchOrders(status)
  }
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.navbar-placeholder {
  width: 32px;
}

.tabs-bar {
  position: sticky;
  top: var(--navbar-height);
  z-index: 90;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
}

.tabs-scroll {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tabs-scroll::-webkit-scrollbar {
  display: none;
}

.tab-item {
  position: relative;
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: transparent;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.tab-item.active {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}

.empty {
  padding: 80px var(--space-lg);
}

.empty-icon {
  font-size: 72px;
  opacity: 0.3;
  margin-bottom: var(--space-md);
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.order-list {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.order-card {
  padding: var(--space-md);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.order-no {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.order-status {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.order-status.pending {
  color: var(--color-warning);
}

.order-status.paid {
  color: var(--color-info);
}

.order-status.shipped {
  color: var(--color-primary);
}

.order-status.completed {
  color: var(--color-success);
}

.order-status.cancelled {
  color: var(--color-text-placeholder);
}

.order-items {
  padding: var(--space-md) 0;
}

.order-item {
  display: flex;
  gap: var(--space-md);
}

.order-item + .order-item {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px dashed var(--color-border-light);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-bg);
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: 1.4;
}

.item-sku {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
  background: var(--color-bg);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: inline-block;
  align-self: flex-start;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--space-sm);
}

.item-price-wrap {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.item-price {
  color: var(--color-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
}

.item-quantity {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.order-footer {
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border-light);
}

.order-summary {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.summary-price {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: 700;
  margin-left: 2px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  flex-wrap: wrap;
}

.order-actions .btn {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-sm);
}
</style>
