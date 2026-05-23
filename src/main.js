// main.js (Vue 3)
import { createApp } from 'vue'
import App from './App.vue'

// ---------- Pinia ----------
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// ---------- Vuetify ----------
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// ---------- Plugins ----------
import VueTheMask from "vue-the-mask"
import "./plugins/validation"

// ---------- Auth0 ----------
import { createAuth0 } from '@auth0/auth0-vue'

// ---------- Vue Router ----------
import { createRouter, createWebHistory } from 'vue-router'

// ---------- Componentes ----------
import Awards from './components/Awards.vue'
import AddTeam from './components/AddTeam.vue'
import NominateTeam from './components/NominateTeam.vue'
import ListTeams from './components/ListTeams.vue'
import Home from './components/Home.vue'
import AddUser from './components/AddUser.vue'
import Login from './components/Login.vue'
import BulkAddTeam from './components/BulkAddTeam.vue'
import NonNominated from './components/NonNominated.vue'
import Visits from './components/Visits.vue'
import AddPicture from './components/AddPicture.vue'
import Dashboard from './components/Dashboard.vue';

// ---------- Instâncias ----------
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

// ✅ Rotas
const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: Home },
  { path: '/visits', name: 'Visits', component: Visits },
  { path: '/non-nominated', name: 'NonNominated', component: NonNominated },
  { path: '/addTeams', name: 'AddTeams', component: BulkAddTeam },
  { path: '/awards', name: 'Awards', component: Awards },
  { path: '/addTeam', name: 'AddTeam', component: AddTeam },
  { path: '/nominateteam', name: 'NominateTeam', component: NominateTeam },
  { path: '/listTeams', name: 'ListTeams', component: ListTeams },
  { path: '/adicionar-foto', name: 'AddPhoto', component: AddPicture },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/adduser', name: 'AddUser', component: AddUser },
  { path: '/:pathMatch(.*)*', redirect: '/listTeams' }, // rota padrão
  
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ✅ Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// ✅ App
const app = createApp(App)
app.use(vuetify)
app.use(VueTheMask)
app.use(router)
app.use(pinia)

// ✅ Auth0
const auth0 = createAuth0({
  domain:  process.env.VUE_APP_OAUTH_DOMAIN,
  clientId:  process.env.VUE_APP_OAUTH_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
  },
})

app.use(auth0)

// ✅ Middleware de autenticação
router.beforeEach(async (to, from, next) => {
  const auth = app.config.globalProperties.$auth0
  const requiresAuth = !['Login', 'AddUser'].includes(to.name)

  while (auth && auth.isLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  const isLogged = auth?.isAuthenticated?.value
  if (requiresAuth && !isLogged) next('/login')
  else next()
})

// ✅ Monta o app
router.isReady().then(() => app.mount('#app'))