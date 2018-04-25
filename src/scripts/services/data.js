import moment from 'moment'
import * as firebase from 'firebase'
import 'firebase/firestore'

var metaTables = [
  { name: 'Courses', ordered: true },
  { name: 'Assignments', ordered: true },
  { name: 'AssignmentItems', ordered: true }
]

var db = firebase.firestore()

class TableAPI {
  constructor (name, ordered) {
    this.name = name
    this.ordered = ordered
    if (this.ordered) {
      this.nextOrder = 0
      this.getMeta('nextOrder').then((nextOrder) => {
        if (nextOrder.exists) {
          this.nextOrder = nextOrder.data().nextOrder
        }
      })
    }
  }

  add (item) {
    return new Promise((resolve, reject) => {
      Object.assign(item, {
        _date_created: moment().toDate(),
        _date_modified: moment().toDate(),
        _uid: firebase.auth().currentUser.uid
      })
      if (this.ordered) {
        Object.assign(item, {
          _order: this.nextOrder
        })
        this.nextOrder += 1
        this.setMeta('nextOrder', { nextOrder: this.nextOrder })
      }
      db.collection(this.name).add(item).then((doc) => {
        item.id = doc.id
        resolve(item)
      })
    })
  }

  update (item) {
    return new Promise((resolve, reject) => {
      item._date_modified = moment().toDate()
      var itemCopy = Object.assign({}, item)
      delete itemCopy.id
      db.collection(this.name).doc(item.id).update(itemCopy).then((updatedItem) => {
        resolve(updatedItem)
      })
    })
  }

  remove (item) {
    return new Promise((resolve, reject) => {
      db.collection(this.name).doc(item.id).delete().then(() => {
        resolve()
      })
    })
  }

  get (id) {
    return new Promise((resolve, reject) => {
      db.collection(this.name).doc(id).get().then((doc) => {
        var item = doc.data()
        item.id = doc.id
        resolve(item)
      })
    })
  }

  getAll () {
    return new Promise((resolve, reject) => {
      var query = db.collection(this.name).where('_uid', '==', firebase.auth().currentUser.uid)
      if (this.ordered) {
        query = query.orderBy('_order')
      }
      query.get().then((docs) => {
        var items = []
        docs.forEach((doc) => {
          var item = doc.data()
          item.id = doc.id
          items.push(item)
        })
        resolve(items)
      })
    })
  }

  getWhere (column, comparison, value) {
    if (column === 'id') {
      column = firebase.firestore.FieldPath.documentId()
    }
    return new Promise((resolve, reject) => {
      var query = db.collection(this.name).where('_uid', '==', firebase.auth().currentUser.uid).where(column, comparison, value)
      if (this.ordered) {
        query = query.orderBy('_order')
      }
      query.get().then((docs) => {
        var items = []
        docs.forEach((doc) => {
          var item = doc.data()
          item.id = doc.id
          items.push(item)
        })
        resolve(items)
      })
    })
  }

  reorder (items, fromIndex, toIndex) {
    if (!this.ordered) {
      return
    }
    var sortedItems = items.slice().sort((item1, item2) => item1._order - item2._order)
    var fromOrder = sortedItems[fromIndex]._order
    var toOrder = sortedItems[toIndex]._order
    return new Promise((resolve, reject) => {
      var filteredItems = items.filter((item) => item._order >= Math.min(fromOrder, toOrder) && item._order <= Math.max(fromOrder, toOrder))
      filteredItems.sort((item1, item2) => item1._order - item2._order)
      if (fromOrder < toOrder) {
        filteredItems.reverse()
      }
      var updates = []
      for (var i = 1; i < filteredItems.length; i++) {
        filteredItems[i - 1]._order = filteredItems[i]._order
        updates.push(this.update(filteredItems[i - 1]))
      }
      filteredItems[filteredItems.length - 1]._order = toOrder
      updates.push(this.update(filteredItems[filteredItems.length - 1]))
      Promise.all(updates).then(() => {
        resolve(items)
      })
    })
  }

  setMeta (prop, value) {
    return new Promise((resolve, reject) => {
      db.collection('meta_' + this.name).doc(prop).set(value, { merge: true }).then((setValue) => {
        resolve(setValue)
      })
    })
  }

  getMeta (prop) {
    return new Promise((resolve, reject) => {
      db.collection('meta_' + this.name).doc(prop).get().then((value) => {
        resolve(value)
      })
    })
  }
}

var api = {}

metaTables.forEach((table) => {
  api[table.name] = new TableAPI(table.name, table.ordered)
})

api.AssignmentItemTypes = [
  {
    name: 'Group',
    markdown: false,
    props: [
      { name: 'Name', required: true }
    ],
    levels: [
      'Root'
    ],
    expandable: true
  },
  {
    name: 'Criterion',
    markdown: '## {Name}',
    props: [
      { name: 'Name', required: true },
      { name: 'Standard', required: false }
    ],
    levels: [
      'Root',
      'Group'
    ],
    expandable: true
  },
  {
    name: 'Sub Criterion',
    markdown: '#### {Name}',
    props: [
      { name: 'Name', required: true },
      { name: 'Standard', required: false }
    ],
    levels: [
      'Criterion'
    ],
    expandable: true
  },
  {
    name: 'Diagnosis',
    markdown: '* {feedback}',
    props: [
      { name: 'Name', required: true },
      { name: 'Feedback', required: false }
    ],
    levels: [
      'Criterion',
      'Sub Criterion'
    ]
  }
]

export default api
