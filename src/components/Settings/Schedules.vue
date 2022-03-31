<template>
    <div id="settings_schedules">
        <table id="settings_schedules_table">
            <tr>
                <td id="schedules_index">
                    <div class="schedule" v-for="(schedule, idx) in schedules" :key="idx"
                        :class="{active: active_schedule && schedule.id === active_schedule.id}"
                        @click="confirm_open_schedule(schedule)">
                        {{schedule.title}}
                        <span class="device_type">{{schedule.device_type_title}}</span>
                    </div>
                    <img src="/images/icon_add_table.jpg" id="new_schedule_button" title="Добавить новую таблицу"
                      @click="confirm_create_schedule"/>
                </td>
                <td id="active_schedule">
                    <template v-if="active_schedule">
                        <span>Название</span><input type="text" v-model="active_schedule.title" id="new_schedule_title" /><br/>
                        <span>Тип устройства</span><select v-model="active_schedule.device_type_id" id="new_schedule_type">
                            <option v-for="(device_type, idx) in schedule_devices_types"
                                :key="idx" :value="device_type.id">
                                {{device_type.title}}
                            </option>
                        </select><br/>
                        <span>Количество дней</span>
                        <input type="text" v-model.number="active_schedule.days_edit"
                            id="new_schedule_days" />
                        <input type="submit" class="btn" value="OK" id="ok_days"
                            @click="active_schedule.days = active_schedule.days_edit"/>
                        <br/>
                        <table id="schedule_days" v-if="active_schedule.days">
                            <tr>
                                <th class="day_column">День</th>
                                <th class="param_column"
                                    v-for="param in active_schedule.params_list" :key="param.id">
                                    {{param.def.title}}
                                    <template v-if="param.def.unit">
                                        ({{param.def.unit}})
                                    </template>
                                </th>
                                <th class="copy_row"></th>
                            </tr>
                            <tr class="deltas">
                                <td class="day_column"></td>
                                <td v-for="(param, idx) in active_schedule.params_list" :key="param.id">
                                    <template v-if="param.type==='float_delta'">
                                        &plusmn;
                                        <input type="text" class="param_delta"
                                            v-model.number="active_schedule.params.delta[idx]"/>
                                    </template>
                                    <template v-if="param.def.subtitle">
                                        {{param.def.subtitle}}
                                    </template>
                                </td>
                                <td class="copy_row"></td>
                            </tr>
                            <tr class="schedule_day" v-for="(item, idx) in active_schedule.items"
                                :key="idx">
                                <td class="day_column">
                                    {{item.day_no}}
                                </td>
                                <td class="param_column"
                                    v-for="(param, idx) in active_schedule.params_list" :key="param.id">
                                    <template v-if="param.type === 'float_delta'">
                                        <input type="text" class="param_value" v-model.number="item.params[idx]"/>
                                    </template>
                                    <template v-if="param.type === 'time'">
                                        <seconds-edit v-model="item.params[idx]">
                                        </seconds-edit>
                                    </template>
                                </td>
                                <td class="copy_row">
                                    <img src="/images/icon_copydown.jpg" @click="copy_row(idx)"
                                        title="Копировать в следующий день"
                                        v-if="idx !== active_schedule.items.length - 1"/>
                                </td>
                            </tr>
                        </table>
                        <div id="btns">
                          <input type="submit" @click="post_schedule(false)" value="Сохранить" class="btn"
                            :class="{pending: pending}" />
                          <input type="submit" @click="post_schedule(true)"
                            value="Сохранить копию" class="btn"/>
                          <input type="submit" @click="confirm_open_schedule(null)" value="Отмена" class="btn cancel"/><br/>
                          <input type="submit" @click="delete_schedule" :disabled="active_schedule.id === 'new'"
                            value="Удалить таблицу" class="btn delete"/>
                        </div>
                   </template>
                </td>
            </tr>
        </table>
  </div>
</template>

<script>

import {mapState} from 'vuex'

import messageBox from '../../message-box'
import {userDataPost, LOAD_SCHEDULES_ACTION} from '../../store'
import {Schedule, load_schedule} from '../../schedule'

import SecondsEdit from '../SecondsEdit'

export default {
  name: 'SettingsDeviceSchedules',
  props: ['schedule_id'],
  components: {SecondsEdit},
  data () {
    return {
      active_schedule: null,
      pending: false,
    }
  },
  mounted () {
    if (this.schedule_id) {
      const schedule = this.schedules.find(item => item.id === parseInt(this.schedule_id))
      if (schedule) {
        this.open_schedule(schedule)
      }
    }
  },
  computed: {
    ...mapState(['schedules', 'devices_types']),
    schedule_devices_types () {
      return this.devices_types.filter(item => item.schedule_params)
    }
  },
  methods: {
    confirm_close_schedule () {
      return messageBox('Закрытие таблицы',
          'Все несохраненные изменения будут утрачены. Продолжить?',
          true)
    },
    copy_row (idx) {
      if (idx < this.active_schedule.items.length - 1) {
        this.active_schedule.items[idx + 1].params =
          JSON.parse(JSON.stringify(this.active_schedule.items[idx].params))
      }
    },
    async confirm_open_schedule (schedule) {
      if (this.pending) {
        return
      }
      if (this.active_schedule) {
        if (!schedule || schedule.id !== this.active_schedule.id)  {
          this.confirm_close_schedule()
            .then(() => {
              if (schedule) {
                this.open_schedule(schedule)
              } else {
                this.active_schedule = null
              }
            })
        }
      } else {
        this.open_schedule(schedule)
      }
    },
    create_schedule () {
      this.open_schedule(new Schedule({id: 'new'}, this.devices_types))
    },
    async confirm_create_schedule () {
      if (this.active_schedule) {
        this.confirm_close_schedule()
          .then(() => {
            this.create_schedule()
          })
      } else {
        this.create_schedule()
      }
    },
    async open_schedule (schedule) {
      if (schedule.id !== 'new') {
        this.pending = true
        load_schedule(schedule.id, this.devices_types)
          .then(loaded_schedule => {
            this.active_schedule = loaded_schedule
            this.active_schedule.days_edit = this.active_schedule.days
          })
          .catch(error => {
            messageBox('Загрузка таблицы', error.message)
          })
          .finally(() => {
            this.pending = false
          })
      } else {
        this.active_schedule = schedule
      }
    },
    async post_schedule (copy=false) {
      this.pending = true
      userDataPost('device_schedule/' + (copy ? 'new' : this.active_schedule.id), {
        items: this.active_schedule.items,
        params: this.active_schedule.params,
        title: (copy ? 'Копия ' : '') + this.active_schedule.title,
        device_type_id: this.active_schedule.device_type_id
      })
        .then(data => {
          this.$store.dispatch(LOAD_SCHEDULES_ACTION)
          if (!copy) {
            this.active_schedule.id = data.id
          }
        })
        .catch(error => {
          messageBox('Загрузка таблицы', error.message)
        })
        .finally(() => {
          this.pending = false
        })
    },
    async delete_schedule () {
      await messageBox('Удаление таблицы',
        'Таблица будет удалена без возможности восстановления. Продолжить?',
        true)
      this.pending = true
      userDataPost('device_schedule/' + this.active_schedule.id, {}, 'DELETE')
        .then(() => {
          this.$store.dispatch(LOAD_SCHEDULES_ACTION)
          this.active_schedule = null
        })
        .catch(error => {
          messageBox('Удаление таблицы', error.message)
        })
        .finally(() => {
          this.pending = false
        })
    }
  }
}
</script>

<style>
</style>
