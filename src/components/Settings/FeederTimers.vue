<template>
    <div id="feeder_timers">
        <table id="timers_setup">
            <tr>
                <th>Начало</th>
                <th>Длительность, сек</th>
                <th class="add_timer" @click="value.push(new_item())">
                  <img src="/images/icon_add.jpg" title="Добавить период"/>
                </th>
            </tr>
            <tr v-for="(item, item_idx) in timers_order" class="timer" :key="item_idx">
                <td :class="{error: item in validation_errors && 0 in validation_errors[item]}">
                    <v-select v-model="value[item][2]" :options="$options.TIMER_TYPES"
                        :reduce="timer_type => timer_type.code" :clearable="false" 
						:searchable="false" :tabindex="1" label="title"
                        :ref="'timer_type_select_' + item_idx" 
                        @open="timer_type_select_open(item_idx)" 
                        @input="value[item][0] = 0"
                        >
                        <template #selected-option="option">
                            <img :src="'/images/' + option.icon" :title="option.title"/>
                        </template>
                        <template #option="option">
                            <img :src="'/images/' + option.icon" :title="option.title"/>
                        </template>
                    </v-select>
                    <seconds-edit v-model="value[item][0]" :sign="value[item][2] !== 0">
                    </seconds-edit>
                </td>
                <td :class="{error: item in validation_errors && 1 in validation_errors[item]}">
                    <input type="number" v-model.number="value[item][1]"
                        @input="$emit('input', Number($event.target.value))"/>
                </td>
                <td @click="delete_item(props_headers, value, item)">
                    <img src="/images/icon_close.png" title="Удалить период"/>
                </td>
            </tr>
        </table>
        <br/>
    </div>
</template>

<script>

import DeviceProps from './DeviceProps'
import SecondsEdit from '../SecondsEdit'
import {TIMER_TYPES} from '../../definitions'

let timer_type_select_active_idx = -1

export default {
  name: "FeederTimers",
  extends: DeviceProps,
  components: {SecondsEdit},
  TIMER_TYPES: TIMER_TYPES,
  timer_type_select_active_idx: -1,
  data () {
    return {
      timers_order: this.order_timers(),
      validation_errors: {},
    }
  },
  computed: {
    timers_count () {
      return this.value ? this.value.length : 0
    }
  },
  methods: {
    timer_type_select_open (idx) {
      if (timer_type_select_active_idx !== idx) {
        if (timer_type_select_active_idx !== -1) {
          this.$refs['timer_type_select_' + timer_type_select_active_idx][0].open = false
        }
        timer_type_select_active_idx = idx
      }
    },
    timer_type_select_change (timer_idx) {
      this.value[timer_idx][0] = 0
    }, 
    new_item () {
      return new Array(this.props_headers.items.length).fill(0)
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
  watch: {
    timers_count () {
      this.timers_order = this.order_timers()
    },
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
          const limits = [this.value[co][0], this.value[co][0] + this.value[co][1], this.value[co][2]]
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


