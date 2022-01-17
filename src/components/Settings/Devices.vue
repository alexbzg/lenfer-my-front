<template>
    <div id="device_settings">

        <div id="device_setup" v-if="device">

            <device-props 
                :device_type_id="device.type_id"
                :device_mode="device.mode"
                @validated="device_props_validated"
                v-model="device.props">

                <template v-slot:device_title>

                    <div class="title">
                        <input type="text" v-model="device.title"/><br/>
                        <span class="title">название устройства на сайте</span>
                    </div>

                    <div id="device_code">
                        {{device.hash}}<br/>
                        <span>код устройства</span>
                    </div>

                    <div id="device_mode" v-if="device_type && device_type.modes">
                        <select v-model="device.mode">
                            <option v-for="mode in device_type.modes" :value="mode.id" 
                                :key="mode.id">
                                {{mode.name}}
                            </option>
                        </select><br/>
                        <span>тип устройства</span>
                    </div>

                    <template v-if="device_type.schedule_params">
                        <select v-model="device.schedule_id">
                            <option v-for="schedule in schedules" :key="schedule.id"
                                :value="schedule.id">{{schedule.title}}</option>
                            </select><br/>
                        <span class="title">таблица работы</span>
                    </template>


                </template>
            </device-props>

        </div>

        <div id="function_setup" v-if="device">
            <table id="device_sensor_setup" class="sensors_param" v-if="sensors_settings.length">
                <tr>
                    <th>Подключен</th>
                    <th>Датчик</th>
                    <th>Название датчика на графике</th>
                    <th>Поправка</th>
                </tr>
                <tbody v-for="(entry, idx) in sensors_settings" :key="idx">
                    <tr class="sensor" v-if="entry.length > 1">
                        <td class="checkbox"></td>
                        <td class="def_title">{{entry[0].sensor.default_title}}</td>
                        <td class="graph_title">
                            <input type="text" v-model="entry[0].sensor.title" 
                                @change="sync_sensors_group_title(idx)"/>
                        </td>
                        <td class="correction"></td>
                    </tr>
                    <tr class="sensor" v-for="sensor in entry" :key="sensor.sensor.id">
                        <td class="checkbox">
                            <input type="checkbox" v-model="sensor.sensor.enabled"/>
                        </td>
                        <template v-if="entry.length > 1">
                            <td colspan="2" class="param">{{sensor.param.title}}</td>
                        </template>
                        <template v-else>
                            <td class="def_title">{{sensor.sensor.default_title}}</td>
                            <td class="graph_title">
                                <input type="text" v-model="sensor.sensor.title"/>
                            </td>
                        </template>
                        <td class="correction">
                            <input type="text" v-model.number="sensor.sensor.correction"/>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table id="device_switches_setup" class="switches_param" 
                v-if="device.switches && device.switches.length">
                <tr>
                    <th>Подключен</th>
                    <th>Переключатель</th>
                    <th>Название переключателя на графике</th>
                </tr>
                <tr class="switch" v-for="entry in device.switches" :key="entry.id">
                    <td class="sensor_checkbox"><input type="checkbox" v-model="entry.enabled"/></td>
                    <td class="sensor">{{entry.default_title}}</td>
                    <td class="sensor_graf_title"><input type="text" v-model="entry.title"/></td>
                </tr>
             </table>

            <template v-for="(prop, prop_id) in custom_props">
                <component 
                    :is="prop.component"
                    :key="prop_id"
                    :prop_header="device_prop_header(prop.idx)"
                    v-model="device.props[prop.idx].value"
                    :device_type_id="device.type_id"
                    @validated="device_custom_prop_validated">
                </component>
            </template>
        </div>

        <div id="buttons_setup" v-if="device">
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
      device: null,
      props_validation: {}, 
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
      if (this.device) {
        return this.$store.state.schedules.filter(
          schedule => schedule.device_type_id === this.device.type_id)
      } else {
        return []
      }
    },
    device_type () {
      return this.devices_types && this.device ?
        this.devices_types.find(item => item.id === this.device.type_id) :
        null
    },
    sensors_settings () {
      const r = []
      if (this.device) {
        for (const SENSOR_PARAM of DEVICE_SENSORS_PARAMS) {
          if (SENSOR_PARAM.id in this.device.sensors_params) {
            for (const sensor of this.device.sensors_params[SENSOR_PARAM.id].sensors) {
              const sensor_entry = {
                sensor: sensor, 
                param: SENSOR_PARAM}

              if (sensor.group !== null) {
                const group = r.find(item => item[0].sensor.group === sensor.group) 
                if (group) {
                  group.push(sensor_entry)
                  continue
                } 
              }
              r.push([sensor_entry])
            }
          }
        }
      }
      return r
    },
    custom_props () {
      const r = []
      if (this.device) {
        for (const custom_prop_def of DEVICE_CUSTOM_PROPS) {
          if (custom_prop_def.device_type_id === this.device.type_id) {
            const prop_idx = this.device.props.findIndex(item => item.id === custom_prop_def.prop_id)
            if (prop_idx !== -1) {
              r.push({
                  idx: prop_idx,
                  component: custom_prop_def.component
              })
            }
          }
        }
      }
      return r
    }
 
  },
  methods: {
    device_prop_header (idx) {
      /* eslint-disable no-unused-vars */
      const {value, ...header} = this.device.props[idx]
      return header
    },
    device_props_validated (validation_data) {
      for (const field in validation_data) {
        this.props_validation[field] = validation_data[field]
      }
    },
    device_custom_prop_validated (prop_id, msg) {
      this.props_validation[prop_id] = msg
    },
    sync_sensors_group_title (group_idx) {
      const group = this.sensors_settings[group_idx]
      const new_title = group[0].sensor.title
      for (let c = 1; c < group.length; c++) {
        group[c].sensor.title = new_title
      }
    },
    async open_device (device) {
      load_device(device.id)
        .then(device => {
          this.device = device
          this.device.enable_schedule = Boolean(this.device_type.schedule_params)
          this.device_cache = JSON.parse(JSON.stringify(device))
          for (const prop of ['props', 'sensors', 'switches', 'mode']) {
            this.device_cache[prop] = JSON.parse(JSON.stringify(device[prop]))
          }
          this.props_validation = {}
        })
    },
    async delete_device () {
      messageBox('Удаление устройства',
        'Вы действительно хотите удалить это устройство?',
        true)
        .then(() => {
          userDataPost('device/' + this.device.id, {delete: true})
            .then(() => {
              this.$store.dispatch(LOAD_DEVICES_ACTION)
              this.$router.push('/')
            })
        })
    },
    open_device_index () {
      this.$router.push('/device/' + this.device.id)
    },
    post_device () {
      
      for (const field in this.props_validation) {
        if (this.props_validation[field]) {
          messageBox('Изменение настроек', `Настройки некорректны: ${this.props_validation[field]}`)
          return
        }
      }
      let device_update = this.device.title !== this.device_cache.title ||
        this.device.schedule_id !== this.device_cache.schedule_id ||
        this.device.timezone !== this.device_cache.timezone ||
        this.device.mode !== this.device_cache.mode
      const queries = []
      if (!device_update) {
        const device_props_length = this.device.props.length
        for (let co = 0; co < device_props_length; co++) {
          if (this.device.props[co].value !== this.device_cache.props[co].value) {
            device_update = true
            break
          }
        }
      }
      if (device_update) {
        queries.push({
          url: 'device/' + this.device.id,
          data: {
            title: this.device.title,
            schedule_id: this.device.schedule_id,
            timezone: this.device.timezone,
            mode: this.device.mode,
            props: this.device.all_props_values
          }
        })
      }
      if (this.device.sensors) {
        const sensors_length = this.device.sensors.length
        for (let co = 0; co < sensors_length; co++) {
          const sensor = this.device.sensors[co]
          const sensor_cache = this.device_cache.sensors ? this.device_cache.sensors.find(item =>
                item.id === sensor.id) : null
          sensor.is_master = this.device.sensors_params[sensor.type].master == sensor
          if (!sensor_cache || sensor.title !== sensor_cache.title ||
            sensor.is_master !== sensor_cache.is_master || sensor.enabled !== sensor_cache.enabled ||
            sensor.correction !== sensor_cache.correction) {
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
      }
      if (this.device.switches) {
        const switches_length = this.device.switches.length
        for (let co = 0; co < switches_length; co++) {
          const switch_item = this.device.switches[co]
          const switch_cache = this.device_cache.switches ? this.device_cache.switches.find(item =>
                item.id === switch_item.id) : null
          if (!switch_cache || switch_item.title !== switch_cache.title ||
            switch_item.enabled !== switch_cache.enabled) {
            queries.push({
              url: `switch/${this.device.id}/${switch_item.id}`,
              data: {
                title: switch_item.title,
                enabled: switch_item.enabled
              }
            })
          }
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
