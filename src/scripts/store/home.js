import Vue from 'vue'
import db from '@/scripts/services/data.js'

export default {
  state: {
    courses: [],
    selectedCourse: {},
    coursesLoading: true,
    assignments: [],
    assignmentsLoading: true
  },
  getters: {
    FirstCourse (state) {
      return state.courses[0] || {}
    }
  },
  mutations: {
    Courses (state, courses) {
      Vue.set(state, 'courses', courses)
    },
    CoursesLoading (state, coursesLoading) {
      state.coursesLoading = coursesLoading
    },
    ActiveCourse (state, selectedCourse) {
      state.selectedCourse = selectedCourse
    },
    Assignments (state, assignments) {
      state.assignments = assignments
    },
    AssignmentsLoading (state, assignmentsLoading) {
      state.assignmentsLoading = assignmentsLoading
    }
  },
  actions: {
    async init ({commit, state, getters, dispatch}) {
      console.log(state.courses)
      await dispatch('GetCourses')
      console.log(state.courses)
      await dispatch('SetActiveCourse', getters.FirstCourse)
    },
    async GetCourses ({commit, state}) {
      commit('CoursesLoading', true)
      commit('Courses', await db.Courses.getAll())
      commit('CoursesLoading', false)
    },
    async SetActiveCourse ({commit, dispatch}, course) {
      commit('ActiveCourse', course)
      await dispatch('GetAssignmentsByActiveCourse')
    },
    async GetAssignmentsByActiveCourse ({commit, state}) {
      commit('AssignmentsLoading', true)
      commit('Assignments', await db.Assignments.getWhere('courseId', '==', state.selectedCourse.id))
      commit('AssignmentsLoading', false)
    }
  }
}
