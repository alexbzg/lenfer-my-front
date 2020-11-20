import {get} from '../api'
import {DEVICE_PARAMS} from '../definitions'

export class Schedule {
  constructor (params, devices_types) {
    this.devices_types = devices_types
    this.id = params.id || null
    this.items = params.items || []
    this._device_type_id = params.device_type_id || null
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
    const item = {day_no: no, params:{}}
    for (const param of this.params) {
      let param_item = {}
      if (param.type === 'float_delta') {
        param_item = {value: null, delta: null}
      }
      item.params[param.id] = param_item
    }
    return item
  }

  get days () {
    return this.items.length
  }

  set device_type_id (val) {
    if (this._device_type_id !== val) {
      this._device_type_id = val
      this.params = []
      const device_type = this.devices_types.find(item => item.id === val)
      if (device_type) {
        for (const param of DEVICE_PARAMS) {
          if (param.id in device_type.schedule_params) {
            this.params.push({...param, ...device_type.schedule_params[param.id]})
          }
        }
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
