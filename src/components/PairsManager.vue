<template>
  <div>
    <!-- Action bar -->
    <div class="d-flex flex-wrap align-center gap-3 mb-5">
      <v-btn
        prepend-icon="mdi-account-multiple-plus"
        color="#007FBC"
        variant="outlined"
        @click="addPair"
      >
        {{ $t('dashboard.pairs.newPair') }}
      </v-btn>

      <v-btn
        prepend-icon="mdi-shuffle-variant"
        color="#007FBC"
        variant="tonal"
        :disabled="pairs.length === 0 || teams.length === 0"
        @click="distributeTeams"
      >
        {{ $t('dashboard.pairs.distribute') }}
      </v-btn>

      <v-btn
        v-if="hasAnyTeams"
        prepend-icon="mdi-broom"
        variant="text"
        color="error"
        @click="clearTeams"
      >
        {{ $t('dashboard.pairs.clearTeams') }}
      </v-btn>
    </div>

    <!-- Available judges pool -->
    <v-sheet
      v-if="judges.length > 0"
      class="pa-3 mb-5 available-pool"
      rounded
      border
    >
      <div class="text-caption text-medium-emphasis font-weight-medium mb-2">
        {{ $t('dashboard.pairs.availableJudges') }}
        <span v-if="availableJudges.length === 0" class="ml-1 text-disabled">
          — {{ $t('dashboard.pairs.allAssigned') }}
        </span>
      </div>
      <div class="d-flex flex-wrap" style="gap: 6px">
        <v-chip
          v-for="judge in availableJudges"
          :key="judge.judgeName"
          size="small"
          color="#007FBC"
          variant="outlined"
          prepend-icon="mdi-account"
        >
          {{ judge.judgeName }}
        </v-chip>
        <span v-if="availableJudges.length === 0" class="text-caption text-disabled">
          ✓
        </span>
      </div>
    </v-sheet>

    <!-- Empty state -->
    <v-alert
      v-if="pairs.length === 0"
      type="info"
      variant="tonal"
      icon="mdi-account-group-outline"
    >
      {{ $t('dashboard.pairs.noPairs') }}
    </v-alert>

    <!-- Pairs grid -->
    <v-row>
      <v-col
        v-for="(pair, pIdx) in pairs"
        :key="pair.id"
        cols="12"
        md="6"
      >
        <v-card elevation="2" class="pair-card h-100">
          <!-- Card header -->
          <v-card-title class="pair-header d-flex align-center justify-space-between py-2 px-4">
            <span class="text-subtitle-1 font-weight-bold">
              {{ $t('dashboard.pairs.pair') }} {{ pIdx + 1 }}
            </span>

            <div class="d-flex align-center" style="gap: 6px">
              <v-chip size="x-small" color="#BFDAE6" label>
                {{ pair.teams.length }} {{ $t('dashboard.pairs.teamsLabel') }}
              </v-chip>
              <v-chip
                v-if="pair.teams.length > 0"
                size="x-small"
                variant="outlined"
                label
                :title="$t('dashboard.pairs.sum')"
              >
                Σ {{ teamSum(pair) }}
              </v-chip>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="x-small"
                density="compact"
                color="error"
                @click="removePair(pIdx)"
              />
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pt-3">
            <!-- ── Judges ── -->
            <div class="mb-4">
              <div class="section-label mb-2">
                <v-icon icon="mdi-account-supervisor" size="14" class="mr-1" />
                {{ $t('dashboard.pairs.judges') }}
              </div>

              <div class="d-flex flex-wrap" style="gap: 6px">
                <v-chip
                  v-for="(judge, jIdx) in pair.judges"
                  :key="judge"
                  closable
                  color="#007FBC"
                  size="small"
                  @click:close="removeJudge(pIdx, jIdx)"
                >
                  {{ judge }}
                </v-chip>

                <!-- Add judge -->
                <v-menu v-if="availableJudges.length > 0">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      size="small"
                      variant="tonal"
                      color="#007FBC"
                      prepend-icon="mdi-plus"
                      style="cursor: pointer"
                    >
                      {{ $t('common.add') }}
                    </v-chip>
                  </template>
                  <v-list density="compact" min-width="180">
                    <v-list-item
                      v-for="j in availableJudges"
                      :key="j.judgeName"
                      :title="j.judgeName"
                      prepend-icon="mdi-account"
                      @click="addJudgeToPair(pIdx, j.judgeName)"
                    />
                  </v-list>
                </v-menu>

                <span
                  v-if="pair.judges.length === 0 && availableJudges.length === 0"
                  class="text-caption text-disabled"
                >
                  {{ $t('dashboard.pairs.noJudgesAvailable') }}
                </span>
              </div>
            </div>

            <!-- ── Teams ── -->
            <div>
              <div class="section-label mb-2">
                <v-icon icon="mdi-robot" size="14" class="mr-1" />
                {{ $t('dashboard.pairs.teamsLabel') }}
              </div>

              <div class="d-flex flex-wrap" style="gap: 6px">
                <v-chip
                  v-for="(team, tIdx) in pair.teams"
                  :key="team.value"
                  closable
                  size="small"
                  color="#BFDAE6"
                  @click:close="removeTeam(pIdx, tIdx)"
                >
                  <span class="font-weight-bold mr-1">{{ team.value }}</span>
                  <span class="text-truncate" style="max-width: 80px">{{ team.text }}</span>
                </v-chip>

                <!-- Add team manually -->
                <v-menu
                  v-if="unassignedTeams.length > 0"
                  :close-on-content-click="false"
                  v-model="addTeamMenuOpen[pIdx]"
                >
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      size="small"
                      variant="tonal"
                      prepend-icon="mdi-plus"
                      style="cursor: pointer"
                    >
                      {{ $t('common.add') }}
                    </v-chip>
                  </template>
                  <v-card min-width="300" class="pa-2">
                    <v-autocomplete
                      :items="unassignedTeams"
                      item-title="text"
                      :item-value="item => item"
                      density="compact"
                      :label="$t('dashboard.pairs.addTeam')"
                      clearable
                      auto-select-first
                      @update:model-value="val => onAddTeam(pIdx, val)"
                    />
                  </v-card>
                </v-menu>

                <span
                  v-if="pair.teams.length === 0"
                  class="text-caption text-disabled"
                >
                  {{ $t('dashboard.pairs.noTeamsYet') }}
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTeams } from "@/composables/useTeams";

const props = defineProps({
  /** Array of judge objects from the API: [{ judgeName: string }] */
  judges: { type: Array, default: () => [] },
});

const { t } = useI18n();
const { teams } = useTeams();

// ── Pairs state ──────────────────────────────────────────────────────────────
let nextId = 1;
const pairs = ref([]);
const addTeamMenuOpen = ref({});

// ── Derived state ────────────────────────────────────────────────────────────
const assignedJudgeNames = computed(
  () => new Set(pairs.value.flatMap((p) => p.judges))
);
const availableJudges = computed(() =>
  props.judges.filter((j) => !assignedJudgeNames.value.has(j.judgeName))
);

const assignedTeamValues = computed(
  () => new Set(pairs.value.flatMap((p) => p.teams.map((t) => t.value)))
);
const unassignedTeams = computed(() =>
  teams.value.filter((t) => !assignedTeamValues.value.has(t.value))
);

const hasAnyTeams = computed(() => pairs.value.some((p) => p.teams.length > 0));

// ── Pair CRUD ────────────────────────────────────────────────────────────────
const addPair = () => {
  pairs.value.push({ id: nextId++, judges: [], teams: [] });
};

const removePair = (pIdx) => {
  pairs.value.splice(pIdx, 1);
};

// ── Judge operations ─────────────────────────────────────────────────────────
const addJudgeToPair = (pIdx, judgeName) => {
  pairs.value[pIdx].judges.push(judgeName);
};

const removeJudge = (pIdx, jIdx) => {
  pairs.value[pIdx].judges.splice(jIdx, 1);
};

// ── Team operations ──────────────────────────────────────────────────────────
const addTeamToPair = (pIdx, team) => {
  if (!team) return;
  pairs.value[pIdx].teams.push(team);
};

const onAddTeam = (pIdx, val) => {
  if (!val) return;
  addTeamToPair(pIdx, val);
  addTeamMenuOpen.value[pIdx] = false;
};

const removeTeam = (pIdx, tIdx) => {
  pairs.value[pIdx].teams.splice(tIdx, 1);
};

const clearTeams = () => {
  pairs.value.forEach((p) => (p.teams = []));
};

// ── Distribution ─────────────────────────────────────────────────────────────
/**
 * Snake (serpentine) seeding — the standard method for balanced tournament
 * distribution. Sorts teams ascending by number (lower = more experienced),
 * then zigzags across pairs so each gets one from every experience tier.
 *
 * Example: 3 pairs, teams [1,2,3,4,5,6,7,8,9]
 *   Pass →  P0:1  P1:2  P2:3
 *   Pass ←  P2:4  P1:5  P0:6
 *   Pass →  P0:7  P1:8  P2:9
 *   Sums: P0=14  P1=15  P2=16  (avg 15 — near-perfect balance)
 */
const distributeTeams = () => {
  if (pairs.value.length === 0) return;

  const sorted = [...teams.value].sort(
    (a, b) => Number(a.value) - Number(b.value)
  );
  const numPairs = pairs.value.length;

  // Clear existing assignments
  pairs.value.forEach((p) => (p.teams = []));

  let direction = 1;
  let pairIdx = 0;

  for (const team of sorted) {
    pairs.value[pairIdx].teams.push(team);
    pairIdx += direction;
    if (pairIdx >= numPairs) {
      pairIdx = numPairs - 1;
      direction = -1;
    } else if (pairIdx < 0) {
      pairIdx = 0;
      direction = 1;
    }
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const teamSum = (pair) =>
  pair.teams.reduce((sum, t) => sum + Number(t.value), 0);
</script>

<style scoped>
.available-pool {
  background-color: #f8fbff;
}

.pair-card {
  transition: box-shadow 0.2s ease;
}

.pair-header {
  background-color: #BFDAE6;
  min-height: 48px;
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
