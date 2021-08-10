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
export const DEVICE_TYPE_THERMO_RELAY_ID = 6

export const DEVICE_CUSTOM_PROPS = [
  {
    device_type_id: DEVICE_TYPE_FEEDER_ID,
    prop_id: 'timers',
    component: (() => import('../components/Settings/FeederTimers'))
  },
  {
    device_type_id: DEVICE_TYPE_THERMO_RELAY_ID,
    prop_id: 'timers',
    component: (() => import('../components/Settings/FeederTimers'))
  }
]

export const TIMER_TYPE_ICONS = [
    {code: 1, title: 'Восход', icon: 'icon_timer_sunrise.png'},
    {code: -1, title: 'Заход', icon: 'icon_timer_sunset.png'},
    {code: 0, title: 'Время', icon: 'icon_timer_clock.png'}
]

export function timer_type_icon(code) {
  return TIMER_TYPE_ICONS.find(item => item.code === code)
}
