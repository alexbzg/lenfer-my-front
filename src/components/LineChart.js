import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: ['chart_data', 'options'],
  mounted () {
    this.renderChart(this.chart_data, this.options)
  }
}
