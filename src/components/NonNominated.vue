<template>
  <div>
    <!-- Image dialog -->
    <v-dialog v-model="dialog" max-width="320">
      <v-card v-if="teams.length > 0">
        <v-img :src="teamImageSrc" />
      </v-card>
    </v-dialog>

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

    <!-- Non-nominated teams table -->
    <v-container v-else fluid>
      <v-card elevation="2" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">Times não indicados</v-card-title>

        <v-data-table
          :headers="headers"
          hover
          :items="teams"
          :items-per-page="-1"
          hide-default-footer
          class="team-table"
          @click:row="openDialog"
        />
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTeams } from "@/composables/useTeams";
import { useTeamImage } from "@/composables/useTeamImage";

const dialog = ref(false);
const selectedIndex = ref(0);

const { teams, loading } = useTeams("awards/non-nominated/teams");
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
</script>

<style scoped>
.team-table {
  font-family: "Roboto", sans-serif;
}

.v-data-table-row:hover {
  background-color: rgba(30, 90, 168, 0.08) !important;
  cursor: pointer;
}
</style>
