<template>
  <v-container fluid>

    <CardTitlePage
      :titulo="$t('scripts.title')"
      icon="mdi-script-text-outline"
      :body="$t('scripts.description')"
    />

    <!-- Summary chips -->
    <div v-if="!loading" class="d-flex flex-wrap mb-5" style="gap:8px">
      <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-trophy-outline">
        {{ winners.length }} {{ $t('scripts.winnersCount') }}
      </v-chip>
      <v-chip size="small" color="warning" variant="tonal" prepend-icon="mdi-clock-outline">
        {{ pendingCount }} {{ $t('scripts.pendingCount') }}
      </v-chip>
      <v-chip size="small" color="success" variant="tonal" prepend-icon="mdi-check-circle-outline">
        {{ acceptedCount }} {{ $t('scripts.acceptedCount') }}
      </v-chip>
    </div>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col v-for="n in 4" :key="n" cols="12" md="6">
        <v-skeleton-loader type="card" elevation="1" />
      </v-col>
    </v-row>

    <template v-else>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- IMPACT AWARD — always visible, outside the nominations system     -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <v-card elevation="3" class="script-card mb-6 impact-card" :class="cardBorderClass('Impact Award')">

        <!-- Header -->
        <v-card-title class="pb-1 pt-3 px-4 d-flex align-center" style="gap:8px; flex-wrap:wrap">
          <v-chip size="x-small" color="#B8860B" variant="flat" label style="color:#fff">
            {{ $t('scripts.impact.badge') }}
          </v-chip>
          <v-icon icon="mdi-crown" color="#B8860B" size="18" />
          <span class="text-subtitle-1 font-weight-bold">{{ $t('scripts.impact.name') }}</span>
        </v-card-title>

        <!-- Winner subtitle (once declared) -->
        <template v-if="impactScript">
          <!-- Editing winner -->
          <div v-if="editingImpactWinner" class="px-4 pb-3 pt-1 d-flex align-center flex-wrap" style="gap:8px">
            <v-autocomplete
              v-model="impactWinnerTeam"
              :items="teams"
              :item-title="t => `#${t.value} — ${t.text}`"
              :item-value="t => t"
              :loading="teamsLoading"
              :label="$t('scripts.impact.selectTeam')"
              variant="outlined"
              density="compact"
              clearable
              return-object
              hide-details
              style="min-width:220px; flex:1"
            />
            <v-btn
              size="small" variant="flat" color="primary"
              :loading="savingImpactWinner"
              :disabled="!impactWinnerTeam"
              @click="handleImpactUpdateWinner"
            >{{ $t('scripts.impact.confirmWinner') }}</v-btn>
            <v-btn
              size="small" variant="text"
              @click="editingImpactWinner = false; impactWinnerTeam = null"
            >{{ $t('scripts.cancel') }}</v-btn>
          </div>
          <!-- Static display -->
          <v-card-subtitle v-else class="px-4 pb-2 d-flex align-center" style="gap:6px">
            <strong>#{{ impactScript.teamNumber }}</strong>
            <span class="text-medium-emphasis">{{ impactScript.teamName }}</span>
            <v-btn
              v-if="isAdmin"
              size="x-small" variant="text" icon="mdi-pencil-outline"
              density="compact"
              style="margin-left:2px"
              @click="editingImpactWinner = true"
            />
          </v-card-subtitle>
        </template>

        <v-divider />

        <v-card-text class="px-4 pt-3 pb-4">

          <!-- ── No winner declared yet ──────────────────────────────── -->
          <template v-if="!impactScript">

            <!-- Non-admin: locked -->
            <div v-if="!isAdmin" class="d-flex align-center justify-center py-5" style="gap:8px">
              <v-icon icon="mdi-lock-outline" color="#B8860B" size="20" />
              <span class="text-medium-emphasis text-body-2">{{ $t('scripts.impact.notAnnounced') }}</span>
            </div>

            <!-- Admin: declare winner form -->
            <div v-else>
              <p class="text-caption text-medium-emphasis mb-3">{{ $t('scripts.impact.declareHint') }}</p>
              <v-row dense>
                <v-col cols="12">
                  <v-autocomplete
                    v-model="impactForm.selectedTeam"
                    :items="teams"
                    :item-title="t => `#${t.value} — ${t.text}`"
                    :item-value="t => t"
                    :label="$t('scripts.impact.selectTeam')"
                    :loading="teamsLoading"
                    variant="outlined"
                    density="compact"
                    clearable
                    return-object
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="impactForm.scriptText"
                    :label="$t('scripts.impact.scriptOptional')"
                    variant="outlined"
                    density="comfortable"
                    rows="4"
                    auto-grow
                    class="script-textarea"
                  />
                </v-col>
              </v-row>
              <v-btn
                color="#B8860B"
                variant="flat"
                size="small"
                prepend-icon="mdi-crown"
                style="color:#fff"
                :loading="savingImpact"
                :disabled="!impactForm.selectedTeam"
                @click="handleImpactDeclare"
              >
                {{ $t('scripts.impact.declareWinner') }}
              </v-btn>
            </div>
          </template>

          <!-- ── Winner declared, no script submitted yet ───────────── -->
          <template v-else-if="!impactScript.scriptText && !isEditing('Impact Award')">
            <div class="d-flex align-center justify-center py-4" style="gap:8px">
              <v-icon icon="mdi-file-edit-outline" color="#B8860B" size="18" />
              <span class="text-body-2 text-medium-emphasis">{{ $t('scripts.impact.noScriptYet') }}</span>
            </div>
            <div class="d-flex justify-center">
              <v-btn
                prepend-icon="mdi-pencil-plus-outline"
                variant="tonal"
                color="#B8860B"
                size="small"
                @click="openEditor('Impact Award')"
              >
                {{ $t('scripts.writeScript') }}
              </v-btn>
            </div>
          </template>

          <!-- ── Inline editor ──────────────────────────────────────── -->
          <template v-else-if="isEditing('Impact Award')">
            <v-textarea
              v-model="editingDraft['Impact Award']"
              :placeholder="$t('scripts.placeholder')"
              rows="6"
              auto-grow
              variant="outlined"
              density="comfortable"
              class="script-textarea mb-3"
            />
            <div class="d-flex" style="gap:8px">
              <v-btn
                color="primary"
                size="small"
                variant="flat"
                :loading="saving['Impact Award']"
                :disabled="!editingDraft['Impact Award']?.trim()"
                @click="handleImpactSubmitScript"
              >
                {{ $t('scripts.submit') }}
              </v-btn>
              <v-btn size="small" variant="text" @click="closeEditor('Impact Award')">
                {{ $t('scripts.cancel') }}
              </v-btn>
            </div>
          </template>

          <!-- ── Script display ─────────────────────────────────────── -->
          <template v-else>
            <!-- Status row -->
            <div class="d-flex align-center flex-wrap mb-3" style="gap:8px">
              <v-chip
                size="small"
                :color="statusColor(impactScript.status)"
                variant="flat"
                :prepend-icon="statusIcon(impactScript.status)"
                style="color:#fff"
              >
                {{ $t(`scripts.status.${impactScript.status}`) }}
              </v-chip>
              <span v-if="impactScript.submittedBy" class="text-caption text-medium-emphasis">
                {{ $t('scripts.by') }} {{ impactScript.submittedBy }}
              </span>
            </div>

            <!-- Script text -->
            <div class="script-display mb-4">{{ impactScript.scriptText }}</div>

            <!-- Actions -->
            <div class="d-flex flex-wrap" style="gap:8px">

              <!-- Accepted: copy -->
              <v-btn
                v-if="impactScript.status === 'accepted'"
                size="small"
                variant="tonal"
                :color="copiedAward === 'Impact Award' ? 'success' : '#B8860B'"
                :prepend-icon="copiedAward === 'Impact Award' ? 'mdi-check' : 'mdi-content-copy'"
                @click="copyScript('Impact Award', impactScript.scriptText)"
              >
                {{ copiedAward === 'Impact Award' ? $t('scripts.copied') : $t('scripts.copy') }}
              </v-btn>

              <!-- Accepted (admin): edit or send back -->
              <template v-if="isAdmin && impactScript.status === 'accepted'">
                <v-btn
                  size="small" variant="tonal" color="warning"
                  prepend-icon="mdi-pencil-outline"
                  @click="openEditor('Impact Award', impactScript.scriptText)"
                >{{ $t('scripts.edit') }}</v-btn>
                <v-btn
                  size="small" variant="tonal" color="error"
                  prepend-icon="mdi-arrow-u-left-top"
                  :loading="saving['Impact Award_reject']"
                  @click="handleReject('Impact Award')"
                >{{ $t('scripts.sendBack') }}</v-btn>
              </template>

              <!-- Rejected: edit -->
              <v-btn
                v-if="impactScript.status === 'rejected'"
                size="small" variant="tonal" color="warning"
                prepend-icon="mdi-pencil-outline"
                @click="openEditor('Impact Award', impactScript.scriptText)"
              >{{ $t('scripts.edit') }}</v-btn>

              <!-- Admin: accept / reject when pending -->
              <template v-if="isAdmin && impactScript.status === 'pending'">
                <v-btn
                  size="small" variant="flat" color="success"
                  prepend-icon="mdi-check-circle-outline"
                  :loading="saving['Impact Award_accept']"
                  @click="handleAccept('Impact Award')"
                >{{ $t('scripts.accept') }}</v-btn>
                <v-btn
                  size="small" variant="flat" color="error"
                  prepend-icon="mdi-arrow-u-left-top"
                  :loading="saving['Impact Award_reject']"
                  @click="handleReject('Impact Award')"
                >{{ $t('scripts.sendBack') }}</v-btn>
              </template>

            </div>
          </template>

        </v-card-text>
      </v-card>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- NOMINATION-BASED WINNERS                                          -->
      <!-- ══════════════════════════════════════════════════════════════════ -->

      <!-- No winners yet -->
      <v-alert
        v-if="winners.length === 0"
        type="info"
        variant="tonal"
        icon="mdi-information-outline"
        class="mb-4"
      >
        {{ $t('scripts.noWinners') }}
      </v-alert>

      <!-- Winner cards -->
      <v-row v-else dense>
        <v-col
          v-for="winner in winners"
          :key="winner.awardName"
          cols="12"
          md="6"
        >
          <v-card
            elevation="2"
            class="script-card mb-3"
            :class="cardBorderClass(winner.awardName)"
          >

            <!-- Award header -->
            <v-card-title class="pb-1 pt-3 px-4 d-flex align-center" style="gap:8px; flex-wrap:wrap">
              <v-chip
                size="x-small"
                :color="isMci(winner.awardName) ? 'primary' : 'teal'"
                variant="flat"
                label
                style="color:#fff"
              >{{ isMci(winner.awardName) ? 'MCI' : 'TA' }}</v-chip>
              <span class="text-subtitle-1 font-weight-bold">{{ winner.awardName }}</span>
            </v-card-title>

            <v-card-subtitle class="px-4 pb-2 d-flex align-center" style="gap:6px">
              <strong>#{{ winner.team.teamNumber }}</strong>
              <span class="text-medium-emphasis">{{ winner.team.teamName }}</span>
            </v-card-subtitle>

            <v-divider />

            <!-- Script section -->
            <v-card-text class="px-4 pt-3 pb-4">

              <!-- No script yet -->
              <div v-if="!scriptByAward.get(winner.awardName) && !isEditing(winner.awardName)" class="d-flex justify-center py-4">
                <v-btn
                  prepend-icon="mdi-pencil-plus-outline"
                  variant="tonal"
                  color="primary"
                  size="small"
                  @click="openEditor(winner.awardName)"
                >
                  {{ $t('scripts.writeScript') }}
                </v-btn>
              </div>

              <!-- Inline editor -->
              <div v-else-if="isEditing(winner.awardName)">
                <v-textarea
                  v-model="editingDraft[winner.awardName]"
                  :placeholder="$t('scripts.placeholder')"
                  rows="6"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                  class="script-textarea mb-3"
                />
                <div class="d-flex" style="gap:8px">
                  <v-btn
                    color="primary"
                    size="small"
                    variant="flat"
                    :loading="saving[winner.awardName]"
                    :disabled="!editingDraft[winner.awardName]?.trim()"
                    @click="handleSubmit(winner)"
                  >
                    {{ $t('scripts.submit') }}
                  </v-btn>
                  <v-btn
                    v-if="scriptByAward.get(winner.awardName)"
                    size="small"
                    variant="text"
                    @click="closeEditor(winner.awardName)"
                  >
                    {{ $t('scripts.cancel') }}
                  </v-btn>
                </div>
              </div>

              <!-- Script display -->
              <div v-else>
                <div class="d-flex align-center flex-wrap mb-3" style="gap:8px">
                  <v-chip
                    size="small"
                    :color="statusColor(scriptByAward.get(winner.awardName).status)"
                    variant="flat"
                    :prepend-icon="statusIcon(scriptByAward.get(winner.awardName).status)"
                    style="color:#fff"
                  >
                    {{ $t(`scripts.status.${scriptByAward.get(winner.awardName).status}`) }}
                  </v-chip>
                  <span
                    v-if="scriptByAward.get(winner.awardName).submittedBy"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ $t('scripts.by') }} {{ scriptByAward.get(winner.awardName).submittedBy }}
                  </span>
                </div>

                <div class="script-display mb-4">{{ scriptByAward.get(winner.awardName).scriptText }}</div>

                <div class="d-flex flex-wrap" style="gap:8px">

                  <!-- Accepted: copy -->
                  <v-btn
                    v-if="scriptByAward.get(winner.awardName).status === 'accepted'"
                    size="small"
                    variant="tonal"
                    :color="copiedAward === winner.awardName ? 'success' : 'primary'"
                    :prepend-icon="copiedAward === winner.awardName ? 'mdi-check' : 'mdi-content-copy'"
                    @click="copyScript(winner.awardName, scriptByAward.get(winner.awardName).scriptText)"
                  >
                    {{ copiedAward === winner.awardName ? $t('scripts.copied') : $t('scripts.copy') }}
                  </v-btn>

                  <!-- Accepted (admin): edit or send back -->
                  <template v-if="isAdmin && scriptByAward.get(winner.awardName).status === 'accepted'">
                    <v-btn
                      size="small" variant="tonal" color="warning"
                      prepend-icon="mdi-pencil-outline"
                      @click="openEditor(winner.awardName, scriptByAward.get(winner.awardName).scriptText)"
                    >{{ $t('scripts.edit') }}</v-btn>
                    <v-btn
                      size="small" variant="tonal" color="error"
                      prepend-icon="mdi-arrow-u-left-top"
                      :loading="saving[winner.awardName + '_reject']"
                      @click="handleReject(winner.awardName)"
                    >{{ $t('scripts.sendBack') }}</v-btn>
                  </template>

                  <!-- Rejected: edit -->
                  <v-btn
                    v-if="scriptByAward.get(winner.awardName).status === 'rejected'"
                    size="small" variant="tonal" color="warning"
                    prepend-icon="mdi-pencil-outline"
                    @click="openEditor(winner.awardName, scriptByAward.get(winner.awardName).scriptText)"
                  >{{ $t('scripts.edit') }}</v-btn>

                  <!-- Admin: accept / reject when pending -->
                  <template v-if="isAdmin && scriptByAward.get(winner.awardName).status === 'pending'">
                    <v-btn
                      size="small" variant="flat" color="success"
                      prepend-icon="mdi-check-circle-outline"
                      :loading="saving[winner.awardName + '_accept']"
                      @click="handleAccept(winner.awardName)"
                    >{{ $t('scripts.accept') }}</v-btn>
                    <v-btn
                      size="small" variant="flat" color="error"
                      prepend-icon="mdi-arrow-u-left-top"
                      :loading="saving[winner.awardName + '_reject']"
                      @click="handleReject(winner.awardName)"
                    >{{ $t('scripts.sendBack') }}</v-btn>
                  </template>

                </div>
              </div>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </template>

  </v-container>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import { useAwards } from "@/composables/useAwards";
import { useScripts } from "@/composables/useScripts";
import { useTeams } from "@/composables/useTeams";
import { MCI_AWARDS } from "@/constants/awards";
import CardTitlePage from "./CardTitlePage.vue";

const { user } = useAuth0();
const isAdmin = computed(() =>
  (user.value?.["https://myapp.example.com/roles"] ?? []).includes("admin")
);

const { groupedAwards, loading: awardsLoading } = useAwards();
const { scriptByAward, impactScript, loading: scriptsLoading, submit, resubmit, updateWinner, accept, reject } = useScripts();
const { teams, loading: teamsLoading } = useTeams();

const loading = computed(() => awardsLoading.value || scriptsLoading.value);

// ── Winners: awards with exactly one nominated team ───────────────────────────
const winners = computed(() =>
  groupedAwards.value
    .map((award) => {
      const nominated = award.teams.filter((t) => t.nominated);
      return nominated.length === 1
        ? { awardName: award.name, team: nominated[0] }
        : null;
    })
    .filter(Boolean)
);

// ── Summary counts (include Impact Award when it has a script) ────────────────
const pendingCount = computed(() => {
  let n = winners.value.filter((w) => scriptByAward.value.get(w.awardName)?.status === "pending").length;
  if (impactScript.value?.scriptText && impactScript.value.status === "pending") n++;
  return n;
});
const acceptedCount = computed(() => {
  let n = winners.value.filter((w) => scriptByAward.value.get(w.awardName)?.status === "accepted").length;
  if (impactScript.value?.status === "accepted") n++;
  return n;
});

// ── Inline editor state ───────────────────────────────────────────────────────
const editingDraft = reactive({});
const saving       = reactive({});

const isEditing   = (awardName) => awardName in editingDraft;
const openEditor  = (awardName, initial = "") => { editingDraft[awardName] = initial; };
const closeEditor = (awardName) => { delete editingDraft[awardName]; };

// ── Impact Award: declare winner form ─────────────────────────────────────────
const impactForm         = reactive({ selectedTeam: null, scriptText: "" });
const savingImpact       = ref(false);
const editingImpactWinner = ref(false);
const impactWinnerTeam    = ref(null);
const savingImpactWinner  = ref(false);

const handleImpactDeclare = async () => {
  if (!impactForm.selectedTeam) return;
  savingImpact.value = true;
  try {
    await submit(
      "Impact Award",
      String(impactForm.selectedTeam.value),
      impactForm.selectedTeam.text,
      impactForm.scriptText.trim()
    );
    impactForm.selectedTeam = null;
    impactForm.scriptText   = "";
  } finally {
    savingImpact.value = false;
  }
};

const handleImpactUpdateWinner = async () => {
  if (!impactWinnerTeam.value || !impactScript.value) return;
  savingImpactWinner.value = true;
  try {
    await updateWinner(
      impactScript.value.idScripts,
      String(impactWinnerTeam.value.value),
      impactWinnerTeam.value.text
    );
    editingImpactWinner.value = false;
    impactWinnerTeam.value    = null;
  } finally {
    savingImpactWinner.value = false;
  }
};

// ── Impact Award: submit script (when winner is declared but script is empty) ─
const handleImpactSubmitScript = async () => {
  const text = editingDraft["Impact Award"]?.trim();
  if (!text || !impactScript.value) return;
  saving["Impact Award"] = true;
  try {
    await resubmit(impactScript.value.idScripts, text);
    closeEditor("Impact Award");
  } finally {
    saving["Impact Award"] = false;
  }
};

// ── Submit / resubmit (nomination-based awards) ───────────────────────────────
const handleSubmit = async (winner) => {
  const text     = editingDraft[winner.awardName]?.trim();
  const existing = scriptByAward.value.get(winner.awardName);
  if (!text) return;

  saving[winner.awardName] = true;
  try {
    if (existing) {
      await resubmit(existing.idScripts, text);
    } else {
      await submit(winner.awardName, winner.team.teamNumber, winner.team.teamName, text);
    }
    closeEditor(winner.awardName);
  } finally {
    saving[winner.awardName] = false;
  }
};

// ── Admin actions ─────────────────────────────────────────────────────────────
const handleAccept = async (awardName) => {
  const script = scriptByAward.value.get(awardName);
  if (!script) return;
  saving[awardName + "_accept"] = true;
  try { await accept(script.idScripts); }
  finally { saving[awardName + "_accept"] = false; }
};

const handleReject = async (awardName) => {
  const script = scriptByAward.value.get(awardName);
  if (!script) return;
  saving[awardName + "_reject"] = true;
  try { await reject(script.idScripts); }
  finally { saving[awardName + "_reject"] = false; }
};

// ── Copy to clipboard ─────────────────────────────────────────────────────────
const copiedAward = ref(null);
const copyScript = async (awardName, text) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedAward.value = awardName;
    setTimeout(() => { copiedAward.value = null; }, 2000);
  } catch { /* clipboard denied */ }
};

// ── Style helpers ─────────────────────────────────────────────────────────────
const isMci = (awardName) => MCI_AWARDS.includes(awardName);

const cardBorderClass = (awardName) => {
  const s = scriptByAward.value.get(awardName)?.status;
  if (s === "accepted") return "border-accepted";
  if (s === "rejected") return "border-rejected";
  if (s === "pending")  return "border-pending";
  return "border-none";
};

const statusColor = (status) => {
  if (status === "accepted") return "success";
  if (status === "rejected") return "error";
  return "warning";
};

const statusIcon = (status) => {
  if (status === "accepted") return "mdi-check-circle";
  if (status === "rejected") return "mdi-arrow-u-left-top";
  return "mdi-clock-outline";
};
</script>

<style scoped>
/* ── Card left-border status indicator ─────────────────────────────────────── */
.script-card { border-left: 4px solid transparent; transition: border-color 0.25s ease; }
.border-accepted { border-left-color: #4CAF50; }
.border-pending  { border-left-color: #FB8C00; }
.border-rejected { border-left-color: #E53935; }
.border-none     { border-left-color: #e0e0e0; }

/* ── Impact Award card extra accent ────────────────────────────────────────── */
.impact-card.border-none { border-left-color: #B8860B; }

/* ── Script text display ───────────────────────────────────────────────────── */
.script-display {
  background: #FAFAFA;
  border: 1px solid #EEEEEE;
  border-radius: 6px;
  padding: 14px 16px;
  font-size: 0.88rem;
  line-height: 1.7;
  white-space: pre-wrap;
  color: rgba(0, 0, 0, 0.82);
}

/* ── Textarea ──────────────────────────────────────────────────────────────── */
.script-textarea :deep(textarea) {
  font-size: 0.88rem;
  line-height: 1.7;
}
</style>
