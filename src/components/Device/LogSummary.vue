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

export default {
  name: "LogSummary",
  props: ["log"],
  computed: {
    entries () {
      const r = []
      if (this.log) {
        const log = [...this.log]
        log.reverse()
        const log_length = log.length
        let aggregates = init_aggregates()
        for (let co = 0; co < log_length; co++) {
          const line = log[co].txt
          if (line.includes('current:')) {
            const current = parseFloat(line.split('current: ')[1])
            aggregates.current.count++
            aggregates.current.sum += current
            aggregates.current.last = current
            if (aggregates.current.max < current) {
              aggregates.current.max = current
            }
            if (aggregates.current.min > current || aggregates.current.min === 0) {
              aggregates.current.min = current
            }

          } else {
            const entry = create_entry(log[co])
            if (line == 'device start' || line == 'disconnected') {
              entry.class = 'connection'
              entry.status = line == 'disconnected' ? 'Нет связи с сервером' : 'Подключено к серверу'
            } else if (line.includes(' reverse ')) {
              entry.class = 'reverse'
              const reverse_on = line.includes(' on')
              entry.status = `${reverse_on ? 'Включен' : 'Выключен'} реверс`
              if (reverse_on && aggregates.current.last) {
                entry.comments = `(~${aggregates.current.last}мА)`
              }
            } else if (line.includes('Feeder start')) {
              entry.class = 'on'
              entry.status = 'Включено'
              entry.status += line.includes('timer') ? ' по таймеру' : ' вручную'
              entry.comments = ''
              aggregates = init_aggregates()
            } else if (line.includes('Feeder stop')) {
              entry.class = 'off'
              entry.status = 'Выключено'
              entry.status += line.includes('timer') ? ' по таймеру' : ' вручную'
              entry.comments = ''
              let current_avg = 0
              if (aggregates.current.count) {
                current_avg = Math.round(aggregates.current.sum/aggregates.current.count)
              }
              if (current_avg || aggregates.current.max) {
                entry.comments += ' ('
                if (current_avg) {
                  entry.comments += `~${aggregates.current.last} мА`
                  if (aggregates.current.max || aggregates.current.min) {
                    entry.comments += `, `
                  }
                }
                if (aggregates.current.min)
                {
                  entry.comments += `мин.${Math.round(aggregates.current.min)}, `
                }
                if (aggregates.current.max)
                {
                  entry.comments += `макс.${Math.round(aggregates.current.max)}`
                }
                entry.comments += ')'
              }
              aggregates = init_aggregates()
            }
            r.push(entry)
          }
        }
      }
      r.reverse()
      return r
    }
  }
}
</script>
