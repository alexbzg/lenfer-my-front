<template>
    <div class="sensor_data_chart">
        <h4>{{device_type_title}} {{title}}</h4>

        <div class="lk_sensor_graf">
            <line-chart v-if="ready" :chart_data="chart_data" :options="chart_options">
            </line-chart>
        </div>
    </div>
</template>

<script>
import strftime from 'strftime'

import {get, dataPost} from '../../api'
import LineChart from '../LineChart'

const SENSOR_TYPE_SETTINGS = {
  temperature: {
    dataset: {
       gradients: {
         backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 0.1)'],
       },
       borderColor: 'rgba(255, 99, 132, 1)'
    }
  },
  humidity: {
    dataset: {
       gradients: {
         backgroundColor: ['rgba(99, 255, 132, 0.6)', 'rgba(99, 255, 132, 0.1)'],
       },
       borderColor: 'rgba(99, 255, 132, 1)'
    }
  }
}

export default {
  name: 'SensorChart',
  components: {LineChart},
  props: ['sensor_id'],
  data () {
    return {
      device_type_title: null,
      title: null,
      sensor_type: null,
      ready: false,
      chart_data: {
        datasets: [
          {
            data: [],
            label: null,
            borderWidth: 3,
            pointRadius: 0,
            spanGaps: false
          }
        ]
      },
      chart_options: {
		responsive: true,
		maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                hour: 'HH:mm',
				minute: 'HH:mm'
              }
            }
          }],
          yAxes: [{
            ticks: {}
          }]
        }
      }
    }
  },
  async mounted () {
    get('/api/sensor/' + this.sensor_id)
      .then(response => {

        this.device_type_title = response.data.device_type_title
        this.title = response.data.sensor_title
        this.sensor_type = response.data.sensor_type

        if (this.sensor_type in SENSOR_TYPE_SETTINGS) {
          Object.assign(this.chart_data.datasets[0],
            SENSOR_TYPE_SETTINGS[this.sensor_type].dataset)
        }

        const end = new Date()
        const begin = new Date()
        begin.setDate(begin.getDate() - 1)
        let data_min = null
        let data_max = null
        let prev_date = null

        dataPost('sensor/data', {
          sensor_id: this.sensor_id,
          begin: strftime('%Y-%m-%d %H:%M:S', begin),
          end:  strftime('%Y-%m-%d %H:%M:S', end)
        })
        .then(data => {

          for (const x of data) {

            if (data_min === null || data_min > x.value)
              data_min = x.value
            if (data_max === null || data_max < x.value)
              data_max = x.value
            const x_date = new Date(x.tstamp)
            if (prev_date && x_date - prev_date > 600000) {
              this.chart_data.datasets[0].data.push({
                x: new Date(x_date.getTime() + 300000),
                y: NaN
              })
            }
            prev_date = x_date
            this.chart_data.datasets[0].data.push({
              x: new Date(x.tstamp),
              y: x.value
            })
          }
          
          this.chart_options.scales.yAxes[0].ticks.min = data_min - 10
          this.chart_options.scales.yAxes[0].ticks.max = data_max + 10
          this.ready = true

        })
      })
  }
}
</script>

<style>

</style>
