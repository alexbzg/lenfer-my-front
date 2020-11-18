<template>
    <div class="add_device">
        введите код устройства
        <input type="text" :class="{error: register_device_hash.length < 6}"
            v-model="register_device_hash"/>
        <input class="btn" type="submit" @click="register_device" :disabled="register_device_hash.length < 6 || pending"
            value="Отправить"/>
    </div>
</template>

<script>


import {userDataPost, LOAD_DEVICES_ACTION} from '../../store'

export default {
  name: 'SettingsRegisterDevice',
  data () {
    return {
      register_device_hash: '',
      pending: false,
      modal: {
        show: false,
        header: '',
        body: ''
      }
    }
  },
  methods: {
    async register_device () {
      userDataPost('device/register', {device_hash: this.register_device_hash})
        .then(() => {
          this.register_device_hash = ''
          this.$store.dispatch(LOAD_DEVICES_ACTION)
        })
        .catch(error => {
          this.$emit('show-modal', 'Регистрация устройства', error.message)
        })
        .finally(() => {
          this.pending = false
        })
    }
  }
}
</script>

<style>
</style>
