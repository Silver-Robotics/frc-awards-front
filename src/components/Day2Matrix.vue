<template>
  <div>

    <!-- No typed pairs hint -->
    <v-alert
      v-if="!hasMci && !hasTa"
      type="info"
      variant="tonal"
      icon="mdi-information-outline"
      class="mb-4"
    >
      {{ $t('dashboard.day2.noPairs') }}
    </v-alert>

    <!-- ── MCI section ── -->
    <v-card v-if="hasMci" class="mb-6" elevation="2">
      <v-card-title
        class="d-flex align-center py-2 px-4"
        style="background: #BBDEFB; font-size: 1rem"
      >
        <v-chip color="primary" size="small" label class="mr-2">MCI</v-chip>
        {{ $t('dashboard.day2.machineAwards') }}
        <v-spacer />
        <v-progress-circular
          v-if="saving"
          indeterminate
          size="16"
          width="2"
          color="primary"
          class="ml-2"
        />
      </v-card-title>

      <v-table density="compact">
        <thead>
          <tr>
            <th style="width: 44%">{{ $t('dashboard.day2.award') }}</th>
            <th
              v-for="grp in ['A','B']"
              :key="grp"
              class="text-center group-header"
              style="width: 28%"
            >
              <div class="d-flex align-center justify-center mb-1" style="gap: 4px">
                <v-chip
                  size="x-small"
                  :color="grp === 'A' ? 'primary' : 'indigo'"
                  variant="flat"
                  label
                >
                  {{ $t('dashboard.day2.group') }} {{ grp }}
                </v-chip>
              </div>

              <!-- Judges in this group -->
              <div class="d-flex flex-wrap justify-center" style="gap: 3px; margin-bottom: 4px">
                <v-chip
                  v-for="name in judgesInGroup(grp)"
                  :key="name"
                  size="x-small"
                  :color="grp === 'A' ? 'primary' : 'indigo'"
                  variant="tonal"
                >{{ name }}</v-chip>
                <span v-if="judgesInGroup(grp).length === 0" class="text-caption text-disabled">
                  {{ $t('dashboard.day2.noJudges') }}
                </span>
              </div>

              <!-- Award + team count badges -->
              <div class="d-flex justify-center flex-wrap" style="gap: 4px">
                <v-chip size="x-small" variant="outlined" :color="grp === 'A' ? 'primary' : 'indigo'">
                  <v-icon start icon="mdi-trophy-outline" size="11" />
                  {{ mciCountForGroup(grp) }}
                </v-chip>
                <v-tooltip :text="$t('dashboard.day2.teamsTooltip')" location="bottom">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      size="x-small"
                      :color="teamCountForGroup(grp) > 0 ? 'warning' : (grp === 'A' ? 'primary' : 'indigo')"
                      :variant="teamCountForGroup(grp) > 0 ? 'flat' : 'outlined'"
                    >
                      <v-icon start icon="mdi-robot" size="11" />
                      <strong>{{ teamCountForGroup(grp) }}</strong>
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="award in MCI_AWARDS" :key="award">
            <td class="award-name">{{ award }}</td>
            <td
              v-for="grp in ['A','B']"
              :key="grp"
              class="text-center py-1"
            >
              <v-btn
                :variant="getGroup('mci', award) === grp ? 'flat' : 'text'"
                :color="grp === 'A' ? 'primary' : 'indigo'"
                size="small"
                density="compact"
                :icon="getGroup('mci', award) === grp
                  ? 'mdi-radiobox-marked'
                  : 'mdi-radiobox-blank'"
                @click="setGroup('mci', award, grp)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- ── TA section ── -->
    <v-card v-if="hasTa" elevation="2">
      <v-card-title
        class="d-flex align-center py-2 px-4"
        style="background: #C8E6C9; font-size: 1rem"
      >
        <v-chip color="success" size="small" label class="mr-2">TA</v-chip>
        {{ $t('dashboard.day2.teamAwards') }}
        <v-spacer />
        <v-progress-circular
          v-if="saving"
          indeterminate
          size="16"
          width="2"
          color="success"
          class="ml-2"
        />
      </v-card-title>

      <v-table density="compact">
        <thead>
          <tr>
            <th style="width: 44%">{{ $t('dashboard.day2.award') }}</th>
            <th
              v-for="grp in ['C','D']"
              :key="grp"
              class="text-center group-header"
              style="width: 28%"
            >
              <div class="d-flex align-center justify-center mb-1" style="gap: 4px">
                <v-chip
                  size="x-small"
                  :color="grp === 'C' ? 'success' : 'teal'"
                  variant="flat"
                  label
                >
                  {{ $t('dashboard.day2.group') }} {{ grp }}
                </v-chip>
              </div>

              <div class="d-flex flex-wrap justify-center" style="gap: 3px; margin-bottom: 4px">
                <v-chip
                  v-for="name in judgesInGroup(grp)"
                  :key="name"
                  size="x-small"
                  :color="grp === 'C' ? 'success' : 'teal'"
                  variant="tonal"
                >{{ name }}</v-chip>
                <span v-if="judgesInGroup(grp).length === 0" class="text-caption text-disabled">
                  {{ $t('dashboard.day2.noJudges') }}
                </span>
              </div>

              <!-- Award + team count badges -->
              <div class="d-flex justify-center flex-wrap" style="gap: 4px">
                <v-chip size="x-small" variant="outlined" :color="grp === 'C' ? 'success' : 'teal'">
                  <v-icon start icon="mdi-trophy-outline" size="11" />
                  {{ taCountForGroup(grp) }}
                </v-chip>
                <v-tooltip :text="$t('dashboard.day2.teamsTooltip')" location="bottom">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      size="x-small"
                      :color="teamCountForGroup(grp) > 0 ? 'warning' : (grp === 'C' ? 'success' : 'teal')"
                      :variant="teamCountForGroup(grp) > 0 ? 'flat' : 'outlined'"
                    >
                      <v-icon start icon="mdi-robot" size="11" />
                      <strong>{{ teamCountForGroup(grp) }}</strong>
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="award in TA_AWARDS" :key="award">
            <td class="award-name">{{ award }}</td>
            <td
              v-for="grp in ['C','D']"
              :key="grp"
              class="text-center py-1"
            >
              <v-btn
                :variant="getGroup('ta', award) === grp ? 'flat' : 'text'"
                :color="grp === 'C' ? 'success' : 'teal'"
                size="small"
                density="compact"
                :icon="getGroup('ta', award) === grp
                  ? 'mdi-radiobox-marked'
                  : 'mdi-radiobox-blank'"
                @click="setGroup('ta', award, grp)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAwardGroups } from "@/composables/useAwardGroups";
import { useAwards } from "@/composables/useAwards";
import { MCI_AWARDS, TA_AWARDS } from "@/constants/awards";
import { usePairs } from "@/composables/usePairs";

const { pairs }                      = usePairs();
const { getGroup, setGroup, saving } = useAwardGroups();
const { groupedAwards }              = useAwards();

// ── Which sections to show ────────────────────────────────────────────────────
const hasMci = computed(() => pairs.value.some((p) => p.type === "mci"));
const hasTa  = computed(() => pairs.value.some((p) => p.type === "ta"));

// ── Judges per Day-2 group ─────────────────────────────────────────────────────
const judgesInGroup = (grp) => {
  const type = ['A','B'].includes(grp) ? 'mci' : 'ta';
  return pairs.value
    .filter((p) => p.type === type)
    .flatMap((p) => p.judges)
    .filter((j) => j.role === grp)
    .map((j) => j.judgeName);
};

// ── Unique team counts per group ──────────────────────────────────────────────
// Key metric for schedule planning: how many distinct teams each group needs to
// interview.  We count ALL nominations (including teams the JA removed from
// active consideration) because at planning time you want the full workload
// picture — teams can still be re-added to consideration before Day 2 starts.
// Deduplication by Teams_idTeams ensures the same team nominated by multiple
// pairs only counts once.
const uniqueTeamCountForGroup = computed(() => {
  const counts = {};
  // Flatten all rows, no nominated filter
  const allRows = groupedAwards.value.flatMap((a) => a.teams);
  // Deduplicate per group: track (group, teamId) pairs
  const seen = new Set();
  for (const item of allRows) {
    const pairType = MCI_AWARDS.includes(item.awardName) ? 'mci' : 'ta';
    const grp = getGroup(pairType, item.awardName);
    if (!grp) continue;
    const key = `${grp}:${item.Teams_idTeams}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts[grp] = (counts[grp] ?? 0) + 1;
  }
  return counts;
});

const teamCountForGroup = (grp) => uniqueTeamCountForGroup.value[grp] ?? 0;

// ── Award counts per group ────────────────────────────────────────────────────
const mciCountForGroup = (grp) =>
  MCI_AWARDS.filter((a) => getGroup("mci", a) === grp).length;

const taCountForGroup = (grp) =>
  TA_AWARDS.filter((a) => getGroup("ta", a) === grp).length;
</script>

<style scoped>
.group-header {
  vertical-align: top;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

.award-name {
  font-size: 0.85rem;
}
</style>
