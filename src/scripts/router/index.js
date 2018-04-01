import Vue from 'vue'
import Router from 'vue-router'
import Courses from '@/scripts/components/Courses.vue'
import Course from '@/scripts/components/Course.vue'
import 'material-icons/iconfont/material-icons.css'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Courses',
      component: Courses
    },
    {
      path: '/Course/:id',
      name: 'Course',
      component: Course,
      props (route) {
        return {
          id: parseInt(route.params.id)
        }
      }
    }
  ]
})
