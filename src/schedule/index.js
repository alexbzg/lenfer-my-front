import {get} from '../api'
import {DEVICE_SENSORS_PARAMS, ADDITIONAL_SCHEDULE_PARAMS} from '../definitions'

const PARAMS_DEFS = DEVICE_SENSORS_PARAMS.concat(ADDITIONAL_SCHEDULE_PARAMS)

export class Schedule {
  constructor (params, devices_types) {
    params = params || {}
    this.devices_types = devices_types
    this.id = params.id || null
    this.params = {}
    this.params_list = []
    this.items = []
    this.device_type_id = params.device_type_id || null
    if (params.items) {
      this.items = params.items
    }
    if (params.params) {
      this.params = params.params
    }
    this.title = params.title || null
  }

  set days(val) {
    const cur = this.days
    if (cur < val) {
      for (let co = cur; co < val; co++) {
        this.items.push(this.create_day(co + 1))
      }
    } else if (cur >  val) {
      this.items.splice(val)
    }
  }

  create_day (no) {
    return{day_no: no, params: new Array(this.params_list.length)}
  }

  get days () {
    return this.items.length
  }

  set device_type_id (val) {
    if (this._device_type_id !== val) {
      this._device_type_id = val
      const device_type = this.devices_types.find(item => item.id === val)
      if (device_type) {
        this.params_list = JSON.parse(JSON.stringify(device_type.schedule_params))
        this.params = {delta: new Array(this.params_list.length)}
      }
      for (const entry of this.params_list) {
        entry.def = PARAMS_DEFS.find(item => item.id === entry.id)
      }
      const days = this.days
      this.items = []
      for (let co = 0; co < days; co++) {
        this.items.push(this.create_day(co + 1))
      }
    }
  }

  get device_type_id () {
    return this._device_type_id
  }
}

export function load_schedule(id, devices_types) {
  return get('/api/device_schedule/' + id)
    .then(response => {
        return new Schedule(response.data, devices_types)
    })
}
