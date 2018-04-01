<template>
  <div>
    <v-layout row justify-space-between align-center>
      <div class="display-1">Courses</div>
      <v-dialog v-model="showNewCourseDialog" max-width="500px"  class="justify-end">
        <v-btn color="primary" dark slot="activator">New Course</v-btn>
        <v-form @submit.prevent="save">
          <v-card>
            <v-card-title>
              <span class="headline">New Course</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="Course Name" ref="newCourseName" v-model="newCourse.name"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
              <v-btn color="blue darken-1" flat type="submit">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </v-layout>
    <v-data-table :items="courses" :headers="courseColumns">
      <template slot="items" slot-scope="props">
        <tr @dblclick="$router.push({name: 'Course', params: {id: props.item.id}})">
          <td>
            <v-edit-dialog :return-value.sync="props.item.name" lazy >
              {{ props.item.name }}
              <v-text-field
                slot="input"
                label="Edit"
                v-model="props.item.name"
                single-line
                autofocus
                @keydown.native.enter="db.Courses.update(props.item)"
              ></v-text-field>
            </v-edit-dialog>
          </td>
          <td class="justify-center layout px-0">
            <v-btn icon class="mx-0" @click="deleteCourse(props.item)">
              <v-icon color="red">delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>

export default {
  name: 'Courses',
  data () {
    var vm = {
      db: null,
      showNewCourseDialog: false,
      courses: [],
      courseColumns: [
        { text: 'Course', value: 'Course', sortable: false },
        { text: 'Actions', value: 'actions', align: 'right', sortable: false, width: 50 }
      ],
      emptyCourse: { name: '' },
      newCourse: {},
      save () {
        this.courses.push(this.newCourse)
        this.db.Courses.add(this.newCourse)
        this.showNewCourseDialog = false
      },
      close () {
        this.showNewCourseDialog = false
      },
      deleteCourse (course) {
        const index = this.courses.indexOf(course)
        if (confirm('Are you sure you want to delete this course?')) {
          this.courses.splice(index, 1)
          this.db.Courses.remove(course)
        }
      }
    }
    require('../services/data').default.then((data) => {
      vm.db = data
      vm.courses = vm.db.Courses.getAll()
    })
    return vm
  },
  watch: {
    showNewCourseDialog (val) {
      if (val) {
        this.newCourse = Object.assign({}, this.emptyCourse)
        this.$nextTick(this.$refs.newCourseName.focus)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
