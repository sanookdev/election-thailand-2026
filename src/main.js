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
          background: '#FAFAF8',
          surface: '#FFFFFF',
          'surface-variant': '#F4F3EF',
          primary: '#1A6B5C',
          secondary: '#C4841D',
          warning: '#D97706',
          error: '#C62828',
          info: '#2563EB',
          success: '#16A34A',
          'on-background': '#1A1A1A',
          'on-surface': '#2D2D2D',
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
    },
  },
})

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
