<template>
    <div id="device_settings">

        <div id="device_setup" v-if="edit_device">

            <device-props :props_headers="edit_device.props_titles"
                :device_type_id="edit_device.type_id"
                :device_mode="edit_device.mode"
                @validated="edit_device_props_validated"
                v-model="edit_device.props_values">

                <template v-slot:device_title>

                    <div class="title">
                        <input type="text" v-model="edit_device.title"/><br/>
                        <span class="title">название устройства на сайте</span>
                    </div>

                    <div id="device_code">
                        {{edit_device.hash}}<br/>
                        <span>код устройства</span>
                    </div>

                    <div id="device_mode" v-if="edit_device_type && edit_device_type.modes">
                        <select v-model="edit_device.mode">
                            <option v-for="mode in edit_device_type.modes" :value="mode.id" 
                                :key="mode.id">
                                {{mode.name}}
                            </option>
                        </select><br/>
                        <span>тип устройства</span>
                    </div>

                    <template v-if="edit_device.enable_schedule">
                        <select v-model="edit_device.schedule_id">
                            <option v-for="schedule in schedules" :key="schedule.id"
                                :value="schedule.id">{{schedule.title}}</option>
                            </select><br/>
                        <span class="title">таблица работы</span>
                    </template>


                </template>
            </device-props>

        </div>

        <div id="function_setup" v-if="edit_device">
            <table id="device_sensor_setup" class="sensors_param" v-if="edit_device_sensors_settings.length">
                <tr>
                    <th>Подключен</th>
                    <th>Датчик</th>
                    <th>Название датчика на графике</th>
                    <th>Поправка</th>
                </tr>
                <tbody v-for="entry in edit_device_sensors_settings" :key="entry.id">
                    <tr class="sensor_type">
                        <td colspan="4">{{entry.title}}</td>
                    </tr>
                    <tr class="sensor" v-for="sensor in entry.sensors" :key="sensor.id">
                        <td class="checkbox">
                            <input type="checkbox" v-model="sensor.enabled"/>
                        </td>
                        <td class="def_title">{{sensor.default_title}}</td>
                        <td class="graph_title"><input type="text" v-model="sensor.title"/></td>
                        <td class="correction"><input type="text" v-model.number="sensor.correction"/></td>
                    </tr>
                </tbody>
            </table>

            <table id="device_switches_setup" class="switches_param" v-if="edit_device_switches.length">
                <tr>
                    <th>Подключен</th>
                    <th>Переключатель</th>
                    <th>Название переключателя на графике</th>
                </tr>
                <tr class="switch" v-for="entry in edit_device_switches" :key="entry.id">
                    <td class="sensor_checkbox"><input type="checkbox" v-model="entry.enabled"/></td>
                    <td class="sensor">{{entry.default_title}}</td>
                    <td class="sensor_graf_title"><input type="text" v-model="entry.title"/></td>
                </tr>
             </table>

            <template v-for="(prop, prop_id) in edit_device.custom_props">
                <component v-if="(!edit_device.mode || 
                    (!prop.title.modes || prop.title.modes.includes(edit_device.mode)))"
                    :is="prop.component"
                    :key="prop_id"
                    :props_headers="prop.title"
                    :value="prop.value"
                    @validated="edit_device_custom_prop_validated">
                </component>
            </template>
        </div>

        <div id="buttons_setup" v-if="edit_device">
            <input class="btn" type="submit" value="Сохранить"
                :disabled="pending" @click="post_device"/>
            <input class="btn cancel" type="submit" value="Отмена" @click="open_device_index"/>
            <br/>
            <input class="btn delete" type="submit" value="Удалить устройство"
                :disabled="pending" @click="delete_device"/>
        </div>
    </div>
</template>

<script>

import {mapState} from 'vuex'

import DeviceProps from './DeviceProps'

import messageBox from '../../message-box'
import {userDataPost, LOAD_DEVICES_ACTION} from '../../store'
import load_device from '../../device'
import {DEVICE_SENSORS_PARAMS, DEVICE_CUSTOM_PROPS} from '../../definitions'

export default {
  name: 'SettingsDevicesIndex',
  components: {DeviceProps},
  props: ['device_id'],
  data () {
    return {
      register_device: false,
      register_device_hash: '',
      edit_device: null,
      pending: false
    }
  },
  async mounted () {
    if (this.device_id) {
      const device = this.devices.find(item => item.id === parseInt(this.device_id))
      if (device) {
        this.open_device(device)
      }
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
    },
    edit_device_type () {
      return this.devices_types && this.edit_device ?
        this.devices_types.find(item => item.id === this.edit_device.type_id) :
        null
    },
    edit_device_switches () {
      return this.edit_device && this.edit_device.switches ? this.edit_device.switches.filter(entry =>
        !this.edit_device.mode || !entry.modes || 
        entry.modes.includes(this.edit_device.mode)) : []
    },
    edit_device_sensors_settings () {
      const r = []
      if (this.edit_device && this.edit_device.sensors_settings) {
        for (const sensors_settings_entry of this.edit_device.sensors_settings) {
          const sensors = sensors_settings_entry.sensors.filter(sensor =>
            !this.edit_device.mode || !sensor.modes || sensor.modes.includes(this.edit_device.mode))
          if (sensors.length) {
            r.push({
              ...sensors_settings_entry,
              sensors: sensors
            })
          }
        }
      }
      return r
    }
  },
  methods: {
    edit_device_props_validated (validation_data) {
      for (const field in validation_data) {
        this.edit_device.props_validation[field] = validation_data[field]
      }
    },
    edit_device_custom_prop_validated (prop_id, msg) {
      this.edit_device.props_validation[prop_id] = msg
    },
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
            const sp_length = DEVICE_SENSORS_PARAMS.length
            for (let co = 0; co < sp_length; co++) {
              if (DEVICE_SENSORS_PARAMS[co].id in device.sensors_params) {
                device.sensors_settings.push({
                  ...DEVICE_SENSORS_PARAMS[co],
                  sensors: device.sensors_params[DEVICE_SENSORS_PARAMS[co].id].sensors
                })
              }
            }
            this.edit_device.custom_props = {}
            for (const custom_prop_def of DEVICE_CUSTOM_PROPS) {
              if (custom_prop_def.device_type_id === this.edit_device.type_id) {
                const prop_idx = this.edit_device.props_titles.findIndex(
                  item => item.id === custom_prop_def.prop_id)
                this.edit_device.custom_props[custom_prop_def.prop_id] = {
                  component: custom_prop_def.component,
                  title: this.edit_device.props_titles[prop_idx],
                  value: this.edit_device.props_values[prop_idx]
                }
              }
            }
            this.edit_device.props_validation = {}

          })
          .finally(() => {
            this.pending = false
          })
      }
    },
    async delete_device () {
      messageBox('Удаление устройства',
        'Вы действительно хотите удалить это устройство?',
        true)
        .then(() => {
          userDataPost('device/' + this.edit_device.id, {delete: true})
            .then(() => {
              this.$store.dispatch(LOAD_DEVICES_ACTION)
              this.$router.push('/')
            })
        })
    },
    open_device_index () {
      this.$router.push('/device/' + this.edit_device.id)
    },
    async post_device () {
      for (const field in this.edit_device.props_validation) {
        if (this.edit_device.props_validation[field]) {
          messageBox('Изменение устройства', this.edit_device.props_validation[field])
          return
        }
      }
      let device_update = this.edit_device.title !== this.device_cache.title ||
        this.edit_device.schedule_id !== this.device_cache.schedule_id ||
        this.edit_device.timezone !== this.device_cache.timezone ||
        this.edit_device.mode !== this.device_cache.mode
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
            timezone: this.edit_device.timezone,
            mode: this.edit_device.mode,
            props: this.edit_device.props_values
          }
        })
      }
      const sensors_length = this.edit_device.sensors.length
      for (let co = 0; co < sensors_length; co++) {
        const sensor = this.edit_device.sensors[co]
        const sensor_cache = this.device_cache.sensors[co]
        sensor.is_master = this.edit_device.sensors_params[sensor.type].master == sensor
        if (sensor.title !== sensor_cache.title || sensor.is_master !== sensor_cache.is_master ||
          sensor.enabled !== sensor_cache.enabled || sensor.correction !== sensor_cache.correction) {
          queries.push({
            url: 'sensor/' + sensor.id,
            data: {
              title: sensor.title,
              is_master: sensor.is_master,
              correction: sensor.correction === "" ? null : sensor.correction,
              enabled: sensor.enabled
            }
          })
        }
      }
      const switches_length = this.edit_device.switches.length
      for (let co = 0; co < switches_length; co++) {
        const switch_item = this.edit_device.switches[co]
        const switch_cache = this.device_cache.switches[co]
        if (switch_item.title !== switch_cache.title || switch_item.enabled !== switch_cache.enabled) {
          queries.push({
            url: `switch/${this.edit_device.id}/${switch_item.id}`,
            data: {
              title: switch_item.title,
              enabled: switch_item.enabled
            }
          })
        }
      }

      if (queries.length) {
        this.pending = true
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
          this.$store.dispatch(LOAD_DEVICES_ACTION)
          this.open_device_index()
        })
      } else {
        this.open_device_index()
      }
    }

  }
}
</script>

<style>
</style>
