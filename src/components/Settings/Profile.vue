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
      <modal v-if="post_error" @close="post_error = null">
        <h3 slot="header">Ошибка сохранения</h3>
        <div slot="body">
          {{post_error}}
        </div>
      </modal>

      <div id="settings_link">
        <span class="note">Ссылка для просмотра статистики ваших устройств<br/><span>(можно изменить, от 6 до 20 английских букв и/или цифр)</span><br/><br/></span>
        <span id="link">http://my.lenfer.ru/</span><input type="text" :value="post_data.public_id" id="input_link_nickname">
        <a :href="'http://my.lenfer.ru/' + post_data.public_id" target="_blank">
          <img src="images/icon_weblink.png" width="15" title="Ссылка откроется в новом окне" />
        </a><br/>

        <table id="setting_link_devices">
          <tr>
            <th>Устройство</th>
            <th>Показывать по ссылке</th>
          </tr>
          <tr>
            <td>Брудер</td>
            <td><input type="checkbox" checked></td>
          </tr>
          <tr>
            <td>Офис</td>
            <td><input type="checkbox"></td>
          </tr>
        </table>
        <input type="button" class="btn" value="Сохранить">
      </div>
    </div>
</template>

<script>

import ValidationMixin from '../../validation-mixin'

import Modal from '../Modal'

import {UPDATE_USER_MUTATION, userDataPost} from '../../store'

export default {
  name: 'SettingsProfile',
  mixins: [ValidationMixin],
  components: {Modal},
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
      post_error: null
    }
  },
  methods: {
    post () {
      this.pending = true
      userDataPost('user/settings', this.post_data)
        .then(() => {
          this.$store.commit(UPDATE_USER_MUTATION, {email: this.post_data.email})
        })
        .catch(err => {
          this.post_error = err.message
        })
        .finally(() => {
          this.pending = false
        })
    }
  },
  computed: {
    userLogin () {
      return this.$store.getters.userLogin ? this.$store.getters.userLogin.toLowerCase() : null
    }
  }
}
</script>

<style>
</style>
