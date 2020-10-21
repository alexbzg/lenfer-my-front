import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from './../components/Login'
import Index from './../components/Index'

const router = new Router({
//  mode: 'history',
  routes: [
    { path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})

export default router
