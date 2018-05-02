import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import firebase from './services/firebase.js'
import router from './router.js'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false
Vue.use(Vuetify)

firebase.authenticated().then(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
    created () {
      this.$store.dispatch('init')
    }
  })
})
