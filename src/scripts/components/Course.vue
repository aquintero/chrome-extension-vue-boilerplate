<template>
  <div>
    <v-layout row justify-space-between>
      <v-layout row align-center>
        <router-link :to="{name: 'Courses'}" tag="div">
          <v-btn color="secondary">
            <v-icon class="mr-1">arrow_back</v-icon>
            <span>Home</span>
          </v-btn>
        </router-link>
        <div class="display-1">
          {{ course.name }}
        </div>
      </v-layout>
      <v-dialog v-model="showNewAssignmentDialog" max-width="500px"  class="justify-end">
        <v-btn color="primary" dark slot="activator">New Assignment</v-btn>
        <v-form @submit.prevent="save">
          <v-card>
            <v-card-title>
              <span class="headline">New Assignment</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="Assignment Name" ref="newAssignmentName" v-model="newAssignment.name"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click.native="showNewAssignmentDialog = false">Cancel</v-btn>
              <v-btn color="primary" flat type="submit">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </v-layout>
    <v-dialog v-model="showMoveAssignmentDialog" max-width="500px" class="justify-end">
      <v-form @submit.prevent="moveAssignmentToCourse()">
        <v-card>
          <v-card-title>
            <span class="headline">Move {{movingAssignment.name}} To</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-select :items="otherCourses" item-text="name" v-model="moveToCourse" label="Course"></v-select>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click.native="showMoveAssignmentDialog=false">Cancel</v-btn>
            <v-btn color="primary" flat type="submit">Move</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-data-table ref="assignmentsTable" :items="assignments" :headers="assignmentColumns">
      <template slot="items" slot-scope="props">
        <tr class="sortableRow" @dblclick="$router.push({name: 'Assignment', params: {id: props.item.id}})">
          <td class="px-1" style="width: 0.1%">
            <v-btn style="cursor: move" icon class="sortHandle"><v-icon>drag_handle</v-icon></v-btn>
          </td>
          <td>
            <v-edit-dialog :return-value.sync="props.item.name" lazy >
              {{ props.item.name }}
              <v-text-field
                slot="input"
                label="Edit"
                v-model="props.item.name"
                single-line
                autofocus
                @keydown.native.enter="updateAssignment(props.item)"
              ></v-text-field>
            </v-edit-dialog>
          </td>
          <td class="justify-center layout px-0">
            <v-menu offset-y left>
              <v-btn icon slot="activator">
                <v-icon>more_vert</v-icon>
              </v-btn>
              <v-list>
                <v-tooltip left open-delay="500">
                  <v-list-tile slot="activator" @click="showMoveAssignmentDialog=true; movingAssignment = props.item">
                    <v-list-tile-title>Move</v-list-tile-title>
                  </v-list-tile>
                  <span>Move assignment to another course</span>
                </v-tooltip>
                <v-tooltip left open-delay="500">
                  <v-list-tile slot="activator" @click="copyAssignment(props.item)">
                    <v-list-tile-title>Copy</v-list-tile-title>
                  </v-list-tile>
                  <span>Copy assignment</span>
                </v-tooltip><v-tooltip left open-delay="500">
                  <v-list-tile slot="activator" @click="deleteAssignment(props.item)">
                    <v-list-tile-title>Delete</v-list-tile-title>
                  </v-list-tile>
                  <span>Delete assignment</span>
                </v-tooltip>
              </v-list>
            </v-menu>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import db from '../services/data'
export default {
  name: 'Assignments',
  props: ['id'],
  mounted () {
    var self = this
    /* eslint-disable no-new */
    new Sortable(
      self.$refs.assignmentsTable.$el.getElementsByTagName('tbody')[0],
      {
        draggable: '.sortableRow',
        handle: '.sortHandle',
        onEnd: self.moveAssignment
      }
    )
  },
  data () {
    var self = this
    var vm = {
      course: {},
      otherCourses: [],
      showNewAssignmentDialog: false,
      showMoveAssignmentDialog: false,
      moveToCourse: {},
      movingAssignment: {},
      assignments: [],
      assignmentColumns: [
        { test: '', vlaue: '', sortable: false },
        { text: 'Assignment', value: 'Assignment', sortable: false },
        { text: 'Actions', value: 'actions', align: 'center', sortable: false, width: 50 }
      ],
      newAssignment: {},
      emptyAssignment: {name: '', courseId: this.id},
      save () {
        this.assignments.push(this.newAssignment)
        db.Assignments.add(this.newAssignment)
        this.showNewAssignmentDialog = false
      },
      deleteAssignment (assignment) {
        const index = this.assignments.indexOf(assignment)
        if (confirm('Are you sure you want to delete this assignment?')) {
          this.assignments.splice(index, 1)
          db.Assignments.remove(assignment)
        }
      },
      copyAssignment (assignment) {
        var copy = Object.assign({}, assignment)
        copy.name = 'Copy of ' + copy.name
        this.assignments.push(copy)
        db.Assignments.add(copy)
      },
      updateAssignment (assignment) {
        db.Assignments.update(assignment)
      },
      moveAssignmentToCourse () {
        var index = this.assignments.indexOf(this.movingAssignment)
        this.assignments.splice(index, 1)
        this.movingAssignment.courseId = this.moveToCourse.id
        db.Assignments.update(this.movingAssignment)
        this.showMoveAssignmentDialog = false
      },
      moveAssignment ({oldIndex, newIndex}) {
        console.log(oldIndex, newIndex)
        db.Assignments.reorder(self.assignments, oldIndex, newIndex)
      }
    }

    db.Assignments.getWhere('courseId', '==', this.id).then((assignments) => {
      vm.assignments = assignments
    })
    db.Courses.getAll().then((courses) => {
      vm.course = courses.filter((course) => {
        return course.id === this.id
      })[0]
      vm.otherCourses = courses.filter((course) => {
        return course.id !== this.id
      })
    })
    return vm
  },
  watch: {
    showNewAssignmentDialog (val) {
      if (val) {
        this.newAssignment = Object.assign({}, this.emptyAssignment)
        this.$nextTick(this.$refs.newAssignmentName.focus)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
