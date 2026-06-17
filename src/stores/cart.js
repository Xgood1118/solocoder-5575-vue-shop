import { defineStore } from 'pinia'
import { showToast } from '@/utils'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    invalidItems: []
  }),
  getters: {
    validItems: (state) => state.items.filter(item => item.stock > 0),
    selectedItems: (state) => state.items.filter(item => item.checked && item.stock > 0),
    selectedCount: (state) => {
      return state.items
        .filter(item => item.checked && item.stock > 0)
        .reduce((sum, item) => sum + item.quantity, 0)
    },
    selectedAmount: (state) => {
      return state.items
        .filter(item => item.checked && item.stock > 0)
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    allChecked: (state) => {
      const validItems = state.items.filter(item => item.stock > 0)
      if (validItems.length === 0) return false
      return validItems.every(item => item.checked)
    },
    totalCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0)
  },
  actions: {
    addToCart(product, sku, quantity = 1) {
      if (!product || !sku) {
        showToast('请选择规格')
        return false
      }
      if (sku.stock <= 0) {
        showToast('该商品已售罄')
        return false
      }
      const existIdx = this.items.findIndex(
        item => item.productId === product.id && item.skuId === sku.id
      )
      if (existIdx >= 0) {
        const newQty = this.items[existIdx].quantity + quantity
        if (newQty > sku.stock) {
          showToast(`库存不足，最多可购买${sku.stock}件`)
          return false
        }
        this.items[existIdx].quantity = newQty
      } else {
        if (quantity > sku.stock) {
          showToast(`库存不足，最多可购买${sku.stock}件`)
          return false
        }
        this.items.push({
          id: product.id + '-' + sku.id,
          productId: product.id,
          skuId: sku.id,
          name: product.name,
          brandName: product.brandName,
          image: sku.image || product.mainImage,
          price: sku.price,
          originalPrice: product.originalPrice,
          quantity,
          stock: sku.stock,
          skuSpec: sku.spec,
          checked: true,
          addedAt: Date.now()
        })
      }
      showToast('已加入购物车')
      return true
    },
    updateQuantity(id, quantity) {
      const idx = this.items.findIndex(item => item.id === id)
      if (idx < 0) return false
      const item = this.items[idx]
      if (quantity > item.stock) {
        showToast(`库存不足，最多可购买${item.stock}件`)
        return false
      }
      if (quantity < 1) {
        this.removeItem(id)
        return true
      }
      this.items[idx].quantity = quantity
      return true
    },
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id)
    },
    toggleCheck(id) {
      const idx = this.items.findIndex(item => item.id === id)
      if (idx >= 0 && this.items[idx].stock > 0) {
        this.items[idx].checked = !this.items[idx].checked
      }
    },
    toggleAllCheck() {
      const allChecked = this.allChecked
      this.items.forEach(item => {
        if (item.stock > 0) {
          item.checked = !allChecked
        }
      })
    },
    clearSelected() {
      this.items = this.items.filter(item => !item.checked)
    },
    clearCart() {
      this.items = []
    },
    clearInvalid() {
      this.items = this.items.filter(item => item.stock > 0)
    }
  },
  persist: {
    key: 'cart-store',
    storage: localStorage,
    paths: ['items']
  }
})
