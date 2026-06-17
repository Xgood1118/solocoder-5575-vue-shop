<template>
  <div class="cs-wrapper">
    <div class="cs-float-btn" @click="showChat = true">
      <span class="cs-icon">💬</span>
    </div>
    <div v-if="showChat" class="cs-mask" @click="showChat = false"></div>
    <transition name="slide-up">
      <div v-if="showChat" class="cs-panel">
        <div class="cs-header">
          <div class="cs-title">在线客服</div>
          <div class="cs-close" @click="showChat = false">✕</div>
        </div>
        <div class="cs-messages" ref="messagesRef">
          <div v-for="(msg, idx) in messages" :key="idx" class="cs-msg" :class="msg.isBot ? 'bot' : 'user'">
            <div class="cs-avatar">{{ msg.isBot ? '🤖' : '👤' }}</div>
            <div class="cs-bubble">
              <div class="cs-text">{{ msg.content }}</div>
              <div class="cs-time">{{ formatTime(msg.time) }}</div>
            </div>
          </div>
        </div>
        <div class="cs-input-area">
          <input
            v-model="inputText"
            type="text"
            class="cs-input"
            placeholder="请输入您的问题..."
            @keyup.enter="sendMessage"
          />
          <button class="cs-send" :disabled="!inputText.trim()" @click="sendMessage">发送</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { api } from '@/mock'
import { formatDate } from '@/utils'

const showChat = ref(false)
const inputText = ref('')
const messagesRef = ref(null)
const messages = ref([
  { content: '您好，我是智能客服小助手，有什么可以帮您的？', time: Date.now(), isBot: true }
])

function formatTime(time) {
  return formatDate(time, 'HH:mm')
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return
  messages.value.push({ content: text, time: Date.now(), isBot: false })
  inputText.value = ''
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
  const res = await api.getAutoReply()
  if (res.code === 200) {
    messages.value.push(res.data)
    await nextTick()
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  }
}
</script>

<style scoped>
.cs-wrapper {
  position: fixed;
  z-index: 99;
}

.cs-float-btn {
  position: fixed;
  right: var(--space-lg);
  bottom: calc(var(--tabbar-height) + 80px);
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  z-index: 99;
}

.cs-icon {
  font-size: 22px;
}

.cs-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.cs-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 70vh;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  display: flex;
  flex-direction: column;
  z-index: 201;
}

.cs-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.cs-title {
  font-size: var(--font-size-md);
  font-weight: 600;
}

.cs-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.cs-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  background: var(--color-bg);
}

.cs-msg {
  display: flex;
  margin-bottom: var(--space-lg);
}

.cs-msg.bot {
  flex-direction: row;
}

.cs-msg.user {
  flex-direction: row-reverse;
}

.cs-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.cs-bubble {
  max-width: 70%;
  margin: 0 var(--space-sm);
}

.cs-text {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}

.cs-msg.user .cs-text {
  background: var(--color-primary);
  color: #fff;
}

.cs-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-top: 4px;
}

.cs-msg.user .cs-time {
  text-align: right;
}

.cs-input-area {
  display: flex;
  padding: var(--space-md);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-card);
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0));
}

.cs-input {
  flex: 1;
  height: 40px;
  padding: 0 var(--space-md);
  background: var(--color-bg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.cs-send {
  margin-left: var(--space-sm);
  padding: 0 var(--space-lg);
  height: 40px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
}

.cs-send:disabled {
  opacity: 0.5;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
