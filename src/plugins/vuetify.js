// Vue 3 + Vuetify 3
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// FRC BioCore™ 2026-27 brand palette
// Source: https://www.firstinspires.org (frc-biocore-styleguide.pdf)
const biocore = {
  primary:   '#007FBC', // Deep Blue  — PMS 7460 C
  secondary: '#7CAEC6', // Medium Blue — PMS 7458 C
  accent:    '#BFDAE6', // Light Blue  — PMS 7457 C
  highlight: '#F7E326', // Yellow      — PMS 102 C
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary:   biocore.primary,
          secondary: biocore.secondary,
          accent:    biocore.accent,
          highlight: biocore.highlight,
        },
      },
    },
  },
})
