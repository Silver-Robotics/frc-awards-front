<template>
  <v-container fluid>
    <!-- Loading skeleton -->
    <v-skeleton-loader v-if="loading" class="mx-auto mt-4" type="table" elevation="1">
      <template #default>
        <v-card flat>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">{{ $t('awards.headers.award') }}</th>
                <th class="text-left">{{ $t('awards.headers.team') }}</th>
                <th class="text-left">{{ $t('awards.headers.room') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in 6" :key="n">
                <td><v-skeleton-loader type="text" width="80%" /></td>
                <td><v-skeleton-loader type="text" width="60%" /></td>
                <td><v-skeleton-loader type="text" width="40%" /></td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </template>
    </v-skeleton-loader>

    <!-- Awards grid -->
    <v-row dense v-else>
      <v-col
        v-for="award in groupedAwards"
        :key="award.name"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-hover v-slot="{ isHover }">
          <v-card :elevation="isHover ? 12 : 4" class="award-card">
            <v-card-title class="card-title">
              {{ award.name }}
              <v-icon icon="mdi-information-outline" size="small" @click="displayAward(award)" />
            </v-card-title>

            <!-- FTC: draggable order -->
            <draggable
              v-if="isFTC"
              v-model="award.teams"
              item-key="Teams_idTeams"
              tag="v-list"
              handle=".drag-handle"
              @end="onDragEnd($event, award)"
            >
              <template #item="{ element: team }">
                <v-list-item
                  @click="openDialog(team, award)"
                  :class="[team.awarded ? 'winner' : team.nominated ? 'tile' : 'alreadyAwarded', positionClass(team)]"
                >
                  <v-list-item-title>
                    <v-icon icon="mdi-drag" size="small" class="mr-2 drag-handle" />
                    <b>{{ team.teamName }} - {{ team.teamNumber }}</b>
                  </v-list-item-title>
                </v-list-item>
              </template>
            </draggable>

            <!-- FRC: static list -->
            <v-list v-else>
              <v-list-item
                v-for="team in award.teams"
                :key="team.Teams_idTeams"
                @click="openDialog(team, award)"
                :class="[team.nominated ? 'tile' : !team.awarded ? 'alreadyAwarded' : 'winner', positionClass(team)]"
              >
                <v-list-item-title>
                  <b>{{ team.teamName }} - {{ team.teamNumber }}</b>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <!-- Team detail dialog -->
    <v-dialog v-model="dialog" max-width="400px">
      <v-card v-if="currentTeam">
        <v-card-title class="headline">{{ currentAward?.name }}</v-card-title>
        <v-card-subtitle>{{ `${currentTeam.teamName} - ${currentTeam.teamNumber}` }}</v-card-subtitle>

        <v-card-text>
          <b>{{ $t('awards.dialog.nominatedBy') }}</b> {{ currentTeam.judge }}<br />
          <b>{{ $t('awards.dialog.description') }}</b> {{ currentTeam.motive }}
        </v-card-text>

        <v-img
          v-if="currentTeam.imagePath"
          :src="apiBase + currentTeam.imagePath"
          max-height="220"
          contain
          class="mb-3"
        />

        <v-card-actions class="flex-column">
          <v-btn
            v-if="!isFTC"
            color="#F7E326"
            text
            @click="toggleNomination(currentTeam, currentAward.name)"
          >
            {{ currentTeam.nominated ? $t('awards.dialog.removeConsideration') : $t('awards.dialog.consider') }}
          </v-btn>

          <v-btn
            v-if="isFTC"
            color="#F7E326"
            text
            @click="toggleAward(currentTeam, currentAward.name)"
          >
            {{ currentTeam.awarded ? $t('awards.dialog.removeAward') : $t('awards.dialog.giveAward') }}
          </v-btn>

          <v-btn color="#F7E326" text @click="deleteAward(currentTeam, currentAward.name)">
            {{ $t('awards.dialog.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";
import { useAwards } from "@/composables/useAwards";
import draggable from "vuedraggable";

const { apiRequest } = useApi();
const eventStore = useEventStore();

const apiBase = process.env.VUE_APP_SERVER_DOMAIN;
const isFTC = computed(() => eventStore.selectedEvent?.program === "ftc");

const dialog = ref(false);
const currentTeam = ref(null);
const currentAward = ref(null);

const { groupedAwards, loading, refresh: reloadAwards } = useAwards();

const positionClass = (team) => (team.premiado ? "winner" : "");

const displayAward = (award) => {
  currentAward.value = award;
  dialog.value = true;
};

const openDialog = (team, award) => {
  currentTeam.value = team;
  currentAward.value = award;
  dialog.value = !!team.motive;
};

const onDragEnd = async (_event, awardTeams) => {
  const payload = awardTeams.teams.map((team, index) => ({
    id: team.idAwards,
    order: index,
  }));
  await apiRequest("awards/order", {
    method: "PUT",
    body: JSON.stringify({ awards: payload }),
  });
};

const toggleNomination = async (team, award) => {
  await apiRequest("awards", {
    method: "PUT",
    body: JSON.stringify({ id: team.Teams_idTeams, nominated: !team.nominated, award }),
  });
  team.nominated = !team.nominated;
  dialog.value = false;
};

const toggleAward = async (team, award) => {
  await apiRequest("awards/awarded", {
    method: "PUT",
    body: JSON.stringify({ id: team.Teams_idTeams, awarded: !team.awarded, award }),
  });
  team.awarded = !team.awarded;
  dialog.value = false;
  await reloadAwards();
};

const deleteAward = async (team, award) => {
  await apiRequest("awards", {
    method: "DELETE",
    body: JSON.stringify({ id: team.Teams_idTeams, award }),
  });

  const awardGroup = groupedAwards.value.find((a) => a.name === currentAward.value.name);
  if (awardGroup) {
    awardGroup.teams = awardGroup.teams.filter((t) => t.Teams_idTeams !== team.Teams_idTeams);
  }
  dialog.value = false;
};
</script>

<style scoped>
.card-title {
  background-color: #F7E326;
  display: flex;
  justify-content: space-between;
}

.award-card {
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 1rem;
}

.tile:hover {
  background: #BFDAE6;
}

.winner {
  background: #F7E326;
}

.alreadyAwarded {
  background: #ef9a9a;
}

.v-list-item {
  transition: background 0.2s ease;
}
</style>
