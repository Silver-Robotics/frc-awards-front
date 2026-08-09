<template>
  <div>
    <!-- Action bar -->
    <div class="d-flex flex-wrap align-center gap-3 mb-5">
      <v-btn
        prepend-icon="mdi-account-multiple-plus"
        color="#007FBC"
        variant="outlined"
        :loading="creating"
        @click="addPair"
      >
        {{ $t('dashboard.pairs.newPair') }}
      </v-btn>

      <v-btn
        prepend-icon="mdi-shuffle-variant"
        color="#007FBC"
        variant="tonal"
        :disabled="pairs.length === 0 || teams.length === 0"
        :loading="distributing"
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
      class="pa-3 mb-4 available-pool"
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
          :key="judge.idJudges"
          size="small"
          color="#007FBC"
          variant="outlined"
          prepend-icon="mdi-account"
        >
          {{ judge.judgeName }}
        </v-chip>
        <span v-if="availableJudges.length === 0" class="text-caption text-disabled">✓</span>
      </div>
    </v-sheet>

    <!-- Team coverage pools (typed view) -->
    <template v-if="hasTypedPairs && teams.length > 0">
      <v-row class="mb-5" dense>
        <v-col v-if="mciPairs.length > 0" cols="12" sm="6">
          <v-sheet class="pa-3 available-pool" rounded border>
            <div class="d-flex align-center mb-2" style="gap: 6px">
              <v-chip size="x-small" color="primary" label>MCI</v-chip>
              <span class="text-caption text-medium-emphasis font-weight-medium">
                {{ $t('dashboard.pairs.teamsWithout') }}
                <span v-if="teamsWithoutMci.length === 0" class="text-disabled">— ✓</span>
              </span>
            </div>
            <div class="d-flex flex-wrap" style="gap: 6px">
              <v-chip
                v-for="team in teamsWithoutMci"
                :key="team.idTeams"
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-robot"
              >{{ team.value }}</v-chip>
            </div>
          </v-sheet>
        </v-col>

        <v-col v-if="taPairs.length > 0" cols="12" sm="6">
          <v-sheet class="pa-3 available-pool" rounded border>
            <div class="d-flex align-center mb-2" style="gap: 6px">
              <v-chip size="x-small" color="success" label>TA</v-chip>
              <span class="text-caption text-medium-emphasis font-weight-medium">
                {{ $t('dashboard.pairs.teamsWithout') }}
                <span v-if="teamsWithoutTa.length === 0" class="text-disabled">— ✓</span>
              </span>
            </div>
            <div class="d-flex flex-wrap" style="gap: 6px">
              <v-chip
                v-for="team in teamsWithoutTa"
                :key="team.idTeams"
                size="small"
                color="success"
                variant="tonal"
                prepend-icon="mdi-robot"
              >{{ team.value }}</v-chip>
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </template>

    <!-- Single pool (no types assigned yet) -->
    <v-sheet
      v-else-if="teams.length > 0"
      class="pa-3 mb-5 available-pool"
      rounded
      border
    >
      <div class="text-caption text-medium-emphasis font-weight-medium mb-2">
        {{ $t('dashboard.pairs.availableTeams') }}
        <span v-if="globalUnassignedTeams.length === 0" class="ml-1 text-disabled">
          — {{ $t('dashboard.pairs.allAssigned') }}
        </span>
      </div>
      <div class="d-flex flex-wrap" style="gap: 6px">
        <v-chip
          v-for="team in globalUnassignedTeams"
          :key="team.idTeams"
          size="small"
          color="#007FBC"
          variant="tonal"
          prepend-icon="mdi-robot"
        >{{ team.value }}</v-chip>
        <span v-if="globalUnassignedTeams.length === 0" class="text-caption text-disabled">✓</span>
      </div>
    </v-sheet>

    <!-- Loading skeleton -->
    <v-row v-if="loading">
      <v-col v-for="n in 2" :key="n" cols="12" md="6">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <!-- Empty state -->
    <v-alert
      v-else-if="pairs.length === 0"
      type="info"
      variant="tonal"
      icon="mdi-account-group-outline"
    >
      {{ $t('dashboard.pairs.noPairs') }}
    </v-alert>

    <!-- Pairs grid -->
    <v-row v-else>
      <v-col
        v-for="(pair, pIdx) in pairs"
        :key="pair.idPair"
        cols="12"
        md="6"
      >
        <v-card elevation="2" class="pair-card h-100">
          <!-- Card header -->
          <v-card-title
            class="pair-header d-flex align-center justify-space-between py-2 px-4"
            :class="pair.type === 'mci' ? 'header-mci' : pair.type === 'ta' ? 'header-ta' : ''"
          >
            <span class="text-subtitle-1 font-weight-bold">
              {{ $t('dashboard.pairs.pair') }} {{ pIdx + 1 }}
            </span>

            <div class="d-flex align-center" style="gap: 6px">
              <v-chip size="x-small" color="white" variant="outlined" label>
                {{ pair.teams.length }} {{ $t('dashboard.pairs.teamsLabel') }}
              </v-chip>

              <!-- MCI / TA type toggle -->
              <v-btn-toggle
                :model-value="pair.type"
                density="compact"
                rounded="lg"
                class="type-toggle"
                @update:model-value="val => setPairType(pIdx, val)"
              >
                <v-btn value="mci" size="x-small" :color="pair.type === 'mci' ? 'primary' : ''">MCI</v-btn>
                <v-btn value="ta"  size="x-small" :color="pair.type === 'ta'  ? 'success' : ''">TA</v-btn>
              </v-btn-toggle>

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
            <div class="mb-3">
              <div class="section-label mb-2">
                <v-icon icon="mdi-account-supervisor" size="14" class="mr-1" />
                {{ $t('dashboard.pairs.judges') }}
              </div>

              <div class="d-flex flex-wrap" style="gap: 6px">
                <!-- Judge chip + role badge -->
                <div
                  v-for="(judge, jIdx) in pair.judges"
                  :key="judge.idJudges"
                  class="d-flex align-center"
                  style="gap: 2px"
                >
                  <v-chip
                    closable
                    color="#007FBC"
                    size="small"
                    @click:close="removeJudge(pIdx, jIdx)"
                  >
                    {{ judge.judgeName }}
                  </v-chip>

                  <!-- Role badge — only shown when pair has a type -->
                  <v-tooltip
                    v-if="pair.type"
                    :text="$t('dashboard.pairs.roleTooltip')"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-chip
                        v-bind="props"
                        size="x-small"
                        :color="roleColor(judge.role)"
                        :variant="judge.role ? 'flat' : 'outlined'"
                        class="role-badge"
                        @click="cycleRole(pIdx, jIdx)"
                      >
                        {{ judge.role || '?' }}
                      </v-chip>
                    </template>
                  </v-tooltip>
                </div>

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
                      :key="j.idJudges"
                      :title="j.judgeName"
                      prepend-icon="mdi-account"
                      @click="addJudgeToPair(pIdx, j)"
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

            <!-- ── Feature 2: Awards list ── -->
            <div v-if="pair.type" class="mb-3">
              <div
                class="section-label mb-1"
                style="cursor: pointer; user-select: none"
                @click="toggleAwardList(pair.idPair)"
              >
                <v-icon icon="mdi-trophy-outline" size="14" class="mr-1" />
                {{ $t('dashboard.pairs.awardsLabel') }}
                <v-icon
                  :icon="expandedAwards.has(pair.idPair) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  size="14"
                  class="ml-1"
                />
              </div>

              <v-expand-transition>
                <div v-if="expandedAwards.has(pair.idPair)">
                  <div class="d-flex flex-wrap mt-1" style="gap: 4px">
                    <v-chip
                      v-for="award in awardsForType(pair.type)"
                      :key="award"
                      size="x-small"
                      :color="pair.type === 'mci' ? 'primary' : 'success'"
                      variant="tonal"
                    >
                      {{ award }}
                    </v-chip>
                  </div>
                </div>
              </v-expand-transition>
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
                  :key="team.idTeams"
                  closable
                  size="small"
                  :color="isConflict(pair, team) ? 'deep-orange' : '#007FBC'"
                  variant="tonal"
                  @click:close="removeTeam(pIdx, tIdx)"
                >
                  {{ team.value }}
                </v-chip>

                <!-- Add team: shows all teams not already in THIS pair -->
                <v-menu v-if="teamsForPairMenu(pair).length > 0">
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
                  <v-list density="compact" min-width="120">
                    <v-list-item
                      v-for="team in teamsForPairMenu(pair)"
                      :key="team.idTeams"
                      :title="String(team.value)"
                      prepend-icon="mdi-robot"
                      @click="onAddTeam(pIdx, team)"
                    />
                  </v-list>
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
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useTeams } from "@/composables/useTeams";
import { useJudges } from "@/composables/useJudges";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";
import { AWARDS_BY_TYPE, ROLES_BY_TYPE } from "@/constants/awards";

const { t } = useI18n();
const { teams } = useTeams();
const { judges } = useJudges();
const { apiRequest } = useApi();
const eventStore = useEventStore();

// ── State ─────────────────────────────────────────────────────────────────────
const pairs        = ref([]);
const loading      = ref(false);
const creating     = ref(false);
const distributing = ref(false);

// Tracks which pair cards have the awards list expanded
const expandedAwards = ref(new Set());

const toggleAwardList = (idPair) => {
  const s = new Set(expandedAwards.value);
  s.has(idPair) ? s.delete(idPair) : s.add(idPair);
  expandedAwards.value = s;
};

const awardsForType = (type) => AWARDS_BY_TYPE[type] ?? [];

// ── Load pairs ────────────────────────────────────────────────────────────────
const fetchPairs = async () => {
  if (!eventStore.selectedEvent?.value) return;
  loading.value = true;
  try {
    pairs.value = await apiRequest("pairs", {
      method: "GET",
      headers: { eventCode: eventStore.selectedEvent.value },
    });
  } catch {
    pairs.value = [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => eventStore.selectedEvent,
  (newVal, oldVal) => {
    if (newVal?.value && newVal.value !== oldVal?.value) fetchPairs();
  },
  { immediate: true }
);

// ── Derived: judges ───────────────────────────────────────────────────────────
const assignedJudgeIds = computed(
  () => new Set(pairs.value.flatMap((p) => p.judges.map((j) => j.idJudges)))
);
const availableJudges = computed(() =>
  judges.value.filter((j) => !assignedJudgeIds.value.has(j.idJudges))
);

// ── Derived: teams ────────────────────────────────────────────────────────────
const mciPairs = computed(() => pairs.value.filter((p) => p.type === "mci"));
const taPairs  = computed(() => pairs.value.filter((p) => p.type === "ta"));
const hasTypedPairs = computed(() => mciPairs.value.length > 0 || taPairs.value.length > 0);

const mciAssignedIds = computed(
  () => new Set(mciPairs.value.flatMap((p) => p.teams.map((t) => t.idTeams)))
);
const taAssignedIds = computed(
  () => new Set(taPairs.value.flatMap((p) => p.teams.map((t) => t.idTeams)))
);
const teamsWithoutMci = computed(() =>
  teams.value.filter((t) => !mciAssignedIds.value.has(t.idTeams))
);
const teamsWithoutTa = computed(() =>
  teams.value.filter((t) => !taAssignedIds.value.has(t.idTeams))
);

const globalAssignedIds = computed(
  () => new Set(pairs.value.flatMap((p) => p.teams.map((t) => t.idTeams)))
);
const globalUnassignedTeams = computed(() =>
  teams.value.filter((t) => !globalAssignedIds.value.has(t.idTeams))
);

const teamsForPairMenu = (pair) =>
  teams.value.filter((t) => !pair.teams.some((pt) => pt.idTeams === t.idTeams));

const hasAnyTeams = computed(() => pairs.value.some((p) => p.teams.length > 0));

const isConflict = (pair, team) => {
  for (const pairJudge of pair.judges) {
    const full = judges.value.find((j) => j.idJudges === pairJudge.idJudges);
    if (full?.conflicts?.some((c) => c.idTeams === team.idTeams)) return true;
  }
  return false;
};

// ── Feature 1: Judge Day-2 roles ──────────────────────────────────────────────
const roleColor = (role) => {
  if (role === 'A') return 'primary';
  if (role === 'B') return 'indigo';
  if (role === 'C') return 'success';
  if (role === 'D') return 'teal';
  return 'grey';
};

const cycleRole = async (pIdx, jIdx) => {
  const pair  = pairs.value[pIdx];
  const judge = pair.judges[jIdx];
  const cycle = [null, ...(ROLES_BY_TYPE[pair.type] ?? [])];
  const currentIdx = cycle.indexOf(judge.role ?? null);
  const newRole    = cycle[(currentIdx + 1) % cycle.length];

  const prev = judge.role;
  judge.role = newRole;
  try {
    await apiRequest(
      `pairs/${pair.idPair}/judges/${judge.idJudges}/role`,
      { method: "PATCH", body: JSON.stringify({ role: newRole }) }
    );
  } catch (err) {
    judge.role = prev;
    console.error("Failed to set judge role:", err);
  }
};

// ── Pair CRUD ─────────────────────────────────────────────────────────────────
const setPairType = async (pIdx, newType) => {
  const pair     = pairs.value[pIdx];
  const resolved = newType === pair.type ? null : newType;
  const prev     = pair.type;
  pair.type = resolved;
  try {
    await apiRequest(`pairs/${pair.idPair}/type`, {
      method: "PATCH",
      body: JSON.stringify({ type: resolved }),
    });
  } catch (err) {
    pair.type = prev;
    console.error("Failed to set pair type:", err);
  }
};

const addPair = async () => {
  if (!eventStore.selectedEvent?.value) return;
  creating.value = true;
  try {
    const { idPair } = await apiRequest("pairs", {
      method: "POST",
      headers: { eventCode: eventStore.selectedEvent.value },
      body: JSON.stringify({}),
    });
    pairs.value.push({ idPair, type: null, judges: [], teams: [] });
  } catch (err) {
    console.error("Failed to create pair:", err);
  } finally {
    creating.value = false;
  }
};

const removePair = async (pIdx) => {
  const pair = pairs.value[pIdx];
  pairs.value.splice(pIdx, 1);
  try {
    await apiRequest(`pairs/${pair.idPair}`, { method: "DELETE" });
  } catch (err) {
    pairs.value.splice(pIdx, 0, pair);
    console.error("Failed to delete pair:", err);
  }
};

// ── Judge operations ──────────────────────────────────────────────────────────
const addJudgeToPair = async (pIdx, judge) => {
  const pair = pairs.value[pIdx];
  pair.judges.push({ ...judge, role: null });
  try {
    await apiRequest(`pairs/${pair.idPair}/judges`, {
      method: "POST",
      body: JSON.stringify({ judgeId: judge.idJudges }),
    });
  } catch (err) {
    pair.judges.pop();
    console.error("Failed to add judge:", err);
  }
};

const removeJudge = async (pIdx, jIdx) => {
  const pair = pairs.value[pIdx];
  const [judge] = pair.judges.splice(jIdx, 1);
  try {
    await apiRequest(`pairs/${pair.idPair}/judges/${judge.idJudges}`, { method: "DELETE" });
  } catch (err) {
    pair.judges.splice(jIdx, 0, judge);
    console.error("Failed to remove judge:", err);
  }
};

// ── Team operations ───────────────────────────────────────────────────────────
const onAddTeam = async (pIdx, team) => {
  const pair = pairs.value[pIdx];
  pair.teams.push(team);
  try {
    await apiRequest(`pairs/${pair.idPair}/teams`, {
      method: "POST",
      body: JSON.stringify({ teamId: team.idTeams }),
    });
  } catch (err) {
    pair.teams.pop();
    console.error("Failed to add team:", err);
  }
};

const removeTeam = async (pIdx, tIdx) => {
  const pair = pairs.value[pIdx];
  const [team] = pair.teams.splice(tIdx, 1);
  try {
    await apiRequest(`pairs/${pair.idPair}/teams/${team.idTeams}`, { method: "DELETE" });
  } catch (err) {
    pair.teams.splice(tIdx, 0, team);
    console.error("Failed to remove team:", err);
  }
};

const clearTeams = async () => {
  const snapshot = pairs.value.map((p) => [...p.teams]);
  pairs.value.forEach((p) => (p.teams = []));
  try {
    await apiRequest("pairs/distribute", {
      method: "PUT",
      body: JSON.stringify({
        distribution: pairs.value.map((p) => ({ pairId: p.idPair, teamIds: [] })),
      }),
    });
  } catch (err) {
    pairs.value.forEach((p, i) => (p.teams = snapshot[i]));
    console.error("Failed to clear teams:", err);
  }
};

// ── Distribution ──────────────────────────────────────────────────────────────
const getConflictIds = (pairJudges) => {
  const ids = new Set();
  for (const { idJudges } of pairJudges) {
    const full = judges.value.find((j) => j.idJudges === idJudges);
    full?.conflicts?.forEach((c) => ids.add(c.idTeams));
  }
  return ids;
};

const resolveConflictsForGroup = (teamsByPair, pairGroup) => {
  let swapped = true;
  let iter = 0;
  while (swapped && iter++ < 50) {
    swapped = false;
    for (let i = 0; i < pairGroup.length; i++) {
      const conflictsI = getConflictIds(pairGroup[i].judges);
      for (let ti = 0; ti < teamsByPair[i].length; ti++) {
        const teamI = teamsByPair[i][ti];
        if (!conflictsI.has(teamI.idTeams)) continue;
        for (let j = 0; j < pairGroup.length; j++) {
          if (j === i) continue;
          const conflictsJ = getConflictIds(pairGroup[j].judges);
          for (let tj = 0; tj < teamsByPair[j].length; tj++) {
            const teamJ = teamsByPair[j][tj];
            if (!conflictsI.has(teamJ.idTeams) && !conflictsJ.has(teamI.idTeams)) {
              teamsByPair[i][ti] = teamJ;
              teamsByPair[j][tj] = teamI;
              swapped = true;
              break;
            }
          }
          if (swapped) break;
        }
        if (swapped) break;
      }
    }
  }
};

const tierShuffle = (sorted, n) => {
  if (n === 0) return [];
  const result = Array.from({ length: n }, () => []);
  for (let i = 0; i < sorted.length; i += n) {
    const tier = sorted.slice(i, i + n);
    for (let j = tier.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [tier[j], tier[k]] = [tier[k], tier[j]];
    }
    tier.forEach((team, idx) => result[idx].push(team));
  }
  return result;
};

const distributeTeams = async () => {
  if (pairs.value.length === 0) return;

  const sorted = [...teams.value].sort(
    (a, b) => Number(a.value) - Number(b.value)
  );

  const snapshot = pairs.value.map((p) => [...p.teams]);

  if (hasTypedPairs.value) {
    if (mciPairs.value.length > 0) {
      const byPair = tierShuffle(sorted, mciPairs.value.length);
      resolveConflictsForGroup(byPair, mciPairs.value);
      mciPairs.value.forEach((pair, i) => (pair.teams = byPair[i]));
    }
    if (taPairs.value.length > 0) {
      const byPair = tierShuffle(sorted, taPairs.value.length);
      resolveConflictsForGroup(byPair, taPairs.value);
      taPairs.value.forEach((pair, i) => (pair.teams = byPair[i]));
    }
  } else {
    const byPair = tierShuffle(sorted, pairs.value.length);
    resolveConflictsForGroup(byPair, pairs.value);
    pairs.value.forEach((p, i) => (p.teams = byPair[i]));
  }

  distributing.value = true;
  try {
    await apiRequest("pairs/distribute", {
      method: "PUT",
      body: JSON.stringify({
        distribution: pairs.value.map((p) => ({
          pairId: p.idPair,
          teamIds: p.teams.map((t) => t.idTeams),
        })),
      }),
    });
  } catch (err) {
    pairs.value.forEach((p, i) => (p.teams = snapshot[i]));
    console.error("Failed to persist distribution:", err);
  } finally {
    distributing.value = false;
  }
};
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

.header-mci {
  background-color: #BBDEFB;
}

.header-ta {
  background-color: #C8E6C9;
}

.type-toggle {
  height: 22px;
  font-size: 0.65rem;
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

.role-badge {
  font-weight: 700;
  min-width: 26px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.role-badge:hover {
  opacity: 0.8;
}
</style>
