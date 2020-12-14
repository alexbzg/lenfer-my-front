<template>
    <div class="settings_devices">
          <table id="settings_devices_table">
            <tr>
              <td class="title">
                <input type="submit" value="Добавить устройство"
                    @click="register_device = !register_device; edit_device = false"
                    id="new_schedule_button" class="btn" /><br/>
                <div v-for="device in devices" :key="device.id"
                    @click="open_device(device)">
                    <div class="device_title">{{device.title}}</div>
                    <div class="device_type">{{device.type_title}} / {{device.hash}}</div>
                </div>
              </td>
              <td class="settings_window">
                <div class="add_device" v-if="register_device">
                    Введите код устройства<br/>
                    <input type="text" :class="{error: register_device_hash.length < 6}"
                        v-model="register_device_hash"/><br/>
                    <input class="btn" type="submit" @click="register_device_post"
                        :disabled="register_device_hash.length < 6 || pending"
                        value="Отправить"/>
                </div>
                <div class="settings" v-if="edit_device">
                    <div class="title">
                        <span class="title">Название устройства на сайте</span><br/>
                        <input type="text" v-model="edit_device.title"/>
                    </div>
                    <device-props :props_headers="edit_device.props_titles" 
                        v-model="edit_device.props_values">
                    </device-props>
                    <template v-if="edit_device.enable_schedule">
                        <span class="title">Таблица работы</span><br/>
                        <select v-model="edit_device.schedule_id">
                            <option v-for="schedule in schedules" :key="schedule.id"
                                :value="schedule.id">{{schedule.title}}</option>
                        </select>
                    </template>

                    <table id="device_sensor_setup" class="sensors_param" v-if="edit_device.sensors">
                        <tr>
                            <th>Подключен</th>
                            <th>Датчик</th>
                            <th>Название датчика на графике</th>
                        </tr>
                        <tr class="sensor" v-for="(entry, title) in edit_device.sensors_titles"
                            :key="title">
                            <td class="sensor_checkbox">
                                <input type="checkbox" v-model="entry.enabled"/>
                            </td>
                            <td class="sensor">{{title}}</td>
                            <td class="sensor_graf_title">
                                <input type="text" v-model="entry.title"/>
                            </td>
                         </tr>
                    </table>

                    <input class="btn" type="submit" value="Сохранить"
                        :disabled="pending" @click="post_device"/>
                    <input class="btn cancel" type="submit" value="Отмена" @click="open_device(null)"/>
                </div>
              </td>
            </tr>
          </table>
    </div>
</template>

<script>

import {mapState} from 'vuex'

import DeviceProps from './DeviceProps'

import messageBox from '../../message-box'
import {userDataPost, LOAD_DEVICES_ACTION} from '../../store'
import load_device from '../../device'
import {DEVICE_PARAMS} from '../../definitions'

export default {
  name: 'SettingsDevicesIndex',
  components: {DeviceProps},
  data () {
    return {
      register_device: false,
      register_device_hash: '',
      edit_device: null,
      pending: false,
    }
  },
  computed: {
    ...mapState(['devices', 'devices_types']),
    schedules () {
      if (this.edit_device) {
        return this.$store.state.schedules.filter(
          schedule => schedule.device_type_id === this.edit_device.type_id)
      } else {
        return []
      }
    }
  },
  methods: {
    async open_device (device) {
      if (this.pending) {
        return
      }
      this.register_device = false

      if ((!device && this.edit_device) || (this.edit_device && this.edit_device.id === device.id)) {
        this.edit_device = null
      } else if (device) {
        this.pending = true
        load_device(device.id)
          .then(device => {
            this.edit_device = device
            const device_type = this.devices_types.find(
              type => type.id === this.edit_device.type_id)
            this.edit_device.enable_schedule = Boolean(device_type.schedule_params)
            this.device_cache = JSON.parse(JSON.stringify(device))
            this.edit_device.sensors_settings = []
            const sp_length = DEVICE_PARAMS.length
            for (let co = 0; co < sp_length; co++) {
              if (DEVICE_PARAMS[co].id in device.sensors_params) {
                device.sensors_settings.push({
                  ...DEVICE_PARAMS[co],
                  sensors: device.sensors_params[DEVICE_PARAMS[co].id].sensors
                })
              }
            }
          })
          .finally(() => {
            this.pending = false
          })
      }
    },
    async post_device () {
      let device_update = this.edit_device.title !== this.device_cache.title ||
        this.edit_device.schedule_id !== this.device_cache.schedule_id
      const queries = []
      if (!device_update) {
        const device_props_length = this.edit_device.props_titles.length
        for (let co = 0; co < device_props_length; co++) {
          if (this.edit_device.props_values[co] !== this.device_cache.props_values[co]) {
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
            schedule_id: this.edit_device.schedule_id,
            props: this.edit_device.props_values
          }
        })
      }
      const sensors_length = this.edit_device.sensors.length
      for (let co = 0; co < sensors_length; co++) {
        const sensor = this.edit_device.sensors[co]
        const sensor_cache = this.device_cache.sensors[co]
        sensor.is_master = this.edit_device.sensors_params[sensor.type].master == sensor
        sensor.title = this.edit_device.sensors_titles[sensor.default_title].title
        sensor.enabled = this.edit_device.sensors_titles[sensor.default_title].enabled
        if (sensor.title !== sensor_cache.title || sensor.is_master !== sensor_cache.is_master ||
          sensor.enabled !== sensor_cache.enabled) {
          queries.push({
            url: 'sensor/' + sensor.id,
            data: {
              title: sensor.title,
              is_master: sensor.is_master,
              enabled: sensor.enabled
            }
          })
        }
      }
      if (queries.length) {
        this.pending = false
        let p = null

        for (const query of queries) {
          if (p) {
            p.then(() => userDataPost(query.url, query.data))
          } else {
            p = userDataPost(query.url, query.data)
              .catch(error => {
                messageBox('Изменение устройства', error.message)
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
      } else {
        this.open_device(null)
      }
    },
    async register_device_post () {
      userDataPost('device/register', {device_hash: this.register_device_hash})
        .then(() => {
          this.register_device_hash = ''
          this.$store.dispatch(LOAD_DEVICES_ACTION)
        })
        .catch(error => {
          messageBox('Регистрация устройства', error.message)
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
