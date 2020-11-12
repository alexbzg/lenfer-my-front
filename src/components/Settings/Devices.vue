<template>
    <div class="settings_devices">
        <div class="device" v-for="device in devices" :key="device.id">
            <span class="type">{{device.type_title}}</span>&nbsp;
            <span class="title">{{device.title}}</span>&nbsp;
            <span class="edit" @click="open_device(device)">Настройки</span>
            <div class="settings" v-if="edit_device && edit_device.id === device.id">
                <div class="title">
                    <span class="title">Название</span> 
                    <input type="text" v-model="edit_device.title"/>                    
                </div>
                <div class="prop" v-for="(prop, idx) in edit_device.props_titles" :key="idx">
                    <span class="title">{{prop.title}}</span>
                    <date-picker v-model="edit_device.props_values[idx]" v-if="prop.type === 'date'"
                        locale="ru" :masks="{input: 'DD MMMM'}"></date-picker>
                </div>
                <h4>Датчики</h4>
                <div class="sensors_param" v-for="(param_entry, param) in edit_device.sensors_params" :key="param">
                    <span class="title">{{$options.SENSORS_PARAMS_TITLES[param]}}</span>
                    <div class="master">
                         Основной 
                         <select v-model="param_entry.master">
                             <option v-for="sensor in param_entry.sensors" 
                                :value="sensor" :key="sensor.id">
                                {{sensor.title ? sensor.title : sensor.default_title}}
                             </option>
                         </select>
                    </div>
                    <div v-for="sensor in param_entry.sensors" class="sensor" :key="sensor.id">
                        <span class="default">{{sensor.default_title}}</span><br/>
                        Название <input type="text" v-model="sensor.title"/>
                    </div>
                    <input type="submit" value="Сохранить" 
                        :disabled="pending" @click="post_device"/>
                    <input type="submit" value="Отмена" @click="open_device(null)"/>
                </div>
            </div>
        </div>
        <div class="add_device">
            Регистрация устройства:<br/>
            введите код 
            <input type="text" :class="{error: register_device_hash.length < 6}" 
                v-model="register_device_hash"/> 
            <input type="submit" @click="register_device" :disabled="register_device_hash.length < 6 || pending"
                value="Отправить"/>
        </div>
        <modal v-if="modal.show" @close="modal.show = false">
            <h3 slot="header">{{modal.header}}</h3>
            <div slot="body">{{modal.body}}</div>
        </modal>

    </div>
</template>

<script>

import {mapState} from 'vuex'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

import Modal from '../Modal'

import {userDataPost, LOAD_DEVICES_ACTION} from '../../store'
import load_device from '../../device'
import {SENSORS_PARAMS_TITLES} from '../../utils'

export default {
  SENSORS_PARAMS_TITLES: SENSORS_PARAMS_TITLES,
  name: 'SettingsDevicesIndex',
  components: {Modal, DatePicker},
  data () {
    return {
      edit_device: null,
      register_device_hash: '',
      pending: false,
      modal: {
        show: false,
        header: '',
        body: ''
      }
    }
  },
  computed: {
    ...mapState(['devices'])
  },
  methods: {
    async open_device (device) {
      if (this.pending) {
        return
      }

      if ((!device && this.edit_device) || (this.edit_device && this.edit_device.id === device.id)) {
        this.edit_device = null
      } else {
        this.pending = true
        load_device(device.id)
          .then(device => {
            this.edit_device = device
          })
          .finally(() => {
            this.pending = false
          })
      }
    }, 
    async register_device () {
      userDataPost('device/register', {device_hash: this.register_device_hash})
        .then(() => { 
          this.register_device_hash = ''
          this.$store.dispatch(LOAD_DEVICES_ACTION) 
        })
        .catch(error => {
          this.modal = {
            show: true,
            header: 'Регистрация устройства',
            body: error.message
          }
        })
        .finally(() => {
          this.pending = false
        })
    },
    async post_device () {
    }
  }
}
</script>

<style>
</style>
