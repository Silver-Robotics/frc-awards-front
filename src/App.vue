<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="item in allowedMenuItems"
          :key="item.key"
          :to="item.route"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon" color="#007FBC" />
          </template>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="user" @click="doLogout">
          <template v-slot:prepend>
            <v-icon icon="mdi-logout" color="red" />
          </template>
          <v-list-item-title>{{ $t('app.logout') }}</v-list-item-title>
        </v-list-item>

        <div class="drawer-logo">
          <v-img v-if="event?.program == 'frc'" max-width="140" :src="require('./assets/logo_frc_biocore_drawer.png')" />
          <v-img v-else max-width="100" :src="require('./assets/logo_ftc.png')" />
        </div>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app :color="event?.program == 'frc' ? '#F7E326' : '#92dbac'" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title v-if="event?.program == 'frc'">
        <v-img src="@/assets/logo_frc_biocore_wordmark.png" alt="FRC BioCore" max-height="38" max-width="280" contain />
      </v-toolbar-title>
      <v-toolbar-title v-else>
        <v-img src="@/assets/logo_text_ftc.png" alt="FTC-Decode" max-height="40" max-width="300" contain />
      </v-toolbar-title>

      <v-combobox
        v-model="event"
        :items="events"
        item-title="text"
        item-value="value"
        :label="$t('app.selectEvent')"
        variant="solo-filled"
        class="combo-event"
        :bg-color="event?.program == 'frc' ? '#BFDAE6' : '#ffcc80'"
      />

      <v-spacer />

      <!-- Language switcher -->
      <v-btn-toggle v-model="currentLocale" mandatory density="compact" class="locale-toggle mr-2">
        <v-btn value="pt" size="small">PT</v-btn>
        <v-btn value="en" size="small">EN</v-btn>
        <v-btn value="es" size="small">ES</v-btn>
      </v-btn-toggle>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
      <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
        {{ snackbarMessage }}
      </v-snackbar>
    </v-main>

    <!-- Footer -->
    <v-footer app color="#007FBC">
      <span class="white--text">{{ $t('app.copyright') }}</span>
      <v-img src="@/assets/logo_frc_biocore_wordmark_white.png" alt="FRC BioCore" max-height="36" max-width="260" contain />
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuth0 } from "@auth0/auth0-vue";
import { useEventStore } from "@/stores/eventStore";
import { useSnackbar } from "@/composables/useSnackbar";
import { syncVeeValidateLocale } from "@/plugins/validation";

const { loginWithRedirect, user, isAuthenticated, logout } = useAuth0();
const { snackbar, snackbarMessage, snackbarColor } = useSnackbar();
const eventStore = useEventStore();
const { locale, t } = useI18n();

if (!isAuthenticated.value || !user.value) {
  loginWithRedirect();
}

// ── Locale switcher ──────────────────────────────────────────────────────────
const currentLocale = computed({
  get: () => locale.value,
  set: (val) => {
    locale.value = val;
    localStorage.setItem("locale", val);
    syncVeeValidateLocale(val);
  },
});

// ── Nav drawer ───────────────────────────────────────────────────────────────
const drawer = ref(false);

// ── Auth / roles ─────────────────────────────────────────────────────────────
const roles = user.value?.["https://myapp.example.com/roles"] || [];
const isAdmin = roles.includes("admin");
const isJudge = roles.includes("judge");
const eventRoles = roles.filter((r) => r !== "admin" && r !== "judge");

// ── Events ───────────────────────────────────────────────────────────────────
const parsedEvents = eventRoles.map((role) => {
  const [eventCode, program] = role.split("-");
  return {
    text: eventCode.toUpperCase(),
    value: eventCode,
    program: program || null,
  };
});
eventStore.setAvailableEvents(parsedEvents);

const event = computed({
  get: () => eventStore.selectedEvent,
  set: (val) => eventStore.setSelectedEvent(val),
});

// ── Menu ─────────────────────────────────────────────────────────────────────
// `key` is used for role-based filtering and never changes with locale.
// `name` is the translated label shown in the UI.
const menuItems = computed(() => [
  { key: "login",        name: t("app.menu.login"),        icon: "mdi-login",                route: "/login" },
  { key: "dashboard",    name: t("app.menu.dashboard"),    icon: "mdi-view-dashboard-outline",route: "/dashboard" },
  { key: "addPhoto",     name: t("app.menu.addPhoto"),     icon: "mdi-camera",               route: "/adicionar-foto" },
  { key: "listTeams",    name: t("app.menu.listTeams"),    icon: "mdi-list-box-outline",     route: "/listTeams" },
  { key: "nominateTeam", name: t("app.menu.nominateTeam"), icon: "mdi-file-tree",            route: "/nominateTeam" },
  { key: "nonNominated", name: t("app.menu.nonNominated"), icon: "mdi-clipboard",            route: "/non-nominated" },
  { key: "visits",       name: t("app.menu.visits"),       icon: "mdi-door-open",            route: "/visits" },
  { key: "awards",       name: t("app.menu.awards"),       icon: "mdi-trophy-award",         route: "/awards" },
]);

const allowedMenuItems = computed(() => {
  if (!isAuthenticated.value || !user.value) {
    return menuItems.value.filter((item) => item.key === "login");
  }
  if (isAdmin) {
    return menuItems.value.filter((item) => item.key !== "login");
  }
  if (isJudge) {
    return menuItems.value.filter((item) => item.key !== "login");
  }
  return menuItems.value.filter((item) => item.key !== "login");
});

// ── Logout ───────────────────────────────────────────────────────────────────
const doLogout = () => {
  logout({ logoutParams: { returnTo: window.location.origin } });
};

const events = eventStore.availableEvents;
</script>

<style scoped>
.drawer-logo {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
}

.combo-event {
  margin-top: 1.4rem;
}

.locale-toggle {
  border-radius: 6px;
}
</style>
