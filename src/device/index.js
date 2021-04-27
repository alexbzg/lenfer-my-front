import {display_date} from '../utils'
import {get} from '../api'

class Device {

  constructor(params, id) {

    this.id = id
    this.sensors = params.sensors
    this.switches = params.switches
    this.type = params.device_type
    this.type_id = params.device_type_id
    this.title = params.title
    this.hash = params.hash
    this.schedule_id = params.schedule_id
    this.props_titles = params.props_titles

    this.props_values = []
    this.props_display = []
    const props_length = this.props_titles.length
    for (let co = 0; co < props_length; co++) {
      let value = params.props_values[co]
      let value_display = value
      if (this.props_titles[co].type === 'date') {
        value = new Date(value)
        value_display = display_date(value)
      }
      this.props_values.push(value)
      this.props_display.push(value_display)
    }

    this.sensors_params = {}
    if (this.sensors) {
      for (const sensor of this.sensors) {
        if (!this.sensors_params[sensor.type]) {
          this.sensors_params[sensor.type] = {sensors: []}
        }
        this.sensors_params[sensor.type].sensors.push(sensor)
        if (sensor.is_master) {
          this.sensors_params[sensor.type].master = sensor
        }
      }
    }
    
  }

}

export default function load_device(id) {
  return get('/api/device/' + id)
    .then(response => {
      return new Device(response.data, id)
    })
}

