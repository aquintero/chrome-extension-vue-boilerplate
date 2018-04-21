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
      <v-dialog v-model="showNewFeedbackItemDialog" max-width="500px" class="justify-end">
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
                    <v-select label="Line Type" v-model="newFeedbackItem.name" ref="newLineType" :items="templatesUnderLevel('Root')"></v-select>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click.native="showNewFeedbackItemDialog = false">Cancel</v-btn>
              <v-btn color="primary" flat type="submit">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </v-layout>
    <v-list>
      <template v-for="(fbItem, index) in feedbackItems">
        <v-list-tile  :key="fbItem.name">
          <v-list-tile-content>
            <v-list-tile-title>{{ fbItem.name }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider v-if="index < feedbackItems.length"  :key="index"></v-divider>
      </template>
    </v-list>
  </div>
</template>

<script>
import db from '../services/data'

var templateTypes = [
  {
    name: 'Group',
    markdown: false,
    props: [
      { name: 'Name', required: true }
    ],
    levels: [
      'Root'
    ]
  },
  {
    name: 'Criterion',
    markdown: '## {Name}',
    props: [
      { name: 'Name', required: true },
      { name: 'Standard', required: false }
    ],
    levels: [
      'Root',
      'Group'
    ]
  },
  {
    name: 'Sub-Criterion',
    markdown: '#### {Name}',
    props: [
      { name: 'Name', required: true },
      { name: 'Standard', required: false }
    ],
    levels: [
      'Criterion'
    ]
  },
  {
    name: 'Diagnosis',
    markdown: '* {feedback}',
    props: [
      { name: 'Name', required: true },
      { name: 'Feedback', required: false }
    ],
    levels: [
      'Criterion',
      'Sub-Criterion'
    ]
  }
]

export default {
  name: 'FeedbackItem',
  props: ['id'],
  data () {
    var vm = {
      assignment: {},
      course: {},
      newFeedbackItem: {},
      showNewFeedBackItemDialog: false,
      emptyFeedbackItem: { name: '', assignmentId: this.id, parentId: null, markdown: false },
      feedbackItems: [],
      save () {
        this.feedbackItems.push(this.newFeedbackItem)
        db.FeedbackItems.add(this.newFeedbackItem)
        this.showNewFeedbackItemDialog = false
      },
      templatesUnderLevel (level) {
        return templateTypes.filter((type) => {
          return type.levels.includes(level)
        }).map((type) => {
          return type.name
        })
      }
    }
    db.Assignments.get(this.id).then((assignment) => {
      vm.assignment = assignment
      db.Courses.get(assignment.courseId).then((course) => {
        vm.course = course
      })
    })
    db.FeedbackItems.getWhere('assignmentId', '==', this.id).then((feedbackItems) => {
      vm.feedbackItems = feedbackItems
    })
    return vm
  },
  watch: {
    showNewFeedbackItemDialog (val) {
      if (val) {
        this.newFeedbackItem = Object.assign({}, this.emptyFeedbackItem)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
