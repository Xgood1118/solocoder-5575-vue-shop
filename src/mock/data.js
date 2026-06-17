import { createImageUrl, randomInt } from '@/utils'

const categories = [
  { id: 'c1', name: '手机数码', icon: '📱', banner: createImageUrl('手机数码产品banner科技感蓝色渐变', 'landscape_16_9') },
  { id: 'c2', name: '服装鞋帽', icon: '👕', banner: createImageUrl('服装鞋帽banner时尚潮流', 'landscape_16_9') },
  { id: 'c3', name: '家用电器', icon: '🏠', banner: createImageUrl('家用电器banner温馨家庭', 'landscape_16_9') },
  { id: 'c4', name: '美妆护肤', icon: '💄', banner: createImageUrl('美妆护肤banner粉色浪漫', 'landscape_16_9') },
  { id: 'c5', name: '食品生鲜', icon: '🍎', banner: createImageUrl('食品生鲜banner绿色健康', 'landscape_16_9') },
  { id: 'c6', name: '母婴用品', icon: '👶', banner: createImageUrl('母婴用品banner温馨可爱', 'landscape_16_9') },
  { id: 'c7', name: '运动户外', icon: '⚽', banner: createImageUrl('运动户外banner活力橙色', 'landscape_16_9') },
  { id: 'c8', name: '图书文具', icon: '📚', banner: createImageUrl('图书文具banner文化知识', 'landscape_16_9') },
  { id: 'c9', name: '家居生活', icon: '🛋️', banner: createImageUrl('家居生活banner温馨舒适', 'landscape_16_9') },
  { id: 'c10', name: '汽车用品', icon: '🚗', banner: createImageUrl('汽车用品banner科技感', 'landscape_16_9') }
]

const brands = [
  { id: 'b1', name: '华为', logo: 'HUAWEI', categoryIds: ['c1'] },
  { id: 'b2', name: '小米', logo: 'XIAOMI', categoryIds: ['c1', 'c3'] },
  { id: 'b3', name: '苹果', logo: 'APPLE', categoryIds: ['c1'] },
  { id: 'b4', name: '耐克', logo: 'NIKE', categoryIds: ['c2', 'c7'] },
  { id: 'b5', name: '阿迪达斯', logo: 'ADIDAS', categoryIds: ['c2', 'c7'] },
  { id: 'b6', name: '优衣库', logo: 'UNIQLO', categoryIds: ['c2'] },
  { id: 'b7', name: '海尔', logo: 'HAIER', categoryIds: ['c3'] },
  { id: 'b8', name: '美的', logo: 'MIDEA', categoryIds: ['c3'] },
  { id: 'b9', name: '兰蔻', logo: 'LANCOME', categoryIds: ['c4'] },
  { id: 'b10', name: '雅诗兰黛', logo: 'ESTEE LAUDER', categoryIds: ['c4'] }
]

const productNames = [
  { category: 'c1', names: ['5G智能手机 Pro', '真无线蓝牙耳机', '智能手表运动版', '平板电脑12英寸', '笔记本电脑轻薄本', '智能音箱旗舰版', '机械键盘RGB', '游戏鼠标无线', '充电宝20000mAh', '高清摄像头4K'] },
  { category: 'c2', names: ['纯棉短袖T恤男', '修身牛仔裤女', '运动休闲鞋情侣款', '羽绒服保暖冬季', '连衣裙夏季新款', '连帽卫衣外套', '休闲西裤商务', '针织衫毛衣', '棒球帽潮流', '运动袜5双装'] },
  { category: 'c3', names: ['变频空调1.5匹', '对开门冰箱500L', '滚筒洗衣机10kg', '4K智能电视65寸', '吸尘器无线手持', '电饭煲IH加热', '空气净化器除甲醛', '微波炉光波一体', '电风扇落地静音', '电热水器60L'] },
  { category: 'c4', names: ['精华液50ml补水', '面霜保湿滋润', '口红丝绒哑光', '粉底液持妆遮瑕', '面膜10片装', '防晒霜SPF50+', '卸妆油深层清洁', '眼霜抗皱紧致', '香水淡香50ml', '腮红自然裸妆'] },
  { category: 'c5', names: ['新鲜水果礼盒5斤', '有机蔬菜套装', '澳洲进口牛排', '东海大黄鱼', '五常大米5kg', '西班牙进口橄榄油', '云南小粒咖啡豆', '明前龙井茶叶', '混合坚果每日坚果', '纯牛奶24盒'] },
  { category: 'c6', names: ['婴幼儿奶粉3段', '纸尿裤XL码50片', '婴儿推车轻便折叠', '宝宝餐椅多功能', '儿童积木玩具', '婴儿洗衣液2L', '宝宝润肤乳', '儿童安全座椅', '孕妇装连衣裙', '婴儿湿巾80抽'] },
  { category: 'c7', names: ['跑步鞋缓震透气', '瑜伽垫加厚防滑', '哑铃可调节套装', '篮球比赛用球7号', '羽毛球拍碳素超轻', '运动速干T恤男', '骑行头盔安全防护', '登山包40L大容量', '游泳镜防雾高清', '跳绳计数智能'] },
  { category: 'c8', names: ['钢笔礼盒装', '笔记本A5加厚', '中性笔0.5黑色', '双肩包商务通勤', '文具盒多功能', '彩色铅笔36色', '文件夹A4透明', '计算器科学函数', '台灯护眼学习', '书签金属'] },
  { category: 'c9', names: ['乳胶枕头护颈', '四件套纯棉床单', '记忆棉床垫', '智能马桶盖', '毛巾浴巾套装', '拖鞋家居防滑', '收纳箱塑料大号', '衣架无痕10个', '香薰蜡烛卧室', '保温杯316不锈钢'] },
  { category: 'c10', names: ['汽车坐垫四季通用', '行车记录仪高清', '车载香水香薰', '洗车水枪高压', '汽车脚垫全包围', '轮胎清洁光亮剂', '车载手机支架', '汽车玻璃水2L', '后备箱收纳箱', '汽车遮阳挡前档'] }
]

const tagsList = ['热销', '新品', '限时特惠', '包邮', '满减', '赠品', '限量', '拼团', '秒杀', '预售']

const productDescriptions = [
  '采用最新工艺打造，品质卓越，性能出众。精选优质材料，经过严格质检，确保每一件产品都达到最高标准。人性化设计，使用舒适便捷，为您的生活带来全新体验。',
  '高端品质，亲民价格。我们精选全球优质原材料，结合先进生产工艺，为您呈现物超所值的优质产品。专业团队全程把控，让您买得放心，用得舒心。',
  '匠心之作，品质之选。每一个细节都经过精心打磨，每一道工序都严格把关。我们承诺，只为给您最好的产品体验。售后服务完善，让您购物无忧。'
]

function generateProducts() {
  const products = []
  let pid = 1
  productNames.forEach(({ category, names }) => {
    const categoryBrands = brands.filter(b => b.categoryIds.includes(category))
    names.forEach((name, idx) => {
      const basePrice = randomInt(50, 2000)
      const originalPrice = Math.floor(basePrice * (1 + randomInt(10, 50) / 100))
      const brand = categoryBrands[randomInt(0, categoryBrands.length - 1)] || brands[0]
      const colors = ['黑色', '白色', '灰色', '蓝色', '红色', '金色', '银色']
      const sizes = ['S', 'M', 'L', 'XL', 'XXL', '标准']
      const skuColors = colors.slice(0, randomInt(2, 5))
      const skuSizes = sizes.slice(0, randomInt(2, 4))
      const skus = []
      skuColors.forEach(color => {
        skuSizes.forEach(size => {
          skus.push({
            id: `sku-${pid}-${color}-${size}`,
            spec: { 颜色: color, 尺寸: size },
            price: basePrice + randomInt(0, 100),
            stock: randomInt(0, 200),
            image: createImageUrl(`${name} ${color} ${size} 电商产品图 白底`, 'square')
          })
        })
      })
      const tags = []
      const tagCount = randomInt(1, 3)
      for (let i = 0; i < tagCount; i++) {
        const tag = tagsList[randomInt(0, tagsList.length - 1)]
        if (!tags.includes(tag)) tags.push(tag)
      }
      const reviews = []
      const reviewCount = randomInt(5, 50)
      const reviewTexts = ['质量很好，非常满意！', '物流很快，包装完整', '性价比很高，推荐购买', '和描述一致，不错', '下次还会再来', '客服态度很好', '颜色很正，喜欢', '手感不错，做工精细']
      for (let i = 0; i < reviewCount; i++) {
        reviews.push({
          id: `r-${pid}-${i}`,
          userId: `u${randomInt(1, 100)}`,
          userName: `用户***${randomInt(1000, 9999)}`,
          avatar: createImageUrl(`可爱头像 卡通 ${randomInt(1, 10)}`, 'square'),
          rating: randomInt(3, 5),
          content: reviewTexts[randomInt(0, reviewTexts.length - 1)],
          images: randomInt(0, 10) > 7 ? [createImageUrl(`产品实拍 ${randomInt(1, 100)}`, 'square')] : [],
          createdAt: Date.now() - randomInt(1, 30) * 86400000,
          sku: skus[randomInt(0, skus.length - 1)]?.spec || {}
        })
      }
      const averageRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      const images = [
        createImageUrl(`${name} 电商主图 高清 白底`, 'square_hd'),
        createImageUrl(`${name} 场景图 生活方式`, 'square_hd'),
        createImageUrl(`${name} 细节特写`, 'square_hd'),
        createImageUrl(`${name} 包装展示`, 'square_hd'),
        createImageUrl(`${name} 使用场景`, 'square_hd')
      ]
      products.push({
        id: `p${pid}`,
        name,
        categoryId: category,
        brandId: brand.id,
        brandName: brand.name,
        price: basePrice,
        originalPrice,
        sales: randomInt(100, 10000),
        rating: Number(averageRating),
        reviewCount,
        images,
        mainImage: images[0],
        description: productDescriptions[randomInt(0, productDescriptions.length - 1)],
        specs: {
          '品牌': brand.name,
          '商品名称': name,
          '商品编号': `NO.${100000 + pid}`,
          '商品产地': '中国大陆',
          '上架时间': new Date(Date.now() - randomInt(1, 365) * 86400000).toISOString().split('T')[0],
          '规格': `${skuColors.length}色可选 ${skuSizes.length}种尺码`,
          '材质': '优质材料'
        },
        skus,
        tags,
        isNew: tags.includes('新品') || randomInt(0, 10) > 7,
        isSeckill: tags.includes('秒杀'),
        seckillPrice: tags.includes('秒杀') ? Math.floor(basePrice * 0.5) : null,
        seckillEndTime: tags.includes('秒杀') ? Date.now() + randomInt(1, 24) * 3600000 : null,
        isNewUser: idx < 2,
        createdAt: Date.now() - randomInt(1, 180) * 86400000,
        reviews,
        isFavorite: false
      })
      pid++
    })
  })
  return products
}

export const mockProducts = generateProducts()

export const mockCategories = categories
export const mockBrands = brands

export const mockBanners = [
  { id: 'banner1', image: createImageUrl('电商首页大banner 限时促销 红色渐变 5G手机数码产品', 'landscape_16_9'), link: '/products?category=c1', title: '5G数码节' },
  { id: 'banner2', image: createImageUrl('电商首页banner 服装新品上市 时尚潮流 橙色渐变', 'landscape_16_9'), link: '/products?category=c2', title: '春夏新品' },
  { id: 'banner3', image: createImageUrl('电商首页banner 美妆护肤大促 粉色浪漫 折扣', 'landscape_16_9'), link: '/products?category=c4', title: '美妆盛典' },
  { id: 'banner4', image: createImageUrl('电商首页banner 家用电器钜惠 蓝色科技感', 'landscape_16_9'), link: '/products?category=c3', title: '家电焕新' }
]

export const mockCoupons = [
  { id: 'cp1', name: '新人专享券', type: 'amount', value: 50, minAmount: 200, desc: '满200减50', startTime: Date.now() - 86400000, endTime: Date.now() + 30 * 86400000, isNewUser: true, stock: 10000, received: 0, categoryIds: [] },
  { id: 'cp2', name: '满100减10', type: 'amount', value: 10, minAmount: 100, desc: '全品类通用', startTime: Date.now() - 86400000, endTime: Date.now() + 15 * 86400000, isNewUser: false, stock: 5000, received: 0, categoryIds: [] },
  { id: 'cp3', name: '满500减100', type: 'amount', value: 100, minAmount: 500, desc: '大额满减券', startTime: Date.now(), endTime: Date.now() + 7 * 86400000, isNewUser: false, stock: 1000, received: 0, categoryIds: [] },
  { id: 'cp4', name: '数码专享券', type: 'amount', value: 200, minAmount: 2000, desc: '手机数码类专用', startTime: Date.now(), endTime: Date.now() + 10 * 86400000, isNewUser: false, stock: 2000, received: 0, categoryIds: ['c1'] },
  { id: 'cp5', name: '服装8折券', type: 'discount', value: 0.8, minAmount: 300, desc: '服装类满300打8折', startTime: Date.now(), endTime: Date.now() + 5 * 86400000, isNewUser: false, stock: 3000, received: 0, categoryIds: ['c2'] },
  { id: 'cp6', name: '美妆9折券', type: 'discount', value: 0.9, minAmount: 200, desc: '美妆护肤类专用', startTime: Date.now(), endTime: Date.now() + 7 * 86400000, isNewUser: false, stock: 4000, received: 0, categoryIds: ['c4'] }
]

export const mockAddresses = [
  { id: 'addr1', name: '张三', phone: '13800138000', province: '北京市', city: '北京市', district: '朝阳区', detail: '建国路88号SOHO现代城A座1001室', isDefault: true },
  { id: 'addr2', name: '李四', phone: '13900139000', province: '上海市', city: '上海市', district: '浦东新区', detail: '陆家嘴环路1000号恒生银行大厦2001室', isDefault: false }
]

export const mockShippingMethods = [
  { id: 's1', name: '标准快递', desc: '3-5天送达', price: 0, freeAmount: 99 },
  { id: 's2', name: '次日达', desc: '次日送达', price: 12, freeAmount: 299 },
  { id: 's3', name: '当日达', desc: '当日送达', price: 25, freeAmount: 999 }
]

export const mockInvoiceTypes = [
  { id: 'i1', name: '不开发票', value: 'none' },
  { id: 'i2', name: '电子普通发票-个人', value: 'personal' },
  { id: 'i3', name: '电子普通发票-企业', value: 'company' }
]

export const hotSearchKeywords = ['iPhone 15', '华为Mate60', '夏季连衣裙', '空调', '防晒', '运动鞋', '面膜', '奶粉', '茶叶', '咖啡豆']

export const mockAutoReplies = [
  '您好，欢迎光临！我是智能客服小助手，有什么可以帮您的？',
  '关于商品规格、材质等信息，请查看商品详情页的"商品规格"tab哦~',
  '物流信息在下单后24小时内更新，您可以在订单详情中查看~',
  '支持7天无理由退换货，请保持商品完好哦~',
  '优惠券可在领券中心领取，下单时自动抵扣~',
  '如有其他问题，您可以拨打客服热线：400-888-8888'
]
