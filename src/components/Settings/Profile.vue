<template>
    <div class="settings_profile">
        <input type="text" v-model="post_data.email" :class="{error: validationErrors.email}" />
        <input type="password" v-model="post_data.password" :class="{error: validationErrors.password}"/>
        <input type="button" :disabled="pending || !validated" value="Сохранить" @click="post"/>
        <modal v-if="post_error" @close="post_error = null">
            <h3 slot="header">Ошибка сохранения</h3>
            <div slot="body">
                {{post_error}}
            </div>
        </modal>
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
      email: this.$store.state.user.email,
      password: ''
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
  }
}
</script>

<style>
</style>
