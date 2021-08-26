<template>
    <div id="feeder_timers">
        <table id="timers_setup">
            <tr>
                <template v-if="timers_type === 'feeder'">
                    <th>Начало</th>
                    <th>Длительность, сек</th>
                </template>
                <template v-if="timers_type === 'switch'">
                    <th>Включить</th>
                    <th>Выключить</th>
                </template>
                <th class="add_timer" @click="new_item()">
                  <img src="/images/icon_add.jpg" title="Добавить период"/>
                </th>
            </tr>
            <tr v-for="(item, item_idx) in timers_order" class="timer" :key="item_idx">
                <timer-entry v-model="value[item]"
                    :timer_type_select_active="timer_type_select_active_idx == item_idx"
                    :validation_errors="validation_errors[item]"
                    @timer-type-select-open="timer_type_select_open(item_idx)" 
                    @input="timer_type_input(item)"
                    >
                </timer-entry>
                <td :class="{error: item in validation_errors && 1 in validation_errors[item]}">
                    <input type="number" v-model.number="value[item][1]" @input="value_input"/>
                </td>
                <td @click="delete_item(item)">
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

const TIMER_VALUE_LENGTH = 3

export default {
  name: "FeederTimers",
  props: ["value", "prop_header"],
  components: {TimerEntry},
  TIMER_TYPES: TIMER_TYPES,
  data () {
    return {
      timers_order: this.order_timers(),
      timer_type_select_active_idx: -1,
      validation_errors: {},
    }
  },
  methods: {
    timer_type_select_open (idx) {
      this.timer_type_select_active_idx = idx
    },
    value_input () {
      this.$emit('input', this.value)
    },
    timer_type_input (idx) {
      this.value[idx][0] = 0
      this.value_input()
    },
    new_item () {
      this.value.push(new Array(TIMER_VALUE_LENGTH).fill(0))
      this.timers_order = this.order_timers()
      this.value_input()
    },
    delete_item (idx) {
      messageBox('Удаление периода',
        'Вы действительно хотите удалить этот период?',
        true)
        .then(() => {
            this.value.splice(idx, 1)
            this.timers_order = this.order_timers()
            this.value_input()
        })
    },
    order_timers () {
      let timers_order = []
        if (this.value) {
          timers_order = [...this.value].sort((a, b) => {
            if (a[2] > b[2]) {
              return -1
            }
            if (a[2] < b[2]) {
              return 1
            }
            if (a[0] < b[0]){
              return -1
            }
            if (a[0] > b[0]){
              return 1
            }
            if (a[1] < b[1]){
              return -1
            }
            if (a[1] > b[1]){
              return 1
            }
            return 0
        }).map(item => this.value.indexOf(item))
      }
      return timers_order
    }
  },
  computed: {
    timers_type () {
      return this.prop_header && this.prop_header.timers_type ? this.prop_header.timer_type : 'feeder'
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        let r = null
        this.validation_errors = {}
        const timers_count = this.value.length
        for (let co = 0; co < timers_count; co++) {
          if (this.value[co][1] !== parseInt(Number(this.value[co][1]))) {
            this.value[co][1] = parseInt(Number(this.value[co][1]))
          }
          if (this.value[co][1] === 0) {
            r = 'Длительность периода должна быть больше 0.'
            this.validation_errors[co] = {1: 1}
            break
          }
          const limits = [this.value[co][0], this.value[co][0] + this.value[co][1],
            this.value[co][2]]
          for (let check_co = 0; check_co < co; check_co++) {
            const check = [
              this.value[check_co][0],
              this.value[check_co][0] + this.value[check_co][1],
              this.value[check_co][2]]
            if (limits[2] === check[2] && ((limits[0] >= check[0] && limits[0] <= check[1]) ||
                (limits[1] >= check[0] && limits[1] <= check[1]))) {
                r = 'Конфликт периодов.'
                this.validation_errors[co] = {0: 1, 1: 1}
                this.validation_errors[check_co] = {0: 1, 1: 1}
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


