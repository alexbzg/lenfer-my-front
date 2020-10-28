<template>
    <div id="lk">
      <div id="lk_top_menu">
        <a id="lk_home_link" href="/"><img src="/images/logo_lk.png" title="Личный кабинет" /></a>
        <a id="lk_setup_link" href="#">Настройки</a>
        <a id="lk_logout_link" href="#" @click="logout()">Выйти</a>
        <div id="device_list">
            <span class="device_btn" v-for="(device, idx) in devices" :key="idx" @click="current_device = device">
                {{device.title ? device.title : device.type_title}}
            </span>
        </div>
      </div>
      <device v-if="current_device" :device_id="current_device.id"></device>
    </div>
</template>

<script>

import {userDataPost, SET_USER_MUTATION} from '../store'

import Device from './Device/Index'

export default {
  name: 'Index',
  components: {Device},
  data () {
    return {
      devices: [],
      current_device: null,
      show_device_register: false,
      device_register_response: null
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.$store.getters.userLogin) {
        vm.$router.push('/login')
      }
    })
  },
  async mounted () {
    this.load_devices()
  },
  methods: {
    async load_devices () {
      userDataPost('users_devices', {})
        .then(data => {
          this.devices = data
          if (this.devices.length) {
            this.current_device = this.devices[0]
          } else {
            this.current_device = null
          }
        })
    },
    logout () {
      this.$store.commit(SET_USER_MUTATION, {user: null})
    }
  }

}
</script>

<style>
</style>
