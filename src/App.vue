<template>
    <div id="app">

        <table id="top_menu">
          <tr>
            <td id="logo">
              <router-link id="home_link" to="/">
                <img src="/images/logo_lk.png" title="Личный кабинет" />
              </router-link>
            </td>
            <template v-if="userLogin">
              <td id="device_list">
                <router-link class="device_btn" v-for="(device, idx) in devices" :key="idx"
                            :to="'/device/' + device.id">
                  {{device.title ? device.title : device.type_title}}
                </router-link>
              </td>
              <td id="menu_links">
                <router-link id="lk_setup_link" to="/settings">Настройки</router-link>
                <a id="lk_logout_link" href="#" @click="logout()">Выйти</a>
              </td>
            </template>
          </tr>
        </table>

        <router-view @login="on_login"></router-view>
    </div>
</template>

<script>

import './style.css'

import {userDataPost, SET_USER_MUTATION} from './store'

export default {
  name: 'app',
  data () {
    return {
      devices: [],
    }
  },
  async mounted () {
    if (this.userLogin) {
      this.load_devices()
    } else {
      this.login()
    }
  },
  methods: {
    async load_devices () {
      userDataPost('users_devices', {})
        .then(data => {
          this.devices = data
          if (this.devices.length) {
            const device_route = '/device/' + this.devices[0].id
            if (device_route !== this.$router.currentRoute.path) {
              this.$router.push(device_route)
            }
          }
        })
    },
    logout () {
      this.$store.commit(SET_USER_MUTATION, {user: null})
      this.login()
    },
    login () {
      this.$router.push('/login')
    },
    on_login () {
      this.load_devices()
    }
  },
  computed: {
    userLogin () {
      return this.$store.getters.userLogin
    }
  }
}
</script>

<style>
</style>
