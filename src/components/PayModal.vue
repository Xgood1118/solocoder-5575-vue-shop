<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-mask modal-center" @click.self="handleClose">
      <div class="modal-content pay-modal">
        <div class="pay-header">
          <div class="pay-title">选择支付方式</div>
          <button class="pay-close" @click="handleClose">×</button>
        </div>

        <div class="pay-amount">
          <span class="pay-amount-label">支付金额</span>
          <span class="pay-amount-value">
            <span class="pay-symbol">¥</span>{{ formatPrice(amount) }}
          </span>
        </div>

        <div v-if="status === 'pending'" class="pay-methods">
          <div
            v-for="method in payMethods"
            :key="method.id"
            class="pay-method-item"
            :class="{ active: selectedMethod === method.id }"
            @click="selectedMethod = method.id"
          >
            <div class="pay-method-icon" :style="{ background: method.color }">
              {{ method.icon }}
            </div>
            <div class="pay-method-info">
              <div class="pay-method-name">{{ method.name }}</div>
              <div class="pay-method-desc">{{ method.desc }}</div>
            </div>
            <div class="pay-method-check" :class="{ checked: selectedMethod === method.id }">
              <span v-if="selectedMethod === method.id">✓</span>
            </div>
          </div>

          <button class="btn btn-primary btn-block pay-btn" @click="handlePay">
            立即支付
          </button>
        </div>

        <div v-else-if="status === 'paying'" class="pay-qrcode-section">
          <div class="pay-method-title">
            <span
              class="pay-method-badge"
              :style="{ background: currentMethod.color }"
            >{{ currentMethod.icon }}</span>
            {{ currentMethod.name }}
          </div>
          <div class="qrcode-wrap">
            <img :src="qrcodeSvg" alt="支付二维码" class="qrcode-img" />
            <div class="qrcode-scanning">
              <div class="scanning-line"></div>
            </div>
          </div>
          <div class="qrcode-tip">请使用{{ currentMethod.name }}扫一扫完成支付</div>
          <div class="paying-loading">
            <span class="spinner"></span>
            <span class="paying-text">等待支付中...</span>
          </div>
        </div>

        <div v-else-if="status === 'success'" class="pay-result pay-success">
          <div class="result-icon success">✓</div>
          <div class="result-title">支付成功</div>
          <div class="result-desc">订单已支付完成</div>
          <button class="btn btn-primary btn-block result-btn" @click="handleClose">
            完成
          </button>
        </div>

        <div v-else-if="status === 'failed'" class="pay-result pay-failed">
          <div class="result-icon failed">×</div>
          <div class="result-title">支付失败</div>
          <div class="result-desc">请重试或选择其他支付方式</div>
          <div class="result-actions">
            <button class="btn btn-outline result-btn-half" @click="resetPay">
              重新支付
            </button>
            <button class="btn btn-primary result-btn-half" @click="handleClose">
              稍后支付
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatPrice, showToast } from '@/utils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    default: 0
  },
  orderId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'success', 'close'])

const payMethods = [
  { id: 'wechat', name: '微信支付', desc: '推荐使用微信支付', icon: '💬', color: '#07C160' },
  { id: 'alipay', name: '支付宝', desc: '支付宝安全支付', icon: '💰', color: '#1677FF' }
]

const selectedMethod = ref('wechat')
const status = ref('pending')

const qrcodeSvg = computed(() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#fff"/>
    ${generateQRPattern()}
  </svg>`
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
})

function generateQRPattern() {
  let patterns = ''
  const size = 20
  const cellSize = 10
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const isFinder = (i < 7 && j < 7) || (i < 7 && j >= size - 7) || (i >= size - 7 && j < 7)
      if (isFinder) {
        if ((i === 0 || i === 6 || j === 0 || j === 6 || i === size - 1 || i === size - 7 || j === size - 1 || j === size - 7) &&
            !((i >= 2 && i <= 4 && j >= 2 && j <= 4) || (i >= 2 && i <= 4 && j >= size - 5 && j <= size - 3) || (i >= size - 5 && i <= size - 3 && j >= 2 && j <= 4))) {
          patterns += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000"/>`
        } else if ((i >= 2 && i <= 4 && j >= 2 && j <= 4) || (i >= 2 && i <= 4 && j >= size - 5 && j <= size - 3) || (i >= size - 5 && i <= size - 3 && j >= 2 && j <= 4)) {
          patterns += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000"/>`
        }
      } else if (Math.random() > 0.55) {
        patterns += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000"/>`
      }
    }
  }
  return patterns
}

const currentMethod = computed(() => payMethods.find(m => m.id === selectedMethod.value))

function handlePay() {
  status.value = 'paying'
  const delay = 2000 + Math.random() * 2000
  setTimeout(() => {
    const success = Math.random() > 0.2
    if (success) {
      status.value = 'success'
      emit('success', { orderId: props.orderId, method: selectedMethod.value })
    } else {
      status.value = 'failed'
      showToast('支付失败，请重试')
    }
  }, delay)
}

function resetPay() {
  status.value = 'pending'
}

function handleClose() {
  emit('update:visible', false)
  emit('close')
  setTimeout(() => {
    status.value = 'pending'
  }, 300)
}
</script>

<style scoped>
.pay-modal {
  padding: var(--space-lg);
  max-width: 340px;
}

.pay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.pay-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.pay-close {
  width: 28px;
  height: 28px;
  font-size: 24px;
  line-height: 1;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-amount {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.pay-amount-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--space-xs);
}

.pay-amount-value {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--color-primary);
}

.pay-symbol {
  font-size: var(--font-size-lg);
}

.pay-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.pay-method-item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
}

.pay-method-item.active {
  border-color: var(--color-primary);
  background: rgba(255, 77, 79, 0.03);
}

.pay-method-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  margin-right: var(--space-md);
  flex-shrink: 0;
}

.pay-method-info {
  flex: 1;
  min-width: 0;
}

.pay-method-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text);
}

.pay-method-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.pay-method-check {
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

.pay-method-check.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.pay-btn {
  margin-top: var(--space-md);
  height: 44px;
  font-size: var(--font-size-md);
  font-weight: 600;
}

.pay-qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pay-method-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
}

.pay-method-badge {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
  margin-right: var(--space-sm);
}

.qrcode-wrap {
  position: relative;
  width: 200px;
  height: 200px;
  padding: 10px;
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.qrcode-img {
  width: 180px;
  height: 180px;
}

.qrcode-scanning {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  overflow: hidden;
}

.scanning-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  animation: scanMove 2s linear infinite;
}

@keyframes scanMove {
  0% { top: 0; }
  50% { top: calc(100% - 2px); }
  100% { top: 0; }
}

.qrcode-tip {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.paying-loading {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.paying-text {
  font-size: var(--font-size-sm);
}

.pay-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md) 0;
}

.result-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  margin-bottom: var(--space-lg);
  animation: resultPop 0.4s ease;
}

@keyframes resultPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.result-icon.success {
  background: var(--color-success);
}

.result-icon.failed {
  background: var(--color-danger);
}

.result-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.result-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.result-btn {
  height: 44px;
  font-weight: 600;
}

.result-actions {
  display: flex;
  gap: var(--space-md);
  width: 100%;
}

.result-btn-half {
  flex: 1;
  height: 44px;
  font-weight: 500;
}
</style>
