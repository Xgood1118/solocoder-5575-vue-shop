<template>
  <div class="order-detail-page safe-bottom">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <div class="navbar-title">订单详情</div>
      <div class="navbar-placeholder"></div>
    </div>

    <div v-if="orderStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!order" class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-title">订单不存在</div>
      <div class="empty-desc">该订单可能已被删除或链接有误</div>
      <button class="empty-btn" @click="$router.push({ name: 'orders' })">查看我的订单</button>
    </div>

    <template v-else>
      <div class="status-header" :class="order.status">
        <div class="status-title">{{ order.statusText }}</div>
        <div v-if="order.status === 'pending'" class="status-desc">请尽快完成付款</div>
        <div v-else-if="order.status === 'paid'" class="status-desc">商家正在准备发货</div>
        <div v-else-if="order.status === 'shipped'" class="status-desc">包裹正在派送中</div>
        <div v-else-if="order.status === 'completed'" class="status-desc">感谢您的购买</div>
        <div v-else-if="order.status === 'cancelled'" class="status-desc">订单已取消</div>
      </div>

      <div v-if="order.tracking && order.tracking.length" class="tracking-section card">
        <div class="section-title">物流信息</div>
        <div class="timeline">
          <div
            v-for="(item, index) in sortedTracking"
            :key="index"
            class="timeline-item"
            :class="{ active: index === 0 }"
          >
            <div class="timeline-dot"></div>
            <div v-if="index < sortedTracking.length - 1" class="timeline-line"></div>
            <div class="timeline-content">
              <div class="timeline-status">{{ item.status }}</div>
              <div class="timeline-desc">{{ item.desc }}</div>
              <div class="timeline-time">{{ formatDate(item.time, 'YYYY-MM-DD HH:mm') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="order.address" class="address-section card">
        <div class="address-icon">📍</div>
        <div class="address-info">
          <div class="address-user">
            <span class="user-name">{{ order.address.name }}</span>
            <span class="user-phone">{{ order.address.phone }}</span>
          </div>
          <div class="address-detail">
            {{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}
          </div>
        </div>
      </div>

      <div class="items-section card">
        <div
          v-for="item in order.items"
          :key="item.productId"
          class="product-item"
          @click="goProduct(item)"
        >
          <img :src="item.image" :alt="item.name" class="product-image" />
          <div class="product-info">
            <div class="product-name text-ellipsis-2">{{ item.name }}</div>
            <div v-if="item.skuSpec && Object.keys(item.skuSpec).length" class="product-sku">
              {{ Object.values(item.skuSpec).join(' / ') }}
            </div>
            <div class="product-bottom">
              <div class="product-price-wrap">
                <span class="price-symbol">¥</span>
                <span class="product-price">{{ formatPrice(item.price) }}</span>
              </div>
              <span class="product-quantity">x{{ item.quantity }}</span>
            </div>
            <div class="product-subtotal">
              小计: <span class="price-symbol">¥</span>
              <span class="subtotal-price">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section card">
        <div class="info-item">
          <span class="info-label">订单号</span>
          <span class="info-value">{{ order.orderNo }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">下单时间</span>
          <span class="info-value">{{ formatDate(order.createdAt, 'YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">支付方式</span>
          <span class="info-value">{{ payMethodText }}</span>
        </div>
      </div>

      <div class="bottom-bar safe-bottom" v-if="showBottomActions">
        <template v-if="order.status === 'pending'">
          <button class="btn btn-outline action-btn" @click="handleCancel">取消订单</button>
          <button class="btn btn-primary action-btn" @click="handlePay">立即付款</button>
        </template>
        <template v-else-if="order.status === 'paid'">
          <button class="btn btn-primary action-btn" @click="handleRemindShip">提醒发货</button>
        </template>
        <template v-else-if="order.status === 'shipped'">
          <button class="btn btn-primary action-btn" @click="handleConfirm">确认收货</button>
        </template>
        <template v-else-if="order.status === 'completed'">
          <button class="btn btn-outline action-btn" @click="handleRefund">申请退款</button>
          <button class="btn btn-primary action-btn" @click="handleBuyAgain">再次购买</button>
        </template>
        <template v-else-if="order.status === 'cancelled'">
          <button class="btn btn-primary action-btn" @click="handleBuyAgain">再次购买</button>
        </template>
      </div>
    </template>

    <PayModal
      v-model:visible="payModalVisible"
      :amount="order?.totalAmount || 0"
      :submitting="paySubmitting"
      @pay="handleConfirmPay"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { formatPrice, formatDate, showToast } from '@/utils'
import PayModal from '@/components/PayModal.vue'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const payModalVisible = ref(false)
const paySubmitting = ref(false)

const order = computed(() => orderStore.currentOrder)

const sortedTracking = computed(() => {
  if (!order.value?.tracking) return []
  return [...order.value.tracking].sort((a, b) => b.time - a.time)
})

const payMethodText = computed(() => {
  const methods = {
    alipay: '支付宝',
    wechat: '微信支付',
    unionpay: '银联支付'
  }
  return methods[order.value?.payMethod] || '在线支付'
})

const showBottomActions = computed(() => {
  if (!order.value) return false
  return ['pending', 'paid', 'shipped', 'completed', 'cancelled'].includes(order.value.status)
})

function goBack() {
  router.back()
}

function goProduct(item) {
  router.push({ name: 'product-detail', params: { id: item.productId } })
}

async function handleCancel() {
  if (!order.value) return
  const success = await orderStore.cancelOrder(order.value.id)
  if (success) {
    orderStore.fetchOrderDetail(order.value.id)
  }
}

function handlePay() {
  payModalVisible.value = true
}

async function handleConfirmPay(method) {
  if (!order.value) return
  paySubmitting.value = true
  try {
    const success = await orderStore.payOrder(order.value.id)
    if (success) {
      payModalVisible.value = false
      orderStore.fetchOrderDetail(order.value.id)
    }
  } finally {
    paySubmitting.value = false
  }
}

function handleRemindShip() {
  showToast('已提醒商家发货')
}

async function handleConfirm() {
  if (!order.value) return
  const success = await orderStore.confirmOrder(order.value.id)
  if (success) {
    orderStore.fetchOrderDetail(order.value.id)
  }
}

function handleRefund() {
  showToast('申请退款功能开发中')
}

function handleBuyAgain() {
  if (order.value?.items && order.value.items.length) {
    router.push({ name: 'product-detail', params: { id: order.value.items[0].productId } })
  }
}

onMounted(() => {
  const id = route.params.id
  if (id) {
    orderStore.fetchOrderDetail(id)
  }
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 80px;
}

.navbar-placeholder {
  width: 32px;
}

.status-header {
  padding: var(--space-xxl);
  color: #fff;
  text-align: center;
}

.status-header.pending {
  background: linear-gradient(135deg, #faad14, #d48806);
}

.status-header.paid {
  background: linear-gradient(135deg, #1890ff, #096dd9);
}

.status-header.shipped {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
}

.status-header.completed {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.status-header.cancelled {
  background: linear-gradient(135deg, #8c8c8c, #595959);
}

.status-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.status-desc {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.tracking-section,
.address-section,
.items-section,
.info-section {
  margin: var(--space-md);
  padding: var(--space-lg);
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.timeline {
  position: relative;
}

.timeline-item {
  position: relative;
  padding-left: var(--space-lg);
  padding-bottom: var(--space-md);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-border);
}

.timeline-item.active .timeline-dot {
  background: var(--color-primary);
  width: 12px;
  height: 12px;
  top: 3px;
  left: -1px;
}

.timeline-line {
  position: absolute;
  left: 4px;
  top: 16px;
  width: 2px;
  bottom: 0;
  background: var(--color-border-light);
}

.timeline-item.active .timeline-status {
  color: var(--color-primary);
  font-weight: 600;
}

.timeline-status {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.timeline-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-xs);
}

.timeline-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.address-section {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.address-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.address-info {
  flex: 1;
  min-width: 0;
}

.address-user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xs);
}

.user-name {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
}

.user-phone {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.address-detail {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.product-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}

.product-item + .product-item {
  border-top: 1px dashed var(--color-border-light);
  padding-top: var(--space-md);
  margin-top: var(--space-sm);
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-bg);
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: 1.4;
}

.product-sku {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
  background: var(--color-bg);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: inline-block;
  align-self: flex-start;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-sm);
}

.product-price-wrap {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.product-price {
  color: var(--color-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
}

.product-quantity {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.product-subtotal {
  margin-top: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: right;
}

.subtotal-price {
  color: var(--color-text);
  font-weight: 600;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.info-item + .info-item {
  border-top: 1px solid var(--color-border-light);
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border-light);
  z-index: 100;
}

.action-btn {
  flex: 1;
  height: 42px;
  font-size: var(--font-size-base);
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px var(--space-lg) var(--space-lg);
}

.empty-icon {
  font-size: 72px;
  margin-bottom: var(--space-lg);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.empty-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xxl);
}

.empty-btn {
  padding: var(--space-sm) var(--space-xxl);
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: 600;
}
</style>
