<template>
  <div class="checkout-page safe-bottom">
    <div class="navbar">
      <button class="navbar-back" @click="handleBack">‹</button>
      <div class="navbar-title">确认订单</div>
      <div class="navbar-placeholder"></div>
    </div>

    <div class="step-indicator">
      <div
        v-for="(step, idx) in steps"
        :key="step.id"
        class="step-item"
        :class="{ active: currentStep === idx, done: currentStep > idx }"
      >
        <div class="step-dot">{{ currentStep > idx ? '✓' : idx + 1 }}</div>
        <div class="step-label">{{ step.label }}</div>
        <div v-if="idx < steps.length - 1" class="step-line"></div>
      </div>
    </div>

    <div class="steps-container">
      <Transition name="slide-left" mode="out-in">
        <div v-if="currentStep === 0" key="step1" class="step-content">
          <div class="step-header">
            <span class="step-title">选择收货地址</span>
            <button class="add-address-btn" @click="showAddAddress = true">
              + 新增地址
            </button>
          </div>
          <div class="address-list">
            <div
              v-for="addr in userStore.addresses"
              :key="addr.id"
              class="address-item card"
              :class="{ active: selectedAddress?.id === addr.id }"
              @click="selectedAddress = addr"
            >
              <div class="address-radio">
                <span class="radio" :class="{ checked: selectedAddress?.id === addr.id }">
                  <span v-if="selectedAddress?.id === addr.id">✓</span>
                </span>
              </div>
              <div class="address-info">
                <div class="address-top">
                  <span class="address-name">{{ addr.name }}</span>
                  <span class="address-phone">{{ addr.phone }}</span>
                  <span v-if="addr.isDefault" class="default-tag">默认</span>
                </div>
                <div class="address-detail">
                  {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
                </div>
              </div>
            </div>
            <div v-if="!userStore.addresses.length" class="empty">
              <div class="empty-icon">📍</div>
              <div>暂无收货地址</div>
            </div>
          </div>
        </div>

        <div v-else-if="currentStep === 1" key="step2" class="step-content">
          <div class="step-header">
            <span class="step-title">选择优惠券</span>
          </div>
          <div class="coupon-list">
            <div
              class="coupon-item"
              :class="{ active: selectedCoupon === null }"
              @click="selectedCoupon = null"
            >
              <div class="coupon-radio">
                <span class="radio" :class="{ checked: selectedCoupon === null }">
                  <span v-if="selectedCoupon === null">✓</span>
                </span>
              </div>
              <div class="coupon-info">
                <div class="coupon-name">不使用优惠券</div>
                <div class="coupon-desc">暂无优惠</div>
              </div>
            </div>
            <div
              v-for="coupon in couponStore.usableCoupons"
              :key="coupon.id"
              class="coupon-item"
              :class="{ active: selectedCoupon?.id === coupon.id, disabled: coupon.minAmount > cartStore.selectedAmount }"
              @click="coupon.minAmount <= cartStore.selectedAmount && (selectedCoupon = coupon)"
            >
              <div class="coupon-left">
                <span v-if="coupon.type === 'amount'" class="coupon-value">
                  <span class="coupon-symbol">¥</span>{{ coupon.value }}
                </span>
                <span v-else class="coupon-value">{{ (coupon.value * 10).toFixed(1) }}折</span>
                <div class="coupon-condition">满{{ coupon.minAmount }}可用</div>
              </div>
              <div class="coupon-right">
                <div class="coupon-name">{{ coupon.name }}</div>
                <div class="coupon-desc">{{ coupon.desc }}</div>
                <div class="coupon-time">{{ formatCouponTime(coupon.endTime) }}</div>
              </div>
              <div class="coupon-radio">
                <span class="radio" :class="{ checked: selectedCoupon?.id === coupon.id }">
                  <span v-if="selectedCoupon?.id === coupon.id">✓</span>
                </span>
              </div>
              <div v-if="coupon.minAmount > cartStore.selectedAmount" class="coupon-mask">
                还差¥{{ formatPrice(coupon.minAmount - cartStore.selectedAmount) }}可用
              </div>
            </div>
            <div v-if="!couponStore.usableCoupons.length" class="empty">
              <div class="empty-icon">🎫</div>
              <div>暂无可用优惠券</div>
            </div>
          </div>
        </div>

        <div v-else-if="currentStep === 2" key="step3" class="step-content">
          <div class="step-header">
            <span class="step-title">选择配送方式</span>
          </div>
          <div class="shipping-list">
            <div
              v-for="method in shippingMethods"
              :key="method.id"
              class="shipping-item card"
              :class="{ active: selectedShipping?.id === method.id }"
              @click="selectedShipping = method"
            >
              <div class="shipping-radio">
                <span class="radio" :class="{ checked: selectedShipping?.id === method.id }">
                  <span v-if="selectedShipping?.id === method.id">✓</span>
                </span>
              </div>
              <div class="shipping-info">
                <div class="shipping-name">{{ method.name }}</div>
                <div class="shipping-desc">{{ method.desc }} · 满{{ method.freeAmount }}元包邮</div>
              </div>
              <div class="shipping-price">
                <span v-if="getShippingFee(method) === 0" class="free-tag">免运费</span>
                <span v-else class="price-text">¥{{ formatPrice(getShippingFee(method)) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="currentStep === 3" key="step4" class="step-content">
          <div class="step-header">
            <span class="step-title">发票信息</span>
          </div>
          <div class="invoice-list">
            <div
              v-for="type in invoiceTypes"
              :key="type.id"
              class="invoice-item card"
              :class="{ active: selectedInvoice?.id === type.id }"
              @click="selectInvoice(type)"
            >
              <div class="invoice-radio">
                <span class="radio" :class="{ checked: selectedInvoice?.id === type.id }">
                  <span v-if="selectedInvoice?.id === type.id">✓</span>
                </span>
              </div>
              <div class="invoice-name">{{ type.name }}</div>
            </div>
          </div>
          <div v-if="selectedInvoice?.value === 'company'" class="invoice-form card">
            <div class="form-label">企业税号</div>
            <input
              v-model="invoiceTaxNo"
              type="text"
              class="form-input"
              placeholder="请输入企业税号"
            />
          </div>
        </div>

        <div v-else-if="currentStep === 4" key="step5" class="step-content">
          <div class="step-header">
            <span class="step-title">订单备注</span>
          </div>
          <div class="remark-section card">
            <textarea
              v-model="orderRemark"
              class="remark-input"
              placeholder="选填，可填写您对订单的特殊要求（最多200字）"
              maxlength="200"
            ></textarea>
            <div class="remark-count">{{ orderRemark.length }}/200</div>
          </div>
        </div>

        <div v-else-if="currentStep === 5" key="step6" class="step-content">
          <div class="step-header">
            <span class="step-title">确认订单信息</span>
          </div>

          <div class="summary-section card">
            <div class="summary-title">商品明细</div>
            <div
              v-for="item in cartStore.selectedItems"
              :key="item.id"
              class="summary-item"
            >
              <img :src="item.image" :alt="item.name" class="summary-img" />
              <div class="summary-info">
                <div class="summary-name text-ellipsis-2">{{ item.name }}</div>
                <div v-if="item.skuSpec" class="summary-sku">
                  {{ Object.values(item.skuSpec).join(' / ') }}
                </div>
              </div>
              <div class="summary-right">
                <div class="summary-price">¥{{ formatPrice(item.price) }}</div>
                <div class="summary-qty">×{{ item.quantity }}</div>
              </div>
            </div>
          </div>

          <div class="amount-section card">
            <div class="amount-row">
              <span class="amount-label">商品总额</span>
              <span class="amount-value">¥{{ formatPrice(cartStore.selectedAmount) }}</span>
            </div>
            <div class="amount-row">
              <span class="amount-label">运费</span>
              <span class="amount-value" :class="{ free: shippingFee === 0 }">
                {{ shippingFee === 0 ? '免运费' : '¥' + formatPrice(shippingFee) }}
              </span>
            </div>
            <div v-if="selectedCoupon" class="amount-row">
              <span class="amount-label">优惠券抵扣</span>
              <span class="amount-value discount">-¥{{ formatPrice(couponDiscount) }}</span>
            </div>
            <div class="amount-row total">
              <span class="amount-label">实付金额</span>
              <span class="amount-value total-price">¥{{ formatPrice(finalAmount) }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="bottom-bar safe-bottom">
      <template v-if="currentStep === 5">
        <div class="final-amount">
          <span class="final-label">实付:</span>
          <span class="final-symbol">¥</span>
          <span class="final-price">{{ formatPrice(finalAmount) }}</span>
        </div>
        <button
          class="submit-btn"
          :class="{ disabled: orderStore.submitting }"
          @click="handleSubmitOrder"
        >
          <span v-if="orderStore.submitting" class="submitting">
            <span class="spinner"></span>
            提交中...
          </span>
          <span v-else>提交订单</span>
        </button>
      </template>
      <template v-else>
        <button
          v-if="currentStep > 0"
          class="prev-btn"
          @click="prevStep"
        >
          上一步
        </button>
        <button
          class="next-btn"
          :class="{ disabled: !canNext }"
          @click="nextStep"
        >
          下一步
        </button>
      </template>
    </div>

    <Teleport to="body">
      <div v-if="showAddAddress" class="modal-mask" @click.self="showAddAddress = false">
        <div class="modal-content address-modal">
          <div class="modal-header">
            <div class="modal-title">新增收货地址</div>
            <button class="modal-close" @click="showAddAddress = false">×</button>
          </div>
          <div class="form-item">
            <div class="form-label">收货人</div>
            <input v-model="newAddress.name" type="text" class="form-input" placeholder="请输入收货人姓名" />
          </div>
          <div class="form-item">
            <div class="form-label">手机号</div>
            <input v-model="newAddress.phone" type="tel" class="form-input" placeholder="请输入手机号" />
          </div>
          <div class="form-item">
            <div class="form-label">所在地区</div>
            <input v-model="newAddressRegion" type="text" class="form-input" placeholder="例：北京市 北京市 朝阳区" />
          </div>
          <div class="form-item">
            <div class="form-label">详细地址</div>
            <input v-model="newAddress.detail" type="text" class="form-input" placeholder="请输入详细地址" />
          </div>
          <div class="form-item form-switch">
            <div class="form-label">设为默认地址</div>
            <div class="switch" :class="{ on: newAddress.isDefault }" @click="newAddress.isDefault = !newAddress.isDefault">
              <div class="switch-dot"></div>
            </div>
          </div>
          <button class="btn btn-primary btn-block save-address-btn" @click="handleAddAddress">
            保存地址
          </button>
        </div>
      </div>
    </Teleport>

    <PayModal
      v-model:visible="showPayModal"
      :amount="finalAmount"
      :order-id="createdOrderId"
      @success="handlePaySuccess"
      @close="handlePayClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { useCouponStore } from '@/stores/coupon'
import { useOrderStore } from '@/stores/order'
import { api } from '@/mock'
import { formatPrice, showToast, validatePhone } from '@/utils'
import PayModal from '@/components/PayModal.vue'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const userStore = useUserStore()
const couponStore = useCouponStore()
const orderStore = useOrderStore()

const steps = [
  { id: 'address', label: '地址' },
  { id: 'coupon', label: '优惠券' },
  { id: 'shipping', label: '配送' },
  { id: 'invoice', label: '发票' },
  { id: 'remark', label: '备注' },
  { id: 'confirm', label: '确认' }
]

const currentStep = ref(0)
const stepDirection = ref('next')

const selectedAddress = ref(null)
const selectedCoupon = ref(null)
const selectedShipping = ref(null)
const selectedInvoice = ref(null)
const invoiceTaxNo = ref('')
const orderRemark = ref('')

const shippingMethods = ref([])
const invoiceTypes = ref([])

const showAddAddress = ref(false)
const newAddress = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})
const newAddressRegion = ref('')

const showPayModal = ref(false)
const createdOrderId = ref('')

const shippingFee = computed(() => {
  if (!selectedShipping.value) return 0
  return getShippingFee(selectedShipping.value)
})

function getShippingFee(method) {
  if (!method) return 0
  if (cartStore.selectedAmount >= method.freeAmount) return 0
  return method.price
}

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  const coupon = selectedCoupon.value
  if (coupon.type === 'amount') return coupon.value
  if (coupon.type === 'discount') return Number((cartStore.selectedAmount * (1 - coupon.value)).toFixed(2))
  return 0
})

const finalAmount = computed(() => {
  const amount = cartStore.selectedAmount + shippingFee.value - couponDiscount.value
  return Math.max(0, amount)
})

const canNext = computed(() => {
  switch (currentStep.value) {
    case 0: return !!selectedAddress.value
    case 1: return true
    case 2: return !!selectedShipping.value
    case 3:
      if (!selectedInvoice.value) return false
      if (selectedInvoice.value.value === 'company' && !invoiceTaxNo.value.trim()) return false
      return true
    case 4: return true
    default: return true
  }
})

function nextStep() {
  if (!canNext.value) {
    const messages = [
      '请选择收货地址',
      '',
      '请选择配送方式',
      selectedInvoice?.value?.value === 'company' ? '请输入企业税号' : '请选择发票类型',
      '',
      ''
    ]
    if (messages[currentStep.value]) {
      showToast(messages[currentStep.value])
    }
    return
  }
  stepDirection.value = 'next'
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  stepDirection.value = 'prev'
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function handleBack() {
  if (currentStep.value > 0) {
    stepDirection.value = 'prev'
    currentStep.value--
  } else {
    router.back()
  }
}

function formatCouponTime(endTime) {
  const d = new Date(endTime)
  return `${d.getMonth() + 1}.${d.getDate()}到期`
}

function selectInvoice(type) {
  selectedInvoice.value = type
  if (type.value !== 'company') {
    invoiceTaxNo.value = ''
  }
}

async function handleAddAddress() {
  if (!newAddress.value.name.trim()) {
    showToast('请输入收货人姓名')
    return
  }
  if (!validatePhone(newAddress.value.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  const regionParts = newAddressRegion.value.trim().split(/\s+/)
  if (regionParts.length < 3) {
    showToast('请输入完整的省市区')
    return
  }
  if (!newAddress.value.detail.trim()) {
    showToast('请输入详细地址')
    return
  }
  const address = {
    ...newAddress.value,
    province: regionParts[0],
    city: regionParts[1],
    district: regionParts.slice(2).join('')
  }
  const success = await userStore.addAddress(address)
  if (success) {
    showAddAddress.value = false
    newAddress.value = { name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false }
    newAddressRegion.value = ''
    if (address.isDefault || !selectedAddress.value) {
      selectedAddress.value = userStore.addresses[userStore.addresses.length - 1]
    }
  }
}

async function handleSubmitOrder() {
  if (!selectedAddress.value) {
    showToast('请选择收货地址')
    currentStep.value = 0
    return
  }
  const orderData = {
    items: cartStore.selectedItems,
    address: selectedAddress.value,
    coupon: selectedCoupon.value,
    couponAmount: couponDiscount.value,
    shippingMethod: selectedShipping.value,
    shippingFee: shippingFee.value,
    invoice: selectedInvoice.value,
    invoiceTaxNo: selectedInvoice.value?.value === 'company' ? invoiceTaxNo.value : '',
    remark: orderRemark.value,
    goodsAmount: cartStore.selectedAmount,
    totalAmount: finalAmount.value,
    payAmount: finalAmount.value
  }
  const order = await orderStore.createOrder(orderData)
  if (order) {
    createdOrderId.value = order.id
    cartStore.clearSelected()
    showPayModal.value = true
  }
}

function handlePaySuccess() {
  showPayModal.value = false
  orderStore.payOrder(createdOrderId.value)
  router.replace({ name: 'order-success', query: { orderId: createdOrderId.value, amount: finalAmount.value } })
}

function handlePayClose() {
  router.replace({ name: 'order-success', query: { orderId: createdOrderId.value, amount: finalAmount.value } })
}

onMounted(async () => {
  if (cartStore.selectedItems.length === 0) {
    showToast('请先选择商品')
    router.replace({ name: 'cart' })
    return
  }
  await userStore.fetchAddresses()
  if (userStore.addresses.length > 0) {
    selectedAddress.value = userStore.defaultAddress || userStore.addresses[0]
  }
  const bestCoupon = couponStore.getBestCoupon(cartStore.selectedAmount)
  if (bestCoupon) {
    selectedCoupon.value = bestCoupon
  }
  const [shippingRes, invoiceRes] = await Promise.all([
    api.getShippingMethods(),
    api.getInvoiceTypes()
  ])
  if (shippingRes.code === 200) {
    shippingMethods.value = shippingRes.data
    selectedShipping.value = shippingMethods.value[0]
  }
  if (invoiceRes.code === 200) {
    invoiceTypes.value = invoiceRes.data
    selectedInvoice.value = invoiceTypes.value[0]
  }
})
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 72px;
}

.navbar-placeholder {
  width: 32px;
}

.step-indicator {
  display: flex;
  align-items: flex-start;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: var(--navbar-height);
  z-index: 50;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-bg-disabled);
  color: var(--color-text-placeholder);
  font-size: var(--font-size-xs);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.step-item.active .step-dot {
  background: var(--color-primary);
  color: #fff;
  transform: scale(1.1);
}

.step-item.done .step-dot {
  background: var(--color-success);
  color: #fff;
  font-size: 12px;
}

.step-label {
  margin-top: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  transition: color 0.3s ease;
}

.step-item.active .step-label {
  color: var(--color-primary);
  font-weight: 500;
}

.step-item.done .step-label {
  color: var(--color-success);
}

.step-line {
  position: absolute;
  top: 12px;
  left: calc(50% + 16px);
  right: calc(-50% + 16px);
  height: 2px;
  background: var(--color-border-light);
  z-index: 1;
}

.step-item.done .step-line {
  background: var(--color-success);
}

.steps-container {
  overflow: hidden;
  padding: var(--space-md);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.35s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.step-content {
  min-height: 400px;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.step-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.add-address-btn {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: 500;
}

.address-list,
.coupon-list,
.shipping-list,
.invoice-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.address-item {
  display: flex;
  align-items: flex-start;
  padding: var(--space-md);
  gap: var(--space-md);
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
}

.address-item.active {
  border-color: var(--color-primary);
  background: rgba(255, 77, 79, 0.03);
}

.address-radio,
.coupon-radio,
.shipping-radio,
.invoice-radio {
  padding-top: 2px;
  flex-shrink: 0;
}

.radio {
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
}

.radio.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.address-info {
  flex: 1;
  min-width: 0;
}

.address-top {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
  flex-wrap: wrap;
}

.address-name {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
}

.address-phone {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.default-tag {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.address-detail {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.coupon-item {
  display: flex;
  align-items: stretch;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.coupon-item.active {
  border-color: var(--color-primary);
}

.coupon-item.disabled {
  opacity: 0.5;
}

.coupon-left {
  width: 100px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: var(--space-md) var(--space-sm);
  flex-shrink: 0;
  position: relative;
}

.coupon-left::before,
.coupon-left::after {
  content: '';
  position: absolute;
  right: -6px;
  width: 12px;
  height: 12px;
  background: var(--color-bg);
  border-radius: 50%;
}

.coupon-left::before {
  top: -6px;
}

.coupon-left::after {
  bottom: -6px;
}

.coupon-item:first-child .coupon-left {
  background: var(--color-bg-disabled);
  color: var(--color-text-placeholder);
}

.coupon-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  line-height: 1;
}

.coupon-symbol {
  font-size: var(--font-size-sm);
}

.coupon-condition {
  font-size: var(--font-size-xs);
  margin-top: var(--space-xs);
  opacity: 0.9;
}

.coupon-right {
  flex: 1;
  padding: var(--space-md);
  min-width: 0;
}

.coupon-name {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.coupon-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.coupon-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.coupon-item .coupon-radio {
  padding: var(--space-md);
  display: flex;
  align-items: center;
}

.coupon-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.shipping-item,
.invoice-item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  gap: var(--space-md);
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
}

.shipping-item.active,
.invoice-item.active {
  border-color: var(--color-primary);
  background: rgba(255, 77, 79, 0.03);
}

.shipping-info {
  flex: 1;
  min-width: 0;
}

.shipping-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
}

.shipping-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.shipping-price {
  text-align: right;
}

.free-tag {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.price-text {
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: 500;
}

.invoice-name {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.invoice-form {
  margin-top: var(--space-md);
  padding: var(--space-md);
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-md);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  color: var(--color-text);
  border: 1px solid var(--color-border-light);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: var(--color-primary);
}

.remark-section {
  padding: var(--space-md);
}

.remark-input {
  width: 100%;
  min-height: 120px;
  padding: var(--space-sm);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  color: var(--color-text);
  resize: none;
  line-height: 1.6;
  border: 1px solid var(--color-border-light);
}

.remark-input:focus {
  border-color: var(--color-primary);
}

.remark-count {
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-top: var(--space-xs);
}

.summary-section,
.amount-section {
  padding: var(--space-md);
  margin-bottom: var(--space-md);
}

.summary-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-img {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-bg);
}

.summary-info {
  flex: 1;
  min-width: 0;
}

.summary-name {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: 1.4;
}

.summary-sku {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.summary-right {
  text-align: right;
  flex-shrink: 0;
}

.summary-price {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: 500;
}

.summary-qty {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.amount-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.amount-value {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.amount-value.free {
  color: var(--color-success);
}

.amount-value.discount {
  color: var(--color-primary);
}

.amount-row.total {
  padding-top: var(--space-md);
  margin-top: var(--space-sm);
  border-top: 1px solid var(--color-border-light);
}

.total-price {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  font-weight: 700;
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
  gap: var(--space-md);
}

.prev-btn {
  flex: 1;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: 500;
  border: 1px solid var(--color-border);
}

.next-btn {
  flex: 2;
  height: 44px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: 600;
}

.next-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.final-amount {
  display: flex;
  align-items: baseline;
  flex: 1;
}

.final-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-right: 2px;
}

.final-symbol {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: 600;
}

.final-price {
  color: var(--color-primary);
  font-size: var(--font-size-xxl);
  font-weight: 700;
}

.submit-btn {
  height: 44px;
  padding: 0 var(--space-xl);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.submit-btn.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.submitting {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.submitting .spinner {
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
}

.address-modal {
  max-height: 80vh;
  overflow-y: auto;
  padding: var(--space-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.modal-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.modal-close {
  width: 28px;
  height: 28px;
  font-size: 24px;
  line-height: 1;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-item {
  margin-bottom: var(--space-md);
}

.form-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-switch .form-label {
  margin-bottom: 0;
}

.switch {
  width: 44px;
  height: 24px;
  background: var(--color-border);
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
}

.switch.on {
  background: var(--color-primary);
}

.switch-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.switch.on .switch-dot {
  left: 22px;
}

.save-address-btn {
  height: 44px;
  margin-top: var(--space-md);
  font-weight: 600;
}
</style>
