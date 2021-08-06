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

        <span class="note">Координаты</span>
        <div id="location">
            <input type="text" v-model="location_edit" :class="{error: !location_validated}"/>
            <input type="button" @click="geolocate" value="Получить" class="btn"
                v-if="geolocation_enabled"/>
        </div>

        <span class="note">Ссылка для просмотра статистики ваших устройств</span><br/>
        <settings-public-access @validation="public_access_validation"></settings-public-access>
        <input type="button" :disabled="pending || !validated || !public_access.validated || !location_validated"
            value="Сохранить" @click="post" class="btn" />

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
      location: this.$store.state.user.location ? [...this.$store.state.user.location] : null,
      timezone: this.$store.state.user.timezone
    }
    return {
      post_data: post_data,
      pending: false,
      public_access: {
        data: null,
        validated: true
      },
      location_edit: post_data.location ? post_data.location.join(', ') : '',
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
    geolocate () {
      navigator.geolocation.getCurrentPosition((position) => {
        this.location_edit = `${position.coords.latitude}, ${position.coords.longitude}`
      })  
    },
    post () {
      this.pending = true
      const requests = []
      if (this.post_data.password || this.post_data.timezone !== this.$store.state.user.timezone ||
        ((this.post_data.location === null && this.location !== null) ||
          (this.post_data.location !== null && this.location === null) ||
          (this.post_data.location[0] !== this.location[0] || this.post_data.location[1] !== this.location[1])
        )) {
        this.post_data.location = [...this.location]
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
    ...mapGetters(['userLogin']),
    location () {
      if (this.location_edit) {
        const coords = this.location_edit.split(/[\s,]+/, 2).map(item => parseFloat(item))
        if (coords.length > 1 &&
          !isNaN(coords[0]) && coords[0] > -90 && coords[0] < 90 &&
          !isNaN(coords[1]) && coords[1] > -180 && coords[1] < 180) {
          return coords
        } else {
          return [NaN]
        }
      } else {
        return null
      }
    },
    location_validated () {
      return this.location === null || !isNaN(this.location[0])
    }, 
    geolocation_enabled () {
      return 'geolocation' in navigator
    }

  }
}
</script>

<style>
</style>
