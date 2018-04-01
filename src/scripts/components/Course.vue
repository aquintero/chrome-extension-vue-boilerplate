<template>
  <div>
    <v-layout row justify-space-between>
      <v-layout row align-center>
        <v-btn color="secondary" small fab @click="$router.push({name: 'Courses'})">
          <v-icon dark>arrow_back</v-icon>
        </v-btn>
        <div class="display-1">
          {{course.name}}
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
    <v-data-table :items="assignments" :headers="assignmentColumns">
      <template slot="items" slot-scope="props">
        <td>
          <v-edit-dialog :return-value.sync="props.item.name" lazy >
            {{ props.item.name }}
            <v-text-field
              slot="input"
              label="Edit"
              v-model="props.item.name"
              single-line
              autofocus
              @keydown.native.enter="db.Assignments.update(props.item)"
            ></v-text-field>
          </v-edit-dialog>
        </td>
        <td class="justify-center layout px-0">
          <v-tooltip bottom>
            <v-btn icon class="mx-0" slot="activator" @click="moveAssignmentUp(props.item)">
              <v-icon>arrow_upward</v-icon>
            </v-btn>
            <span>Move Up</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn icon class="mx-0" slot="activator" @click="moveAssignmentDown(props.item)">
              <v-icon>arrow_downward</v-icon>
            </v-btn>
            <span>Move Down</span>
          </v-tooltip>
          <v-tooltip bottom slot="activator">
            <v-btn icon class="mx-0" slot="activator" style="position:relative" @click="showMoveAssignmentDialog=true; movingAssignment=props.item">
              <v-icon>folder_open</v-icon>
              <v-icon style="position: absolute; font-size: 14px; left: 14px; top: 12px">arrow_forward</v-icon>
              <v-icon style="position: absolute; font-size: 14px; left: 8px; top: 12px; transform: scale(-1, 1)">arrow_forward</v-icon>
            </v-btn>
            <span>Move To Course</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn icon class="mx-0" slot="activator" style="position:relative" @click="copyAssignment(props.item)">
              <v-icon>content_copy</v-icon>
              <v-icon small style="position: absolute; font-size: 18px; top: 12px; left: 11px">add</v-icon>
            </v-btn>
            <span>Copy</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn icon class="mx-0" slot="activator" @click="deleteAssignment(props.item)">
              <v-icon>clear</v-icon>
            </v-btn>
            <span>Delete</span>
          </v-tooltip>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: 'Assignments',
  props: ['id'],
  data () {
    var vm = {
      db: null,
      course: {},
      otherCourses: [],
      showNewAssignmentDialog: false,
      showMoveAssignmentDialog: false,
      moveToCourse: {},
      movingAssignment: {},
      assignments: [],
      assignmentColumns: [
        { text: 'Assignment', value: 'Assignment', sortable: false },
        { text: 'Actions', value: 'actions', align: 'center', sortable: false, width: 50 }
      ],
      newAssignment: {},
      emptyAssignment: {},
      save () {
        this.assignments.push(this.newAssignment)
        this.db.Assignments.add(this.newAssignment)
        this.showNewAssignmentDialog = false
      },
      deleteAssignment (assignment) {
        const index = this.assignments.indexOf(assignment)
        if (confirm('Are you sure you want to delete this assignment?')) {
          this.assignments.splice(index, 1)
          this.db.Assignments.remove(assignment)
        }
      },
      copyAssignment (assignment) {
        var copy = Object.assign({}, assignment)
        copy.name = 'Copy of ' + copy.name
        this.assignments.push(copy)
        this.db.Assignments.add(copy)
      },
      moveAssignmentUp (assignment) {
        var index = this.assignments.indexOf(assignment)
        if (index <= 0) {
          return
        }
        this.assignments.splice(index, 1)
        this.assignments.splice(index - 1, 0, assignment)
        this.db.Assignments.reorder(this.assignments)
      },
      moveAssignmentDown (assignment) {
        var index = this.assignments.indexOf(assignment)
        if (index < 0 || index >= this.assignments.length) {
          return
        }
        console.log(index, this.assignments.length)
        this.assignments.splice(index, 1)
        this.assignments.splice(index + 1, 0, assignment)
        this.db.Assignments.reorder(this.assignments)
      },
      moveAssignmentToCourse () {
        var index = this.assignments.indexOf(this.movingAssignment)
        this.assignments.splice(index, 1)
        this.movingAssignment.courseId = this.moveToCourse.id
        this.db.Assignments.update(this.movingAssignment)
        this.showMoveAssignmentDialog = false
      }
    }
    require('../services/data').default.then((data) => {
      vm.db = data
      vm.assignments = vm.db.Assignments.getAll().filter((assignment) => {
        return assignment.courseId === this.id
      })
      vm.emptyAssignment = { name: '', courseId: this.id }
      vm.course = this.db.Courses.get(this.id)
      vm.otherCourses = vm.db.Courses.getAll().filter((course) => {
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
