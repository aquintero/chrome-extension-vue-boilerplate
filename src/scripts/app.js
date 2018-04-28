import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import './services/firebase.js'
import VueDragDrop from 'vue-drag-drop'
import router from './router.js'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(Vuetify)
Vue.use(VueDragDrop)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
