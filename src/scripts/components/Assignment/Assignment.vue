<template>
  <div>
    <v-layout row justify-space-between align-center>
      <v-layout row align-center>
        <router-link :to="{name: 'Course', params: {id: assignment.courseId}}" tag="div" v-if="assignment.courseId">
          <v-btn color="secondary">
            <v-icon class="mr-1">arrow_back</v-icon>
            <span>{{ course.name }}</span>
          </v-btn>
        </router-link>
        <div class="display-1">{{ assignment.name }}</div>
      </v-layout>
      <v-dialog v-model="showNewAssignmentItemDialog" max-width="500px" class="justify-end">
        <v-btn color="primary" dark slot="activator"><v-icon>add</v-icon></v-btn>
        <v-form @submit.prevent="save">
          <v-card>
            <v-card-title>
              <span class="headline">Add</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md4>
                    <v-select label="Type" v-model="newAssignmentItem.type" ref="newLineType" :items="rootLevelTypes()" @change="typeChanged"></v-select>
                  </v-flex>
                  <v-flex xs12 sm6 md4 v-for="prop in newAssignmentItemProps" :key="prop.name">
                    <v-text-field :label="prop.name" v-model="newAssignmentItem[prop.name]"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click.native="showNewAssignmentItemDialog = false">Cancel</v-btn>
              <v-btn color="primary" flat type="submit">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </v-layout>
    <v-list>
      <template v-for="(item, index) in assignmentItems">
        <assignment-item :key="item.id" :item="item" @delete="assignmentItemDeleted">
        </assignment-item>
        <v-divider v-if="index < assignmentItems.length"  :key="index"></v-divider>
      </template>
    </v-list>
  </div>
</template>

<script>
import db from '../../services/data'
import AssignmentItem from './AssignmentItem.vue'

export default {
  name: 'Assignment',
  props: ['id'],
  components: {
    AssignmentItem
  },
  data () {
    var self = this
    var vm = {
      assignment: {},
      course: {},
      newAssignmentItem: {},
      newAssignmentItemProps: [],
      showNewAssignmentItemDialog: false,
      emptyAssignmentItem: { type: '', assignmentId: this.id, parentId: null, markdown: false },
      assignmentItems: [],
      save () {
        this.assignmentItems.push(this.newAssignmentItem)
        db.AssignmentItems.add(this.newAssignmentItem)
        this.showNewAssignmentItemDialog = false
      },
      rootLevelTypes () {
        return db.AssignmentItemTypes.filter((type) => {
          return type.levels.includes('Root')
        }).map((type) => {
          return type.name
        })
      },
      typeChanged (val) {
        self.newAssignmentItemProps = db.AssignmentItemTypes.filter((type) => {
          return type.name === val
        })[0].props
      },
      assignmentItemDeleted (assignmentItem) {
        self.assignmentItems = self.assignmentItems.filter((item) => item.id === assignmentItem.id)
      }
    }
    db.Assignments.get(this.id).then((assignment) => {
      this.assignment = assignment
      db.Courses.get(assignment.courseId).then((course) => {
        this.course = course
      })
    })
    db.AssignmentItems.getWhere('assignmentId', '==', this.id).then((assignmentItems) => {
      this.assignmentItems = assignmentItems
    })
    return vm
  },
  watch: {
    showNewAssignmentItemDialog (val) {
      if (val) {
        this.newAssignmentItemProps = []
        this.newAssignmentItem = Object.assign({}, this.emptyAssignmentItem)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
