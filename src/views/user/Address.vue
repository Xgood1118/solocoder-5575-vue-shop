<template>
  <div class="address-page app-container">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <span class="navbar-title">收货地址</span>
      <span style="width: 32px;"></span>
    </div>

    <div class="page">
      <div v-if="userStore.loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="userStore.addresses.length === 0" class="empty">
        <div class="empty-icon">📍</div>
        <p>暂无收货地址</p>
      </div>

      <div v-else class="address-list">
        <div v-for="addr in userStore.addresses" :key="addr.id" class="address-item card">
          <div class="address-main" @click="handleEdit(addr)">
            <div class="address-top">
              <span class="name">{{ addr.name }}</span>
              <span class="phone">{{ addr.phone }}</span>
              <span v-if="addr.isDefault" class="default-tag">默认</span>
            </div>
            <div class="address-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</div>
          </div>
          <div class="address-actions">
            <div class="action-item" @click="handleSetDefault(addr)">
              <div class="radio" :class="{ checked: addr.isDefault }">
                <span v-if="addr.isDefault" class="radio-dot"></span>
              </div>
              <span>默认地址</span>
            </div>
            <div class="action-right">
              <span class="action-btn" @click="handleEdit(addr)">✏️ 编辑</span>
              <span class="action-btn danger" @click="handleDelete(addr)">🗑️ 删除</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer safe-bottom">
      <button class="btn btn-primary btn-block add-btn" @click="handleAdd">
        ➕ 新增收货地址
      </button>
    </div>

    <div v-if="showModal" class="modal-mask" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ editingId ? '编辑地址' : '新增地址' }}</span>
          <span class="modal-close" @click="closeModal">✕</span>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <span class="row-label">姓名</span>
            <input v-model="form.name" type="text" class="row-input" placeholder="请输入收货人姓名" />
          </div>
          <div class="form-row">
            <span class="row-label">手机号</span>
            <input v-model="form.phone" type="tel" class="row-input" placeholder="请输入手机号" />
          </div>
          <div class="form-row">
            <span class="row-label">省市区</span>
            <input v-model="form.region" type="text" class="row-input" placeholder="请输入省/市/区" />
          </div>
          <div class="form-row column">
            <span class="row-label">详细地址</span>
            <textarea v-model="form.detail" class="row-textarea" placeholder="请输入详细地址"></textarea>
          </div>
          <div class="form-row">
            <span class="row-label">设为默认</span>
            <div class="switch-wrap">
              <div class="switch" :class="{ active: form.isDefault }" @click="form.isDefault = !form.isDefault">
                <div class="switch-dot"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer safe-bottom">
          <button class="btn btn-outline cancel-btn" @click="closeModal">取消</button>
          <button class="btn btn-primary confirm-btn" @click="handleSubmit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, validatePhone } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

const showModal = ref(false)
const editingId = ref(null)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  region: '',
  isDefault: false
})

onMounted(() => {
  userStore.fetchAddresses()
})

function goBack() {
  router.back()
}

function resetForm() {
  form.name = ''
  form.phone = ''
  form.province = ''
  form.city = ''
  form.district = ''
  form.detail = ''
  form.region = ''
  form.isDefault = false
}

function handleAdd() {
  editingId.value = null
  resetForm()
  showModal.value = true
}

function handleEdit(addr) {
  editingId.value = addr.id
  form.name = addr.name
  form.phone = addr.phone
  form.province = addr.province
  form.city = addr.city
  form.district = addr.district
  form.detail = addr.detail
  form.region = `${addr.province}${addr.city}${addr.district}`
  form.isDefault = addr.isDefault
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function parseRegion() {
  const region = form.region.trim()
  if (!region) return
  const match = region.match(/^(.*?省|.*?市|.*?自治区)?(.*?市|.*?地区|.*?盟)?(.*?区|.*?县|.*?市)?$/)
  if (match) {
    form.province = match[1] || ''
    form.city = match[2] || ''
    form.district = match[3] || ''
  }
}

async function handleSubmit() {
  if (!form.name.trim()) {
    showToast('请输入收货人姓名')
    return
  }
  if (!form.phone || !validatePhone(form.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  if (!form.region.trim()) {
    showToast('请输入省市区')
    return
  }
  if (!form.detail.trim()) {
    showToast('请输入详细地址')
    return
  }
  parseRegion()
  const addressData = {
    name: form.name.trim(),
    phone: form.phone,
    province: form.province,
    city: form.city,
    district: form.district,
    detail: form.detail.trim(),
    isDefault: form.isDefault
  }
  let success
  if (editingId.value) {
    success = await userStore.updateAddress({ id: editingId.value, ...addressData })
  } else {
    success = await userStore.addAddress(addressData)
  }
  if (success) {
    closeModal()
  }
}

async function handleDelete(addr) {
  if (window.confirm('确定要删除这个地址吗？')) {
    await userStore.deleteAddress(addr.id)
  }
}

async function handleSetDefault(addr) {
  if (!addr.isDefault) {
    await userStore.setDefaultAddress(addr.id)
  }
}
</script>

<style scoped>
.address-page {
  background: var(--color-bg);
  min-height: 100vh;
  padding-bottom: 88px;
}

.page {
  padding: var(--space-md);
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.address-item {
  padding: var(--space-md);
  cursor: pointer;
}

.address-main {
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}

.address-top {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.phone {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.default-tag {
  font-size: var(--font-size-xs);
  color: #fff;
  background: var(--color-primary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.address-detail {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.address-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-md);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio.checked {
  border-color: var(--color-primary);
}

.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
}

.action-right {
  display: flex;
  gap: var(--space-md);
}

.action-btn {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.action-btn.danger {
  color: var(--color-danger);
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-md);
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border-light);
}

.add-btn {
  padding: var(--space-md);
  font-size: var(--font-size-md);
  font-weight: 600;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.modal-close {
  font-size: 20px;
  color: var(--color-text-placeholder);
  cursor: pointer;
  padding: var(--space-xs);
}

.modal-body {
  padding: 0 var(--space-lg);
  max-height: 60vh;
  overflow-y: auto;
}

.form-row {
  display: flex;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.form-row:last-child {
  border-bottom: none;
}

.form-row.column {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
}

.row-label {
  font-size: var(--font-size-base);
  color: var(--color-text);
  width: 80px;
  flex-shrink: 0;
}

.form-row.column .row-label {
  width: auto;
}

.row-input {
  flex: 1;
  text-align: right;
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: transparent;
}

.form-row.column .row-input {
  text-align: left;
  width: 100%;
}

.row-input::placeholder {
  color: var(--color-text-placeholder);
}

.row-textarea {
  width: 100%;
  min-height: 80px;
  padding: var(--space-sm);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  resize: none;
}

.row-textarea::placeholder {
  color: var(--color-text-placeholder);
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

.modal-footer {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: var(--space-md);
  font-size: var(--font-size-base);
  font-weight: 600;
}
</style>
