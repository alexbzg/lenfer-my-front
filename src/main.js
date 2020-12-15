import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import store from './store'
import router from './router'

import 'chart.js'
import 'chartjs-adapter-date-fns'

import capitalizeDirective from './capitalize-directive'
capitalizeDirective()

new Vue({
  store: store,
  router: router,
  render: h => h(App),
}).$mount('#app')
