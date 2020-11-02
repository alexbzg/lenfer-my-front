import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import storage from '../storage'
import {dataPost} from '../api'

const STORAGE_KEY_USER = 'user'

const INIT_MUTATION = 'initMttn'
export const SET_USER_MUTATION = 'setUserMttn'
export const UPDATE_USER_MUTATION = 'updUserMttn'

export const LOGIN_ACTION = 'loginActn'

const store = new Vuex.Store({
  state: {
    user: null,
    remember: true
  },
  getters: {
    userLogin: state => {
      return state.user ? state.user.login : null
    },
    userToken: state => {
      return state.user ? state.user.token : null
    }
  },
  mutations: {
    [INIT_MUTATION] (state) {
      state.user = storage.load(STORAGE_KEY_USER)
    },
    [SET_USER_MUTATION] (state, payload) {
      state.user = payload.user
      storage.remove(STORAGE_KEY_USER, state.remember ? 'local' : 'session')
      if (payload.user) {
        storage.save(STORAGE_KEY_USER, state.user,
          payload.remember ? 'local' : 'session')
        state.remember = payload.remember
      }
    },
    [UPDATE_USER_MUTATION] (state, payload) {
      Object.assign(state.user, payload)
      storage.save(STORAGE_KEY_USER, state.user,
        payload.remember ? 'local' : 'session')
    }
  },
  actions: {
    [LOGIN_ACTION] ({commit}, payload) {
        return dataPost('login', payload)
          .then(data => { commit(SET_USER_MUTATION, {user: data, remember: true}) })
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(INIT_MUTATION)

export default store

export function userDataPost(url, data) {
  const userData = {
    login: store.getters.userLogin,
    token: store.getters.userToken,
    ...data
  }
  return dataPost(url, userData)
}

