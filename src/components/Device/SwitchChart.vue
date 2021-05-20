<template>
    <line-chart css-classes="lk_switch_graf" v-if="ready"
        :chart_data="chart_data" :options="chart_options">
    </line-chart>
</template>

<script>
import strftime from 'strftime'

import {dataPost} from '../../api'
import LineChart from '../LineChart'

const SWITCH_TYPE_SETTINGS = {
  heat: {
    dataset: [{
       gradients: {
         backgroundColor: ['rgba(200, 0, 0, 0.3)', 'rgba(200, 0, 0, 0.1)'],
       },
       borderColor: 'rgba(200, 0, 0, 1)'
    }]
  },
  vent_out: {
    dataset: [{
       gradients: {
         backgroundColor: ['rgba(0, 150, 0, 0.3)', 'rgba(0, 150, 0, 0.1)'],
       },
       borderColor: 'rgba(0, 150, 0, 1)'
    }]
  },
  vent_mix: {
    dataset: [{
       gradients: {
         backgroundColor: ['rgba(0, 0, 150, 0.3)', 'rgba(0, 0, 150, 0.1)'],
       },
       borderColor: 'rgba(0, 0, 150, 1)'
    }]
  },

}

const DATASET_TMPLT = {
  borderWidth: 3,
  pointRadius: 0,
  pointHitRadius: 0.4,
  lineTension: 0,
  spanGaps: false
}

export default {
  name: 'SensorChart',
  components: {LineChart},
  props: ['device_id', 'switch', 'interval'],
  data () {
    return {
      ready: false,
      chart_data: {
        datasets: []
      },
      chart_options: {
        vertical_cursor: {
          style: 'grey',
          width: 1
        },
		responsive: true,
		maintainAspectRatio: false,
        tooltips: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
          position: 'nearest',
          callbacks: {
            label (context) {
              return context.value === "1" ? 'ON' :  'OFF'
            }
          }
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'hour',
              stepSize: 1,
              tooltipFormat: 'HH:mm',
              displayFormats: {
                hour: 'HH:mm',
				minute: 'HH:mm'
              }
            }
          }],
          yAxes: [{
            ticks: {
              min: 0,
              max: 1,
              callback (value) {
                if (value === 1) return 'ON'
                else if (value === 0) return 'OFF'
                else return null
              }
            },
            position: 'right'
          }]
        }
      }
    }
  },
  async mounted () {
    this.render_chart()
  },
  methods: {

    async render_chart() {

      this.ready = false

      this.chart_data.datasets = []

      const dataset = {
        data: [],
        label: this.switch.title || this.switch.default_title,
        ...DATASET_TMPLT
      }
      this.chart_data.datasets.push(dataset)

      if (this.switch.type in SWITCH_TYPE_SETTINGS) {
        Object.assign(dataset, SWITCH_TYPE_SETTINGS[this.switch.type].dataset[0])
      }

      let prev_date = null

      dataPost('switch/state', {
        device_id: this.device_id,
        device_type_switch_id: this.switch.id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        begin: strftime('%Y-%m-%d %H:%M:%S', this.interval[0]),
        end:  strftime('%Y-%m-%d %H:%M:%S', this.interval[1])
      })
        .then(data => {

          if (data.length) {

            for (const x of data) {

              const x_date = new Date(x.tstamp)
              if (prev_date && x_date - prev_date > 600000) {
                dataset.data.push({
                    x: new Date(x_date.getTime() + 300000),
                    y: NaN
                })
              }
              prev_date = x_date
              dataset.data.push({
                x: new Date(x.tstamp),
                y: x.state ? 1 : 0
              })
            }
          }

          this.ready = true

        })
    }
  },
  watch: {
    interval () {
      this.render_chart()
    }
  }
}
</script>

<style>

</style>
