import {display_date} from '../utils'
import {get} from '../api'

class Device {
  #sensors
  #switches
  #props

  constructor(params, id) {

    this.id = id
    this.#sensors = params.sensors ? [...params.sensors] : null
    this.#switches = params.switches ? [...params.switches] : null
    this.#props = params.props_titles ? params.props_titles.map( (prop, idx) => {
      let value = params.props_values[idx]
      let display = value
      if (prop.title == 'date') {
        value = new Date(value)
        display = display_date(value)
      }
      return {
        ...prop,
        value: value,
        display: display
      }
    }) : null
    this.type = params.device_type
    this.type_id = params.device_type_id
    this.title = params.title
    this.hash = params.hash
    this.schedule_id = params.schedule_id
    this.timezone = params.timezone
    this.mode = params.mode

  }

  mode_filter (data) {
    return data ? data.filter(item =>
      !this.mode || !item.modes || item.modes.includes(this.mode)) :
      null
  }

  get props () {
    return this.mode_filter(this.#props)
  }

  get all_props_values () {
    return this.#props ? this.#props.map(prop => prop.value) : null
  }

  get sensors () {
    return this.mode_filter(this.#sensors)
  }

  get switches () {
    return this.mode_filter(this.#switches)
  }

  get sensors_params () {
    const r = {}
    if (this.sensors) {
      for (const sensor of this.sensors) {
        if (!r[sensor.type]) {
          r[sensor.type] = {sensors: []}
        }
        r[sensor.type].sensors.push(sensor)
        if (sensor.is_master) {
          r[sensor.type].master = sensor
        }
      }
    }
    return r
  }

}

export default function load_device(id) {
  return get('/api/device/' + id)
    .then(response => {
      return new Device(response.data, id)
    })
}

