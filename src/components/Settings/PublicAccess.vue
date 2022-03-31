<template>
      <div id="settings_link">
        <a :href="public_url_prefix + post_data.public_id" target="_blank" title="Ссылка откроется в новом окне">{{public_url_prefix}}</a>
        <input type="text" v-capitalize:lower v-model="post_data.public_id" id="input_link_nickname"
            :class="{error: validationErrors.public_id}"><br/>
        <span class="subnote">(можно изменить, от 6 до 20 английских букв и/или цифр)</span>
        <table id="setting_link_devices">
          <tr>
            <th>Устройство</th>
            <th>Показывать по ссылке</th>
          </tr>
          <tr v-for="(device, idx) in post_data.devices" :key="device.id">
              <td class="device">{{$store.state.devices[idx].title}}</td>
            <td><input type="checkbox" v-model="device.public_access"></td>
          </tr>
        </table>
      </div>
</template>

<script>
import ValidationMixin from '../../validation-mixin'

export default {
  name: 'SettingsPublicAccess',
  mixins: [ValidationMixin],
  data () {
    const post_data = {
      login: this.$store.getters.userLogin,
      public_id: this.$store.state.user.public_id,
      devices: this.get_public_devices()
    }
    return {
      post_data: post_data,
      pending: false,
      validationData: post_data,
      validationSchema: 'post_user_public_settings',
    }
  },
  methods: {
    get_public_devices () {
      return this.$store.state.devices.map(item => {
        return {
          id: item.id,
          public_access: item.public_access,
        }
      })
    }
  },
  computed: {
    public_url_prefix () {
      return `${location.protocol}//${location.host}/#/`
    }
  }
}
</script>

<style>
</style>
