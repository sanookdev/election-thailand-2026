import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          background: '#F5F5F0',
          surface: '#FFFFFF',
          'surface-variant': '#F0EDE8',
          primary: '#0D7377',
          secondary: '#E8A838',
          warning: '#E8913A',
          error: '#D32F2F',
          info: '#1976D2',
          success: '#2E7D32',
          'on-background': '#2C2C2C',
          'on-surface': '#333333',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
