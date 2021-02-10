<template>
    <div id="login_form">

        <template v-if="mode !== 'password_change'">
            <b>Логин</b><br/>
            <input type="text" name="login_input" id="login_input" v-model.trim="login"
                v-capitalize/>
            <br/>
        </template>

        <template v-if="mode === 'register'">
            <b>Email</b> <span class="note">(минимум 8 символов)</span><br/>
            <input type="text" name="email_input" id="email_input"
                v-model="email"><br/>
        </template>

        <template v-if="mode !== 'password_request'">
            <b>Пароль</b> <span class="note">(минимум 8 символов)</span><br/>
            <input type="password" name="password_input" id="password_input"
                v-model="password"><br/>
        </template>

        <div id="recap"  v-if="mode === 'register' || mode === 'password_request'">
            <vue-recaptcha 
            ref="recaptcha"
            @verify="recaptcha_verify"
            @expired="recaptcha_expired"
            sitekey="6LcV3tMZAAAAAIRtLU5nGm0cnwWdsKpxB-HswOpr">
            </vue-recaptcha>
        </div>

        <input type="button" name="login_btn" id="login_btn"
                :disabled="pending" value='Вход' class="btn" @click="post()"/>

        <div id="login_bottom" v-if="mode !== 'passwordChange'">
            <a id="pass_recovery" href="#" 
                @click="mode = (mode === 'password_request' ? 'login' : 'password_request')">
                {{mode === 'password_request' ? 'Вход/Регистрация' : 'Восстановление пароля'}}
            </a>
            <input type="button" name="register_btn" id="login2_btn" 
                v-if="mode !== 'password_request'"
                :value="mode === 'register' ? 'Вход' : 'Регистрация'" class="btn"
                @click="mode = mode === 'register' ? 'login' : 'register'"/>
        </div>

    </div>
</template>

<script>

import {LOGIN_ACTION} from '../store'

export default {
  name: 'Login',
  props: ['passsword_recovery_token'],
  data () {
    return {
      mode: 'login',
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
