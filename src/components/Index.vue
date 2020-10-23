<template>
    <div id="lk_top_menu">
        <a id="lk_home_link" href="/"><img src="/images/logo_lk.png" title="Личный кабинет" /></a>
        <a id="lk_setup_link" href="#">Настройки</a>
        <div id="device_list">
            <span class="device_btn" v-for="(device, idx) in devices" :key="idx" @click="current_device = device">
                {{device.title ? device.title : device.type_title}}
            </span>
            <span class="device_new" @click="show_device_register = !show_device_register">+</span>
            <device-register v-if="show_device_register" @close="close_device_register"></device-register>
            <modal v-if="device_register_response" @close="device_register_response = null">
                <h3 slot="header">Регистрация устройства</h3>
                <div slot="body">
                    {{device_register_response}}
                </div>
            </modal>
        </div>

        <device v-if="current_device" :device_id="current_device.id"></device>
    </div>
</template>

<script>

import {userDataPost} from '../store'

import Device from './Device/Index'
import DeviceRegister from './Device/Register'
import Modal from './Modal'

export default {
  name: 'Index',
  components: {Device, DeviceRegister, Modal},
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
    async close_device_register (device_hash) {
      this.show_device_register = false
      if (device_hash) {
          userDataPost('device/register', {device_hash: device_hash})
            .then(() => {this.load_devices()})
            .catch(error => {
               this.device_register_response = error.message
            })
      }
    }
  }
  
}
</script>

<style>
</style>
