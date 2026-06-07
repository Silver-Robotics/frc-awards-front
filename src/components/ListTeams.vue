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
      color="#598290"
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
                <th class="text-left">Nome</th>
                <th class="text-left">Número</th>
                <th class="text-left">Estado</th>
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
import { ref, watch } from "vue";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";
import { useTeams } from "@/composables/useTeams";
import { useTeamImage } from "@/composables/useTeamImage";

const { apiRequest } = useApi();
const eventStore = useEventStore();

const dialog = ref(false);
const selectedIndex = ref(0);
const event = ref(null);

const { teams, loading } = useTeams();
const { teamImageSrc } = useTeamImage(teams, selectedIndex);

const headers = [
  { title: "Estado", value: "state" },
  { title: "Nome", value: "text" },
  { title: "#Time", value: "value" },
  { title: "Escola", value: "school" },
];

const openDialog = (item) => {
  const i = teams.value.findIndex((t) => t.value === item.value);
  selectedIndex.value = i;
  dialog.value = true;
};

// Fetch event info whenever the selected event changes
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
  background-color: #e0f7fa !important;
  cursor: pointer;
}
</style>
