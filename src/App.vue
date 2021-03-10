<template>
  <div id="app">
    <div id="logo">
        <router-link id="home_link" to="/">
            <img src="/images/logo_lk.png" title="Личный кабинет" />
        </router-link>
        <div id="menu_links" v-if="userLogin">
            <router-link id="lk_setup_link" to="/settings/profile">Профиль</router-link>
            <a id="lk_logout_link" href="#" @click="logout()">Выход</a>
        </div>
    </div>
    <div id="device_list" v-if="userLogin">
        <a id="add_device" href="#" title="Добавить устройство"
            @click="register_device = true">+</a>
        <router-link class="device_btn" v-for="(device, idx) in devices" :key="idx"
            :class="{timeout: device.timeout, 
                'router-link-active': $router.currentRoute.path === '/settings/devices/' + device.id ||
                $router.currentRoute.path === '/settings/schedules/' + device.schedule_id}" 
                :to="'/device/' + device.id">
                {{device.title ? device.title : device.type_title}}
        </router-link>
        <modal v-if="register_device" title="Добавление устройства" :cancel_button="true"
            @cancel="register_device = false" @confirm="register_device_confirm">
            <span class="register_device_caption">Введите код устройства</span><br/>
            <input type="text" :class="{error: register_device_hash.length < 6}"
                v-model="register_device_hash"/>
        </modal>
    </div>

    <router-view></router-view>
  </div>
</template>


<script>

import './style.css'

import {mapState} from 'vuex'

import {SET_USER_MUTATION, LOAD_DEVICES_ACTION, userDataPost} from './store'
import messageBox from './message-box'

import Modal from './components/Modal'

export default {
  name: 'app',
  components: {Modal},
  data () {
    return {
      register_device: false,
      register_device_hash: '',
      pending: false
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
    ...mapState(['devices']),
    userLogin () {
      return this.$store.getters.userLogin
    }
  }
}
</script>

<style>
</style>
