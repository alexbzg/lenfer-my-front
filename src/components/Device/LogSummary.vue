<template>
    <table id="timers_log">
        <tr>
            <th class="date" rowspan="2">Дата</th>
            <th class="ts_device">Время</th>
            <th class="status" rowspan="2">Статус</th>
        </tr>
        <tr>
            <th class="ts_device"><span>на устройcтве</span></th>
        </tr>
        <tr v-for="(entry, idx) in entries" :key="idx">
            <td class="date">{{entry.date}}</td>
            <td class="ts_device">
                {{entry.device_time.h}}:{{entry.device_time.m}}<span>:{{entry.device_time.s}}</span>
            </td>
            <td class="status">
                <span class="entry_prop" v-if="props[entry.prop] && props[entry.prop].title">
                    {{props[entry.prop].title}}
                </span>
                <span :class="entry.class">{{entry.status}}</span>
                <span v-if="entry.comments">{{entry.comments}}</span>
            </td>
        </tr>
    </table>
</template>

<script>

import {RU_MONTH} from '../../utils'

function split_time (val) {
  const r = {h: '00', m: '00', s: '00'};
  [r.h, r.m, r.s] = val.split(':')
  return r
}

function create_entry (log_entry) {
  const date_str = log_entry.rcvd_tstamp.split(' ')[0]
  const date_array = date_str.split('-')
  return {
    date: `${date_array[2]} ${RU_MONTH[parseInt(date_array[1]) - 1]} ${date_array[0]}`,
    device_time: split_time(log_entry.log_tstamp.split(' ')[1]),
    server_time: split_time(log_entry.rcvd_tstamp.split(' ')[1]),
  }
}

function init_aggregates() {
  return {current: {count: 0, sum: 0, max: 0, last: 0, min: 0}}
}

const SUCCESS_TYPES = {
  'open': 'Открыто',
  'close': 'Закрыто'
}

export default {
  name: "LogSummary",
  props: ["log", "device_props"],
  computed: {
    props () {
      const r = {}
      for (const prop of this.device_props) {
        r[prop.id] = prop
      }
      return r
    },
    entries () {
      const r = []
      if (this.log) {
        const log_length = this.log.log.length
        let aggregates = []
        for (let co = log_length - 1; co > -1; co--) {
          let prop = null
          const line = this.log.log[co].txt
          const line_start = line.split(' ')[0]
          if (line_start in this.props) {
            prop = line_start
          }
          if (line.includes('current:') && prop in aggregates) {
            const current = parseFloat(line.split('current: ')[1])
            aggregates[prop].current.count++
            aggregates[prop].current.sum += current
            aggregates[prop].current.last = current
            if (aggregates[prop].current.max < current) {
              aggregates[prop].current.max = current
            }
            if (aggregates[prop].current.min > current || aggregates[prop].current.min === 0) {
              aggregates[prop].current.min = current
            }

          } else {
            const entry = create_entry(this.log.log[co])
            entry.prop = prop
            if (line == 'device start' || line == 'disconnected') {
              entry.class = 'connection'
              entry.status = line == 'disconnected' ? 'Нет связи с сервером' : 'Подключено к серверу'
            } else if (line.includes(' reverse ')) {
              entry.class = 'reverse'
              const reverse_on = line.includes(' on')
              entry.status = `${reverse_on ? 'Включен' : 'Выключен'} реверс`
              if (reverse_on && aggregates[prop] && aggregates[prop].current.last) {
                entry.comments = `(~${aggregates[prop].current.last}мА)`
              }
            } else if (line.includes(`${prop} start`) || line.includes(`${prop} stop`)) {
              const start = line.includes('start')
              entry.class = start ? 'on' : 'off'
              if (line.includes('open') || line.includes('close')) {
                entry.status = line.includes('open') ? 'Открытие: ' : 'Закрытие: '
              }
              if (entry.status) {
                entry.status += start ? 'вкл.' : 'выкл.'
              } else {
                entry.status = start ? 'Вкл.' : 'Выкл.'
              }
              entry.status += line.includes(' timer') ? ' по таймеру' : ' вручную'
              entry.comments = ''
              if (!start) {
                let current_avg = 0
                if (aggregates[prop] && aggregates[prop].current.count) {
                 current_avg = Math.round(aggregates[prop].current.sum/aggregates.current.count)
                }
                if (current_avg || (aggregates[prop] && aggregates[prop].current.max)) {
                  entry.comments += ' ('
                  if (current_avg) {
                    entry.comments += `~${aggregates[prop].current.last} мА`
                    if (aggregates[prop] && (aggregates[prop].current.max || aggregates[prop].current.min)) {
                      entry.comments += `, `
                    }
                  }
                  if (aggregates[prop] && aggregates[prop].current.min) {
                    entry.comments += `мин.${Math.round(aggregates[prop].current.min)}, `
                  }
                  if (aggregates[prop] && aggregates[prop].current.max) {
                    entry.comments += `макс.${Math.round(aggregates[prop].current.max)}`
                  }
                  entry.comments += ')'
                }
              }
              aggregates[prop] = init_aggregates()
                 
            } else if (line.includes('success')) {
              entry.class = 'success'
              for (const success_type in SUCCESS_TYPES) {
                if (line.includes(success_type)) {
                  entry.status = SUCCESS_TYPES[success_type]
                }
              }
              if (!entry.status) {
                entry.status = 'Выполнено'
              }
            } 
            r.unshift(entry)
          }
        }
      }
      this.$emit('summary', r)
      return r
    }
  }
}
</script>
