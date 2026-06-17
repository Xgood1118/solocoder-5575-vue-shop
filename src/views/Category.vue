<template>
  <div class="category-page app-container">
    <div class="category-navbar navbar">
      <div class="navbar-title">全部分类</div>
    </div>

    <div class="category-body">
      <div class="category-sidebar">
        <div
          v-for="category in productStore.categories"
          :key="category.id"
          class="sidebar-item"
          :class="{ active: activeCategoryId === category.id }"
          @click="selectCategory(category.id)"
        >
          <span class="sidebar-icon">{{ category.icon }}</span>
          <span class="sidebar-name">{{ category.name }}</span>
        </div>
      </div>

      <div class="category-content">
        <div v-if="activeCategory" class="content-inner">
          <div class="category-banner">
            <img :src="activeCategory.banner" :alt="activeCategory.name" />
            <div class="banner-overlay">
              <span class="banner-title">{{ activeCategory.name }}</span>
            </div>
          </div>

          <div v-if="categoryBrands.length > 0" class="category-brands">
            <div class="brands-header">热门品牌</div>
            <div class="brands-grid">
              <div
                v-for="brand in categoryBrands"
                :key="brand.id"
                class="brand-card"
                @click="goBrandProducts(brand.id)"
              >
                <div class="brand-card-logo">{{ brand.logo }}</div>
                <div class="brand-card-name">{{ brand.name }}</div>
              </div>
            </div>
          </div>

          <div class="category-products">
            <div class="products-header">
              <span class="products-title">精选商品</span>
              <span class="products-count">共 {{ categoryProducts.length }} 件</span>
            </div>
            <div v-if="categoryProducts.length > 0" class="products-grid">
              <div v-for="product in categoryProducts" :key="product.id" class="product-item">
                <ProductCard :product="product" layout="waterfall" />
              </div>
            </div>
            <div v-else class="empty">
              <div class="empty-icon">📦</div>
              <div>暂无商品</div>
            </div>
          </div>
        </div>
        <div v-else class="empty">
          <div class="empty-icon">📂</div>
          <div>请选择分类</div>
        </div>
      </div>
    </div>

    <Tabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'
import Tabbar from '@/components/Tabbar.vue'

const router = useRouter()
const productStore = useProductStore()

const activeCategoryId = ref('')

const activeCategory = computed(() => {
  return productStore.categories.find(c => c.id === activeCategoryId.value) || null
})

const categoryBrands = computed(() => {
  if (!activeCategoryId.value) return []
  return productStore.brands.filter(b => b.categoryIds.includes(activeCategoryId.value))
})

const categoryProducts = computed(() => {
  if (!activeCategoryId.value) return []
  return productStore.products.filter(p => p.categoryId === activeCategoryId.value)
})

function selectCategory(id) {
  activeCategoryId.value = id
}

function goBrandProducts(brandId) {
  router.push({ name: 'products', query: { brand: brandId, category: activeCategoryId.value } })
}

onMounted(async () => {
  await Promise.all([
    productStore.fetchCategories(),
    productStore.fetchBrands(),
    productStore.fetchProducts({ page: 1, pageSize: 100 })
  ])

  if (productStore.categories.length > 0) {
    activeCategoryId.value = productStore.categories[0].id
  }
})
</script>

<style scoped>
.category-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
}

.category-navbar {
  flex-shrink: 0;
}

.category-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding-bottom: var(--tabbar-height);
}

.category-sidebar {
  width: 96px;
  flex-shrink: 0;
  background: var(--color-bg-card);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.category-sidebar::-webkit-scrollbar {
  display: none;
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-md) var(--space-sm);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--color-border-light);
}

.sidebar-item.active {
  background: var(--color-bg);
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
}

.sidebar-icon {
  font-size: 22px;
  line-height: 1;
}

.sidebar-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.2;
}

.sidebar-item.active .sidebar-name {
  color: var(--color-primary);
  font-weight: 600;
}

.category-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--color-bg);
}

.category-content::-webkit-scrollbar {
  display: none;
}

.content-inner {
  padding: var(--space-md);
}

.category-banner {
  position: relative;
  width: 100%;
  padding-top: 30%;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.category-banner img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 var(--space-lg);
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.4), transparent);
}

.banner-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: #fff;
}

.category-brands {
  margin-top: var(--space-lg);
  padding: var(--space-md);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
}

.brands-header {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.brand-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
}

.brand-card-logo {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-primary);
}

.brand-card-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.category-products {
  margin-top: var(--space-lg);
}

.products-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-sm) var(--space-md);
}

.products-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
}

.products-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.product-item {
  width: 100%;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xxl) * 3;
  color: var(--color-text-placeholder);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--space-md);
  opacity: 0.5;
}
</style>
