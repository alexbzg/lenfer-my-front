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
        <router-link v-if="!public_id && userLogin"
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

import {LOAD_DEVICES_ACTION, SET_USER_MUTATION, userDataPost} from '../store'
import messageBox from '../message-box'
import {get} from '../api'

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
    } else if (this.public_id) {
      this.load_public_devices()
    }
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
            this.$router.push(def_path)
          }
        })
   },
   login () {
      this.$router.push('/login')
    },
    logout () {
      this.$store.commit(SET_USER_MUTATION, {user: null})
      this.login()
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
    devices () {
      return this.public_id ? this.public_devices : this.$store.state.devices
    },
    current_device () {
      if (this.$route.name == 'Device') {
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
    }
  }
}
</script>

<style>
</style>
