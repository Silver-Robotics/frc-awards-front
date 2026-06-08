<template>
  <div>
    <!-- Image dialog -->
    <v-dialog v-model="dialog" max-width="290">
      <v-card v-if="teams.length > 0">
        <v-img :src="teamImageSrc" />
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
import { useTeamImage } from "@/composables/useTeamImage";

const { apiRequest } = useApi();
const eventStore = useEventStore();
const { t } = useI18n();

const dialog = ref(false);
const selectedIndex = ref(0);
const event = ref(null);

const { teams, loading } = useTeams();
const { teamImageSrc } = useTeamImage(teams, selectedIndex);

const headers = computed(() => [
  { title: t("listTeams.headers.state"),      value: "state" },
  { title: t("listTeams.headers.name"),       value: "text" },
  { title: t("listTeams.headers.teamNumber"), value: "value" },
  { title: t("listTeams.headers.school"),     value: "school" },
]);

const openDialog = (item) => {
  const i = teams.value.findIndex((t) => t.value === item.value);
  selectedIndex.value = i;
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
</style>
