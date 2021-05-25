export const DEVICE_SENSORS_PARAMS = [
  {id: 'temperature', title: 'Teмпература', unit:'\xB0'},
  {id: 'humidity', title: 'Влажность', 'unit': '%'},
  {id: 'co2', title: 'CO2', 'unit': 'ppm'}
]

export const ADDITIONAL_SCHEDULE_PARAMS = [
  {id: 'light_on', title: 'Cвет', subtitle: 'ВКЛ'},
  {id: 'light_off', title: 'Cвет', subtitle: 'ВЫКЛ'}
]

export const DEVICE_TYPE_FEEDER_ID = 3

export const DEVICE_CUSTOM_PROPS = [
  {
    device_type_id: DEVICE_TYPE_FEEDER_ID,
    prop_id: 'timers',
    component: (() => import('../components/Settings/FeederTimers'))
  }
]
