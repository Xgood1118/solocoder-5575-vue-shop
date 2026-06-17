export function delay(min = 800, max = 2000) {
  const duration = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, duration))
}

export function formatPrice(price) {
  return Number(price).toFixed(2)
}

export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

export function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function debounce(fn, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function throttle(fn, delay = 300) {
  let last = 0
  return function(...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function showToast(message, duration = 2000) {
  const existing = document.querySelector('.toast-container')
  if (existing) existing.remove()
  const container = document.createElement('div')
  container.className = 'toast-container'
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  container.appendChild(toast)
  document.body.appendChild(container)
  setTimeout(() => container.remove(), duration)
}

export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function validateEmail(email) {
  return /^[\w.-]+@[\w-]+\.[\w.-]+$/.test(email)
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function createImageUrl(prompt, size = 'square') {
  const encoded = encodeURIComponent(prompt)
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encoded}&image_size=${size}`
}

export function calcCountdown(endTime) {
  const now = Date.now()
  const end = new Date(endTime).getTime()
  const diff = Math.max(0, end - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, total: diff }
}

export function padZero(num, len = 2) {
  return String(num).padStart(len, '0')
}
