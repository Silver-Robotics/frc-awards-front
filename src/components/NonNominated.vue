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
                <th class="text-left">{{ $t('nonNominated.headers.name') }}</th>
                <th class="text-left">{{ $t('nonNominated.headers.teamNumber') }}</th>
                <th class="text-left">{{ $t('nonNominated.headers.state') }}</th>
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
        <v-card-title class="text-h6 font-weight-bold">{{ $t('nonNominated.title') }}</v-card-title>

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
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTeams } from "@/composables/useTeams";
import { useTeamImage } from "@/composables/useTeamImage";

const { t } = useI18n();

const dialog = ref(false);
const selectedIndex = ref(0);

const { teams, loading } = useTeams("awards/non-nominated/teams");
const { teamImageSrc } = useTeamImage(teams, selectedIndex);

const headers = computed(() => [
  { title: t("nonNominated.headers.state"),      value: "state" },
  { title: t("nonNominated.headers.name"),       value: "text" },
  { title: t("nonNominated.headers.teamNumber"), value: "value" },
  { title: t("nonNominated.headers.school"),     value: "school" },
]);

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
