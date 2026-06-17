import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', keepAlive: true }
  },
  {
    path: '/category',
    name: 'category',
    component: () => import('@/views/Category.vue'),
    meta: { title: '分类', keepAlive: true }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductList.vue'),
    meta: { title: '商品列表', keepAlive: true }
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车', keepAlive: true }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { title: '确认订单' }
  },
  {
    path: '/order/success',
    name: 'order-success',
    component: () => import('@/views/OrderSuccess.vue'),
    meta: { title: '提交成功' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/Orders.vue'),
    meta: { title: '我的订单' }
  },
  {
    path: '/order/:id',
    name: 'order-detail',
    component: () => import('@/views/OrderDetail.vue'),
    meta: { title: '订单详情' }
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/User.vue'),
    meta: { title: '我的', keepAlive: true }
  },
  {
    path: '/user/profile',
    name: 'user-profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { title: '个人资料' }
  },
  {
    path: '/user/address',
    name: 'user-address',
    component: () => import('@/views/user/Address.vue'),
    meta: { title: '收货地址' }
  },
  {
    path: '/user/history',
    name: 'user-history',
    component: () => import('@/views/user/History.vue'),
    meta: { title: '浏览历史' }
  },
  {
    path: '/user/password',
    name: 'user-password',
    component: () => import('@/views/user/Password.vue'),
    meta: { title: '修改密码' }
  },
  {
    path: '/coupons',
    name: 'coupons',
    component: () => import('@/views/Coupons.vue'),
    meta: { title: '领券中心' }
  },
  {
    path: '/user/coupons',
    name: 'user-coupons',
    component: () => import('@/views/user/Coupons.vue'),
    meta: { title: '我的优惠券' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.meta.keepAlive && savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 轻量级电商` : '轻量级电商'
  next()
})

export default router
