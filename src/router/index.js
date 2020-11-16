import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Login from '../components/Login'
import Device from '../components/Device/Index'
import Settings from '../components/Settings/Index'
import SettingsProfile from '../components/Settings/Profile'
import SettingsDevices from '../components/Settings/Devices'
import SettingsRegisterDevice from '../components/Settings/Register_device'

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
          path: 'register_device',
          name: 'SettingsRegisterDevice',
          component: SettingsRegisterDevice,
        }

      ]
    }

  ]
})

export default router
