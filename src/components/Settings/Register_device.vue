<template>
    <div class="add_device">
        введите код устройства
        <input type="text" :class="{error: register_device_hash.length < 6}" 
            v-model="register_device_hash"/> 
        <input type="submit" @click="register_device" :disabled="register_device_hash.length < 6 || pending"
            value="Отправить"/>
        <modal v-if="modal.show" @close="modal.show = false">
            <h3 slot="header">{{modal.header}}</h3>
            <div slot="body">{{modal.body}}</div>
        </modal>
    </div>
</template>

<script>

import Modal from '../Modal'

import {userDataPost, LOAD_DEVICES_ACTION} from '../../store'

export default {
  name: 'SettingsRegisterDevice',
  components: {Modal},
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
          this.modal = {
            show: true,
            header: 'Регистрация устройства',
            body: error.message
          }
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
