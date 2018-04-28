<template>
<v-card>
  <list :items="courses"
        title="Courses"
        adderText="ADD COURSE"
        textProp="name"
        :actions="{add: {text: 'Add Course', dialog: true}}"
        @add-dialog-opened="insertCourseDialogOpened"
        @add="insertCourse"
        @reorder="reorderCourses">
    <v-flex slot="add-form">
      <v-text-field v-model="newCourse.name" placeholder="Name" ref="newCourseName"></v-text-field>
    </v-flex>
  </list>
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
    })
  },
  data () {
    return {
      courses: [],
      newCourse: {}
    }
  },
  methods: {
    insertCourse () {
      this.courses.push(this.newCourse)
      db.Courses.add(this.newCourse)
    },
    insertCourseDialogOpened () {
      this.newCourse = {}
      this.$nextTick(this.$refs.newCourseName.focus)
    },
    reorderCourses (courses, fromIndex, toIndex) {
      db.Courses.reorder(courses, fromIndex, toIndex)
    }
  }
}
</script>
<style scoped>
</style>
