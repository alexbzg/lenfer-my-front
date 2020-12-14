<template>
    <table class="seconds_picker">
		<tr>
			<td v-if="enable_fields.hr">
                <select v-model="hr" @change="on_input">
					<option v-for="item in zeropad_range(24)" :key="item" :value="item">{{item}}</option>
				</select><span v-if="enable_fields.mn">:</span>
			</td>
			<td v-if="enable_fields.mn">
				<select v-model="mn" @change="on_input">
					<option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
				</select><span v-if="enable_fields.sc">:</span>
			</td>
			<td v-if="enable_fields.sc">
				<select v-model="sc" @change="on_input">
					<option v-for="item in zeropad_range(60)" :key="item" :value="item">{{item}}</option>
				</select>
			</td>
		</tr>
		<tr>
			<td class="bottom_text" v-if="enable_fields.hr">час</td>
			<td class="bottom_text" v-if="enable_fields.mn">мин</td>
            <td class="bottom_text" v-if="enable_fields.sc">сек</td>
        </tr>
	</table>
</template>

<script>

import {zeropad_range, string_pad} from '../utils'

export default {
    name: "SecondsPicker",
    props: ['value', 'enable_fields'],
    data () {
      const value = this.value || 0
      const hr = Math.floor(value/3600)
      return {
        hr: string_pad(hr),
        mn: string_pad(Math.floor((value - hr*3600)/60)),
        sc: string_pad(value % 60)    
      }
    },
    methods: {
      on_input () {
        this.$emit('input', Number(this.hr)*3600 + Number(this.mn)*60 + Number(this.sc))
      },
      zeropad_range: zeropad_range
    }
}

</script>

<style>
</style>
