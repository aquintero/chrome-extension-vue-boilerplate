<template>
  <v-dialog v-model="show" max-width="500px" class="justify-end">
    <v-btn icon slot="activator"><v-icon>add</v-icon></v-btn>
    <v-form @submit.prevent="save">
      <v-card>
        <v-card-title>
          <span class="headline">Add</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md4>
                <v-select label="Type" v-model="assignmentItem.type" ref="newLineType" :items="types" @change="typeChanged"></v-select>
              </v-flex>
              <v-flex xs12 sm6 md4 v-for="prop in itemProps" :key="prop.name">
                <v-text-field :label="prop.name" v-model="assignmentItem[prop.name]"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click.native="show = false">Cancel</v-btn>
          <v-btn color="primary" flat type="submit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>
<script>
import db from '../../services/data'
export default {
  name: 'NewAssignmentItemDialog',
  props: ['level'],
  data () {
    var self = this
    var vm = {
      show: false,
      assignmentItem: {},
      itemProps: [],
      emptyAssignmentItem: { type: '', assignmentId: this.id, parentId: null, markdown: false },
      types: db.AssignmentItemTypes.filter((type) => {
        return type.levels.includes(this.level)
      }).map((type) => type.name),
      save () {
        this.show = false
        this.$emit('save', this.assignmentItem)
      },
      typeChanged (val) {
        self.itemProps = db.AssignmentItemTypes.filter((type) => {
          return type.name === val
        })[0].props
      }
    }
    return vm
  },
  watch: {
    showDialog (val) {
      if (val) {
        this.assignmentItem = Object.assign({}, this.emptyAssignmentItem)
      }
    }
  }
}
</script>
