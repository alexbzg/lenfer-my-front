<template>
    <div id="settings_profile">

      <span class="note">Смена пароля доступа</span>
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

      <span class="note">Ссылка для просмотра статистики ваших устройств</span><br/>
      <settings-public-access></settings-public-access>

    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import ValidationMixin from '../../validation-mixin'
import messageBox from '../../message-box'

import SettingsPublicAccess from './PublicAccess'

import {userDataPost} from '../../store'

export default {
  name: 'SettingsProfile',
  mixins: [ValidationMixin],
  components: {SettingsPublicAccess},
  data () {
    const post_data = {
      login: this.$store.getters.userLogin,
      password: ''
    }
    return {
      post_data: post_data,
      pending: false,
      validationData: post_data,
      validationSchema: 'post_user_settings',
    }
  },
  methods: {
    post () {
      this.pending = true
      userDataPost('user/settings', this.post_data)
        .then(() => {
          messageBox("Настройки пользователя", "Изменения сохранены.")
        })
        .catch(err => {
          messageBox('Ошибка сохранения', err.message)
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
