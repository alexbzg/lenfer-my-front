<template>
    <div id="wrap">
    <div id="login_form">
        <img src="/images/logo_lk2.png" />
        <template v-if="mode !== 'password_change'">
            <b>Email</b><br/>
            <input type="text" name="login_input" id="login_input" v-model.trim="post_data.login"
                v-capitalize:lower/>
            <br/>
        </template>

        <template v-if="mode !== 'password_request'">
            <b>Пароль</b> <span class="note">(минимум 8 символов)</span><br/>
            <input type="password" name="password_input" id="password_input"
                v-model="post_data.password"><br/>
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
                :disabled="pending" class="btn" @click="post()"
                :value="({login: 'Войти', register: 'Зарегистрироваться',
                    password_request: 'Отправить', password_recovery: 'Сохранить'})[mode]"
                />

        <div id="login_bottom" v-if="mode !== 'password_change'">

             <a id="register" href="#"
                v-if="mode !== 'password_request'"
                @click="set_mode(mode === 'register' ? 'login' : 'register')">
                {{mode === 'register' ? 'Вход' : 'Регистрация'}}
            </a>
            <br/>

            <a id="pass_recovery" href="#"
                @click="set_mode(mode === 'password_request' ? 'login' : 'password_request')">
                {{mode === 'password_request' ? 'Вход/Регистрация' : 'Восстановление пароля'}}
            </a>


        </div>
      </div>
    </div>
</template>

<script>

import VueRecaptcha from 'vue-recaptcha'
import ValidationMixin from '../validation-mixin'
import {LOGIN_ACTION, REGISTER_ACTION} from '../store'
import {dataPost} from '../api'
import messageBox from '../message-box'

export default {
  name: 'Login',
  components: {VueRecaptcha},
  mixins: [ValidationMixin],
  props: ['token'],
  data () {
    const post_data = {
      login: null,
      password: null,
      recaptcha: null,
      token: null
    }
    return {
      mode: 'login',
      validationSchema: 'login',
      validationData: post_data,
      post_data: post_data,
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
  mounted () {
    if (this.token) {
      this.mode = 'password_recovery'
      this.post_data.token = this.token
    }
  },
  methods: {
    set_mode (mode) {
      this.mode = mode
      this.validationSchema = (mode === 'password_request' ? 'passwordRequest' : 'login')
    },
    recaptcha_verify (response) {
      this.post_data.recaptcha = response
    },
    recaptcha_expired () {
      this.post_data.recaptcha = null
    },
    reset_recaptcha () {
      this.recaptcha_expired()
      this.$refs.recaptcha.reset()
    },
    post() {
      this.pending = true
      if (this.mode === 'login' || this.mode === 'register') {
        const action = (this.mode === 'login' ? LOGIN_ACTION : REGISTER_ACTION)
        this.$store.dispatch(action, this.post_data)
          .then(() => {
            this.$emit('login')
            this.$router.push('/')
          })
          .catch(e => {
            const msg_title = (this.mode === 'login' ? 'Вход' : 'Регистрация')
            messageBox(msg_title, e.message)
          })
      } else {
        const url = (this.mode === 'password_request' ? 'password_recovery_request' : 'password_recovery')
        dataPost(url, this.post_data)
          .then(() => {
            const msg = (this.mode === 'password_request' ?
              'На ваш почтовый адрес было отправлено письмо с инструциями.' :
              'Пароль был изменен.')
            messageBox('Восстановление пароля', msg)
              .then(() => {
                this.set_mode('login')
              })
          })
          .catch(e => {
            messageBox('Восстановление пароля', e.message)
          })
      }
      this.pending = false
    }
  }
}
</script>

<style scoped>
</style>
