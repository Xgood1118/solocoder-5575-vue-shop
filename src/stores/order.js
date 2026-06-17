import { defineStore } from 'pinia'
import { api } from '@/mock'
import { showToast } from '@/utils'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    loading: false,
    submitting: false,
    pendingOrder: null
  }),
  actions: {
    async fetchOrders(status = 'all') {
      this.loading = true
      try {
        const res = await api.getOrders(status)
        if (res.code === 200) {
          this.orders = res.data
        }
      } finally {
        this.loading = false
      }
    },
    async fetchOrderDetail(id) {
      this.loading = true
      this.currentOrder = null
      try {
        const res = await api.getOrderDetail(id)
        if (res.code === 200) {
          this.currentOrder = res.data
        }
      } finally {
        this.loading = false
      }
    },
    async createOrder(orderData) {
      this.submitting = true
      try {
        const res = await api.createOrder(orderData)
        if (res.code === 200) {
          this.currentOrder = res.data
          this.pendingOrder = res.data
          return res.data
        }
        showToast(res.message || '下单失败')
        return null
      } finally {
        this.submitting = false
      }
    },
    async cancelOrder(id) {
      const res = await api.cancelOrder(id)
      if (res.code === 200) {
        showToast('取消成功')
        const idx = this.orders.findIndex(o => o.id === id)
        if (idx >= 0) {
          this.orders[idx].status = 'cancelled'
          this.orders[idx].statusText = '已取消'
        }
        return true
      }
      showToast(res.message || '取消失败')
      return false
    },
    async confirmOrder(id) {
      const res = await api.confirmOrder(id)
      if (res.code === 200) {
        showToast('确认收货成功')
        const idx = this.orders.findIndex(o => o.id === id)
        if (idx >= 0) {
          this.orders[idx].status = 'completed'
          this.orders[idx].statusText = '已完成'
        }
        return true
      }
      showToast(res.message || '操作失败')
      return false
    },
    async payOrder(id) {
      const res = await api.payOrder(id)
      if (res.code === 200) {
        if (res.data.success) {
          showToast('支付成功')
          const idx = this.orders.findIndex(o => o.id === id)
          if (idx >= 0) {
            this.orders[idx].status = 'paid'
            this.orders[idx].statusText = '待发货'
          }
          if (this.currentOrder && this.currentOrder.id === id) {
            this.currentOrder.status = 'paid'
            this.currentOrder.statusText = '待发货'
          }
          return true
        } else {
          showToast('支付失败，请重试')
          return false
        }
      }
      showToast(res.message || '支付失败')
      return false
    },
    clearPending() {
      this.pendingOrder = null
    }
  }
})
