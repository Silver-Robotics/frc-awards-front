<template>
  <v-container fluid>
    <!-- ── Admin controls (admin-only) ──────────────────────────────────── -->
    <div v-if="isAdmin && !loading" class="d-flex justify-end mb-3" style="gap:8px">
      <v-btn
        size="small"
        density="comfortable"
        :variant="visibilityOn ? 'tonal' : 'outlined'"
        :color="visibilityOn ? 'primary' : 'grey'"
        :prepend-icon="visibilityOn ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
        @click="toggleVisibility"
      >{{ $t(visibilityOn ? 'awards.admin.visibilityOn' : 'awards.admin.visibilityOff') }}</v-btn>

      <v-btn
        size="small"
        density="comfortable"
        :variant="conflictOn ? 'tonal' : 'outlined'"
        :color="conflictOn ? 'warning' : 'grey'"
        prepend-icon="mdi-alert-circle-outline"
        @click="toggleConflict"
      >{{ $t(conflictOn ? 'awards.admin.conflictsOn' : 'awards.admin.conflictsOff') }}</v-btn>
    </div>

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

            <!-- Blur wrapper — nominations hidden when visibility is OFF -->
            <div :class="{ 'nominations-blurred': !visibilityOn }">

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
                    <v-list-item-subtitle
                      v-if="conflictOn && conflictsFor(team.Teams_idTeams).length"
                      class="conflict-warning"
                    >
                      <v-icon icon="mdi-alert-outline" size="12" class="mr-1" />{{ conflictsFor(team.Teams_idTeams).join(' · ') }}
                    </v-list-item-subtitle>
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
                  <v-list-item-subtitle
                    v-if="conflictOn && conflictsFor(team.Teams_idTeams).length"
                    class="conflict-warning"
                  >
                    <v-icon icon="mdi-alert-outline" size="12" class="mr-1" />{{ conflictsFor(team.Teams_idTeams).join(' · ') }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

            </div>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <!-- ── Award info dialog ─────────────────────────────────────────────── -->
    <v-dialog v-model="infoDialog" max-width="500px" scrollable>
      <v-card v-if="infoData" rounded="lg" class="info-dialog-card">

        <!-- Yellow header bar matching the card-title style -->
        <div class="info-dialog-header">
          <div class="d-flex align-center justify-space-between">
            <div style="flex:1; min-width:0">
              <div class="d-flex align-center flex-wrap" style="gap:8px">
                <span class="text-h6 font-weight-bold info-award-name">{{ infoAward?.name }}</span>
                <v-chip
                  size="x-small"
                  :color="infoData.category === 'MCI' ? '#007FBC' : '#00AA46'"
                  variant="flat"
                  label
                  class="font-weight-bold"
                  style="color:#fff; letter-spacing:0.05em"
                >{{ infoData.category }}</v-chip>
              </div>
              <div v-if="infoData.sponsor" class="text-caption mt-1 d-flex align-center" style="gap:4px; color:rgba(0,0,0,0.6)">
                <v-icon icon="mdi-handshake-outline" size="13" />
                {{ infoData.sponsor }}
              </div>
              <div v-if="infoData.note" class="text-caption mt-1 d-flex align-center font-weight-medium" style="gap:4px; color:#7a5700">
                <v-icon icon="mdi-star-circle-outline" size="13" />
                {{ infoData.note }}
              </div>
            </div>
            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              density="compact"
              @click="infoDialog = false"
              style="flex-shrink:0; margin-left:8px"
            />
          </div>
        </div>

        <v-card-text class="pt-4 pb-2">
          <!-- Description -->
          <p class="text-body-2 mb-4" style="line-height:1.65; color:rgba(0,0,0,0.82)">
            {{ infoDescription }}
          </p>

          <!-- Criteria section -->
          <div class="criteria-label mb-2">
            <v-icon icon="mdi-format-list-checks" size="14" class="mr-1" />
            {{ $t('awards.infoDialog.keyCriteria') }}
          </div>
          <div class="criteria-list">
            <div
              v-for="(criterion, i) in infoCriteria"
              :key="i"
              class="criteria-row"
            >
              <v-icon icon="mdi-check-circle-outline" size="15" color="#007FBC" class="criteria-check" />
              <span class="text-body-2 criteria-text">{{ criterion }}</span>
            </div>
          </div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="px-4 py-2">
          <span class="text-caption text-disabled">{{ $t('awards.infoDialog.source') }}</span>
          <v-spacer />
          <v-btn variant="flat" color="#007FBC" size="small" style="color:#fff" @click="infoDialog = false">
            {{ $t('awards.infoDialog.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Team detail / edit dialog -->
    <v-dialog v-model="dialog" max-width="480px" @after-leave="resetEdit">
      <v-card v-if="currentTeam">

        <!-- ── View mode ─────────────────────────────────────────────────── -->
        <template v-if="!editMode">
          <v-card-title class="headline">{{ currentAward?.name }}</v-card-title>
          <v-card-subtitle>{{ `${currentTeam.teamName} - ${currentTeam.teamNumber}` }}</v-card-subtitle>

          <v-card-text>
            <b>{{ $t('awards.dialog.nominatedBy') }}</b> {{ currentTeam.judge }}<br />
            <b>{{ $t('awards.dialog.description') }}</b> {{ currentTeam.motive }}
          </v-card-text>

          <v-img
            v-if="currentTeam.imagePath"
            :src="currentTeam.imagePath"
            max-height="220"
            contain
            class="mb-3"
          />

          <v-card-actions class="flex-column">
            <v-btn
              v-if="!isFTC"
              color="grey-darken-1"
              variant="tonal"
              @click="toggleNomination(currentTeam, currentAward.name)"
            >
              {{ currentTeam.nominated ? $t('awards.dialog.removeConsideration') : $t('awards.dialog.consider') }}
            </v-btn>

            <v-btn
              v-if="isFTC"
              color="grey-darken-1"
              variant="tonal"
              @click="toggleAward(currentTeam, currentAward.name)"
            >
              {{ currentTeam.awarded ? $t('awards.dialog.removeAward') : $t('awards.dialog.giveAward') }}
            </v-btn>

            <v-btn color="primary" variant="tonal" @click="startEdit">
              <v-icon start icon="mdi-pencil" />
              {{ $t('awards.dialog.edit') }}
            </v-btn>

            <v-btn color="error" variant="tonal" @click="deleteAward(currentTeam, currentAward.name)">
              <v-icon start icon="mdi-trash-can-outline" />
              {{ $t('awards.dialog.delete') }}
            </v-btn>
          </v-card-actions>
        </template>

        <!-- ── Edit mode ─────────────────────────────────────────────────── -->
        <template v-else>
          <v-card-title class="d-flex align-center" style="gap:8px">
            <v-icon icon="mdi-pencil" size="20" color="primary" />
            {{ $t('awards.dialog.editTitle') }}
          </v-card-title>
          <v-card-subtitle>{{ `${currentTeam.teamName} - ${currentTeam.teamNumber}` }}</v-card-subtitle>

          <v-card-text class="pt-4">
            <v-select
              v-model="editForm.awardName"
              :items="availableAwards"
              :label="$t('nominateTeam.fields.selectAward')"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-textarea
              v-model="editForm.motive"
              :label="$t('nominateTeam.fields.justification')"
              variant="outlined"
              rows="4"
              auto-grow
            />
          </v-card-text>

          <v-card-actions class="justify-end px-4 pb-4" style="gap:8px">
            <v-btn variant="text" @click="cancelEdit">
              {{ $t('awards.dialog.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :loading="editSaving"
              @click="saveEdit"
            >
              {{ $t('awards.dialog.save') }}
            </v-btn>
          </v-card-actions>
        </template>

      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth0 } from "@auth0/auth0-vue";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";
import { useAwards } from "@/composables/useAwards";
import { useJudges } from "@/composables/useJudges";
import { MCI_AWARDS, TA_AWARDS } from "@/constants/awards";
import { AWARD_INFO } from "@/constants/awardDescriptions";
import draggable from "vuedraggable";

const { apiRequest } = useApi();
const eventStore = useEventStore();
const { user } = useAuth0();
const { t, tm, te } = useI18n();

const isFTC = computed(() => eventStore.selectedEvent?.program === "ftc");
const isAdmin = computed(() =>
  (user.value?.["https://myapp.example.com/roles"] ?? []).includes("admin")
);

// ── Admin toggle state (persisted across page refreshes via sessionStorage) ──
const SESS_VIS  = "awards_visibility";
const SESS_CONF = "awards_conflicts";

const visibilityOn = ref(sessionStorage.getItem(SESS_VIS) !== "false");
const conflictOn   = ref(sessionStorage.getItem(SESS_CONF) === "true");

const toggleVisibility = () => {
  visibilityOn.value = !visibilityOn.value;
  sessionStorage.setItem(SESS_VIS, String(visibilityOn.value));
};
const toggleConflict = () => {
  conflictOn.value = !conflictOn.value;
  sessionStorage.setItem(SESS_CONF, String(conflictOn.value));
};

// ── Conflict-of-interest lookup ───────────────────────────────────────────────
const { judges } = useJudges();

// Map: idTeams → [judgeName, ...] — rebuilt whenever judges data changes
const conflictMap = computed(() => {
  const map = new Map();
  for (const judge of judges.value) {
    for (const c of (judge.conflicts ?? [])) {
      if (!map.has(c.idTeams)) map.set(c.idTeams, []);
      map.get(c.idTeams).push(judge.judgeName);
    }
  }
  return map;
});

const conflictsFor = (idTeams) => conflictMap.value.get(idTeams) ?? [];

const dialog    = ref(false);
const editMode  = ref(false);
const editSaving = ref(false);

const currentTeam  = ref(null);
const currentAward = ref(null);

// ── Award info dialog ─────────────────────────────────────────────────────────
const infoDialog = ref(false);
const infoAward  = ref(null);
const infoData   = computed(() =>
  infoAward.value?.name ? AWARD_INFO[infoAward.value.name] ?? null : null
);

const infoSlug = computed(() =>
  infoAward.value?.name
    ? infoAward.value.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/, "")
    : null
);
const infoDescription = computed(() => {
  const key = infoSlug.value ? `awardDescriptions.${infoSlug.value}.description` : null;
  return key && te(key) ? t(key) : (infoData.value?.description ?? "");
});
const infoCriteria = computed(() => {
  const key = infoSlug.value ? `awardDescriptions.${infoSlug.value}.criteria` : null;
  return key && te(key) ? tm(key) : (infoData.value?.criteria ?? []);
});

const editForm = reactive({ awardName: "", motive: "" });

const { groupedAwards, loading, refresh: reloadAwards } = useAwards();

// ── Award list for the edit selector ─────────────────────────────────────────
const FTC_AWARDS = [
  'Think Award', 'Connect Award', 'Innovate Award',
  'Design Award', 'Control Award', 'Reach Award', 'Sustain Award',
];

const availableAwards = computed(() =>
  isFTC.value ? FTC_AWARDS : [...MCI_AWARDS, ...TA_AWARDS]
);

// Derive category from the selected award name
const categoryForAward = (name) => {
  if (isFTC.value) {
    const ftcMci = ['Think Award', 'Innovate Award', 'Design Award', 'Control Award'];
    return ftcMci.includes(name) ? 'MCI' : 'AE';
  }
  return MCI_AWARDS.includes(name) ? 'MCI' : 'AE';
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const positionClass = (team) => (team.premiado ? "winner" : "");

const displayAward = (award) => {
  infoAward.value  = award;
  infoDialog.value = true;
};

const openDialog = (team, award) => {
  currentTeam.value  = team;
  currentAward.value = award;
  dialog.value = !!team.motive;
};

// ── Edit helpers ──────────────────────────────────────────────────────────────
const startEdit = () => {
  editForm.awardName = currentTeam.value.awardName;
  editForm.motive    = currentTeam.value.motive ?? "";
  editMode.value     = true;
};

const cancelEdit = () => {
  editMode.value = false;
};

const resetEdit = () => {
  editMode.value = false;
};

const saveEdit = async () => {
  editSaving.value = true;
  try {
    await apiRequest(`awards/${currentTeam.value.idAwards}`, {
      method: "PATCH",
      body: JSON.stringify({
        motive:    editForm.motive,
        awardName: editForm.awardName,
        category:  categoryForAward(editForm.awardName),
      }),
    });
    dialog.value   = false;
    editMode.value = false;
    await reloadAwards();
  } finally {
    editSaving.value = false;
  }
};

// ── Existing actions ──────────────────────────────────────────────────────────
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

/* ── Admin visibility toggle ─────────────────────────────────────────────── */
.nominations-blurred {
  filter: blur(7px);
  pointer-events: none;
  user-select: none;
  transition: filter 0.3s ease;
}

/* ── Conflict-of-interest indicator ─────────────────────────────────────── */
.conflict-warning {
  font-size: 0.68rem !important;
  color: #E65100 !important;
  display: flex;
  align-items: center;
  opacity: 0.9;
  margin-top: 1px;
}

/* ── Info dialog ─────────────────────────────────────────────────────────── */
.info-dialog-card {
  overflow: hidden;
}

.info-dialog-header {
  background: #F7E326;
  padding: 16px 20px 14px;
}

.info-award-name {
  font-size: 1.05rem !important;
  line-height: 1.3;
  color: rgba(0, 0, 0, 0.87);
}

.criteria-label {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #007FBC;
}

.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.criteria-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.criteria-check {
  flex-shrink: 0;
  margin-top: 2px;
}

.criteria-text {
  line-height: 1.45;
  color: rgba(0, 0, 0, 0.78);
}
</style>
