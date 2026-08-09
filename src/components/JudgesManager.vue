<template>
  <div>
    <!-- Add judge form -->
    <div class="d-flex align-center gap-3 mb-6">
      <v-text-field
        autocomplete="off"
        v-model="judgeName"
        :label="$t('dashboard.fields.judgeName')"
        prepend-icon="mdi-account-multiple-check"
        variant="solo-filled"
        density="compact"
        hide-details
        style="max-width: 340px"
        @keyup.enter="addJudge"
      />
      <v-btn
        color="#007FBC"
        variant="outlined"
        :loading="adding"
        :disabled="!judgeName || judgeName.trim().length < 1"
        @click="addJudge"
      >
        {{ $t('dashboard.submit.addJudges') }}
      </v-btn>
    </div>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <!-- Empty state -->
    <v-alert
      v-else-if="judges.length === 0"
      type="info"
      variant="tonal"
      icon="mdi-account-off-outline"
    >
      {{ $t('dashboard.messages.noJudgesRegistered') }}
    </v-alert>

    <!-- Judge cards -->
    <v-row v-else>
      <v-col
        v-for="judge in judges"
        :key="judge.idJudges"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card elevation="2" class="judge-card h-100">
          <!-- Header -->
          <v-card-title class="judge-header d-flex align-center justify-space-between py-2 px-4">
            <div class="d-flex align-center" style="gap: 8px">
              <v-icon icon="mdi-account-supervisor" size="18" />
              <span class="text-body-1 font-weight-medium">{{ judge.judgeName }}</span>
            </div>
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="x-small"
              density="compact"
              class="delete-btn"
              @click="deleteJudge(judge)"
            />
          </v-card-title>

          <v-divider />

          <v-card-text class="pt-3">
            <div class="section-label mb-2">
              <v-icon icon="mdi-alert-circle-outline" size="14" class="mr-1" />
              {{ $t('dashboard.judges.conflicts') }}
            </div>

            <div class="d-flex flex-wrap" style="gap: 6px">
              <!-- Existing conflict chips -->
              <v-chip
                v-for="team in judge.conflicts"
                :key="team.idTeams"
                closable
                size="small"
                color="deep-orange"
                variant="tonal"
                @click:close="removeConflict(judge, team)"
              >
                {{ team.value }}
              </v-chip>

              <!-- Add conflict -->
              <v-menu v-if="availableTeamsFor(judge).length > 0">
                <template #activator="{ props }">
                  <v-chip
                    v-bind="props"
                    size="small"
                    variant="tonal"
                    color="deep-orange"
                    prepend-icon="mdi-plus"
                    style="cursor: pointer"
                  >
                    {{ $t('common.add') }}
                  </v-chip>
                </template>
                <v-list density="compact" min-width="120">
                  <v-list-item
                    v-for="team in availableTeamsFor(judge)"
                    :key="team.idTeams"
                    :title="String(team.value)"
                    prepend-icon="mdi-robot"
                    @click="addConflict(judge, team)"
                  />
                </v-list>
              </v-menu>

              <span
                v-if="judge.conflicts.length === 0"
                class="text-caption text-disabled"
              >
                {{ $t('dashboard.judges.noConflicts') }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useJudges } from "@/composables/useJudges";
import { useTeams } from "@/composables/useTeams";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";

const { judges, loading } = useJudges();
const { teams } = useTeams();
const { apiRequest } = useApi();
const eventStore = useEventStore();

// ── Add judge ─────────────────────────────────────────────────────────────────
const judgeName = ref("");
const adding = ref(false);

const addJudge = async () => {
  if (!judgeName.value?.trim() || !eventStore.selectedEvent?.value) return;
  adding.value = true;
  try {
    const newJudge = await apiRequest("judges", {
      method: "POST",
      headers: { eventCode: eventStore.selectedEvent.value },
      body: JSON.stringify({ judgeName: judgeName.value.trim() }),
    });
    judges.value.push(newJudge);
    judgeName.value = "";
  } catch (err) {
    console.error("Failed to add judge:", err);
  } finally {
    adding.value = false;
  }
};

// ── Delete judge ──────────────────────────────────────────────────────────────
const deleteJudge = async (judge) => {
  const idx = judges.value.indexOf(judge);
  judges.value.splice(idx, 1); // optimistic
  try {
    await apiRequest(`judges/${judge.idJudges}`, { method: "DELETE" });
  } catch (err) {
    judges.value.splice(idx, 0, judge); // revert
    console.error("Failed to delete judge:", err);
  }
};

// ── Conflicts ─────────────────────────────────────────────────────────────────

/** Teams not already in conflict for this judge */
const availableTeamsFor = (judge) =>
  teams.value.filter(
    (t) => !judge.conflicts.some((c) => c.idTeams === t.idTeams)
  );

const addConflict = async (judge, team) => {
  judge.conflicts.push(team); // optimistic
  try {
    await apiRequest(`judges/${judge.idJudges}/conflicts`, {
      method: "POST",
      body: JSON.stringify({ teamId: team.idTeams }),
    });
  } catch (err) {
    const i = judge.conflicts.indexOf(team);
    if (i !== -1) judge.conflicts.splice(i, 1); // revert
    console.error("Failed to add conflict:", err);
  }
};

const removeConflict = async (judge, team) => {
  const i = judge.conflicts.indexOf(team);
  judge.conflicts.splice(i, 1); // optimistic
  try {
    await apiRequest(`judges/${judge.idJudges}/conflicts/${team.idTeams}`, {
      method: "DELETE",
    });
  } catch (err) {
    judge.conflicts.splice(i, 0, team); // revert
    console.error("Failed to remove conflict:", err);
  }
};
</script>

<style scoped>
.judge-card {
  transition: box-shadow 0.2s ease;
}

.judge-header {
  background-color: #BFDAE6;
  min-height: 48px;
}

.delete-btn {
  color: #757575;
  transition: all 0.25s ease;
}

.delete-btn:hover {
  color: #e53935;
  background-color: rgba(229, 57, 53, 0.1);
  transform: scale(1.1);
}

.section-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #607d8b;
  display: flex;
  align-items: center;
}
</style>
