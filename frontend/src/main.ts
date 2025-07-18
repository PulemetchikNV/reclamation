import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'primeicons/primeicons.css'
import locale from './plugins/primevue/locale.ts'
import theme from './plugins/primevue/theme.ts'
import PrimeVue from 'primevue/config'
import router from './router/index.ts'
import VueApexCharts from 'vue3-apexcharts'
import { ToastService, Tooltip } from 'primevue'

const app = createApp(App)

app.use(PrimeVue, { theme, locale })
app.use(router)
app.component('apexchart', VueApexCharts)
app.use(ToastService)
app.directive('tooltip', Tooltip)
app.mount('#app')
