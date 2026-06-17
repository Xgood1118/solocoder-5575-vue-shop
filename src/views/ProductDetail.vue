<template>
  <div class="product-detail safe-bottom">
    <div class="navbar">
      <button class="navbar-back" @click="goBack">‹</button>
      <div class="navbar-title">商品详情</div>
      <button class="navbar-fav" @click="handleToggleFavorite">
        <span v-if="isFav">❤️</span>
        <span v-else>🤍</span>
      </button>
    </div>

    <div v-if="productStore.detailLoading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!product" class="empty-state">
      <div class="empty-icon">📦</div>
      <div class="empty-title">商品不存在或已下架</div>
      <div class="empty-desc">请检查商品链接是否正确</div>
      <button class="empty-btn" @click="$router.push({ name: 'home' })">返回首页</button>
    </div>

    <template v-else>
      <div class="swiper-wrap" ref="swiperRef">
        <div class="swiper-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div class="swiper-slide" v-for="(img, idx) in product.images" :key="idx">
            <img :src="img" :alt="product.name" />
          </div>
        </div>
        <div class="swiper-indicators">
          <span
            v-for="(_, idx) in product.images"
            :key="idx"
            class="indicator"
            :class="{ active: currentSlide === idx }"
          ></span>
        </div>
      </div>

      <div class="product-info card">
        <div class="price-row">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ formatPrice(currentSku?.price || product.price) }}</span>
          <span v-if="product.originalPrice > (currentSku?.price || product.price)" class="price-original">
            ¥{{ formatPrice(product.originalPrice) }}
          </span>
        </div>
        <div class="product-name">{{ product.name }}</div>
        <div v-if="product.tags && product.tags.length" class="product-tags">
          <span v-for="tag in product.tags" :key="tag" class="product-tag">{{ tag }}</span>
        </div>
        <div class="product-meta">
          <span>已售{{ formatSales(product.sales) }}</span>
          <span class="meta-divider">|</span>
          <span>⭐ {{ product.rating }}</span>
          <span class="meta-divider">|</span>
          <span>{{ product.reviewCount }}条评价</span>
        </div>
      </div>

      <div class="sku-section card">
        <div v-for="(values, specName) in specOptions" :key="specName" class="spec-group">
          <div class="spec-label">{{ specName }}</div>
          <div class="spec-values">
            <button
              v-for="val in values"
              :key="val"
              class="spec-btn"
              :class="{
                active: selectedSpecs[specName] === val,
                disabled: !isSpecAvailable(specName, val)
              }"
              @click="selectSpec(specName, val)"
            >
              {{ val }}
            </button>
          </div>
        </div>

        <div class="sku-info" v-if="currentSku">
          <span>库存: {{ currentSku.stock }}件</span>
          <span class="sku-price">¥{{ formatPrice(currentSku.price) }}</span>
        </div>

        <div class="quantity-row">
          <span class="quantity-label">数量</span>
          <div class="quantity-control">
            <button class="qty-btn" :class="{ disabled: quantity <= 1 }" @click="changeQuantity(-1)">−</button>
            <span class="qty-value">{{ quantity }}</span>
            <button class="qty-btn" :class="{ disabled: !currentSku || currentSku.stock <= 0 || quantity >= currentSku.stock }" @click="changeQuantity(1)">+</button>
          </div>
        </div>
      </div>

      <div class="detail-tabs card">
        <div class="tabs-header">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="tabs-content">
          <div v-if="activeTab === 'description'" class="tab-panel">
            <div class="desc-text">{{ product.description }}</div>
            <div class="desc-images">
              <img v-for="(img, idx) in product.images" :key="idx" :src="img" :alt="product.name" />
            </div>
          </div>
          <div v-else-if="activeTab === 'specs'" class="tab-panel">
            <div class="specs-list">
              <div v-for="(val, key) in product.specs" :key="key" class="spec-item">
                <span class="spec-key">{{ key }}</span>
                <span class="spec-val">{{ val }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="activeTab === 'reviews'" class="tab-panel">
            <div v-if="product.reviews && product.reviews.length" class="reviews-list">
              <div v-for="review in product.reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <img v-if="review.avatar" :src="review.avatar" class="review-avatar" />
                  <div v-else class="review-avatar review-avatar-fallback">
                    {{ review.userName?.charAt(0) || 'U' }}
                  </div>
                  <div class="review-user">
                    <div class="review-name">{{ review.userName }}</div>
                    <div class="review-rating">
                      <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">⭐</span>
                    </div>
                  </div>
                  <div class="review-time">{{ formatDate(review.createdAt, 'YYYY-MM-DD') }}</div>
                </div>
                <div class="review-content">{{ review.content }}</div>
                <div v-if="review.sku && Object.keys(review.sku).length" class="review-sku">
                  规格: {{ Object.values(review.sku).join(' / ') }}
                </div>
                <div v-if="review.images && review.images.length" class="review-images">
                  <img v-for="(img, idx) in review.images" :key="idx" :src="img" class="review-img" />
                </div>
              </div>
            </div>
            <div v-else class="empty-reviews">暂无评价</div>
          </div>
        </div>
      </div>

      <div class="recommend-section" v-if="recommendProducts.length">
        <div class="section-title">相关推荐</div>
        <div class="recommend-grid">
          <ProductCard
            v-for="item in recommendProducts"
            :key="item.id"
            :product="item"
            layout="grid"
          />
        </div>
      </div>
    </template>

    <div class="bottom-bar safe-bottom" v-if="product">
      <button class="action-btn cart-btn" @click="handleAddToCart">
        <span class="action-icon">🛒</span>
        <span>加入购物车</span>
      </button>
      <button class="action-btn buy-btn" @click="handleBuyNow">
        立即购买
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { formatPrice, formatDate, showToast } from '@/utils'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const swiperRef = ref(null)
const currentSlide = ref(0)
const activeTab = ref('description')
const quantity = ref(1)
const recommendProducts = ref([])
const selectedSpecs = reactive({})

const tabs = [
  { key: 'description', label: '详情描述' },
  { key: 'specs', label: '商品规格' },
  { key: 'reviews', label: '用户评价' }
]

const product = computed(() => productStore.detail)

const isFav = computed(() => {
  if (!product.value) return false
  return userStore.isFavorite(product.value.id)
})

const specOptions = computed(() => {
  if (!product.value || !product.value.skus) return {}
  const options = {}
  product.value.skus.forEach(sku => {
    Object.entries(sku.spec || {}).forEach(([key, val]) => {
      if (!options[key]) options[key] = []
      if (!options[key].includes(val)) options[key].push(val)
    })
  })
  return options
})

const currentSku = computed(() => {
  if (!product.value || !product.value.skus) return null
  const specKeys = Object.keys(specOptions.value)
  if (specKeys.some(k => !selectedSpecs[k])) return null
  return product.value.skus.find(sku => {
    return specKeys.every(k => sku.spec?.[k] === selectedSpecs[k])
  }) || null
})

function formatSales(sales) {
  if (sales >= 10000) return (sales / 10000).toFixed(1) + '万'
  if (sales >= 1000) return (sales / 1000).toFixed(1) + 'k'
  return sales
}

function goBack() {
  router.back()
}

function handleToggleFavorite() {
  if (!product.value) return
  userStore.toggleFavorite(product.value)
}

function isSpecAvailable(specName, value) {
  if (!product.value || !product.value.skus) return true
  const tempSpecs = { ...selectedSpecs, [specName]: value }
  return product.value.skus.some(sku => {
    return Object.entries(tempSpecs).every(([k, v]) => sku.spec?.[k] === v || !tempSpecs[k])
      && sku.stock > 0
  })
}

function selectSpec(specName, value) {
  if (!isSpecAvailable(specName, value)) return
  selectedSpecs[specName] = value
  const specKeys = Object.keys(specOptions.value)
  specKeys.forEach(k => {
    if (k !== specName && selectedSpecs[k]) {
      if (!isSpecAvailable(k, selectedSpecs[k])) {
        delete selectedSpecs[k]
      }
    }
  })
  if (currentSku.value && quantity.value > currentSku.value.stock) {
    quantity.value = Math.max(1, currentSku.value.stock)
  }
}

function changeQuantity(delta) {
  const newQty = quantity.value + delta
  if (newQty < 1) return
  if (currentSku.value && newQty > currentSku.value.stock) {
    showToast(`库存不足，最多可购买${currentSku.value.stock}件`)
    return
  }
  quantity.value = newQty
}

function handleAddToCart() {
  if (!product.value || !currentSku.value) {
    showToast('请选择完整规格')
    return
  }
  const success = cartStore.addToCart(product.value, currentSku.value, quantity.value)
  if (success) {
    quantity.value = 1
  }
}

function handleBuyNow() {
  if (!product.value || !currentSku.value) {
    showToast('请选择完整规格')
    return
  }
  const success = cartStore.addToCart(product.value, currentSku.value, quantity.value)
  if (success) {
    router.push({ name: 'checkout' })
  }
}

let touchStartX = 0
let touchEndX = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}

function onTouchMove(e) {
  touchEndX = e.touches[0].clientX
}

function onTouchEnd() {
  if (!product.value) return
  const diff = touchEndX - touchStartX
  if (Math.abs(diff) > 50) {
    if (diff < 0 && currentSlide.value < product.value.images.length - 1) {
      currentSlide.value++
    } else if (diff > 0 && currentSlide.value > 0) {
      currentSlide.value--
    }
  }
}

onMounted(async () => {
  const id = route.params.id
  if (id) {
    await productStore.fetchProductDetail(id)
    if (product.value) {
      userStore.addHistory(product.value)
      Object.keys(specOptions.value).forEach(key => {
        const firstAvailable = specOptions.value[key].find(v => isSpecAvailable(key, v))
        if (firstAvailable) selectedSpecs[key] = firstAvailable
      })
      recommendProducts.value = await productStore.getRecommendProducts(8)
    }
  }
  if (swiperRef.value) {
    swiperRef.value.addEventListener('touchstart', onTouchStart)
    swiperRef.value.addEventListener('touchmove', onTouchMove)
    swiperRef.value.addEventListener('touchend', onTouchEnd)
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    currentSlide.value = 0
    activeTab.value = 'description'
    quantity.value = 1
    Object.keys(selectedSpecs).forEach(k => delete selectedSpecs[k])
    productStore.fetchProductDetail(newId)
  }
})
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 70px;
}

.navbar-fav {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
}

.swiper-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--color-bg-card);
  touch-action: pan-y;
}

.swiper-track {
  display: flex;
  transition: transform 0.3s ease;
}

.swiper-slide {
  flex-shrink: 0;
  width: 100%;
  padding-top: 100%;
  position: relative;
}

.swiper-slide img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.swiper-indicators {
  position: absolute;
  bottom: var(--space-md);
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
  transition: all 0.2s ease;
}

.indicator.active {
  width: 18px;
  border-radius: 3px;
  background: #fff;
}

.product-info {
  margin: var(--space-md);
  padding: var(--space-lg);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.price-symbol {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: 600;
}

.price-value {
  color: var(--color-primary);
  font-size: var(--font-size-xxl);
  font-weight: 700;
}

.price-original {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
  text-decoration: line-through;
  margin-left: var(--space-xs);
}

.product-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.5;
  margin-top: var(--space-sm);
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.product-tag {
  padding: 2px 8px;
  background: var(--color-primary-light);
  color: #fff;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

.product-meta {
  display: flex;
  align-items: center;
  margin-top: var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.meta-divider {
  margin: 0 var(--space-sm);
  color: var(--color-border);
}

.sku-section {
  margin: var(--space-md);
  padding: var(--space-lg);
}

.spec-group {
  margin-bottom: var(--space-md);
}

.spec-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.spec-btn {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
}

.spec-btn.active {
  border-color: var(--color-primary);
  background: rgba(255, 77, 79, 0.05);
  color: var(--color-primary);
}

.spec-btn.disabled {
  opacity: 0.4;
  pointer-events: none;
  background: var(--color-bg-disabled);
}

.sku-info {
  display: flex;
  justify-content: space-between;
  padding: var(--space-md) 0;
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.sku-price {
  color: var(--color-primary);
  font-weight: 600;
}

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-md);
}

.quantity-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: var(--color-text);
  background: var(--color-bg-card);
}

.qty-btn.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.qty-value {
  min-width: 40px;
  text-align: center;
  font-size: var(--font-size-base);
  color: var(--color-text);
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  padding: 0 var(--space-sm);
  line-height: 32px;
}

.detail-tabs {
  margin: var(--space-md);
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--color-border-light);
}

.tab-btn {
  flex: 1;
  padding: var(--space-md);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
  position: relative;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}

.tabs-content {
  padding: var(--space-lg);
}

.desc-text {
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: 1.8;
}

.desc-images {
  margin-top: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.desc-images img {
  width: 100%;
  border-radius: var(--radius-sm);
}

.specs-list {
  display: flex;
  flex-direction: column;
}

.spec-item {
  display: flex;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-sm);
}

.spec-key {
  width: 100px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.spec-val {
  flex: 1;
  color: var(--color-text);
}

.reviews-list {
  display: flex;
  flex-direction: column;
}

.review-item {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.review-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.review-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: #fff;
  font-size: var(--font-size-sm);
}

.review-user {
  flex: 1;
}

.review-name {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.review-rating {
  font-size: var(--font-size-xs);
  margin-top: 2px;
}

.review-rating .star {
  opacity: 0.3;
}

.review-rating .star.filled {
  opacity: 1;
}

.review-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.review-content {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: 1.6;
}

.review-sku {
  margin-top: var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.review-images {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.review-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.empty-reviews {
  text-align: center;
  padding: var(--space-xxl);
  color: var(--color-text-placeholder);
}

.recommend-section {
  padding: var(--space-md);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border-light);
  z-index: 100;
}

.action-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all 0.2s ease;
}

.cart-btn {
  background: linear-gradient(135deg, #ffb800, #fa8c16);
  color: #fff;
}

.buy-btn {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: #fff;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-icon {
  font-size: var(--font-size-md);
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
