<template>
  <div>
    <!-- Image dialog -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-img v-if="teams.length > 0" :src="teamImageSrc" max-height="300" contain />
      </v-card>
    </v-dialog>

    <!-- Loading skeleton -->
    <v-skeleton-loader v-if="loading" class="mx-auto mt-4" type="table" elevation="1">
      <template #default>
        <v-card flat>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">{{ $t('common.name') }}</th>
                <th class="text-left">{{ $t('visits.headers.number') }}</th>
                <th class="text-left">{{ $t('common.state') }}</th>
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

    <!-- Visit control table -->
    <v-container v-else fluid>
      <v-card elevation="2" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">{{ $t('visits.title') }}</v-card-title>

        <v-data-table hide-default-footer :items-per-page="teams.length">
          <thead>
            <tr>
              <th class="text-left">{{ $t('common.name') }}</th>
              <th class="text-left">{{ $t('visits.headers.number') }}</th>
              <th class="text-center">{{ $t('visits.headers.visitAE') }}</th>
              <th class="text-center">{{ $t('visits.headers.visitMCI') }}</th>
              <th class="text-center">{{ $t('visits.headers.visitExtra') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in teams" :key="item.value">
              <td>{{ item.text }}</td>
              <td>{{ item.value }}</td>
              <td class="text-center">
                <v-checkbox
                  hide-details density="compact" color="#007FBC"
                  v-model="item.visitedTA" @change="visitChange(item, 'visitedTA')"
                />
              </td>
              <td class="text-center">
                <v-checkbox
                  hide-details density="compact" color="#007FBC"
                  v-model="item.visitedMCI" @change="visitChange(item, 'visitedMCI')"
                />
              </td>
              <td class="text-center">
                <v-checkbox
                  hide-details density="compact" color="#007FBC"
                  v-model="item.visitedExtra" @change="visitChange(item, 'visitedExtra')"
                />
              </td>
            </tr>
          </tbody>
        </v-data-table>
      </v-card>
    </v-container>
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

const { teams, loading } = useTeams();
const { teamImageSrc } = useTeamImage(teams, selectedIndex);

// Coerce API integers/strings to real booleans for v-checkbox
watch(teams, (newTeams) => {
  newTeams.forEach((team) => {
    team.visitedTA    = team.visitedTA    === true || team.visitedTA    === "true" || team.visitedTA    === 1;
    team.visitedMCI   = team.visitedMCI   === true || team.visitedMCI   === "true" || team.visitedMCI   === 1;
    team.visitedExtra = team.visitedExtra === true || team.visitedExtra === "true" || team.visitedExtra === 1;
  });
});

const visitChange = async (item, visitType) => {
  await apiRequest(`teams/${item.value}`, {
    method: "PUT",
    headers: { eventCode: eventStore.selectedEvent?.value },
    body: JSON.stringify({ visit: visitType, newValue: item[visitType] }),
  });
};
</script>

<style scoped>
</style>
