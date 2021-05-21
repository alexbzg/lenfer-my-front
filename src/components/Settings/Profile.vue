<template>
    <div id="settings_profile">

        <span class="note">Смена пароля доступа</span>
        <table id="setting_login">
            <tr>
                <td class="email">{{$store.state.user.login}}</td>
                <td><input type="password" v-model="post_data.password" @input="password_input"
                    :class="{error: post_data.password && validationErrors.password}"/></td>
            </tr>
            <tr>
                <th>email</th>
                <th>пароль</th>
            </tr>
        </table>

        <span class="note">Часовой пояс</span>
        <div id="timezone">
            <select v-model="post_data.timezone">
                <option v-for="entry in $options.TIMEZONES" :value="entry.id" :key="entry.id">
                    {{entry.title}}
                </option>
            </select>
        </div>


        <span class="note">Ссылка для просмотра статистики ваших устройств</span><br/>
        <settings-public-access @validation="public_access_validation"></settings-public-access>
        <input type="button" :disabled="pending || !validated || !public_access.validated" value="Сохранить" @click="post" class="btn" />

    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import ValidationMixin from '../../validation-mixin'

import messageBox from '../../message-box'
import TIMEZONES from '../../timezones'

import SettingsPublicAccess from './PublicAccess'

import {UPDATE_USER_MUTATION, LOAD_DEVICES_ACTION, userDataPost} from '../../store'

export default {
  TIMEZONES: TIMEZONES,
  name: 'SettingsProfile',
  mixins: [ValidationMixin],
  components: {SettingsPublicAccess},
  data () {
    const post_data = {
      login: this.$store.getters.userLogin,
      password: null,
      timezone: this.$store.state.user.timezone
    }
    return {
      post_data: post_data,
      pending: false,
      public_access: {
        data: null,
        validated: true
      },
      validationData: post_data,
      validationSchema: "post_user_settings"
    }
  },
  methods: {
    password_input () {
      if (!this.post_data.password && this.post_data.password !== null) {
        this.post_data.password = null
      }
    },
    post () {
      this.pending = true
      const requests = []
      if (this.post_data.password || this.post_data.timezone !== this.$store.state.user.timezone) {
        requests.push(userDataPost('user/settings', this.post_data)
          .then(() => {
            this.$store.commit(UPDATE_USER_MUTATION, {timezone: this.post_data.timezone})
          })
        )
      }
      requests.push(userDataPost('user/public', this.public_access.data)
        .then(() => {
          this.$store.commit(UPDATE_USER_MUTATION, {public_id: this.public_access.data.public_id})
          this.$store.dispatch(LOAD_DEVICES_ACTION)
        })
      )
      Promise.all(requests)
        .then(() => {
          messageBox("Настройки пользователя", "Изменения сохранены.")
        })
        .catch(err => {
          messageBox('Ошибка сохранения', err.message)
        })
        .finally(() => {
          this.pending = false
        })
    },
    public_access_validation(validated, data) {
      this.public_access = {
        validated: validated,
        data: data
      }
    }
  },
  computed: {
    ...mapGetters(['userLogin'])
  }
}
</script>

<style>
</style>
