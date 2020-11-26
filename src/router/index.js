import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from '../components/Login'
import Device from '../components/Device/Index'
import Settings from '../components/Settings/Index'
import SettingsProfile from '../components/Settings/Profile'
import SettingsDevices from '../components/Settings/Devices'
import SettingsSchedules from '../components/Settings/Schedules'

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
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
      children: [
        {
          path: 'profile',
          name: 'SettingsProfile',
          component: SettingsProfile
        },
        {
          path: '/',
          name: 'SettingsDevices',
          component: SettingsDevices,
        },
        {
          path: 'schedules/:schedule_id',
          name: 'SettingsSchedules',
          component: SettingsSchedules,
          props: true
        },
        {
          path: 'schedules',
          name: 'SettingsSchedules',
          component: SettingsSchedules,
        }        
      ]
    }

  ]
})

export default router
