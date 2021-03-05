<template>
  <div id="app">
    <div id="logo">
      <router-link id="home_link" to="/">
        <img src="/images/logo_lk.png" title="Личный кабинет" />
      </router-link>
      <template v-if="userLogin">
        <div id="menu_links">
          <router-link id="lk_setup_link" to="/settings">Настройки</router-link>
          <a id="lk_logout_link" href="#" @click="logout()">Выход</a>
        </div>
      </template>
    </div>

    <template v-if="userLogin">
      <div id="device_list">
        <router-link class="device_btn" v-for="(device, idx) in devices" :key="idx"
                :class="{timeout: device.timeout}" :to="'/device/' + device.id">
                {{device.title ? device.title : device.type_title}}
        </router-link>
      </div>
    </template>

    <router-view></router-view>
  </div>
</template>


<!--
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

        <router-view></router-view>
    </div>
-->





<script>

import './style.css'

import {mapState} from 'vuex'

import {SET_USER_MUTATION} from './store'

export default {
  name: 'app',
  data () {
    return {
    }
  },
  async mounted () {
    if (!this.userLogin) {
      this.login()
    }
  },
  methods: {
    logout () {
      this.$store.commit(SET_USER_MUTATION, {user: null})
      this.login()
    },
    login () {
      this.$router.push('/login')
    }
  },
  computed: {
    ...mapState(['devices']),
    userLogin () {
      return this.$store.getters.userLogin
    }
  }
}
</script>

<style>
</style>
