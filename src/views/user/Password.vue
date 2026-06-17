<template>
  <div class="password-page app-container">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <span class="navbar-title">修改密码</span>
      <span style="width: 32px;"></span>
    </div>

    <div class="page">
      <div class="form-section card">
        <div class="form-row">
          <span class="row-label">原密码</span>
          <input v-model="form.oldPassword" :type="showOldPwd ? 'text' : 'password'" class="row-input" placeholder="请输入原密码" />
          <span class="toggle-pwd" @click="showOldPwd = !showOldPwd">{{ showOldPwd ? '🙈' : '👁️' }}</span>
        </div>
        <div class="form-row">
          <span class="row-label">新密码</span>
          <input v-model="form.newPassword" :type="showNewPwd ? 'text' : 'password'" class="row-input" placeholder="请输入新密码" />
          <span class="toggle-pwd" @click="showNewPwd = !showNewPwd">{{ showNewPwd ? '🙈' : '👁️' }}</span>
        </div>
        <div class="form-row">
          <span class="row-label">确认密码</span>
          <input v-model="form.confirmPassword" :type="showConfirmPwd ? 'text' : 'password'" class="row-input" placeholder="请再次输入新密码" />
          <span class="toggle-pwd" @click="showConfirmPwd = !showConfirmPwd">{{ showConfirmPwd ? '🙈' : '👁️' }}</span>
        </div>
      </div>

      <div class="tips">
        <p>密码长度至少6位，建议包含字母和数字</p>
      </div>

      <button class="btn btn-primary btn-block submit-btn" @click="handleSubmit">提交</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

const showOldPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function goBack() {
  router.back()
}

function handleSubmit() {
  if (!form.oldPassword) {
    showToast('请输入原密码')
    return
  }
  if (!form.newPassword) {
    showToast('请输入新密码')
    return
  }
  if (form.newPassword.length < 6) {
    showToast('新密码至少6位')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    showToast('两次密码输入不一致')
    return
  }
  if (form.oldPassword === form.newPassword) {
    showToast('新密码不能与原密码相同')
    return
  }
  const success = userStore.changePassword(form.oldPassword, form.newPassword)
  if (success) {
    setTimeout(() => router.back(), 1000)
  }
}
</script>

<style scoped>
.password-page {
  background: var(--color-bg);
}

.page {
  padding: var(--space-md);
}

.form-section {
  padding: 0 var(--space-md);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
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

.row-label {
  font-size: var(--font-size-base);
  color: var(--color-text);
  width: 80px;
  flex-shrink: 0;
}

.row-input {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: transparent;
}

.row-input::placeholder {
  color: var(--color-text-placeholder);
}

.toggle-pwd {
  font-size: 18px;
  cursor: pointer;
  padding: var(--space-xs);
}

.tips {
  margin: var(--space-md) var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}

.tips p {
  line-height: 1.6;
}

.submit-btn {
  margin-top: var(--space-md);
  padding: var(--space-md);
  font-size: var(--font-size-md);
  font-weight: 600;
}
</style>
