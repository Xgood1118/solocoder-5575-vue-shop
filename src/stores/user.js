import { defineStore } from 'pinia'
import { api } from '@/mock'
import { showToast } from '@/utils'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: true,
    userInfo: {
      id: 'u1',
      nickname: '电商用户',
      avatar: '',
      phone: '138****8000',
      email: 'user@example.com',
      points: 1280,
      level: '黄金会员',
      levelIcon: '🥇',
      registerTime: Date.now() - 180 * 86400000
    },
    addresses: [],
    history: [],
    favorites: [],
    searchHistory: [],
    loading: false
  }),
  getters: {
    defaultAddress: (state) => state.addresses.find(a => a.isDefault) || state.addresses[0] || null,
    historyProducts: (state) => state.history.slice(0, 20)
  },
  actions: {
    async fetchAddresses() {
      this.loading = true
      try {
        const res = await api.getAddresses()
        if (res.code === 200) {
          this.addresses = res.data
        }
      } finally {
        this.loading = false
      }
    },
    async addAddress(address) {
      const res = await api.addAddress(address)
      if (res.code === 200) {
        this.addresses.push(res.data)
        showToast('添加成功')
        return true
      }
      showToast(res.message || '添加失败')
      return false
    },
    async updateAddress(address) {
      const res = await api.updateAddress(address)
      if (res.code === 200) {
        const idx = this.addresses.findIndex(a => a.id === address.id)
        if (idx >= 0) this.addresses[idx] = res.data
        showToast('修改成功')
        return true
      }
      showToast(res.message || '修改失败')
      return false
    },
    async deleteAddress(id) {
      const res = await api.deleteAddress(id)
      if (res.code === 200) {
        this.addresses = this.addresses.filter(a => a.id !== id)
        showToast('删除成功')
        return true
      }
      showToast(res.message || '删除失败')
      return false
    },
    async setDefaultAddress(id) {
      const res = await api.setDefaultAddress(id)
      if (res.code === 200) {
        this.addresses.forEach(a => a.isDefault = a.id === id)
        return true
      }
      return false
    },
    updateUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info }
      showToast('保存成功')
    },
    changePassword(oldPwd, newPwd) {
      if (!oldPwd || !newPwd) {
        showToast('请填写完整信息')
        return false
      }
      if (newPwd.length < 6) {
        showToast('新密码至少6位')
        return false
      }
      showToast('密码修改成功')
      return true
    },
    addHistory(product) {
      if (!product) return
      this.history = this.history.filter(p => p.id !== product.id)
      this.history.unshift({
        id: product.id,
        name: product.name,
        image: product.mainImage,
        price: product.price,
        viewTime: Date.now()
      })
      if (this.history.length > 50) {
        this.history = this.history.slice(0, 50)
      }
    },
    clearHistory() {
      this.history = []
      showToast('已清空浏览历史')
    },
    toggleFavorite(product) {
      const idx = this.favorites.findIndex(p => p.id === product.id)
      if (idx >= 0) {
        this.favorites.splice(idx, 1)
        showToast('已取消收藏')
        return false
      } else {
        this.favorites.unshift({
          id: product.id,
          name: product.name,
          image: product.mainImage,
          price: product.price,
          addTime: Date.now()
        })
        showToast('收藏成功')
        return true
      }
    },
    isFavorite(productId) {
      return this.favorites.some(p => p.id === productId)
    },
    addSearchHistory(keyword) {
      if (!keyword) return
      this.searchHistory = this.searchHistory.filter(k => k !== keyword)
      this.searchHistory.unshift(keyword)
      if (this.searchHistory.length > 20) {
        this.searchHistory = this.searchHistory.slice(0, 20)
      }
    },
    clearSearchHistory() {
      this.searchHistory = []
    }
  },
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['userInfo', 'isLoggedIn', 'favorites', 'searchHistory']
  }
})
