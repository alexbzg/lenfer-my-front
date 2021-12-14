<template>
    <div id="feeder_timers">
        <div class="timers_title" v-if="prop_header.title">{{prop_header.title}}</div>
        <table id="timers_setup">
            <tr>
                <template v-if="timers_type === 'feeder'">
                    <th>Начало</th>
                    <th>Длительность, сек</th>
                </template>
                <template v-if="timers_type === 'switch'">
                    <template v-if="prop_header.title_on_off">
                        <th v-for="(entry, idx) in prop_header.title_on_off" :key="idx">
                            {{entry}}
                        </th>
                    </template>
                    <template v-else>
                        <th>Включить</th>
                        <th>Выключить</th>
                    </template>
                </template>
                <th class="add_timer" @click="new_item()">
                  <img src="/images/icon_add.jpg" title="Добавить период"/>
                </th>
            </tr>
            <tr v-for="(row, row_idx) in timers" class="timer" :key="row_idx">
                <template v-for="timer_idx in row">
                    <timer-entry v-model="value[timer_idx]" :key="'timer' + row_idx + '_' + timer_idx"
                        :timer_type_select_active="timer_type_select_active_idx == timer_idx"
                        :validation_errors="validation_errors[timer_idx]"
                        @timer-type-select-open="timer_type_select_open(timer_idx)" 
                        >
                    </timer-entry>
                    <td :class="{error: timer_idx in validation_errors && 1 in validation_errors[timer_idx]}"
                        v-if="timers_type === 'feeder'" :key="'duration' + row_idx + '_' + timer_idx">
                        <input type="number" v-model.number="value[timer_idx][1]"/>
                    </td>
                </template>
                <td @click="delete_item(row_idx)">
                    <img src="/images/icon_close.png" title="Удалить период"/>
                </td>
            </tr>
        </table>
        <br/>
    </div>
</template>

<script>

import TimerEntry from './TimerEntry'
import {TIMER_TYPES} from '../../definitions'
import messageBox from '../../message-box'

const TIMERS_SETTINGS = {
  feeder: {
    columns: 1,
    new_row: [[0, 0, 0]]
  },
  switch: {
    columns: 2,
    new_row: [[0, 0, 0], [0, -1, 0]]
  }
}

export default {
  name: "FeederTimers",
  props: ["value", "prop_header"],
  components: {TimerEntry},
  TIMER_TYPES: TIMER_TYPES,
  data () {
    return {
      timers: [],
      timer_type_select_active_idx: -1,
      validation_errors: {},
    }
  },
  created () {
    this.order_timers()
  },
  methods: {
    timer_type_select_open (idx) {
      this.timer_type_select_active_idx = idx
    },
    new_item () {
      TIMERS_SETTINGS[this.timers_type].new_row.map(item => this.value.push([...item]))
      this.order_timers()
    },
    delete_item (row_idx) {
      messageBox('Удаление периода',
        'Вы действительно хотите удалить этот период?',
        true)
        .then(() => {
            this.timers[row_idx].reverse().map(timer_idx => this.value.splice(timer_idx, 1))
            this.order_timers()
        })
    },
    timers_sort (a, b) {
      if (this.value[a[0]][2] > this.value[b[0]][2]) {
        return -1
      }
      if (this.value[a[0]][2] < this.value[b[0]][2]) {
        return 1
      }
      if (this.value[a[0]][0] < this.value[b[0]][0]){
        return -1
      }
      if (this.value[a[0]][0] > this.value[b[0]][0]){
        return 1
      }
      if (this.value[a[0]][1] < this.value[b[0]][1]){
        return -1
      }
      if (this.value[a[0]][1] > this.value[b[0]][1]){
        return 1
      }
      return 0
    },
    order_timers () {
      this.timers = []
      const columns = TIMERS_SETTINGS[this.timers_type].columns
      if (this.value) {
        const rows = this.value.length / columns
        for (let row_idx = 0; row_idx < rows; row_idx++) {
          const row = []
          for (let col_idx = 0; col_idx < columns; col_idx++) {
            row.push(row_idx * columns + col_idx)
          }
          this.timers.push(row)
        }
        this.timers = this.timers.sort(this.timers_sort)
      }
    },
    timer_limits (idx) {
      return [
        this.value[idx][0], 
        this.timers_type === 'feeder' ? this.value[idx][0] + this.value[idx][1] : this.value[idx + 1][0],
        this.value[idx][2],
        this.timers_type === 'feeder' ? this.value[idx][2] : this.value[idx + 1][2],
      ]
    }
  },
  computed: {
    timers_type () {
      return this.prop_header && this.prop_header.timers_type ? this.prop_header.timers_type : 'feeder'
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        let r = null
        this.validation_errors = {}
        const timers_count = this.value.length
        const columns = TIMERS_SETTINGS[this.timers_type].columns
        for (let co = 0; co < timers_count; co++) {
          if (this.timers_type === 'feeder' && 
            this.value[co][1] !== parseInt(Number(this.value[co][1]))) {
            this.value[co][1] = parseInt(Number(this.value[co][1]))
          }
          if (co % columns) {
            continue
          }
          if ((this.timers_type === 'feeder' && this.value[co][1] === 0) || 
            (this.timers_type === 'switch' && this.value[co][0] === this.value[co + 1][0])) {
            r = 'Длительность периода должна быть больше 0.'
            if (this.timer_type === 'feeder') {
              this.validation_errors[co] = {1: 1}
            } else if (this.timers_type === 'switch') {
              this.validation_errors[co] = {0: 1}
              this.validation_errors[co + 1] = {0: 1}
            }
            break
          }
          const limits = this.timer_limits(co)
          for (let check_co = 0; check_co < co; check_co += columns) {
            const check = this.timer_limits(check_co)
            if (limits[2] === check[2] && limits[3] === check[3] && limits[2] === limits[3] && 
                ((limits[0] >= check[0] && limits[0] <= check[1]) ||
                (limits[1] >= check[0] && limits[1] <= check[1]))) {
                r = 'Конфликт периодов.'
                this.validation_errors[co] = {0: 1, 1: 1}
                this.validation_errors[check_co] = {0: 1, 1: 1}
                if (this.timers_type === 'switch') {
                  this.validation_errors[co + 1] = {0: 1, 1: 1}
                  this.validation_errors[check_co + 1] = {0: 1, 1: 1}
                }
                break
            }
          }
        }
        this.$emit('validated', 'timers', r)
        this.validated = r
      }
    }
  }
}

</script>

<style scoped>
.vs__search {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin: -1px !important;
  border: 0 !important;
  clip: rect(0 0 0 0) !important;
}
.form-control {
  position: absolute
}
</style>


