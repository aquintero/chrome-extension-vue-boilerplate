<template>
<v-card>
  <v-layout row class="lists-container">
    <list :items="courses"
          title="Courses"
          textProp="name"
          :selectedItem="selectedCourse"
          :loading="coursesLoading"
          :actions="{
            add: {text: 'Add Course', dialog: true},
            rename: {text: 'Rename Course', dialog: true, condition: selectedCourse},
            delete: {text: 'Delete Course', condition: selectedCourse}
          }"
          @reorder="reorderCourses"
          @selected="(course) => selectedCourse = course"
          @add="addCourse"
          @add-dialog-opened="addCourseDialogOpened"
          @rename="renameCourse"
          @rename-dialog-opened="renameCourseDialogOpened"
          @delete="deleteCourse">
      <div slot="add-form">
        <v-text-field v-model="newCourse.name" placeholder="Name" ref="newCourseName"></v-text-field>
      </div>
      <div slot="rename-form">
        <v-text-field v-model="newCourse.name" placeholder="Name" ref="courseRename"></v-text-field>
      </div>
    </list>
    <list :items="assignments"
          :title="selectedCourse.name"
          :selectedItem="selectedAssignment"
          textProp="name"
          :loading="assignmentsLoading"
          :actions="{
            add: {text: 'Add Assignment', dialog: true},
            rename: {text: 'Rename Assignment', dialog: true, condition: selectedAssignment},
            move: {text: 'Move Assignment', dialog: true, condition: selectedAssignment},
            delete: {text: 'Delete Assignment', condition: selectedAssignment}
          }"
          @reorder="reorderAssignments"
          @selected="assignmentSelected"
          @add="addAssignment"
          @add-dialog-opened="addAssignmentDialogOpened"
          @rename="renameAssignment"
          @rename-dialog-opened="renameAssignmentDialogOpened"
          @delete="deleteAssignment"
          @move="moveAssignment"
          @move-dialog-opened="moveAssignmentDialogOpened">
      <div slot="add-form">
        <v-text-field v-model="newAssignment.name" placeholder="Name" ref="newAssignmentName"></v-text-field>
      </div>
      <div slot="rename-form">
        <v-text-field v-model="newAssignment.name" placeholder="Name" ref="assignmentRename"></v-text-field>
      </div>
      <div slot="move-form">
        <v-select :items="moveToCourses" v-model="moveToCourse" item-text="name" placeholder="To Course"></v-select>
      </div>
    </list>
  </v-layout>
</v-card>
</template>
<script>
import db from '@/scripts/services/data.js'
import List from '@/scripts/components/ui/List.vue'
export default {
  name: 'Home',
  components: {
    List
  },
  mounted () {
    db.Courses.getAll().then((courses) => {
      this.courses = courses
      this.coursesLoading = false
    })
  },
  data () {
    return {
      courses: [],
      coursesLoading: true,
      newCourse: {},
      selectedCourse: {},
      assignments: [],
      assignmentsLoading: true,
      newAssignment: {},
      selectedAssignment: {},
      moveToCourse: {},
      moveToCourses: []
    }
  },
  methods: {
    addCourse () {
      this.courses.push(this.newCourse)
      db.Courses.add(this.newCourse).then(() => {
        this.selectedCourse = this.newCourse
      })
    },
    addCourseDialogOpened () {
      this.newCourse = {}
      this.$nextTick(this.$refs.newCourseName.focus)
    },
    renameCourse () {
      this.selectedCourse.name = this.newCourse.name
      db.Courses.update(this.selectedCourse)
    },
    renameCourseDialogOpened () {
      this.newCourse = {name: this.selectedCourse.name}
      this.$nextTick(this.$refs.courseRename.focus)
    },
    deleteCourse () {
      if (confirm('This will also delete all assignments under \'' + this.selectedCourse.name + '\'. Are you sure you want to delete this course?')) {
        db.Courses.remove(this.selectedCourse).then(() => {
          db.Courses.getAll().then((courses) => {
            this.courses = courses
          })
        })
      }
    },
    reorderCourses (courses, fromIndex, toIndex) {
      db.Courses.reorder(courses, fromIndex, toIndex)
    },
    addAssignment () {
      this.assignments.push(this.newAssignment)
      db.Assignments.add(this.newAssignment).then(() => {
        this.selectedAssignment = this.newAssignment
      })
    },
    addAssignmentDialogOpened () {
      this.newAssignment = {courseId: this.selectedCourse.id}
      this.$nextTick(this.$refs.newAssignmentName.focus)
    },
    renameAssignment () {
      this.selectedAssignment.name = this.newAssignment.name
      db.Assignments.update(this.selectedAssignment)
    },
    renameAssignmentDialogOpened () {
      this.newAssignment = {name: this.selectedAssignment.name}
      this.$nextTick(this.$refs.assignmentRename.focus)
    },
    deleteAssignment () {
      if (confirm('This will also delete all feedback areas under \'' + this.selectedAssignment.name + '\'. Are you sure you want to delete this assignment?')) {
        db.Assignments.remove(this.selectedAssignment).then(() => {
          db.Assignments.getWhere('courseId', '==', this.selectedCourse.id).then((assignments) => {
            this.assignments = assignments
          })
        })
      }
    },
    reorderAssignments (assignments, fromIndex, toIndex) {
      db.Assignments.reorder(assignments, fromIndex, toIndex)
    },
    assignmentSelected (assignment) {
      this.selectedAssignment = assignment
    },
    moveAssignment () {
      this.selectedAssignment.courseId = this.moveToCourse.id
      db.Assignments.update(this.selectedAssignment).then(() => {
        db.Assignments.getWhere('courseId', '==', this.selectedAssignment.id).then((assignments) => {
          this.assignments = assignments
        })
        this.selectedCourse = this.moveToCourse
      })
    },
    moveAssignmentDialogOpened () {
      this.moveToCourse = this.selectedCourse
      this.moveToCourses = this.courses.filter((course) => {
        return this.selectedCourse.id !== course.id
      })
    }
  },
  watch: {
    selectedCourse (course) {
      this.assignmentsLoading = true
      db.Assignments.getWhere('courseId', '==', course.id).then((assignments) => {
        this.assignments = assignments
        this.assignmentsLoading = false
      })
    }
  }
}
</script>
<style scoped>
  .lists-container {
    border-right: 1px solid;
    border-color: #d7d7d7;
  }
</style>
