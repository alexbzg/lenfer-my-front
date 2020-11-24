import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import storage from '../storage'
import {get, dataPost} from '../api'
import router from '../router'
import {Schedule} from '../schedule'

const STORAGE_KEY_USER = 'user'

const INIT_MUTATION = 'initMttn'
export const SET_USER_MUTATION = 'setUserMttn'
export const UPDATE_USER_MUTATION = 'updUserMttn'
const SET_DEVICES_MUTATION = 'setDevicesMttn'
const SET_DEVICES_TYPES_MUTATION = 'setDevicesTypesMttn'
const SET_SCHEDULES_MUTATION = 'setSchedulessMttn'

export const LOGIN_ACTION = 'loginActn'
export const LOAD_DEVICES_ACTION = 'loadDeviceActn'
export const LOAD_SCHEDULES_ACTION = 'loadSchedulesActn'
const LOAD_DEVICES_TYPES_ACTION = 'loadDevicesTypesActn'

const store = new Vuex.Store({
  state: {
    user: null,
    remember: true,
    devices: [],
    schedules: [],
    devices_types: []
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
    [SET_DEVICES_TYPES_MUTATION] (state, payload) {
      state.devices_types = payload
    },
    [SET_SCHEDULES_MUTATION] (state, payload) {
      state.schedules = payload.map(item => new Schedule(item, state.devices_types))
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
    }, 
    [LOAD_DEVICES_TYPES_ACTION] ({commit}) {
      return get('/api/devices_types')
        .then(response => { commit(SET_DEVICES_TYPES_MUTATION, response.data) })
    },
    [LOAD_SCHEDULES_ACTION] ({commit}) {
      userDataPost('users_device_schedules')
        .then(data => { commit(SET_SCHEDULES_MUTATION, data) })
    }
  },
  strict: process.env.NODE_ENV !== 'production'
})

store.commit(INIT_MUTATION)
store.dispatch(LOAD_DEVICES_ACTION)
store.dispatch(LOAD_DEVICES_TYPES_ACTION)
  .then(() => { store.dispatch(LOAD_SCHEDULES_ACTION) })

export default store

export function userDataPost(url, data, method='POST') {
  const userData = {
    login: store.getters.userLogin,
    token: store.getters.userToken,
    ...data
  }
  return dataPost(url, userData, method)
}

