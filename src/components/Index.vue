<template>
  <div id="app">
    <div id="device_list">
        <img id="logo" src="/images/logo_lk2.png" title="Ленивый фермер - Личный кабинет" />
        <a id="add_device" href="#" title="Добавить устройство" v-if="!public_id"
            @click="register_device = true">+</a>
        <router-link class="device_btn" v-for="(device, idx) in devices" :key="idx"
            :class="{timeout: device.timeout,
                'router-link-active': $router.currentRoute.path === '/settings/devices/' + device.id ||
                $router.currentRoute.path === '/settings/schedules/' + device.schedule_id}"
                :to="(public_id ? '/' + public_id : '') + '/device/' + device.id">
                {{device.title ? device.title : device.type_title}}
        </router-link>
        <modal v-if="register_device" title="Добавление устройства" :cancel_button="true"
            @cancel="register_device = false" @confirm="register_device_confirm">
            <span class="register_device_caption">Введите код устройства</span><br/>
            <input type="text" :class="{error: register_device_hash.length < 6}"
                v-model="register_device_hash"/>
        </modal>
    </div>
    <div id="right_menu">
        <router-link :to="'/settings/devices/' + current_device.id"
            v-if="current_device && !public_id" tag="img" id="icon_settings"
            src="/images/icon_settings.png" title="Настройки устройства" />
        <router-link v-if="!public_id && userLogin && schedules_enabled"
            :to="'/settings/schedules' + 
                ((current_device && current_device.schedule_id) ? '/' + current_device.schedule_id : '')"
            tag="img" id="icon_tables" src="/images/icon_tables.png"
            title="Редактирование таблиц" />
        <router-link id="lk_setup_link" to="/settings/profile" v-if="userLogin">
            <img src="/images/icon_profile.png" title="Ваш профиль" />
        </router-link>
        <a  v-if="userLogin" id="lk_logout_link" href="#" @click="logout()">
            <img src="/images/icon_logout.png" title="Выйти из личного кабинета" />
        </a>
    </div>
    <router-view></router-view>
  </div>
</template>


<script>

import {LOAD_DEVICES_ACTION, LOAD_PUBLIC_USER_DATA_ACTION, SET_USER_MUTATION,
  DEVICE_STATUS_MUTATION, set_device_status, userDataPost} from '../store'
import messageBox from '../message-box'
import {get} from '../api'
import {debugLog} from '../utils'

import Modal from './Modal'

export default {
  name: 'Index',
  components: {Modal},
  props: ['public_id'],
  data () {
    return {
      register_device: false,
      register_device_hash: '',
      public_devices: [],
      pending: false
    }
  },
  mounted () {
    if (!this.userLogin && !this.public_id) {
      this.login()
      return
    } else if (this.public_id) {
      this.load_public_devices()
      this.$store.dispatch(LOAD_PUBLIC_USER_DATA_ACTION, this.public_id)
    } else {
      debugLog(this.$router.currentRoute)
      if (this.$router.currentRoute.fullPath == '/') {
        this.def_device()
      }
    }
    setInterval(this.update_devices_status, 10 * 1000)
  },
  methods: {   
    async load_public_devices () {
      get(`/api/users_device/public/${this.public_id}`)
        .then(rsp => {
          this.public_devices = rsp.data
          if (this.public_devices.length > 0) {
            const def_path = `/${this.public_id}/device/${this.public_devices[0].id}`
            this.$router.addRoutes([{path: '/:public_id',
                redirect: def_path} ])
            if (!this.$router.currentRoute.params.device_id) {
              this.$router.push(def_path)
            }
          }
        })
    },
    async get_public_devices_status () {
      return get(`/api/devices_status/public/${this.public_id}`)
        .then(response => response.data)
    },
    async update_devices_status () {
      (this.public_id ? this.get_public_devices_status() : userDataPost('devices_status'))
        .then(data => {
            const now = new Date()
            for (const device_id in data) {        
              const tstamp = new Date(data[device_id].last_tstamp)
              const device = this.devices.find(item => item.id == data[device_id].id)
              if (device) {
                const timeout_int = 10 + (device.props.deepsleep ? device.props.deepsleep : 0)
                const timeout = now - tstamp > timeout_int * 60000
                this.public_id ? set_device_status(device, tstamp, timeout) :
                  this.$store.commit(DEVICE_STATUS_MUTATION, {
                    device: device,
                    tstamp: tstamp,
                    timeout: timeout
                  })

              }
            }
        })
    },
    def_device () {
      if (this.devices.length) {
        this.$router.push('/device/' + this.devices[0].id)
      }
    },
    login () {
      this.$router.push('/login')
    },
    logout () {
      messageBox('Выход', 'Вы действительно хотите выйти из аккаунта?', true)
        .then(() => {
            this.$store.commit(SET_USER_MUTATION, {user: null})
            this.login()
        })
    },
    async register_device_confirm () {
      if (this.register_device_hash.length > 5) {
        this.pending = true
        userDataPost('device/register', {device_hash: this.register_device_hash})
          .then(() => {
            this.register_device_hash = ''
            this.register_device = false
            this.$store.dispatch(LOAD_DEVICES_ACTION)
          })
          .catch(error => {
            messageBox('Регистрация устройства', error.message)
          })
          .finally(() => {
            this.pending = false
          })

      }
    }
  },
  computed: {
    schedules_enabled () {
      let r = false
      if (this.current_device) {
        const device_type = this.$store.state.devices_types.find(
          device_type => device_type.id === this.current_device.type_id)
        r = device_type && device_type.schedule_params
      }
      return r
    },
    devices () {
      return this.public_id ? this.public_devices : this.$store.state.devices
    },
    current_device () {
      if (this.$route.name == 'Device' || this.$route.name == 'SettingsDevices' ) {
        return this.devices.find(item => item.id == parseInt(this.$route.params.device_id))
      } else {
        return null
      }
    },
    userLogin () {
      return this.$store.getters.userLogin
    }
  },
  watch: {
    public_id () {
      if (this.public_id) {
        this.load_public_devices()
      } else {
        this.public_devices = []
      }
    },
    devices (new_val, old_val) {
      if (!this.public_id && !old_val.length && new_val.length) {
        if (this.$router.currentRoute.fullPath == '/') {
          this.def_device()
        }
      }
    }

  }
}
</script>

<style>
</style>
