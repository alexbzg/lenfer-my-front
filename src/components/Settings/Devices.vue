<template>
    <div class="settings_devices">
          <table id="settings_devices_table">
            <tr>
              <td class="title">
                <input type="submit" value="Добавить устройство" 
                    @click="register_device = !register_device"
                    id="new_schedule_button" class="btn" /><br/>
                <div v-for="device in devices" :key="device.id"
                    @click="open_device(device)">
                    <div class="device_title">{{device.title}}</div>
                    <div class="device_type">{{device.type_title}} / {{device.hash}}</div>
                </div>
              </td>
              <td class="settings_widow">
                <div class="add_device" v-if="register_device">
                    введите код устройства
                    <input type="text" :class="{error: register_device_hash.length < 6}"
                        v-model="register_device_hash"/>
                    <input class="btn" type="submit" @click="register_device_post" 
                        :disabled="register_device_hash.length < 6 || pending"
                        value="Отправить"/>
                </div>
                <div class="settings" v-if="edit_device">
                    <div class="title">
                        <span class="title">Название устройства на сайте</span><br/>
                        <input type="text" v-model="edit_device.title"/>
                    </div>
                    <div class="prop" v-for="(prop, idx) in edit_device.props_titles" :key="idx">
                        <span class="title">{{prop.title}}</span><br/>
                        <template v-if="prop.type === 'date'">
                            <date-picker v-model="edit_device.props_values[idx]" locale="ru" 
                                :masks="{input: 'DD MMMM'}"></date-picker><br/>
                        </template>
                    </div>
                    Таблица работы
                    <select v-model="edit_device.schedule_id">
                        <option v-for="schedule in schedules" :key="schedule.id" 
                            :value="schedule.id">{{schedule.title}}</option>
                    </select>
                    <h4>Названия датчиков устройства на графиках</h4>
                    <div class="sensors_param" v-for="param_entry in edit_device.sensors_settings"
                        :key="param_entry.id">
                        <span class="title">{{param_entry.title}}</span>
                        <!--div class="master" v-if="param_entry.sensors.length > 1">
                            <select v-model="param_entry.master">
                                <option v-for="sensor in param_entry.sensors"
                                    :value="sensor" :key="sensor.id">
                                    {{sensor.title ? sensor.title : sensor.default_title}}
                                </option>
                            </select>
                        </div-->
                        <div v-for="sensor in param_entry.sensors" class="sensor" :key="sensor.id">
                            <span class="default">{{sensor.default_title}}</span><br/>
                            <input type="text" v-model="sensor.title"/>
                        </div>
                    </div>
                    <input class="btn" type="submit" value="Сохранить"
                        :disabled="pending" @click="post_device"/>
                    <input class="btn" type="submit" value="Отмена" @click="open_device(null)"/>
                </div>
              </td>
            </tr>
          </table>
    </div>
</template>

<script>

import {mapState} from 'vuex'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

import messageBox from '../../message-box'
import {userDataPost, LOAD_DEVICES_ACTION} from '../../store'
import load_device from '../../device'
import {DEVICE_PARAMS} from '../../definitions'

export default {
  name: 'SettingsDevicesIndex',
  components: {DatePicker},
  data () {
    return {
      register_device: false,
      register_device_hash: '',
      edit_device: null,
      pending: false,
    }
  },
  computed: {
    ...mapState(['devices']),
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

      if ((!device && this.edit_device) || (this.edit_device && this.edit_device.id === device.id)) {
        this.edit_device = null
      } else if (device) {
        this.pending = true
        load_device(device.id)
          .then(device => {
            this.edit_device = device
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
