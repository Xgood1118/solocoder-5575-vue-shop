import { defineStore } from 'pinia'
import { api } from '@/mock'

export const useProductStore = defineStore('product', {
  state: () => ({
    banners: [],
    categories: [],
    brands: [],
    products: [],
    total: 0,
    loading: false,
    detail: null,
    detailLoading: false,
    currentParams: {
      keyword: '',
      categoryId: '',
      brandId: '',
      tag: '',
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      sort: '',
      page: 1,
      pageSize: 20
    }
  }),
  actions: {
    async fetchBanners() {
      if (this.banners.length > 0) return
      const res = await api.getBanners()
      if (res.code === 200) this.banners = res.data
    },
    async fetchCategories() {
      if (this.categories.length > 0) return
      const res = await api.getCategories()
      if (res.code === 200) this.categories = res.data
    },
    async fetchBrands() {
      if (this.brands.length > 0) return
      const res = await api.getBrands()
      if (res.code === 200) this.brands = res.data
    },
    async fetchProducts(params = {}) {
      this.loading = true
      this.currentParams = { ...this.currentParams, ...params }
      try {
        const res = await api.getProducts(this.currentParams)
        if (res.code === 200) {
          if (this.currentParams.page === 1) {
            this.products = res.data.items
          } else {
            this.products = [...this.products, ...res.data.items]
          }
          this.total = res.data.total
        }
      } finally {
        this.loading = false
      }
    },
    async loadMore() {
      if (this.loading || this.products.length >= this.total) return
      this.currentParams.page++
      await this.fetchProducts()
    },
    resetProducts() {
      this.currentParams.page = 1
      this.products = []
      this.total = 0
    },
    async fetchProductDetail(id) {
      this.detailLoading = true
      this.detail = null
      try {
        const res = await api.getProductDetail(id)
        if (res.code === 200) {
          this.detail = res.data
        }
      } finally {
        this.detailLoading = false
      }
    },
    async getRecommendProducts(count = 8) {
      const res = await api.getRecommendProducts(count)
      if (res.code === 200) return res.data
      return []
    },
    async getSeckillProducts() {
      const res = await api.getSeckillProducts()
      if (res.code === 200) return res.data
      return []
    },
    async getNewUserProducts() {
      const res = await api.getNewUserProducts()
      if (res.code === 200) return res.data
      return []
    },
    async getHotKeywords() {
      const res = await api.getHotKeywords()
      if (res.code === 200) return res.data
      return []
    },
    async getSearchSuggestions(keyword) {
      const res = await api.getSearchSuggestions(keyword)
      if (res.code === 200) return res.data
      return []
    }
  }
})
