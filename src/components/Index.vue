<template>
    <div id="lk_top_menu">
        <a id="lk_home_link" href="/"><img src="/images/logo_lk.png" title="Личный кабинет" /></a>
        <a id="lk_setup_link" href="#">Настройки</a>
        <div id="device_list">
            <span class="device_btn" v-for="(device, idx) in devices" :key="idx" @click="current_device = device">
                {{device.title ? device.title : device.type_title}}
            </span>
        </div>

        <device v-if="current_device" :device_id="current_device.id"></device>
    </div>
</template>

<script>

import {mapGetters} from 'vuex'

import {dataPost} from '../api'

import Device from './Device/Index'

export default {
  name: 'Index',
  components: {Device},
  data () {
    return {
      devices: [],
      current_device: null
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
    dataPost('users_devices', {login: this.userLogin, token: this.userToken})
      .then(data => {
        this.devices = data
        if (this.devices.length) {
          this.current_device = this.devices[0]
        }
      })
  },
  computed: {
    ...mapGetters(['userLogin', 'userToken'])
  }

}
</script>

<style>
</style>
