<template>
    <div class="device_props">
        <slot name="device_title"></slot>

        <template v-for="(prop, idx) in props_headers">
            <div class="prop" v-if="!custom_props[prop.id]" :key="idx">
                <template v-if="prop.type === 'date'">
                    <date-picker v-model="value[idx]" locale="ru"
                        :masks="{input: 'DD MMMM'}"></date-picker>
                </template>
                <template v-if="prop.type === 'seconds'">
                    <seconds-edit v-model="value[idx]"></seconds-edit>
                </template>
                <template v-if="prop.type === 'integer'">
                    <input type="number" v-model.number="value[idx]"/>
                </template>
                <template v-if="prop.type === 'float_delta'">
                    <input type="number" v-model.number="value[idx][0]"/>
                    &plusmn;
                    <input type="number" v-model.number="value[idx][1]"/>
                </template>
                <span v-if="prop.unit" v-html="prop.unit"></span>

                <br/><span class="title">{{prop.title}}</span>
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

import {DEVICE_CUSTOM_PROPS} from '../../definitions'

export default {
  DEVICE_CUSTOM_PROPS: DEVICE_CUSTOM_PROPS,
  name: "DeviceProps",
  props: ["props_headers", "value", "device_type_id"],
  components: {DatePicker, SecondsEdit}, 
  data () {
    return {
      validated: {},
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
      for (const custom_prop_def of DEVICE_CUSTOM_PROPS) {
        if (custom_prop_def.device_type_id === this.device_type_id) {
          r[custom_prop_def.prop_id] = true
        }
      }
      return r
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        const props_count = this.props_headers.length
        for (let co = 0; co < props_count; co++) {
          if (this.props_headers[co].type === 'integer' &&  
            this.value[co] !== parseInt(Number(this.value[co]))) {
            this.value[co] = parseInt(Number(this.value[co]))
          }
        }
      }
    }
  }
}

</script>

<style scoped>
</style>


