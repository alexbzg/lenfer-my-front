import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: ['chart_data', 'options'],
  mounted () {
    const canvas = this.$refs.canvas
    const context = canvas.getContext('2d')
    const chart_data = JSON.parse(JSON.stringify(this.chart_data))
    for (const dataset of chart_data.datasets) {
      if ('gradients' in dataset) {
        for (const color_type in dataset.gradients) {
          let gradient = context.createLinearGradient(canvas.width/2, 0, canvas.width/2, canvas.height)
          gradient.addColorStop(0, dataset.gradients[color_type][0])
          gradient.addColorStop(1, dataset.gradients[color_type][1])
          dataset[color_type] = gradient
        }
      }
    }
    this.renderChart(chart_data, this.options)
  }
}
