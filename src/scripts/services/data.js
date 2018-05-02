import moment from 'moment'
import * as firebase from 'firebase'
import 'firebase/firestore'

const metaTables = [
  { name: 'Courses', ordered: true },
  { name: 'Assignments', ordered: true },
  { name: 'AssignmentItems', ordered: true }
]

const db = firebase.firestore()

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

  async add (item) {
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
    let doc = await db.collection(this.name).add(item)
    item.id = doc.id
    return item
  }

  async update (item) {
    item._date_modified = moment().toDate()
    let itemCopy = Object.assign({}, item)
    delete itemCopy.id
    let updatedItem = await db.collection(this.name).doc(item.id).update(itemCopy)
    return updatedItem
  }

  async remove (item) {
    await db.collection(this.name).doc(item.id).delete()
    return item
  }

  async get (id) {
    let doc = await db.collection(this.name).doc(id).get()
    let item = doc.data()
    item.id = doc.id
    return item
  }

  async getAll () {
    let query = db.collection(this.name).where('_uid', '==', firebase.auth().currentUser.uid)
    if (this.ordered) {
      query = query.orderBy('_order')
    }
    let docs = await query.get()
    let items = []
    docs.forEach((doc) => {
      let item = doc.data()
      item.id = doc.id
      items.push(item)
    })
    return items
  }

  async getWhere (column, comparison, value) {
    if (column === 'id') {
      column = firebase.firestore.FieldPath.documentId()
    }

    let query = db.collection(this.name).where('_uid', '==', firebase.auth().currentUser.uid).where(column, comparison, value)
    if (this.ordered) {
      query = query.orderBy('_order')
    }
    let docs = await query.get()
    let items = []
    docs.forEach((doc) => {
      let item = doc.data()
      item.id = doc.id
      items.push(item)
    })
    return items
  }

  async reorder (items, fromIndex, toIndex) {
    if (!this.ordered) {
      return
    }
    let sortedItems = items.slice().sort((item1, item2) => item1._order - item2._order)
    let fromOrder = sortedItems[fromIndex]._order
    let toOrder = sortedItems[toIndex]._order
    let filteredItems = items.filter((item) => item._order >= Math.min(fromOrder, toOrder) && item._order <= Math.max(fromOrder, toOrder))
    filteredItems.sort((item1, item2) => item1._order - item2._order)
    if (fromOrder < toOrder) {
      filteredItems.reverse()
    }
    let updates = []
    for (let i = 1; i < filteredItems.length; i++) {
      filteredItems[i - 1]._order = filteredItems[i]._order
      updates.push(this.update(filteredItems[i - 1]))
    }
    filteredItems[filteredItems.length - 1]._order = toOrder
    updates.push(this.update(filteredItems[filteredItems.length - 1]))
    await Promise.all(updates)
    return items
  }

  async setMeta (prop, value) {
    let setValue = await db.collection('meta_' + this.name).doc(prop).set(value, { merge: true })
    return setValue
  }

  async getMeta (prop) {
    let value = await db.collection('meta_' + this.name).doc(prop).get()
    return value
  }
}

let api = {}

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
