<template>
  <div class="profile-page app-container">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <span class="navbar-title">个人资料</span>
      <span style="width: 32px;"></span>
    </div>

    <div class="page">
      <div class="avatar-section card">
        <div class="avatar-row" @click="triggerFileInput">
          <span class="row-label">头像</span>
          <div class="avatar-wrap">
            <div class="avatar">
              <img v-if="form.avatar" :src="form.avatar" alt="avatar" />
              <span v-else class="avatar-placeholder">👤</span>
            </div>
            <span class="row-arrow">›</span>
          </div>
          <input ref="fileInputRef" type="file" accept="image/*" style="display: none;" @change="handleFileChange" />
        </div>
      </div>

      <div class="form-section card">
        <div class="form-row">
          <span class="row-label">昵称</span>
          <input v-model="form.nickname" type="text" class="row-input" placeholder="请输入昵称" />
        </div>
        <div class="form-row">
          <span class="row-label">手机号</span>
          <input v-model="form.phone" type="tel" class="row-input" placeholder="请输入手机号" />
        </div>
        <div class="form-row">
          <span class="row-label">邮箱</span>
          <input v-model="form.email" type="email" class="row-input" placeholder="请输入邮箱" />
        </div>
      </div>

      <div class="menu-section card">
        <div class="menu-item" @click="goPassword">
          <span class="row-label">修改密码</span>
          <span class="row-arrow">›</span>
        </div>
      </div>

      <button class="btn btn-primary btn-block save-btn" @click="handleSave">保存</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, validatePhone, validateEmail } from '@/utils'

const router = useRouter()
const userStore = useUserStore()
const fileInputRef = ref(null)

const form = reactive({
  avatar: '',
  nickname: '',
  phone: '',
  email: ''
})

onMounted(() => {
  form.avatar = userStore.userInfo.avatar || ''
  form.nickname = userStore.userInfo.nickname || ''
  form.phone = userStore.userInfo.phone || ''
  form.email = userStore.userInfo.email || ''
})

function goBack() {
  router.back()
}

function goPassword() {
  router.push({ name: 'user-password' })
}

function triggerFileInput() {
  fileInputRef.value.click()
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.avatar = ev.target.result
  }
  reader.readAsDataURL(file)
}

function handleSave() {
  if (!form.nickname.trim()) {
    showToast('请输入昵称')
    return
  }
  if (form.phone && !validatePhone(form.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  if (form.email && !validateEmail(form.email)) {
    showToast('请输入正确的邮箱')
    return
  }
  userStore.updateUserInfo({
    avatar: form.avatar,
    nickname: form.nickname.trim(),
    phone: form.phone,
    email: form.email
  })
  router.back()
}
</script>

<style scoped>
.profile-page {
  background: var(--color-bg);
}

.page {
  padding: var(--space-md);
}

.avatar-section,
.form-section,
.menu-section {
  padding: 0 var(--space-md);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.avatar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  cursor: pointer;
}

.row-label {
  font-size: var(--font-size-base);
  color: var(--color-text);
  flex-shrink: 0;
}

.avatar-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 28px;
}

.row-arrow {
  font-size: 20px;
  color: var(--color-text-placeholder);
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

.row-input {
  flex: 1;
  text-align: right;
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: transparent;
}

.row-input::placeholder {
  color: var(--color-text-placeholder);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) 0;
  cursor: pointer;
}

.save-btn {
  margin-top: var(--space-xl);
  padding: var(--space-md);
  font-size: var(--font-size-md);
  font-weight: 600;
}
</style>
