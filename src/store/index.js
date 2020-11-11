import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import storage from '../storage'
import {dataPost} from '../api'
import router from '../router'

const STORAGE_KEY_USER = 'user'

const INIT_MUTATION = 'initMttn'
export const SET_USER_MUTATION = 'setUserMttn'
export const UPDATE_USER_MUTATION = 'updUserMttn'
const SET_DEVICES_MUTATION = 'setDevicesMttn'

export const LOGIN_ACTION = 'loginActn'
export const LOAD_DEVICES_ACTION = 'loadDeviceActn'

const store = new Vuex.Store({
  state: {
    user: null,
    remember: true,
    devices: []
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
    [SET_DEVICES_MUTATION] (state, payload) {
      state.devices = payload
      if (payload.length) {
        router.addRoutes([{path: '/', redirect: '/device/' + payload[0].id}])
      }
    },
    [UPDATE_USER_MUTATION] (state, payload) {
      Object.assign(state.user, payload)
      storage.save(STORAGE_KEY_USER, state.user,
        payload.remember ? 'local' : 'session')
    }
  },
  actions: {
    [LOGIN_ACTION] ({commit, dispatch}, payload) {
      return dataPost('login', payload)
        .then(data => { 
          commit(SET_USER_MUTATION, {user: data, remember: true}) 
          dispatch(LOAD_DEVICES_ACTION)
        })
    },
    [LOAD_DEVICES_ACTION] ({commit}) {
      return userDataPost('users_devices')
        .then(data => { commit(SET_DEVICES_MUTATION, data) })
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(INIT_MUTATION)
store.dispatch(LOAD_DEVICES_ACTION)

export default store

export function userDataPost(url, data) {
  const userData = {
    login: store.getters.userLogin,
    token: store.getters.userToken,
    ...data
  }
  return dataPost(url, userData)
}

