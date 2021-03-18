<template>
    <div class="settings_profile">
      <table id="setting_login">
        <tr>
          <td class="email">{{$store.state.user.login}}</td>
          <td><input type="password" v-model="post_data.password" :class="{error: validationErrors.password}"/></td>
          <td><input type="button" :disabled="pending || !validated" value="Сохранить" @click="post" class="btn" /></td>
        </tr>
        <tr>
          <th>email</th>
          <th>пароль</th>
          <th></th>
        </tr>
      </table>

      <div id="settings_link">
        <span class="note">Ссылка для просмотра статистики ваших устройств<br/><span>(можно изменить, от 6 до 20 английских букв и/или цифр)</span><br/><br/></span>
        <span id="link">http://my.lenfer.ru/</span>
        <input type="text" v-capitalize:lower :value="post_data.public_id" id="input_link_nickname">
        <a :href="'http://my.lenfer.ru/' + post_data.public_id" target="_blank">
          <img src="images/icon_weblink.png" width="15" title="Ссылка откроется в новом окне" />
        </a><br/>

        <table id="setting_link_devices">
          <tr>
            <th>Устройство</th>
            <th>Показывать по ссылке</th>
          </tr>
          <tr v-for="device in public_devices" :key="device.id">
              <td>{{device.title}}</td>
            <td><input type="checkbox" v-model="device.public_access"></td>
          </tr>
        </table>
        <input type="button" class="btn" value="Сохранить" @click="post_public_devices">
      </div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import ValidationMixin from '../../validation-mixin'
import messageBox from '../../message-box'

import {UPDATE_USER_MUTATION, LOAD_DEVICES_ACTION, userDataPost} from '../../store'

export default {
  name: 'SettingsProfile',
  mixins: [ValidationMixin],
  data () {
    const post_data = {
      password: '',
      public_id: this.$store.state.user.public_id
    }
    return {
      post_data: post_data,
      pending: false,
      validationData: post_data,
      validationSchema: 'post_user_settings',
      public_devices: this.get_public_devices()
    }
  },
  methods: {
    get_public_devices () {
      return this.$store.state.devices.map(item => {
        return {
          id: item.id, 
          public_access: item.public_access, 
          title: item.title
        }
      })
    },
    post () {
      this.pending = true
      userDataPost('user/settings', this.post_data)
        .then(() => {
          this.$store.dispatch(UPDATE_USER_MUTATION, {email: this.post_data.email})
        })
        .catch(err => {
          messageBox('Ошибка сохранения', err)
        })
        .finally(() => {
          this.pending = false
        })
    },
    post_public_devices () {
      this.pending = true
        userDataPost('device/public_access', 
          {values: this.public_devices.map(item => {
            return {id: item.id, public_access: item.public_access}
          })})
        .then(() => {
          this.$store.dispatch(LOAD_DEVICES_ACTION)
            .then(() => {
              this.public_devices = this.get_public_devices()
              messageBox("Настройки просмотра", "Изменения сохранены.")
            })
        })
        .catch(err => {
          messageBox('Ошибка сохранения', err)
        })
        .finally(() => {
          this.pending = false
        })
    }
  },
  computed: {
    ...mapGetters(['userLogin'])
  }
}
</script>

<style>
</style>
