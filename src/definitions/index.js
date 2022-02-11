export const POWER_SENSORS_COLORS = [{
       gradients: {
         backgroundColor: ['rgba(174,176,206, 0.6)', 'rgba(174,176,206, 0.1)'],
       },
       borderColor: 'rgba(53,59,134, 0.8)'
    },
    {
       gradients: {
         backgroundColor: ['rgba(162,187,127, 0.6)', 'rgba(162,187,127, 0.1)'],
       },
       borderColor: 'rgba(69,120,0, 1)'
    },
    {
       gradients: {
         backgroundColor: ['rgba(228,163,158, 0.6)', 'rgba(228,163,158, 0.1)'],
       },
       borderColor: 'rgba(188,25,13, 1)'
    }]

export const DEVICE_SENSORS_PARAMS = [
  {id: 'temperature', title: 'Teмпература', unit:'\xB0'},
  {id: 'humidity', title: 'Влажность', 'unit': '%'},
  {id: 'co2', title: 'CO2', 'unit': 'ppm'},
  {id: 'power', title: 'Мощность', unit: 'W', colors: POWER_SENSORS_COLORS},
  {id: 'voltage', title: 'Напряжение', unit: 'V', colors: POWER_SENSORS_COLORS},
  {id: 'current', title: 'Сила тока', unit: 'A', colors: POWER_SENSORS_COLORS}
]

export const ADDITIONAL_SCHEDULE_PARAMS = [
  {id: 'light_on', title: 'Cвет', subtitle: 'ВКЛ'},
  {id: 'light_off', title: 'Cвет', subtitle: 'ВЫКЛ'}
]

export const DEVICE_TYPE_FEEDER_ID = 3
export const DEVICE_TYPE_THERMO_RELAY_ID = 6
export const DEVICE_TYPE_GATES_ID = 8

export const DEVICE_CUSTOM_PROPS = [
  {
    device_type_id: DEVICE_TYPE_FEEDER_ID,
    prop_id: 'timers',
    component: (() => import('../components/Settings/Timers'))
  },
  {
    device_type_id: DEVICE_TYPE_THERMO_RELAY_ID,
    prop_id: 'timers',
    component: (() => import('../components/Settings/Timers'))
  },
  {
    device_type_id: DEVICE_TYPE_GATES_ID,
    prop_id: 'timers',
    component: (() => import('../components/Settings/Timers'))
  },
  {
    device_type_id: DEVICE_TYPE_GATES_ID,
    prop_id: 'light',
    component: (() => import('../components/Settings/Timers'))
  }

]

export const TIMER_TYPES = [
    {code: 1, title: 'Восход', icon: 'icon_timer_sunrise.png'},
    {code: -1, title: 'Заход', icon: 'icon_timer_sunset.png'},
    {code: 0, title: 'Время', icon: 'icon_timer_clock.png'}
]

export function timer_type_icon(code) {
  return TIMER_TYPES.find(item => item.code === code)
}
