<template>
  <v-container grid-list-md class="white">
    <v-layout column>
      <v-layout row justify-space-between @click="expanded = !expanded" class="pa-3">
        <v-layout>
          <div v-if="children.length > 0">
            <v-icon center v-show="!expanded">keyboard_arrow_right</v-icon>
            <v-icon v-show="expanded">keyboard_arrow_down</v-icon>
          </div>
          <div v-for="prop in type.props" v-if="prop.required" :key="prop.name">
            <v-edit-dialog :return-value.sync="item[prop.name]" lazy @click.native.stop>
              {{ item[prop.name] }}
              <v-text-field
                slot="input"
                :label="prop.name"
                v-model="item[prop.name]"
                single-line
                autofocus
                @keydown.native.enter="updateAssignmentItem(item)"
              ></v-text-field>
            </v-edit-dialog>
          </div>
        </v-layout>
        <v-layout row>
          <div v-for="prop in type.props" v-if="!prop.required" :key="prop.name">
            <v-text-field :label="prop.name" v-model="item[prop.name]">
            </v-text-field>
          </div>
        </v-layout>
        <v-layout row reverse>
          <v-btn @click="deleteAssignmentItem(item)" icon><v-icon>delete</v-icon></v-btn>
          <new-assignment-item-dialog v-if="type.expandable" :level="type.name" @save="insertAssignmentItem">
          </new-assignment-item-dialog>
        </v-layout>
      </v-layout>
      <v-layout row v-show="expanded && children.length > 0" class="pl-2 grey lighten-2">
        <assignment-item v-for="child in children" :key="child.id" :item="child" @delete="assignmentItemDeleted">
        </assignment-item>
      </v-layout>
    </v-layout>
  </v-container>
</template>
<script>
import db from '../../services/data'
import NewAssignmentItemDialog from './NewAssignmentItemDialog.vue'
import AssignmentItem from './AssignmentItem.vue'

export default {
  name: 'AssignmentItem',
  components: {
    AssignmentItem,
    NewAssignmentItemDialog
  },
  props: ['item'],
  data () {
    var self = this
    var vm = {
      expanded: false,
      type: db.AssignmentItemTypes.filter((type) => {
        return type.name === this.item.type
      })[0],
      children: [],
      updateAssignmentItem (assignmentItem) {
        db.AssignmentItems.update(assignmentItem)
      },
      insertAssignmentItem (assignmentItem) {
        assignmentItem.parentId = self.item.id
        db.AssignmentItems.add(assignmentItem).then((addedItem) => {
          self.children.push(addedItem)
        })
        self.expanded = true
      },
      deleteAssignmentItem (assignmentItem) {
        if (confirm('Are you sure you want to delete this item?')) {
          db.AssignmentItems.remove(assignmentItem)
          this.$emit('delete', assignmentItem)
        }
      },
      assignmentItemDeleted (assignmentItem) {
        console.log(assignmentItem)
        console.log(self.children.filter((item) => {
          return item.id !== assignmentItem.id
        }))
        self.children = self.children.filter((item) => {
          return item.id !== assignmentItem.id
        })
      }
    }
    db.AssignmentItems.getWhere('parentId', '==', this.item.id).then((children) => {
      this.children = children
    })
    return vm
  }
}
</script>
