<template>
      <div id="login_form">
        <b>Логин</b><br/>
        <input type="text" name="login_input" id="login_input" v-model.trim="login"
              v-capitalize/>
        <br/>
        <b>Пароль</b> <span class="note">(минимум 8 символов)</span><br/>
        <input type="password" name="password_input" id="password_input"
              v-model="password"><br/>
        <input type="button" name="login_btn" id="login_btn"
                  :disabled="pending" value='Вход' class="btn" @click="post()"/>
      </div>
</template>

<script>

import {LOGIN_ACTION} from '../store'

export default {
  name: 'Login',
  data () {
    return {
      login: null,
      password: null,
      pending: false
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.$store.getters.userLogin) {
        vm.$router.push('/')
      }
    })
  },
  methods: {
    post() {
      this.pending = true
      this.$store.dispatch(LOGIN_ACTION,
        {login: this.login, password: this.password})
        .then(() => {
          this.$emit('login')
          this.$router.push('/')
        })
        .catch(e => {
          alert(e.message)
        })
        .finally(() => {
          this.pending = false
        })
    }
  }
}
</script>

<style scoped>
</style>
