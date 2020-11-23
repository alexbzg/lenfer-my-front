<template>
</template>

<script>

import messageBox from '../../message-box'
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
  }
}
</script>

<style>
</style>
