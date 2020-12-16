<template>
    <div class="device_props">
        <template v-for="(prop, idx) in props_headers">
            <component v-if="prop.id in custom_props" :is="custom_props[prop.id]" :key="idx"
                :props_headers="prop" :value="value[idx]" @validated="on_validated">
            </component>
            <div class="prop" v-else :key="idx">
                <span class="title">{{prop.title}}</span><br/>
                <template v-if="prop.type === 'date'">
                    <date-picker v-model="value[idx]" locale="ru"
                        :masks="{input: 'DD MMMM'}"></date-picker>
                </template>
                <template v-if="prop.type === 'seconds'">
                    <seconds-edit v-model="value[idx]"></seconds-edit>
                </template>
                <template v-if="prop.type === 'integer'">
                    <input type="number" v-model="value[idx]"/>
                </template>
                <template v-if="'items' in prop">
                    <div v-for="(item, item_idx) in value[idx]" class="prop_item" :key="item_idx">
                        <device-props :props_headers="prop.items" :value="item">
                        </device-props>
                        <button class="delete_prop_item" 
                            @click="delete_item(prop, value[idx], item_idx)">
                            Удалить {{prop.title_item}}
                        </button>
                    </div>
                    <br/>
                    <button class="add_prop_item" @click="value[idx].push(new_item())">
                        Добавить {{prop.title_item}}
                    </button>
                </template>
                <br/>
            </div>
        </template>
    </div>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

import SecondsEdit from '../SecondsEdit'

import messageBox from '../../message-box'

import {DEVICE_TYPE_FEEDER_ID} from '../../definitions'

const CUSTOM_PROPS = [
  {
    device_type_id: DEVICE_TYPE_FEEDER_ID,
    prop_id: 'timers',
    component: (() => import('./FeederTimers'))
  }
]

export default {
  name: "DeviceProps",
  props: ["props_headers", "value", "device_type_id"],
  components: {DatePicker, SecondsEdit}, 
  data () {
    return {
      validated: {}
    }
  },
  methods: {
    new_item () {
      return new Array(this.props_headers.length).fill(null)
    },
    delete_item (header, items, idx) {
      messageBox(`Удаление ${header.title_item_genitive}`,
        `Вы действительно хотите удалить этот ${header.title_item}?`,
        true)
        .then(() => {
            items.splice(idx, 1)
        })
    },
    on_validated (prop_id, msg) {
      this.validated[prop_id] = msg
      this.$emit('validated', this.validated)
    }
  }, 
  computed: {
    custom_props () {
      const r = {}
      for (const custom_prop_def of CUSTOM_PROPS) {
        if (custom_prop_def.device_type_id === this.device_type_id) {
          r[custom_prop_def.prop_id] = custom_prop_def.component
        }
      }
      return r
    }
  }
}

</script>

<style scoped>
</style>


