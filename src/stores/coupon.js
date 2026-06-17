import { defineStore } from 'pinia'
import { api } from '@/mock'
import { showToast } from '@/utils'

export const useCouponStore = defineStore('coupon', {
  state: () => ({
    availableCoupons: [],
    myCoupons: [],
    loading: false
  }),
  getters: {
    usableCoupons: (state) => state.myCoupons.filter(c => Date.now() < c.endTime)
  },
  actions: {
    async fetchAvailableCoupons() {
      this.loading = true
      try {
        const res = await api.getCoupons()
        if (res.code === 200) {
          const receivedIds = this.myCoupons.map(c => c.id)
          this.availableCoupons = res.data.filter(c => !receivedIds.includes(c.id))
        }
      } finally {
        this.loading = false
      }
    },
    async receiveCoupon(couponId) {
      const res = await api.receiveCoupon(couponId)
      if (res.code === 200) {
        this.myCoupons.push({ ...res.data, receivedAt: Date.now(), used: false })
        this.availableCoupons = this.availableCoupons.filter(c => c.id !== couponId)
        showToast('领取成功')
        return true
      }
      showToast(res.message || '领取失败')
      return false
    },
    getBestCoupon(totalAmount, categoryIds = []) {
      let best = null
      let bestDiscount = 0
      this.usableCoupons.forEach(coupon => {
        if (totalAmount < coupon.minAmount) return
        if (coupon.categoryIds && coupon.categoryIds.length > 0) {
          const hasMatch = categoryIds.some(cid => coupon.categoryIds.includes(cid))
          if (!hasMatch) return
        }
        let discount = 0
        if (coupon.type === 'amount') {
          discount = coupon.value
        } else if (coupon.type === 'discount') {
          discount = totalAmount * (1 - coupon.value)
        }
        if (discount > bestDiscount) {
          bestDiscount = discount
          best = { ...coupon, discountAmount: discount }
        }
      })
      return best
    }
  },
  persist: {
    key: 'coupon-store',
    storage: localStorage,
    paths: ['myCoupons']
  }
})
