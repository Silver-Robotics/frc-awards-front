<template>
  <v-container>

    <div class="d-flex align-center mb-6" style="gap: 10px">
      <v-icon icon="mdi-calendar-clock" color="#007FBC" size="28" />
      <h1 class="text-h5 font-weight-bold">{{ $t('day2Briefing.title') }}</h1>
      <v-spacer />
      <v-btn
        prepend-icon="mdi-refresh"
        variant="text"
        color="#007FBC"
        size="small"
        :loading="loading"
        @click="reload"
      >
        {{ $t('day2Briefing.reload') }}
      </v-btn>
      <v-btn
        v-if="groups.length > 0"
        prepend-icon="mdi-file-pdf-box"
        variant="tonal"
        color="#007FBC"
        size="small"
        :loading="generatingPdf"
        @click="downloadPdf"
      >
        {{ $t('day2Briefing.downloadPdf') }}
      </v-btn>
    </div>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col v-for="n in 2" :key="n" cols="12" md="6">
        <v-skeleton-loader type="card" elevation="1" />
      </v-col>
    </v-row>

    <!-- No pairs configured -->
    <v-alert
      v-else-if="groups.length === 0"
      type="info"
      variant="tonal"
      icon="mdi-information-outline"
    >
      {{ $t('day2Briefing.notConfigured') }}
    </v-alert>

    <!-- Groups -->
    <div v-else>
      <v-row>
        <v-col
          v-for="group in groups"
          :key="group.letter"
          cols="12"
          md="6"
        >
          <v-card elevation="2" class="mb-4 h-100">

            <!-- Group header -->
            <v-card-title
              class="d-flex align-center flex-wrap py-3 px-4"
              :class="groupHeaderClass(group.letter)"
              style="gap: 8px"
            >
              <v-chip
                :color="groupChipColor(group.letter)"
                size="small"
                label
                variant="flat"
              >
                {{ $t('day2Briefing.group') }} {{ group.letter }}
              </v-chip>

              <span class="text-subtitle-1 font-weight-bold">
                {{ group.pairType === 'mci'
                    ? $t('day2Briefing.machineAwards')
                    : $t('day2Briefing.teamAwards') }}
              </span>

              <v-spacer />

              <!-- Award + team count summary chips -->
              <div class="d-flex" style="gap: 6px">
                <v-tooltip :text="$t('day2Briefing.awardsTooltip')" location="bottom">
                  <template #activator="{ props }">
                    <v-chip v-bind="props" size="small" variant="outlined" color="white">
                      <v-icon start icon="mdi-trophy-outline" size="14" />
                      {{ group.awardData.length }}
                    </v-chip>
                  </template>
                </v-tooltip>

                <v-tooltip :text="$t('day2Briefing.teamsTooltip')" location="bottom">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      size="small"
                      :color="group.uniqueTeamCount > 0 ? 'warning' : 'white'"
                      :variant="group.uniqueTeamCount > 0 ? 'flat' : 'outlined'"
                    >
                      <v-icon start icon="mdi-robot" size="14" />
                      <strong>{{ group.uniqueTeamCount }}</strong>
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
            </v-card-title>

            <v-divider />

            <v-card-text class="pt-3">

              <!-- Judges in this group -->
              <div class="mb-4">
                <div class="section-label mb-2">
                  <v-icon icon="mdi-account-supervisor" size="14" class="mr-1" />
                  {{ $t('day2Briefing.judges') }}
                </div>
                <div class="d-flex flex-wrap" style="gap: 6px">
                  <v-chip
                    v-for="judge in group.judges"
                    :key="judge.name"
                    size="small"
                    :color="groupChipColor(group.letter)"
                    variant="tonal"
                    :prepend-icon="'mdi-account'"
                  >
                    {{ judge.name }}
                    <span class="ml-1 text-caption">({{ judge.pair }})</span>
                  </v-chip>
                  <span v-if="group.judges.length === 0" class="text-caption text-disabled">
                    {{ $t('day2Briefing.noJudgesAssigned') }}
                  </span>
                </div>
              </div>

              <!-- Awards + nominated teams -->
              <div
                v-for="award in group.awardData"
                :key="award.name"
                class="award-block mb-4"
              >
                <div class="d-flex align-center mb-1">
                  <span class="font-weight-semibold award-name">{{ award.name }}</span>
                </div>

                <div v-if="award.teams.length > 0" class="pl-1">
                  <div
                    v-for="team in award.teams"
                    :key="team.Teams_idTeams"
                    class="team-entry"
                    :class="{ 'team-multi-award': group.teamAwardCounts[team.Teams_idTeams] > 1 }"
                  >
                    <!-- Main row -->
                    <div
                      class="team-row"
                      :class="{ 'team-row-clickable': team.nominations.some(n => n.motive) }"
                      @click="team.nominations.some(n => n.motive) && toggleExpand(`${award.name}:${team.Teams_idTeams}`)"
                    >
                      <v-icon icon="mdi-pound" size="13" class="mr-1 text-medium-emphasis" />
                      <strong class="team-number">{{ team.teamNumber }}</strong>
                      <span class="text-medium-emphasis ml-1 team-name-text">{{ team.teamName }}</span>
                      <div class="ml-auto d-flex align-center" style="gap: 4px">
                        <v-chip
                          v-if="group.teamAwardCounts[team.Teams_idTeams] > 1"
                          size="x-small"
                          color="warning"
                          variant="flat"
                        >
                          <v-icon start icon="mdi-link-variant" size="11" />
                          {{ group.teamAwardCounts[team.Teams_idTeams] }} {{ $t('day2Briefing.awards') }}
                        </v-chip>
                        <v-icon
                          v-if="team.nominations.some(n => n.motive)"
                          icon="mdi-chevron-down"
                          size="15"
                          class="expand-chevron"
                          :style="{ transform: isExpanded(`${award.name}:${team.Teams_idTeams}`) ? 'rotate(180deg)' : 'rotate(0deg)' }"
                        />
                      </div>
                    </div>

                    <!-- Nomination details (expandable) -->
                    <v-expand-transition>
                      <div
                        v-if="isExpanded(`${award.name}:${team.Teams_idTeams}`)"
                        class="team-motives"
                      >
                        <div
                          v-for="(nom, idx) in team.nominations.filter(n => n.motive)"
                          :key="idx"
                          class="nomination-item"
                        >
                          <span class="nomination-text">{{ nom.motive }}</span>
                          <span v-if="nom.judge" class="nomination-judge"> — {{ nom.judge }}</span>
                        </div>
                      </div>
                    </v-expand-transition>
                  </div>
                </div>

                <div v-else class="text-caption text-disabled pl-1">
                  {{ $t('day2Briefing.noNominations') }}
                </div>
              </div>

              <!-- No awards assigned to this group -->
              <div v-if="group.awardData.length === 0" class="text-caption text-disabled">
                {{ $t('day2Briefing.noAwardsAssigned') }}
              </div>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

  </v-container>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePairs } from "@/composables/usePairs";
import { useAwardGroups } from "@/composables/useAwardGroups";
import { useAwards } from "@/composables/useAwards";
import { useBriefingPdf } from "@/composables/useBriefingPdf";
import { MCI_AWARDS, TA_AWARDS } from "@/constants/awards";

const { t } = useI18n();
const { pairs, loading: pairsLoading, refresh: reloadPairs } = usePairs();
const { getGroup, loading: groupsLoading, refresh: reloadGroups } = useAwardGroups();
const { groupedAwards, loading: awardsLoading, refresh: reloadAwards } = useAwards();
const { generate: generatePdf } = useBriefingPdf();

const loading = computed(
  () => pairsLoading.value || groupsLoading.value || awardsLoading.value
);

const reload = () => {
  reloadPairs();
  reloadGroups();
  reloadAwards();
};

// ── PDF download ──────────────────────────────────────────────────────────────
const generatingPdf = ref(false);

const downloadPdf = async () => {
  generatingPdf.value = true;
  try {
    // Small tick so the loading spinner renders before the sync PDF work blocks the thread
    await new Promise((r) => setTimeout(r, 30));
    generatePdf(groups.value);
  } finally {
    generatingPdf.value = false;
  }
};

// ── Helper: unique teams for an award (one entry per team, all nominations) ───
// The `nominated` flag is irrelevant here — the Briefing shows every team any
// judge submitted.  Removing a team from Day-2 consideration means deleting the
// nomination entirely, not flipping the nominated flag.
// Deduplication by Teams_idTeams handles the case where multiple pairs nominated
// the same team for the same award.
const teamsForAward = (awardName) => {
  const found = groupedAwards.value.find((g) => g.name === awardName);
  const allRows = found?.teams ?? [];
  // Deduplicate by team, but collect every nomination so judges see all motives
  const byId = new Map();
  for (const row of allRows) {
    if (!byId.has(row.Teams_idTeams)) {
      byId.set(row.Teams_idTeams, {
        ...row,
        nominations: [{ motive: row.motive, judge: row.judge }],
      });
    } else {
      byId.get(row.Teams_idTeams).nominations.push({ motive: row.motive, judge: row.judge });
    }
  }
  return Array.from(byId.values());
};

// ── Expand/collapse nomination details ───────────────────────────────────────
// Key format: "<awardName>:<Teams_idTeams>"
const expanded = reactive(new Set());
const toggleExpand = (key) => {
  if (expanded.has(key)) expanded.delete(key);
  else expanded.add(key);
};
const isExpanded = (key) => expanded.has(key);

// ── Color helpers ─────────────────────────────────────────────────────────────
const groupChipColor = (letter) => {
  if (letter === 'A') return 'primary';
  if (letter === 'B') return 'indigo';
  if (letter === 'C') return 'success';
  if (letter === 'D') return 'teal';
  return 'grey';
};

const groupHeaderClass = (letter) => {
  if (letter === 'A' || letter === 'B') return 'header-mci';
  if (letter === 'C' || letter === 'D') return 'header-ta';
  return '';
};

// ── Build group data ──────────────────────────────────────────────────────────
const buildGroup = (letter, pairType) => {
  const typedPairs = pairs.value.filter((p) => p.type === pairType);
  if (typedPairs.length === 0) return null;

  // Judges whose role matches this group letter, with their pair number
  const judges = typedPairs.flatMap((p, pIdx) =>
    p.judges
      .filter((j) => j.role === letter)
      .map((j) => ({
        name: j.judgeName,
        pair: `${pairType.toUpperCase()} ${pIdx + 1}`,
      }))
  );

  // Awards assigned to this group with their unique nominated teams
  const typeAwards = pairType === 'mci' ? MCI_AWARDS : TA_AWARDS;
  const awardData = typeAwards
    .filter((a) => getGroup(pairType, a) === letter)
    .map((name) => ({ name, teams: teamsForAward(name) }));

  // Unique team count across all awards in this group (all nominations, deduped)
  const uniqueTeamIds = new Set(
    awardData.flatMap((a) => a.teams.map((t) => t.Teams_idTeams))
  );

  // Teams nominated for more than one award within this group need only one visit
  const teamAwardCounts = {};
  for (const a of awardData) {
    for (const t of a.teams) {
      teamAwardCounts[t.Teams_idTeams] = (teamAwardCounts[t.Teams_idTeams] ?? 0) + 1;
    }
  }

  return {
    letter,
    pairType,
    judges,
    awardData,
    uniqueTeamCount: uniqueTeamIds.size,
    teamAwardCounts,
  };
};

const groups = computed(() => {
  const candidates = [
    buildGroup('A', 'mci'),
    buildGroup('B', 'mci'),
    buildGroup('C', 'ta'),
    buildGroup('D', 'ta'),
  ];
  return candidates.filter(Boolean);
});
</script>

<style scoped>
.header-mci { background-color: #BBDEFB; }
.header-ta  { background-color: #C8E6C9; }

.section-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #607d8b;
  display: flex;
  align-items: center;
}

.award-block {
  border-left: 3px solid #e0e0e0;
  padding-left: 10px;
}

.award-name {
  font-size: 0.9rem;
}

.team-entry {
  border-radius: 4px;
  margin-bottom: 1px;
}

.team-multi-award {
  background-color: rgba(255, 179, 0, 0.15);
}

.team-row {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  font-size: 0.83rem;
  border-radius: 4px;
}

.team-row-clickable {
  cursor: pointer;
}

.team-row-clickable:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.expand-chevron {
  transition: transform 0.22s ease;
  opacity: 0.4;
  flex-shrink: 0;
}

.team-motives {
  padding: 4px 8px 6px 26px;
  margin: 0 4px 3px 16px;
  border-left: 2px solid rgba(0, 0, 0, 0.08);
}

.nomination-item {
  line-height: 1.45;
  margin-bottom: 2px;
}

.nomination-text {
  font-style: italic;
  font-size: 0.78rem;
  color: rgba(0, 0, 0, 0.6);
}

.nomination-judge {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.38);
  font-weight: 500;
}

.team-number {
  font-size: 0.83rem;
  min-width: 38px;
}

.team-name-text {
  font-size: 0.83rem;
}

.font-weight-semibold { font-weight: 600; }
</style>
