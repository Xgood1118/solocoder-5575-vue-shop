<template>
  <div class="cart-page safe-bottom">
    <div class="navbar">
      <button v-if="!isEditing" class="navbar-placeholder"></button>
      <div class="navbar-title">购物车</div>
      <button v-if="validItems.length" class="navbar-edit" @click="isEditing = !isEditing">
        {{ isEditing ? '完成' : '编辑' }}
      </button>
      <button v-else class="navbar-placeholder"></button>
    </div>

    <div v-if="!cartStore.items.length" class="empty-cart">
      <div class="empty-icon">🛒</div>
      <div class="empty-text">购物车还是空的</div>
      <button class="btn btn-primary go-shop-btn" @click="goShopping">去逛逛</button>
    </div>

    <template v-else>
      <div v-if="validItems.length" class="cart-list">
        <div
          v-for="item in validItems"
          :key="item.id"
          class="cart-item card"
        >
          <div class="item-checkbox" @click="handleToggleCheck(item)">
            <span class="checkbox" :class="{ checked: item.checked }">
              <span v-if="item.checked">✓</span>
            </span>
          </div>
          <img :src="item.image" :alt="item.name" class="item-image" @click="goDetail(item)" />
          <div class="item-info">
            <div class="item-name text-ellipsis-2" @click="goDetail(item)">{{ item.name }}</div>
            <div v-if="item.skuSpec && Object.keys(item.skuSpec).length" class="item-sku">
              {{ Object.values(item.skuSpec).join(' / ') }}
            </div>
            <div class="item-bottom">
              <div class="item-price-wrap">
                <span class="price-symbol">¥</span>
                <span class="item-price">{{ formatPrice(item.price) }}</span>
              </div>
              <div class="quantity-control">
                <button class="qty-btn" :class="{ disabled: item.quantity <= 1 }" @click="handleUpdateQuantity(item, item.quantity - 1)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" :class="{ disabled: item.quantity >= item.stock }" @click="handleUpdateQuantity(item, item.quantity + 1)">+</button>
              </div>
            </div>
            <div v-if="isEditing" class="item-delete" @click="handleRemoveItem(item.id)">删除</div>
          </div>
        </div>
      </div>

      <div v-if="invalidItems.length" class="invalid-section">
        <div class="section-header">
          <span class="section-title">失效商品（{{ invalidItems.length }}）</span>
          <button class="clear-invalid" @click="handleClearInvalid">清空</button>
        </div>
        <div
          v-for="item in invalidItems"
          :key="item.id"
          class="cart-item card invalid-item"
        >
          <div class="item-checkbox">
            <span class="checkbox checkbox-disabled"></span>
          </div>
          <img :src="item.image" :alt="item.name" class="item-image" />
          <div class="item-info">
            <div class="item-name text-ellipsis-2">{{ item.name }}</div>
            <div v-if="item.skuSpec && Object.keys(item.skuSpec).length" class="item-sku">
              {{ Object.values(item.skuSpec).join(' / ') }}
            </div>
            <div class="item-invalid-tip">该商品已失效</div>
          </div>
        </div>
      </div>

      <div v-if="freeShippingDiff > 0 && validItems.length" class="shipping-tip card" @click="go凑单">
        <span class="tip-icon">🚚</span>
        <span class="tip-text">还差 <span class="tip-amount">¥{{ formatPrice(freeShippingDiff) }}</span> 免运费（标准快递99元包邮）</span>
        <span class="tip-action">去凑单 ›</span>
      </div>
    </template>

    <div class="bottom-bar safe-bottom" v-if="cartStore.items.length">
      <div class="select-all" @click="cartStore.toggleAllCheck()">
        <span class="checkbox" :class="{ checked: cartStore.allChecked }">
          <span v-if="cartStore.allChecked">✓</span>
        </span>
        <span class="select-all-text">全选</span>
      </div>
      <div class="total-wrap">
        <span class="total-label">合计:</span>
        <span class="price-symbol">¥</span>
        <span class="total-amount">{{ formatPrice(cartStore.selectedAmount) }}</span>
      </div>
      <button
        v-if="!isEditing"
        class="checkout-btn"
        :class="{ disabled: cartStore.selectedCount <= 0 }"
        @click="handleCheckout"
      >
        结算({{ cartStore.selectedCount }})
      </button>
      <button
        v-else
        class="checkout-btn"
        :class="{ disabled: !hasSelected }"
        @click="handleDeleteSelected"
      >
        删除
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice, showToast } from '@/utils'

const FREE_SHIPPING_AMOUNT = 99

const router = useRouter()
const cartStore = useCartStore()

const isEditing = ref(false)

const validItems = computed(() => cartStore.items.filter(item => item.stock > 0))
const invalidItems = computed(() => cartStore.items.filter(item => item.stock <= 0))

const freeShippingDiff = computed(() => {
  const selectedAmount = cartStore.selectedAmount
  if (selectedAmount >= FREE_SHIPPING_AMOUNT) return 0
  return FREE_SHIPPING_AMOUNT - selectedAmount
})

const hasSelected = computed(() => cartStore.items.some(item => item.checked && item.stock > 0))

function handleToggleCheck(item) {
  if (item.stock > 0) {
    cartStore.toggleCheck(item.id)
  }
}

function handleUpdateQuantity(item, quantity) {
  if (quantity < 1) {
    cartStore.removeItem(item.id)
    return
  }
  if (quantity > item.stock) {
    showToast(`库存不足，最多可购买${item.stock}件`)
    return
  }
  cartStore.updateQuantity(item.id, quantity)
}

function handleRemoveItem(id) {
  cartStore.removeItem(id)
}

function handleClearInvalid() {
  cartStore.clearInvalid()
  showToast('已清空失效商品')
}

function handleDeleteSelected() {
  if (!hasSelected.value) {
    showToast('请选择要删除的商品')
    return
  }
  cartStore.items.forEach(item => {
    if (item.checked && item.stock > 0) {
      cartStore.removeItem(item.id)
    }
  })
  isEditing.value = false
  showToast('删除成功')
}

function handleCheckout() {
  if (cartStore.selectedCount <= 0) {
    showToast('请选择要结算的商品')
    return
  }
  router.push({ name: 'checkout' })
}

function goShopping() {
  router.push({ name: 'home' })
}

function goDetail(item) {
  router.push({ name: 'product-detail', params: { id: item.productId } })
}

function go凑单() {
  router.push({ name: 'products' })
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 70px;
}

.navbar-placeholder {
  width: 32px;
}

.navbar-edit {
  font-size: var(--font-size-base);
  color: var(--color-text);
  padding: 0 var(--space-sm);
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  margin-bottom: var(--space-xl);
}

.go-shop-btn {
  padding: var(--space-sm) var(--space-xl);
}

.cart-list {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.cart-item {
  display: flex;
  align-items: flex-start;
  padding: var(--space-md);
  gap: var(--space-md);
  position: relative;
}

.invalid-item {
  opacity: 0.5;
}

.item-checkbox {
  padding-top: 4px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-disabled {
  background: var(--color-bg-disabled);
  border-color: var(--color-border);
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
  margin-top: var(--space-sm);
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
  font-size: var(--font-size-md);
  font-weight: 700;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg-card);
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-bg-card);
}

.qty-btn.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.qty-value {
  min-width: 36px;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  line-height: 28px;
}

.item-delete {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.item-invalid-tip {
  margin-top: var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.invalid-section {
  padding: 0 var(--space-md);
  margin-top: var(--space-md);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xs) var(--space-sm);
}

.section-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.clear-invalid {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}

.invalid-section .cart-item {
  margin-bottom: var(--space-md);
}

.shipping-tip {
  margin: var(--space-md);
  padding: var(--space-md);
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
}

.tip-icon {
  margin-right: var(--space-xs);
}

.tip-text {
  flex: 1;
  color: var(--color-text-secondary);
}

.tip-amount {
  color: var(--color-primary);
  font-weight: 600;
}

.tip-action {
  color: var(--color-primary);
  font-weight: 500;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border-light);
  z-index: 100;
}

.select-all {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-right: var(--space-md);
}

.select-all-text {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.total-wrap {
  flex: 1;
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  margin-right: 2px;
}

.total-wrap .price-symbol {
  font-size: var(--font-size-md);
}

.total-amount {
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.checkout-btn {
  height: 40px;
  padding: 0 var(--space-xl);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
}

.checkout-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.checkout-btn:active {
  transform: scale(0.98);
}
</style>
