<template>
    <div class="settings_devices">
        <div class="device" v-for="device in devices" :key="device.id">
            <span class="type">{{device.type_title}}</span>&nbsp;
            <span class="title">{{device.title}}</span>&nbsp;
            <span class="edit" @click="toggle_show_settings(device)">Настройки</span>
        </div>
        <div class="add_device">
            Регистрация устройства:<br/>
            введите код 
            <input type="text" :class="{error: register_device_hash.length < 6}" 
                v-model="register_device_hash"/> 
            <input type="submit" @click="register_device" :disabled="register_device_hash.length < 6 || pending"
                value="Отправить"/>
        </div>
        <modal v-if="modal.show" @close="modal.show = false">
            <h3 slot="header">{{modal.header}}</h3>
            <div slot="body">{{modal.body}}</div>
        </modal>

    </div>
</template>

<script>

import {mapState} from 'vuex'

import Modal from '../Modal'

import {userDataPost, LOAD_DEVICES_ACTION} from '../../store'

export default {
  name: 'SettingsDevicesIndex',
  components: {Modal},
  data () {
    return {
      show_settings: null,
      register_device_hash: '',
      pending: false,
      modal: {
        show: false,
        header: '',
        body: ''
      }
    }
  },
  computed: {
    ...mapState(['devices'])
  },
  methods: {
    toggle_show_settings (device) {
      this.show_settings = this.show_settings === device ? null : device
    }, 
    register_device () {
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
