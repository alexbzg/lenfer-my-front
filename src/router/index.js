import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from './../components/Login'
import Device from './../components/Device/Index'

const router = new Router({
//  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/device/:device_id',
      name: 'Device',
      component: Device,
      props: true
    }
  ]
})

export default router
