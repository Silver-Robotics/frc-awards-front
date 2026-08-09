<template>
  <div>
    <!-- ── Team photo dialog ─────────────────────────────────────────────── -->
    <v-dialog v-model="dialog" max-width="380px">
      <v-card v-if="selectedTeam" rounded="lg" class="team-dialog-card">

        <!-- Photo area -->
        <div class="team-photo-wrapper">
          <v-img
            :src="selectedTeam.imageLink || standardImg"
            height="260"
            cover
            class="team-photo-img"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                <v-progress-circular indeterminate color="grey-lighten-1" />
              </div>
            </template>

            <!-- Gradient overlay for readability -->
            <div class="photo-gradient" />

            <!-- Team number badge -->
            <div class="team-number-badge">
              <v-icon icon="mdi-pound" size="13" class="mr-1" />{{ selectedTeam.value }}
            </div>

            <!-- Close button -->
            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              density="compact"
              class="photo-close-btn"
              @click="dialog = false"
              style="color:#fff"
            />
          </v-img>
        </div>

        <!-- Team info -->
        <v-card-text class="pt-3 pb-4">
          <div class="text-h6 font-weight-bold team-name-text">{{ selectedTeam.text }}</div>

          <div class="d-flex flex-wrap mt-2" style="gap:6px">
            <v-chip
              v-if="selectedTeam.school"
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-school-outline"
            >{{ selectedTeam.school }}</v-chip>

            <v-chip
              v-if="selectedTeam.state"
              size="small"
              variant="tonal"
              color="teal"
              prepend-icon="mdi-map-marker-outline"
            >{{ selectedTeam.state }}</v-chip>

            <v-chip
              v-if="!selectedTeam.imageLink"
              size="small"
              variant="tonal"
              color="grey"
              prepend-icon="mdi-image-off-outline"
            >{{ $t('addPicture.noPhoto') }}</v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Event banner -->
    <v-card
      v-if="event"
      color="#007FBC"
      class="mx-auto"
      prepend-icon="mdi-robot"
      :subtitle="event.location"
    >
      <template v-slot:title>
        <span class="font-weight-black">{{ event.name }}</span>
      </template>
    </v-card>

    <!-- Loading skeleton -->
    <v-skeleton-loader v-if="loading" class="mx-auto mt-4" type="table" elevation="1">
      <template #default>
        <v-card flat>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">{{ $t('listTeams.headers.name') }}</th>
                <th class="text-left">{{ $t('listTeams.headers.teamNumber') }}</th>
                <th class="text-left">{{ $t('listTeams.headers.state') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in 8" :key="n">
                <td><v-skeleton-loader type="text" width="70%" /></td>
                <td><v-skeleton-loader type="text" width="40%" /></td>
                <td><v-skeleton-loader type="text" width="50%" /></td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </template>
    </v-skeleton-loader>

    <!-- Teams table -->
    <v-data-table
      v-else
      :headers="headers"
      :items="teams"
      hover
      hide-default-footer
      :items-per-page="teams.length"
    >
      <template #item="{ item }">
        <tr @click="openDialog(item)" style="cursor: pointer">
          <td>{{ item.state }}</td>
          <td>{{ item.text }}</td>
          <td>{{ item.value }}</td>
          <td>{{ item.school }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";
import { useTeams } from "@/composables/useTeams";
import standardImg from "@/assets/fotos_times/standard.webp";

const { apiRequest } = useApi();
const eventStore = useEventStore();
const { t } = useI18n();

const dialog      = ref(false);
const selectedTeam = ref(null);
const event       = ref(null);

const { teams, loading } = useTeams();

const headers = computed(() => [
  { title: t("listTeams.headers.state"),      value: "state" },
  { title: t("listTeams.headers.name"),       value: "text" },
  { title: t("listTeams.headers.teamNumber"), value: "value" },
  { title: t("listTeams.headers.school"),     value: "school" },
]);

const openDialog = (item) => {
  // find the full team record from useTeams so imageLink is available
  selectedTeam.value = teams.value.find((t) => t.value === item.value) ?? item;
  dialog.value = true;
};

const fetchEvent = async () => {
  if (!eventStore.selectedEvent?.value) return;
  try {
    event.value = await apiRequest("events", {
      method: "GET",
      headers: { eventCode: eventStore.selectedEvent.value },
    });
  } catch {
    event.value = null;
  }
};

watch(() => eventStore.selectedEvent, fetchEvent, { immediate: true });
</script>

<style scoped>
.v-data-table tbody tr:hover {
  background-color: #BFDAE6 !important;
  cursor: pointer;
}

/* ── Team photo dialog ────────────────────────────────────────────────────── */
.team-dialog-card {
  overflow: hidden;
}

.team-photo-wrapper {
  position: relative;
}

.team-photo-img {
  display: block;
}

.photo-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 40%, rgba(0,0,0,0.35) 100%);
  pointer-events: none;
}

.team-number-badge {
  position: absolute;
  bottom: 10px;
  left: 12px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(4px);
  letter-spacing: 0.03em;
}

.photo-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.35) !important;
  backdrop-filter: blur(4px);
}

.team-name-text {
  font-size: 1rem !important;
  line-height: 1.35;
  color: rgba(0, 0, 0, 0.87);
}
</style>
