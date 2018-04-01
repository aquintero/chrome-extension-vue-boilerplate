var metaTables = {
  Courses: {
    next_id: 0,
    ids: []
  },
  Assignments: {
    next_id: 0,
    ids: []
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (var key in changes) {
    var storageChange = changes[key]
    console.log(key, storageChange.oldValue, storageChange.newValue)
  }
})

class DataStore {
  constructor (store, data) {
    this.store = store
    this.data = data
  }

  set (key, value) {
    this.data[key] = value
    var change = {}
    change[key] = value
    this.store.set(change)
  }

  get (key) {
    return this.data[key]
  }

  remove (key) {
    this.store.remove(key)
  }

  hasKey (key) {
    return this.data.hasOwnProperty(key)
  }
}

class TableAPI {
  constructor (store, name) {
    this.store = store
    this.name = name
    this.metaTable = this.store.get(this.name)
  }

  add (item) {
    item.id = this.metaTable.next_id
    this.metaTable.next_id += 1
    this.metaTable.ids.push(item.id)
    this.store.set(this.name, this.metaTable)
    this.store.set(this.name + item.id, this.metaTable.setTransform(item))
  }

  update (item) {
    this.store.set(this.name + item.id, this.metaTable.setTransform(item))
  }

  reorder (items) {
    items.forEach((item) => {
      var index = this.metaTable.ids.indexOf(item.id)
      this.metaTable.ids.splice(index, 1)
      this.metaTable.ids.push(item.id)
    })
    this.store.set(this.name, this.metaTable)
  }

  remove (item) {
    var idx = this.metaTable.ids.indexOf(item.id)
    if (idx > -1) {
      this.metaTable.ids.splice(idx, 1)
    }
    this.store.remove(this.name + item.id)
    this.store.set(this.name, this.metaTable)
  }

  get (id) {
    return this.metaTable.getTransform(this.store.get(this.name + id))
  }

  getAll () {
    var items = []
    this.metaTable.ids.forEach((id) => {
      items.push(this.metaTable.getTransform(this.store.get(this.name + id)))
    })
    return items
  }
}

function init (store) {
  var api = {}

  Object.getOwnPropertyNames(metaTables).forEach((tableName) => {
    if (!store.hasKey(tableName)) {
      store.set(tableName, metaTables[tableName])
    }
    var metaTable = store.get(tableName)
    metaTable['setTransform'] = (val) => { return val }
    metaTable['getTransform'] = (val) => { return val }
    if (metaTables[tableName].hasOwnProperty('setTransform')) {
      metaTable['setTransform'] = metaTables[tableName].setTransform
    }
    if (metaTables[tableName].hasOwnProperty('getTransform')) {
      metaTable['getTransform'] = metaTables[tableName].getTransform
    }
    store.set(tableName, metaTable)
    api[tableName] = new TableAPI(store, tableName)
  })

  return api
}

export default new Promise((resolve, reject) => {
  chrome.storage.sync.get(null, (data) => {
    resolve(init(new DataStore(chrome.storage.sync, data)))
  })
})
