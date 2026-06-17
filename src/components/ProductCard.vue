<template>
  <div class="product-card" :class="[layout]" @click="goDetail">
    <div class="card-image-wrap">
      <img :src="product.mainImage" :alt="product.name" class="card-image" loading="lazy" />
      <div v-if="product.tags && product.tags.length" class="card-tags">
        <span v-for="tag in product.tags.slice(0, 2)" :key="tag" class="card-tag">{{ tag }}</span>
      </div>
      <div v-if="product.isSeckill" class="seckill-badge">秒杀</div>
    </div>
    <div class="card-content">
      <div class="card-title text-ellipsis-2">{{ product.name }}</div>
      <div class="card-brand" v-if="layout !== 'waterfall'">{{ product.brandName }}</div>
      <div class="card-bottom">
        <div class="card-price-wrap">
          <span class="price-symbol">¥</span>
          <span class="card-price">{{ formatPrice(displayPrice) }}</span>
          <span v-if="product.originalPrice > displayPrice && layout !== 'waterfall'" class="card-original">¥{{ formatPrice(product.originalPrice) }}</span>
        </div>
        <div v-if="layout !== 'list'" class="card-sales">已售{{ formatSales(product.sales) }}</div>
      </div>
      <div v-if="layout === 'list'" class="card-list-bottom">
        <div class="card-rating">
          <span class="rating-star">⭐</span>
          <span>{{ product.rating }}</span>
          <span class="card-sales">· 已售{{ formatSales(product.sales) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice } from '@/utils'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  layout: {
    type: String,
    default: 'grid'
  }
})

const router = useRouter()

const displayPrice = computed(() => {
  if (props.product.isSeckill && props.product.seckillPrice) {
    return props.product.seckillPrice
  }
  return props.product.price
})

function formatSales(sales) {
  if (sales >= 10000) return (sales / 10000).toFixed(1) + '万'
  if (sales >= 1000) return (sales / 1000).toFixed(1) + 'k'
  return sales
}

function goDetail() {
  router.push({ name: 'product-detail', params: { id: props.product.id } })
}
</script>

<style scoped>
.product-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.product-card:active {
  transform: scale(0.98);
}

.product-card.grid {
  display: flex;
  flex-direction: column;
}

.product-card.waterfall {
  display: flex;
  flex-direction: column;
}

.product-card.list {
  display: flex;
  padding: var(--space-md);
  gap: var(--space-md);
}

.card-image-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: var(--color-bg);
}

.list .card-image-wrap {
  width: 110px;
  height: 110px;
  padding-top: 0;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-tags {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  display: flex;
  gap: 4px;
}

.card-tag {
  padding: 2px 6px;
  background: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

.seckill-badge {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  padding: 2px 8px;
  background: linear-gradient(135deg, #ff6b00, #ff4d4f);
  color: #fff;
  font-size: var(--font-size-xs);
  font-weight: 600;
  border-radius: var(--radius-sm);
}

.card-content {
  flex: 1;
  padding: var(--space-sm) var(--space-md) var(--space-md);
  display: flex;
  flex-direction: column;
}

.list .card-content {
  padding: 0;
}

.card-title {
  font-size: var(--font-size-base);
  line-height: 1.4;
  color: var(--color-text);
  min-height: 2.8em;
}

.list .card-title {
  min-height: auto;
  font-size: var(--font-size-base);
}

.card-brand {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.card-bottom {
  margin-top: auto;
  padding-top: var(--space-sm);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.list .card-bottom {
  margin-top: 0;
}

.card-price-wrap {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.card-price {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.waterfall .card-price {
  font-size: var(--font-size-md);
}

.card-original {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  text-decoration: line-through;
  margin-left: 4px;
}

.card-sales {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.card-list-bottom {
  margin-top: var(--space-sm);
  display: flex;
  align-items: center;
}

.card-rating {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 2px;
}

.rating-star {
  color: #faad14;
}
</style>
