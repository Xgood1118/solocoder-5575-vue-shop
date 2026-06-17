<template>
  <div class="home-page app-container">
    <div class="home-header">
      <div class="search-bar" @click="goSearch">
        <span class="search-icon">🔍</span>
        <span class="search-placeholder">搜索商品</span>
      </div>
      <button class="theme-toggle" @click="themeStore.toggleTheme">
        {{ themeStore.theme === 'light' ? '🌙' : '☀️' }}
      </button>
    </div>

    <div class="banner-section">
      <div class="banner-wrap">
        <div
          v-for="(banner, index) in productStore.banners"
          :key="banner.id"
          class="banner-slide"
          :class="{ active: currentBanner === index }"
          @click="goBanner(banner)"
        >
          <img :src="banner.image" :alt="banner.title" />
        </div>
      </div>
      <div class="banner-indicators">
        <span
          v-for="(banner, index) in productStore.banners"
          :key="banner.id"
          class="indicator"
          :class="{ active: currentBanner === index }"
        ></span>
      </div>
    </div>

    <div class="category-grid card">
      <div
        v-for="category in productStore.categories"
        :key="category.id"
        class="category-item"
        @click="goCategory(category.id)"
      >
        <div class="category-icon">{{ category.icon }}</div>
        <div class="category-name">{{ category.name }}</div>
      </div>
    </div>

    <div class="section seckill-section card">
      <div class="section-header">
        <div class="section-title">
          <span class="seckill-icon">⚡</span>
          <span>限时秒杀</span>
        </div>
        <div class="countdown">
          <span class="countdown-label">距结束</span>
          <span class="countdown-num">{{ padZero(countdown.hours) }}</span>
          <span class="countdown-sep">:</span>
          <span class="countdown-num">{{ padZero(countdown.minutes) }}</span>
          <span class="countdown-sep">:</span>
          <span class="countdown-num">{{ padZero(countdown.seconds) }}</span>
        </div>
      </div>
      <div class="scroll-list">
        <div v-for="product in seckillProducts" :key="product.id" class="scroll-item">
          <ProductCard :product="product" layout="grid" />
        </div>
      </div>
    </div>

    <div class="section newuser-section card">
      <div class="section-header">
        <div class="section-title">
          <span class="newuser-icon">🎁</span>
          <span>新人专享</span>
        </div>
      </div>
      <div class="scroll-list">
        <div v-for="product in newUserProducts" :key="product.id" class="scroll-item">
          <ProductCard :product="product" layout="grid" />
        </div>
      </div>
    </div>

    <div class="section brand-section card">
      <div class="section-header">
        <div class="section-title">
          <span class="brand-icon">🏷️</span>
          <span>品牌专区</span>
        </div>
      </div>
      <div class="brand-scroll">
        <div
          v-for="brand in productStore.brands"
          :key="brand.id"
          class="brand-item"
          @click="goBrand(brand.id)"
        >
          <div class="brand-logo">{{ brand.logo }}</div>
          <div class="brand-name">{{ brand.name }}</div>
        </div>
      </div>
    </div>

    <div class="section recommend-section">
      <div class="section-header center">
        <div class="section-title">
          <span>—</span>
          <span class="recommend-text">为你推荐</span>
          <span>—</span>
        </div>
      </div>
      <div class="recommend-grid">
        <div v-for="product in productStore.products" :key="product.id" class="recommend-item">
          <ProductCard :product="product" layout="waterfall" />
        </div>
      </div>
      <div v-if="productStore.loading" class="loading">
        <div class="spinner"></div>
      </div>
      <div v-else-if="productStore.products.length >= productStore.total && productStore.products.length > 0" class="no-more">
        没有更多了
      </div>
    </div>

    <Tabbar />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useThemeStore } from '@/stores/theme'
import ProductCard from '@/components/ProductCard.vue'
import Tabbar from '@/components/Tabbar.vue'
import { calcCountdown, padZero, throttle } from '@/utils'

const router = useRouter()
const productStore = useProductStore()
const themeStore = useThemeStore()

const currentBanner = ref(0)
const seckillProducts = ref([])
const newUserProducts = ref([])
const countdown = ref({ hours: 0, minutes: 0, seconds: 0 })

let bannerTimer = null
let countdownTimer = null

function goSearch() {
  router.push({ name: 'search' })
}

function goBanner(banner) {
  if (banner.link) {
    router.push(banner.link)
  }
}

function goCategory(categoryId) {
  router.push({ name: 'products', query: { category: categoryId } })
}

function goBrand(brandId) {
  router.push({ name: 'products', query: { brand: brandId } })
}

function startBannerAutoPlay() {
  bannerTimer = setInterval(() => {
    if (productStore.banners.length > 0) {
      currentBanner.value = (currentBanner.value + 1) % productStore.banners.length
    }
  }, 3000)
}

function startCountdown() {
  countdownTimer = setInterval(() => {
    if (seckillProducts.value.length > 0 && seckillProducts.value[0].seckillEndTime) {
      countdown.value = calcCountdown(seckillProducts.value[0].seckillEndTime)
    }
  }, 1000)
}

const handleScroll = throttle(() => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight = document.documentElement.clientHeight || document.body.clientHeight
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight

  if (scrollTop + clientHeight >= scrollHeight - 100) {
    productStore.loadMore()
  }
}, 300)

onMounted(async () => {
  await Promise.all([
    productStore.fetchBanners(),
    productStore.fetchCategories(),
    productStore.fetchBrands(),
    productStore.fetchProducts({ page: 1 })
  ])

  seckillProducts.value = await productStore.getSeckillProducts()
  newUserProducts.value = await productStore.getNewUserProducts()

  if (seckillProducts.value.length > 0 && seckillProducts.value[0].seckillEndTime) {
    countdown.value = calcCountdown(seckillProducts.value[0].seckillEndTime)
  }

  startBannerAutoPlay()
  startCountdown()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  if (bannerTimer) clearInterval(bannerTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home-page {
  background: var(--color-bg);
}

.home-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-bg-card);
}

.search-bar {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
  background: var(--color-bg);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.search-icon {
  font-size: var(--font-size-base);
}

.search-placeholder {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}

.theme-toggle {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  border-radius: var(--radius-full);
  background: var(--color-bg);
}

.banner-section {
  margin: var(--space-md);
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.banner-wrap {
  position: relative;
  width: 100%;
  padding-top: 42%;
  background: var(--color-bg);
}

.banner-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.banner-slide.active {
  opacity: 1;
}

.banner-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-indicators {
  position: absolute;
  bottom: var(--space-sm);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.indicator.active {
  width: 18px;
  border-radius: 3px;
  background: #fff;
}

.category-grid {
  margin: var(--space-md);
  padding: var(--space-md);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md) 0;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
}

.category-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: var(--color-bg);
  border-radius: var(--radius-full);
}

.category-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.section {
  margin: var(--space-md);
  padding: var(--space-md);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.section-header.center {
  justify-content: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.seckill-icon {
  color: var(--color-primary);
}

.newuser-icon {
  color: var(--color-warning);
}

.brand-icon {
  color: var(--color-info);
}

.recommend-text {
  padding: 0 var(--space-md);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 3px;
}

.countdown-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-right: 4px;
}

.countdown-num {
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333;
  color: #fff;
  font-size: var(--font-size-xs);
  font-weight: 600;
  border-radius: 4px;
}

.countdown-sep {
  color: #333;
  font-weight: 600;
  font-size: var(--font-size-xs);
}

.scroll-list {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  padding-bottom: var(--space-sm);
  -webkit-overflow-scrolling: touch;
}

.scroll-list::-webkit-scrollbar {
  display: none;
}

.scroll-item {
  flex-shrink: 0;
  width: 130px;
}

.brand-scroll {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  padding-bottom: var(--space-sm);
  -webkit-overflow-scrolling: touch;
}

.brand-scroll::-webkit-scrollbar {
  display: none;
}

.brand-item {
  flex-shrink: 0;
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
}

.brand-logo {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-primary);
}

.brand-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  padding: 0 var(--space-md);
}

.recommend-item {
  width: 100%;
}

.loading {
  padding: var(--space-xl);
}

.no-more {
  padding: var(--space-xl);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}
</style>
