<template>
    <div class="settings_devices">
        <div class="device" v-for="device in devices" :key="device.id">
          <table class="device_table">
            <tr>
              <td class="title">
                {{device.title}}
              </td>
              <td rowspan="2" class="edit" @click="open_device(device)">
                Настройки
              </td>
            </tr>
            <tr>
              <td class="type">
                {{device.type_title}} / Код устройства
              </td>
            </tr>
          </table>

            <div class="settings" v-if="edit_device && edit_device.id === device.id">
                <div class="title">
                    <span class="title">Название устройства на сайте</span><br/>
                    <input type="text" v-model="edit_device.title"/>
                </div>
                <div class="prop" v-for="(prop, idx) in edit_device.props_titles" :key="idx">
                    <span class="title">{{prop.title}}</span><br/>
                    <date-picker v-model="edit_device.props_values[idx]" v-if="prop.type === 'date'"
                        locale="ru" :masks="{input: 'DD MMMM'}"></date-picker>
                </div>
                <h4>Названия датчиков устройства на графиках</h4>
                <div class="sensors_param" v-for="(param_entry, param) in edit_device.sensors_params" :key="param">
                    <span class="title">{{$options.SENSORS_PARAMS_TITLES[param]}}</span>
                    <div class="master" v-if="param_entry.sensors.length > 1">
<!--                         <select v-model="param_entry.master">
                             <option v-for="sensor in param_entry.sensors"
                                :value="sensor" :key="sensor.id">
                                {{sensor.title ? sensor.title : sensor.default_title}}
                             </option>
                         </select> -->
                    </div>
                    <div v-for="sensor in param_entry.sensors" class="sensor" :key="sensor.id">
                        <span class="default">{{sensor.default_title}}</span><br/>
                        <input type="text" v-model="sensor.title"/>
                    </div>
                </div>
                <input class="btn" type="submit" value="Сохранить"
                    :disabled="pending" @click="post_device"/>
                <input class="btn" type="submit" value="Отмена" @click="open_device(null)"/>
            </div>
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
            this.device_cache = JSON.parse(JSON.stringify(device))
          })
          .finally(() => {
            this.pending = false
          })
      }
    },
    async post_device () {
      let device_update = this.edit_device.title !== this.device_cache.title
      const queries = []
      if (!device_update) {
        const device_props_length = this.edit_device.props_titles.count
        for (let co = 0; co < device_props_length; co++) {
          if (this.edit_device.props_values[co] !== this.device_cash.props_values[co]) {
            device_update = true
            break
          }
        }
      }
      if (device_update) {
        queries.push({
          url: 'device/' + this.edit_device.id,
          data: {
            title: this.edit_device.title,
            props: this.edit_device.props_values
          }
        })
      }
      const sensors_length = this.edit_device.sensors.length
      for (let co = 0; co < sensors_length; co++) {
        const sensor = this.edit_device.sensors[co]
        const sensor_cache = this.device_cache.sensors[co]
        sensor.is_master = this.edit_device.sensors_params[sensor.type].master == sensor
        if (sensor.title !== sensor_cache.title || sensor.is_master !== sensor_cache.is_master) {
          queries.push({
            url: 'sensor/' + sensor.id,
            data: {
              title: sensor.title,
              is_master: sensor.is_master
            }
          })
        }
      }
      this.pending = false
      let p = null
      for (const query of queries) {
        if (p) {
          p.then(() => userDataPost(query.url, query.data))
        } else {
          p = userDataPost(query.url, query.data)
            .catch(error => {
              this.modal = {
                show: true,
                header: 'Изменение устройства',
                body: error.message
              }
            })
            .finally(() => {
              this.pending = false
            })
        }
      }
      p.then(() => {
        this.open_device(null)
        this.$store.dispatch(LOAD_DEVICES_ACTION)
      })
    }
  }
}
</script>

<style>
</style>
