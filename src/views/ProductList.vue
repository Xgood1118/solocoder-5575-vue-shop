<template>
  <div class="product-list-page">
    <div class="navbar">
      <button class="navbar-back" @click="router.back()">
        <span>←</span>
      </button>
      <div class="navbar-title">{{ pageTitle }}</div>
      <button class="navbar-search" @click="goSearch">
        <span>🔍</span>
      </button>
    </div>

    <div class="sort-tabs">
      <div
        v-for="tab in sortTabs"
        :key="tab.key"
        class="sort-tab"
        :class="{ active: currentSort === tab.key }"
        @click="handleSortChange(tab.key)"
      >
        <span>{{ tab.label }}</span>
        <span v-if="tab.key === 'price'" class="sort-arrow">
          <span :class="{ active: priceOrder === 'asc' }">↑</span>
          <span :class="{ active: priceOrder === 'desc' }">↓</span>
        </span>
      </div>
      <div class="sort-divider"></div>
      <button class="filter-btn" @click="showFilter = true">
        <span>筛选</span>
      </button>
      <button class="layout-btn" @click="toggleLayout">
        <span>{{ layoutIcon }}</span>
      </button>
    </div>

    <div class="list-container" ref="listContainer" @scroll="onScroll">
      <div v-if="productStore.loading && productStore.products.length === 0" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="productStore.products.length === 0" class="empty">
        <div class="empty-icon">📦</div>
        <div>暂无商品</div>
      </div>

      <template v-else>
        <div v-if="layout === 'waterfall'" class="waterfall-container">
          <div class="waterfall-column">
            <ProductCard
              v-for="product in leftColumn"
              :key="product.id"
              :product="product"
              layout="waterfall"
            />
          </div>
          <div class="waterfall-column">
            <ProductCard
              v-for="product in rightColumn"
              :key="product.id"
              :product="product"
              layout="waterfall"
            />
          </div>
        </div>

        <div v-else-if="layout === 'grid'" class="grid-container">
          <ProductCard
            v-for="product in productStore.products"
            :key="product.id"
            :product="product"
            layout="grid"
          />
        </div>

        <div v-else class="list-items">
          <ProductCard
            v-for="product in productStore.products"
            :key="product.id"
            :product="product"
            layout="list"
          />
        </div>

        <div v-if="paginationMode === 'scroll'">
          <div v-if="productStore.loading" class="loading">
            <div class="spinner"></div>
          </div>
          <div v-if="!productStore.loading && productStore.products.length >= productStore.total" class="no-more">
            没有更多了
          </div>
        </div>

        <div v-if="paginationMode === 'page' && totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button
            class="page-btn"
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </template>
    </div>

    <div v-if="showFilter" class="modal-mask" @click.self="showFilter = false">
      <div class="modal-content filter-panel">
        <div class="filter-header">
          <span class="filter-title">筛选</span>
          <button class="filter-close" @click="showFilter = false">
            <span>✕</span>
          </button>
        </div>

        <div class="filter-body">
          <div class="filter-group">
            <div class="filter-label">分类</div>
            <div class="filter-options">
              <span
                v-for="cat in productStore.categories"
                :key="cat.id"
                class="filter-option"
                :class="{ active: filterParams.categoryId === cat.id }"
                @click="toggleFilter('categoryId', cat.id)"
              >
                {{ cat.name }}
              </span>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">品牌</div>
            <div class="filter-options">
              <span
                v-for="brand in productStore.brands"
                :key="brand.id"
                class="filter-option"
                :class="{ active: filterParams.brandId === brand.id }"
                @click="toggleFilter('brandId', brand.id)"
              >
                {{ brand.name }}
              </span>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">价格区间</div>
            <div class="price-range">
              <input
                v-model.number="filterParams.minPrice"
                type="number"
                class="price-input"
                placeholder="最低价"
              />
              <span class="price-sep">-</span>
              <input
                v-model.number="filterParams.maxPrice"
                type="number"
                class="price-input"
                placeholder="最高价"
              />
            </div>
            <div class="filter-options">
              <span
                v-for="range in priceRanges"
                :key="range.label"
                class="filter-option"
                :class="{ active: isPriceRangeActive(range) }"
                @click="selectPriceRange(range)"
              >
                {{ range.label }}
              </span>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">评分</div>
            <div class="filter-options">
              <span
                v-for="rating in ratingOptions"
                :key="rating.value"
                class="filter-option"
                :class="{ active: filterParams.minRating === rating.value }"
                @click="toggleFilter('minRating', rating.value)"
              >
                {{ rating.label }}
              </span>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">标签</div>
            <div class="filter-options">
              <span
                v-for="tag in tagOptions"
                :key="tag"
                class="filter-option"
                :class="{ active: filterParams.tag === tag }"
                @click="toggleFilter('tag', tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div class="filter-footer">
          <button class="btn btn-outline filter-reset" @click="resetFilter">重置</button>
          <button class="btn btn-primary filter-confirm" @click="confirmFilter">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()

const listContainer = ref(null)
const showFilter = ref(false)
const layout = ref('grid')
const paginationMode = ref('scroll')
const currentSort = ref('default')
const priceOrder = ref('desc')
const scrollPositions = ref({})

const filterParams = ref({
  categoryId: '',
  brandId: '',
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  tag: ''
})

const sortTabs = [
  { key: 'default', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'price', label: '价格' },
  { key: 'new', label: '新品' },
  { key: 'rating', label: '评分' }
]

const priceRanges = [
  { label: '0-100', min: 0, max: 100 },
  { label: '100-500', min: 100, max: 500 },
  { label: '500-1000', min: 500, max: 1000 },
  { label: '1000-5000', min: 1000, max: 5000 },
  { label: '5000+', min: 5000, max: undefined }
]

const ratingOptions = [
  { label: '不限', value: undefined },
  { label: '3分以上', value: 3 },
  { label: '4分以上', value: 4 },
  { label: '4.5分以上', value: 4.5 }
]

const tagOptions = ['新品', '热销', '特价', '包邮', '秒杀']

const layouts = ['waterfall', 'grid', 'list']
const layoutIcons = { waterfall: '▦', grid: '▦', list: '☰' }

const pageTitle = computed(() => {
  if (route.query.categoryId) {
    const cat = productStore.categories.find(c => c.id === route.query.categoryId)
    return cat?.name || '商品列表'
  }
  if (route.query.keyword) {
    return `"${route.query.keyword}" 的搜索结果`
  }
  return '商品列表'
})

const layoutIcon = computed(() => {
  const nextIndex = (layouts.indexOf(layout.value) + 1) % layouts.length
  return layoutIcons[layouts[nextIndex]]
})

const currentPage = computed(() => productStore.currentParams.page)
const totalPages = computed(() => Math.ceil(productStore.total / productStore.currentParams.pageSize))

const leftColumn = computed(() => {
  return productStore.products.filter((_, i) => i % 2 === 0)
})

const rightColumn = computed(() => {
  return productStore.products.filter((_, i) => i % 2 === 1)
})

onMounted(async () => {
  await productStore.fetchCategories()
  await productStore.fetchBrands()
  initFromRoute()
  await loadProducts()
})

function initFromRoute() {
  if (route.query.categoryId) {
    filterParams.value.categoryId = route.query.categoryId
  }
  if (route.query.keyword) {
    filterParams.value.keyword = route.query.keyword
  }
  if (route.query.sort) {
    currentSort.value = route.query.sort
    if (route.query.sort === 'price_asc') {
      currentSort.value = 'price'
      priceOrder.value = 'asc'
    } else if (route.query.sort === 'price_desc') {
      currentSort.value = 'price'
      priceOrder.value = 'desc'
    }
  }
}

async function loadProducts(reset = true) {
  if (reset) {
    productStore.resetProducts()
    scrollPositions.value[currentSort.value] = 0
  }
  const params = buildParams()
  await productStore.fetchProducts(params)
  if (reset && listContainer.value) {
    listContainer.value.scrollTop = 0
  } else if (!reset && scrollPositions.value[currentSort.value]) {
    listContainer.value.scrollTop = scrollPositions.value[currentSort.value]
  }
}

function buildParams() {
  const params = {}
  if (filterParams.value.categoryId) params.categoryId = filterParams.value.categoryId
  if (filterParams.value.brandId) params.brandId = filterParams.value.brandId
  if (filterParams.value.minPrice !== undefined) params.minPrice = filterParams.value.minPrice
  if (filterParams.value.maxPrice !== undefined) params.maxPrice = filterParams.value.maxPrice
  if (filterParams.value.minRating !== undefined) params.minRating = filterParams.value.minRating
  if (filterParams.value.tag) params.tag = filterParams.value.tag
  if (route.query.keyword) params.keyword = route.query.keyword

  if (currentSort.value === 'default') {
    params.sort = ''
  } else if (currentSort.value === 'price') {
    params.sort = priceOrder.value === 'asc' ? 'price_asc' : 'price_desc'
  } else {
    params.sort = currentSort.value
  }

  return params
}

function handleSortChange(key) {
  scrollPositions.value[currentSort.value] = listContainer.value?.scrollTop || 0
  if (key === 'price') {
    if (currentSort.value === 'price') {
      priceOrder.value = priceOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      currentSort.value = 'price'
      priceOrder.value = 'desc'
    }
  } else {
    currentSort.value = key
  }
  loadProducts(true)
}

function toggleLayout() {
  const currentIndex = layouts.indexOf(layout.value)
  layout.value = layouts[(currentIndex + 1) % layouts.length]
}

function toggleFilter(key, value) {
  if (filterParams.value[key] === value) {
    filterParams.value[key] = key === 'minPrice' || key === 'minRating' ? undefined : ''
  } else {
    filterParams.value[key] = value
  }
}

function isPriceRangeActive(range) {
  return filterParams.value.minPrice === range.min && filterParams.value.maxPrice === range.max
}

function selectPriceRange(range) {
  filterParams.value.minPrice = range.min
  filterParams.value.maxPrice = range.max
}

function resetFilter() {
  filterParams.value = {
    categoryId: '',
    brandId: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    tag: ''
  }
}

function confirmFilter() {
  showFilter.value = false
  loadProducts(true)
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  productStore.currentParams.page = page
  loadProducts(false)
  if (listContainer.value) {
    listContainer.value.scrollTop = 0
  }
}

function onScroll(e) {
  if (paginationMode.value !== 'scroll') return
  const { scrollTop, clientHeight, scrollHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    productStore.loadMore()
  }
}

function goSearch() {
  router.push({ name: 'search' })
}
</script>

<style scoped>
.product-list-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  padding: 0 var(--space-lg);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
}

.navbar-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: calc(-1 * var(--space-sm));
  font-size: var(--font-size-xl);
  color: var(--color-text);
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.navbar-search {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: var(--color-text);
}

.sort-tabs {
  position: sticky;
  top: var(--navbar-height);
  z-index: 99;
  display: flex;
  align-items: center;
  padding: 0 var(--space-sm);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
  height: 44px;
}

.sort-tab {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 var(--space-md);
  height: 100%;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  position: relative;
}

.sort-tab.active {
  color: var(--color-primary);
  font-weight: 600;
}

.sort-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}

.sort-arrow {
  display: flex;
  flex-direction: column;
  font-size: 8px;
  line-height: 1;
  color: var(--color-text-placeholder);
}

.sort-arrow span.active {
  color: var(--color-primary);
}

.sort-divider {
  width: 1px;
  height: 16px;
  background: var(--color-border);
  margin: 0 var(--space-sm);
}

.filter-btn,
.layout-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 var(--space-md);
  height: 28px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  margin-left: var(--space-xs);
}

.filter-btn:active,
.layout-btn:active {
  background: var(--color-border-light);
}

.list-container {
  flex: 1;
  overflow-y: auto;
}

.waterfall-container {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm);
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
  padding: var(--space-sm);
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.page-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:active:not(:disabled) {
  background: var(--color-bg-hover);
}

.page-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.no-more {
  text-align: center;
  padding: var(--space-xl);
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}

.filter-panel {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.filter-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.filter-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.filter-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

.filter-group {
  margin-bottom: var(--space-xl);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.filter-option {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.filter-option.active {
  background: #fff2e8;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.price-range {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.price-input {
  flex: 1;
  height: 36px;
  padding: 0 var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.price-input::placeholder {
  color: var(--color-text-placeholder);
}

.price-sep {
  color: var(--color-text-placeholder);
  font-size: var(--font-size-base);
}

.filter-footer {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
  padding-bottom: calc(var(--space-lg) + env(safe-area-inset-bottom, 0));
}

.filter-reset,
.filter-confirm {
  flex: 1;
  height: 40px;
  justify-content: center;
}
</style>
