<template>
  <div class="search-page">
    <div class="search-navbar">
      <button class="navbar-back" @click="goBack">
        <span>←</span>
      </button>
      <div class="search-input-wrap">
        <span class="search-icon">🔍</span>
        <input
          ref="inputRef"
          v-model="keyword"
          type="text"
          class="search-input"
          placeholder="搜索商品"
          @input="onInput"
          @keyup.enter="handleSearch"
          @focus="onFocus"
        />
        <button v-if="keyword" class="search-clear" @click="clearKeyword">
          <span>✕</span>
        </button>
      </div>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </div>

    <div v-if="showSuggestions && suggestions.length" class="suggestions-panel">
      <div
        v-for="(item, index) in suggestions"
        :key="index"
        class="suggestion-item"
        @click="selectSuggestion(item)"
      >
        <span class="suggestion-icon">🔍</span>
        <span class="suggestion-text">{{ item }}</span>
      </div>
    </div>

    <div v-if="!hasSearched && !showSuggestions" class="search-content">
      <div v-if="userStore.searchHistory.length" class="search-section">
        <div class="section-header">
          <span class="section-title">搜索历史</span>
          <button class="section-action" @click="handleClearHistory">
            <span>🗑</span> 清空
          </button>
        </div>
        <div class="history-tags">
          <div
            v-for="(item, index) in userStore.searchHistory"
            :key="index"
            class="history-tag"
          >
            <span class="history-text" @click="searchKeyword(item)">{{ item }}</span>
            <button class="history-delete" @click.stop="deleteHistory(index)">
              <span>✕</span>
            </button>
          </div>
        </div>
      </div>

      <div class="search-section">
        <div class="section-header">
          <span class="section-title">热门搜索</span>
        </div>
        <div class="hot-tags">
          <span
            v-for="(item, index) in hotKeywords"
            :key="index"
            class="hot-tag"
            :class="{ 'hot-top': index < 3 }"
            @click="searchKeyword(item)"
          >
            {{ item }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="hasSearched" class="search-results">
      <div v-if="productStore.loading && productStore.products.length === 0" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="productStore.products.length === 0" class="no-result">
        <div class="empty-icon">😔</div>
        <div class="empty-text">没有找到相关商品</div>
        <div class="empty-sub">换个关键词试试吧</div>
        <div class="recommend-section">
          <div class="section-header">
            <span class="section-title">猜你喜欢</span>
          </div>
          <div class="recommend-grid">
            <ProductCard
              v-for="product in recommendProducts"
              :key="product.id"
              :product="product"
              layout="grid"
            />
          </div>
        </div>
      </div>

      <div v-else class="results-list">
        <div class="results-header">
          <span class="results-count">共找到 {{ productStore.total }} 件商品</span>
          <button class="results-back" @click="backToSearch">
            <span>←</span> 返回搜索
          </button>
        </div>
        <div class="products-grid" ref="scrollContainer" @scroll="onScroll">
          <ProductCard
            v-for="product in productStore.products"
            :key="product.id"
            :product="product"
            layout="grid"
          />
          <div v-if="productStore.loading" class="loading">
            <div class="spinner"></div>
          </div>
          <div v-if="!productStore.loading && productStore.products.length >= productStore.total" class="no-more">
            没有更多了
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useUserStore } from '@/stores/user'
import { debounce } from '@/utils'
import ProductCard from '@/components/ProductCard.vue'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const userStore = useUserStore()

const inputRef = ref(null)
const keyword = ref('')
const hotKeywords = ref([])
const suggestions = ref([])
const showSuggestions = ref(false)
const hasSearched = ref(false)
const recommendProducts = ref([])
const scrollContainer = ref(null)

onMounted(async () => {
  hotKeywords.value = await productStore.getHotKeywords()
  if (route.query.keyword) {
    keyword.value = route.query.keyword
    handleSearch()
  } else {
    nextTick(() => inputRef.value?.focus())
  }
})

const debouncedFetchSuggestions = debounce(async (val) => {
  if (!val.trim()) {
    suggestions.value = []
    return
  }
  const result = await productStore.getSearchSuggestions(val)
  suggestions.value = result.slice(0, 10)
}, 300)

function onInput() {
  showSuggestions.value = true
  hasSearched.value = false
  debouncedFetchSuggestions(keyword.value)
}

function onFocus() {
  if (suggestions.value.length) {
    showSuggestions.value = true
  }
}

function clearKeyword() {
  keyword.value = ''
  suggestions.value = []
  showSuggestions.value = false
  hasSearched.value = false
  productStore.resetProducts()
  nextTick(() => inputRef.value?.focus())
}

function selectSuggestion(item) {
  keyword.value = item
  handleSearch()
}

function searchKeyword(kw) {
  keyword.value = kw
  handleSearch()
}

async function handleSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  showSuggestions.value = false
  hasSearched.value = true
  userStore.addSearchHistory(kw)
  productStore.resetProducts()
  await productStore.fetchProducts({ keyword: kw, page: 1 })
  if (productStore.products.length === 0) {
    recommendProducts.value = await productStore.getRecommendProducts(8)
  }
}

function deleteHistory(index) {
  userStore.searchHistory.splice(index, 1)
}

function handleClearHistory() {
  userStore.clearSearchHistory()
}

function goBack() {
  if (hasSearched.value) {
    backToSearch()
  } else {
    router.back()
  }
}

function backToSearch() {
  hasSearched.value = false
  showSuggestions.value = false
  productStore.resetProducts()
  nextTick(() => inputRef.value?.focus())
}

function onScroll(e) {
  const { scrollTop, clientHeight, scrollHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    productStore.loadMore()
  }
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.search-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 var(--space-md);
  background: var(--color-bg);
  border-radius: var(--radius-full);
  gap: var(--space-xs);
}

.search-icon {
  font-size: var(--font-size-base);
  color: var(--color-text-placeholder);
}

.search-input {
  flex: 1;
  height: 100%;
  background: transparent;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.search-input::placeholder {
  color: var(--color-text-placeholder);
}

.search-clear {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  background: var(--color-border-light);
  border-radius: 50%;
}

.search-btn {
  padding: 0 var(--space-lg);
  height: 36px;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
  color: #fff;
  font-size: var(--font-size-base);
  border-radius: var(--radius-full);
  font-weight: 500;
}

.search-btn:active {
  transform: scale(0.98);
}

.suggestions-panel {
  position: sticky;
  top: calc(var(--navbar-height) + 1px);
  z-index: 99;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
  max-height: 60vh;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:active {
  background: var(--color-bg-hover);
}

.suggestion-icon {
  color: var(--color-text-placeholder);
  font-size: var(--font-size-base);
}

.suggestion-text {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.search-content {
  flex: 1;
  padding: var(--space-lg);
}

.search-section {
  margin-bottom: var(--space-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.section-action {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 2px;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.history-tag {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-card);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-light);
}

.history-text {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  cursor: pointer;
}

.history-delete {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--color-text-placeholder);
  background: var(--color-bg);
  border-radius: 50%;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.hot-tag {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-card);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
}

.hot-tag.hot-top {
  background: linear-gradient(135deg, #fff2e8, #ffe7e6);
  color: var(--color-primary);
  border-color: #ffccc7;
  font-weight: 500;
}

.hot-tag:active {
  transform: scale(0.98);
}

.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-light);
}

.results-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.results-back {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 2px;
}

.results-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.products-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
  padding: var(--space-sm);
}

.no-result {
  padding: var(--space-xxl) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--space-md);
  opacity: 0.6;
}

.empty-text {
  font-size: var(--font-size-md);
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: var(--space-xs);
}

.empty-sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xxl);
}

.recommend-section {
  width: 100%;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.no-more {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-xl);
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}

.navbar-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  color: var(--color-text);
  flex-shrink: 0;
}
</style>
