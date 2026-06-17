import { delay } from '@/utils'

let mockProducts = []
let mockCategories = []
let mockBrands = []
let mockBanners = []
let mockCoupons = []
let mockAddresses = []
let mockShippingMethods = []
let mockInvoiceTypes = []
let hotSearchKeywords = []
let mockAutoReplies = []

async function loadMockData() {
  const data = await import('./data.js')
  mockProducts = data.mockProducts
  mockCategories = data.mockCategories
  mockBrands = data.mockBrands
  mockBanners = data.mockBanners
  mockCoupons = data.mockCoupons
  mockAddresses = data.mockAddresses
  mockShippingMethods = data.mockShippingMethods
  mockInvoiceTypes = data.mockInvoiceTypes
  hotSearchKeywords = data.hotSearchKeywords
  mockAutoReplies = data.mockAutoReplies
}

export async function initMSW() {
  await loadMockData()
  return true
}

function response(data, success = true, message = '') {
  return {
    code: success ? 200 : 500,
    data,
    message
  }
}

export const api = {
  async getBanners() {
    await delay(200, 500)
    return response(mockBanners)
  },

  async getCategories() {
    await delay(200, 500)
    return response(mockCategories)
  },

  async getBrands() {
    await delay(200, 500)
    return response(mockBrands)
  },

  async getProducts(params = {}) {
    await delay(300, 800)
    let list = [...mockProducts]
    if (params.categoryId) {
      list = list.filter(p => p.categoryId === params.categoryId)
    }
    if (params.brandId) {
      list = list.filter(p => p.brandId === params.brandId)
    }
    if (params.tag) {
      list = list.filter(p => p.tags.includes(params.tag))
    }
    if (params.minPrice !== undefined) {
      list = list.filter(p => p.price >= params.minPrice)
    }
    if (params.maxPrice !== undefined) {
      list = list.filter(p => p.price <= params.maxPrice)
    }
    if (params.minRating !== undefined) {
      list = list.filter(p => p.rating >= params.minRating)
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw) ||
        p.brandName.toLowerCase().includes(kw) ||
        p.tags.some(t => t.toLowerCase().includes(kw))
      )
    }
    if (params.sort) {
      switch (params.sort) {
        case 'sales': list.sort((a, b) => b.sales - a.sales); break
        case 'price-asc': list.sort((a, b) => a.price - b.price); break
        case 'price-desc': list.sort((a, b) => b.price - a.price); break
        case 'new': list.sort((a, b) => b.createdAt - a.createdAt); break
        case 'rating': list.sort((a, b) => b.rating - a.rating); break
      }
    }
    const total = list.length
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const start = (page - 1) * pageSize
    const items = list.slice(start, start + pageSize)
    return response({ items, total, page, pageSize })
  },

  async getProductDetail(id) {
    await delay(300, 600)
    const product = mockProducts.find(p => p.id === id)
    if (!product) return response(null, false, '商品不存在')
    return response(product)
  },

  async getRecommendProducts(count = 8) {
    await delay(200, 500)
    const shuffled = [...mockProducts].sort(() => Math.random() - 0.5)
    return response(shuffled.slice(0, count))
  },

  async getNewUserProducts() {
    await delay(200, 500)
    return response(mockProducts.filter(p => p.isNewUser).slice(0, 6))
  },

  async getSeckillProducts() {
    await delay(200, 500)
    return response(mockProducts.filter(p => p.isSeckill))
  },

  async getCoupons() {
    await delay(300, 500)
    return response(mockCoupons)
  },

  async receiveCoupon(couponId) {
    await delay(500, 1000)
    const coupon = mockCoupons.find(c => c.id === couponId)
    if (!coupon) return response(null, false, '优惠券不存在')
    if (coupon.received >= coupon.stock) return response(null, false, '优惠券已领完')
    coupon.received++
    return response({ ...coupon })
  },

  async getAddresses() {
    await delay(300, 500)
    return response(mockAddresses)
  },

  async addAddress(address) {
    await delay(500, 1000)
    const newAddr = { ...address, id: 'addr' + Date.now() }
    if (newAddr.isDefault) {
      mockAddresses.forEach(a => a.isDefault = false)
    }
    if (mockAddresses.length === 0) newAddr.isDefault = true
    mockAddresses.push(newAddr)
    return response(newAddr)
  },

  async updateAddress(address) {
    await delay(500, 1000)
    const idx = mockAddresses.findIndex(a => a.id === address.id)
    if (idx < 0) return response(null, false, '地址不存在')
    if (address.isDefault) {
      mockAddresses.forEach(a => a.isDefault = false)
    }
    mockAddresses[idx] = { ...mockAddresses[idx], ...address }
    return response(mockAddresses[idx])
  },

  async deleteAddress(id) {
    await delay(500, 1000)
    const idx = mockAddresses.findIndex(a => a.id === id)
    if (idx < 0) return response(null, false, '地址不存在')
    mockAddresses.splice(idx, 1)
    return response(true)
  },

  async setDefaultAddress(id) {
    await delay(300, 600)
    mockAddresses.forEach(a => a.isDefault = a.id === id)
    return response(true)
  },

  async getShippingMethods() {
    await delay(200, 400)
    return response(mockShippingMethods)
  },

  async getInvoiceTypes() {
    await delay(200, 400)
    return response(mockInvoiceTypes)
  },

  async createOrder(orderData) {
    await delay(800, 2000)
    const orderNo = 'SO' + Date.now()
    const order = {
      id: orderNo,
      orderNo,
      ...orderData,
      status: 'pending',
      statusText: '待付款',
      createdAt: Date.now(),
      tracking: [
        { time: Date.now(), status: '订单提交成功', desc: '订单已提交，请尽快付款' }
      ]
    }
    const orders = JSON.parse(localStorage.getItem('mock-orders') || '[]')
    orders.unshift(order)
    localStorage.setItem('mock-orders', JSON.stringify(orders))
    return response(order)
  },

  async getOrders(status = 'all') {
    await delay(300, 600)
    const orders = JSON.parse(localStorage.getItem('mock-orders') || '[]')
    const sampleOrders = [
      {
        id: 'SO20240115001',
        orderNo: 'SO20240115001',
        status: 'paid',
        statusText: '待发货',
        items: mockProducts.slice(0, 2).map(p => ({
          productId: p.id,
          name: p.name,
          image: p.mainImage,
          price: p.price,
          quantity: 1,
          skuSpec: p.skus[0]?.spec || {}
        })),
        totalAmount: 1299,
        createdAt: Date.now() - 3 * 86400000,
        tracking: [
          { time: Date.now() - 3 * 86400000, status: '订单提交成功', desc: '订单已提交' },
          { time: Date.now() - 3 * 86400000 + 3600000, status: '支付成功', desc: '付款成功' },
          { time: Date.now() - 2 * 86400000, status: '仓库处理中', desc: '商品正在准备发货' }
        ]
      },
      {
        id: 'SO20240110002',
        orderNo: 'SO20240110002',
        status: 'shipped',
        statusText: '待收货',
        items: mockProducts.slice(2, 4).map(p => ({
          productId: p.id,
          name: p.name,
          image: p.mainImage,
          price: p.price,
          quantity: 2,
          skuSpec: p.skus[0]?.spec || {}
        })),
        totalAmount: 2598,
        createdAt: Date.now() - 7 * 86400000,
        tracking: [
          { time: Date.now() - 7 * 86400000, status: '订单提交成功', desc: '订单已提交' },
          { time: Date.now() - 7 * 86400000 + 3600000, status: '支付成功', desc: '付款成功' },
          { time: Date.now() - 6 * 86400000, status: '已发货', desc: '顺丰速运：SF1234567890，包裹已从仓库发出' },
          { time: Date.now() - 5 * 86400000, status: '运输中', desc: '包裹已到达【北京转运中心】' },
          { time: Date.now() - 1 * 86400000, status: '派送中', desc: '快递员正在为您派送，请保持电话畅通' }
        ]
      },
      {
        id: 'SO20240105003',
        orderNo: 'SO20240105003',
        status: 'completed',
        statusText: '已完成',
        items: mockProducts.slice(4, 5).map(p => ({
          productId: p.id,
          name: p.name,
          image: p.mainImage,
          price: p.price,
          quantity: 1,
          skuSpec: p.skus[0]?.spec || {}
        })),
        totalAmount: 699,
        createdAt: Date.now() - 15 * 86400000,
        tracking: [
          { time: Date.now() - 15 * 86400000, status: '订单提交成功', desc: '订单已提交' },
          { time: Date.now() - 15 * 86400000 + 3600000, status: '支付成功', desc: '付款成功' },
          { time: Date.now() - 14 * 86400000, status: '已发货', desc: '顺丰速运：SF0987654321' },
          { time: Date.now() - 12 * 86400000, status: '已签收', desc: '包裹已签收，感谢您的购买' }
        ]
      },
      {
        id: 'SO20240101004',
        orderNo: 'SO20240101004',
        status: 'cancelled',
        statusText: '已取消',
        items: mockProducts.slice(5, 6).map(p => ({
          productId: p.id,
          name: p.name,
          image: p.mainImage,
          price: p.price,
          quantity: 1,
          skuSpec: p.skus[0]?.spec || {}
        })),
        totalAmount: 399,
        createdAt: Date.now() - 20 * 86400000,
        tracking: [
          { time: Date.now() - 20 * 86400000, status: '订单提交成功', desc: '订单已提交' },
          { time: Date.now() - 19 * 86400000, status: '订单已取消', desc: '订单超时未付款，已自动取消' }
        ]
      }
    ]
    const allOrders = [...orders, ...sampleOrders]
    if (status === 'all') return response(allOrders)
    return response(allOrders.filter(o => o.status === status))
  },

  async getOrderDetail(id) {
    await delay(300, 600)
    const orders = JSON.parse(localStorage.getItem('mock-orders') || '[]')
    const order = orders.find(o => o.id === id)
    if (!order) return response(null, false, '订单不存在')
    return response(order)
  },

  async cancelOrder(id) {
    await delay(500, 1000)
    const orders = JSON.parse(localStorage.getItem('mock-orders') || '[]')
    const idx = orders.findIndex(o => o.id === id)
    if (idx >= 0) {
      orders[idx].status = 'cancelled'
      orders[idx].statusText = '已取消'
      orders[idx].tracking = orders[idx].tracking || []
      orders[idx].tracking.push({ time: Date.now(), status: '订单已取消', desc: '用户主动取消订单' })
      localStorage.setItem('mock-orders', JSON.stringify(orders))
    }
    return response(true)
  },

  async confirmOrder(id) {
    await delay(500, 1000)
    const orders = JSON.parse(localStorage.getItem('mock-orders') || '[]')
    const idx = orders.findIndex(o => o.id === id)
    if (idx >= 0) {
      orders[idx].status = 'completed'
      orders[idx].statusText = '已完成'
      orders[idx].tracking = orders[idx].tracking || []
      orders[idx].tracking.push({ time: Date.now(), status: '已签收', desc: '用户确认收货，订单完成' })
      localStorage.setItem('mock-orders', JSON.stringify(orders))
    }
    return response(true)
  },

  async payOrder(id) {
    await delay(800, 2000)
    const success = Math.random() > 0.2
    if (success) {
      const orders = JSON.parse(localStorage.getItem('mock-orders') || '[]')
      const idx = orders.findIndex(o => o.id === id)
      if (idx >= 0) {
        orders[idx].status = 'paid'
        orders[idx].statusText = '待发货'
        orders[idx].paidAt = Date.now()
        orders[idx].tracking = orders[idx].tracking || []
        orders[idx].tracking.push({ time: Date.now(), status: '支付成功', desc: '付款成功，等待商家发货' })
        localStorage.setItem('mock-orders', JSON.stringify(orders))
      }
    }
    return response({ success })
  },

  async getHotKeywords() {
    await delay(100, 300)
    return response(hotSearchKeywords)
  },

  async getSearchSuggestions(keyword) {
    await delay(100, 300)
    if (!keyword) return response([])
    const kw = keyword.toLowerCase()
    const suggestions = []
    mockProducts.forEach(p => {
      if (p.name.toLowerCase().includes(kw) && suggestions.length < 8) {
        suggestions.push(p.name)
      }
    })
    hotSearchKeywords.forEach(k => {
      if (k.toLowerCase().includes(kw) && !suggestions.includes(k) && suggestions.length < 10) {
        suggestions.push(k)
      }
    })
    return response(suggestions)
  },

  async getAutoReply() {
    await delay(500, 1200)
    const reply = mockAutoReplies[Math.floor(Math.random() * mockAutoReplies.length)]
    return response({ content: reply, time: Date.now(), isBot: true })
  }
}
