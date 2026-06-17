const DB_NAME = 'vue-shop-db'
const DB_VERSION = 1
const STORES = {
  products: { keyPath: 'id' },
  history: { keyPath: 'id', autoIncrement: false },
  searchHistory: { keyPath: 'keyword' }
}

let db = null
let initPromise = null

export function initDB() {
  if (initPromise) return initPromise
  initPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    request.onupgradeneeded = (event) => {
      const database = event.target.result
      Object.keys(STORES).forEach(storeName => {
        if (!database.objectStoreNames.contains(storeName)) {
          const { keyPath } = STORES[storeName]
          database.createObjectStore(storeName, { keyPath })
        }
      })
    }
  })
  return initPromise
}

export function addRecord(storeName, data) {
  return new Promise(async (resolve, reject) => {
    await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function getRecord(storeName, key) {
  return new Promise(async (resolve, reject) => {
    await initDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function getAllRecords(storeName) {
  return new Promise(async (resolve, reject) => {
    await initDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function deleteRecord(storeName, key) {
  return new Promise(async (resolve, reject) => {
    await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export function clearStore(storeName) {
  return new Promise(async (resolve, reject) => {
    await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export function bulkAdd(storeName, dataList) {
  return new Promise(async (resolve, reject) => {
    await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    dataList.forEach(item => store.put(item))
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}
