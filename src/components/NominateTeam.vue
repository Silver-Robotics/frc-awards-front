<template>
  <v-form ref="form">
    <v-container fluid>
      <v-card elevation="2" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">{{ $t('nominateTeam.title') }}</v-card-title>

        <!-- Loading skeleton (data fetch) -->
        <v-skeleton-loader v-if="loading" class="mx-auto mt-6 pa-4" type="card" elevation="2">
          <template #default>
            <v-card flat class="pa-4">
              <v-skeleton-loader type="heading" width="60%" class="mb-6" />
              <v-skeleton-loader type="paragraph" width="100%" height="45px" class="mb-4" />
              <v-skeleton-loader type="paragraph" width="100%" height="45px" class="mb-4" />
              <v-skeleton-loader type="paragraph" width="100%" height="45px" class="mb-4" />
              <v-skeleton-loader type="button" width="150px" height="40px" class="mt-6" />
            </v-card>
          </template>
        </v-skeleton-loader>

        <!-- Form fields -->
        <v-row v-else>
          <v-col cols="12" md="4">
            <v-combobox
              v-model="award"
              :items="premios"
              item-title="text"
              item-value="value"
              :label="$t('nominateTeam.fields.selectAward')"
              variant="solo-filled"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-combobox
              v-model="team"
              :items="teamOptions"
              item-title="text"
              item-value="value"
              :label="$t('nominateTeam.fields.selectTeam')"
              variant="solo-filled"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="room"
              :items="pairOptions"
              item-title="text"
              item-value="value"
              :return-object="true"
              :label="$t('nominateTeam.fields.selectRoom')"
              :loading="pairsLoading"
              variant="solo-filled"
            >
              <!-- dropdown row -->
              <template #item="{ item, props }">
                <v-list-item v-bind="props" :title="undefined">
                  <div class="d-flex align-center" style="gap: 8px">
                    <v-chip
                      v-if="item.raw.type"
                      size="x-small"
                      :color="item.raw.type === 'mci' ? 'primary' : 'success'"
                      label
                    >
                      {{ item.raw.type.toUpperCase() }}
                    </v-chip>
                    <span>{{ item.raw.text }}</span>
                  </div>
                </v-list-item>
              </template>

              <!-- selected value chip -->
              <template #selection="{ item }">
                <v-chip
                  v-if="item.raw.type"
                  size="x-small"
                  :color="item.raw.type === 'mci' ? 'primary' : 'success'"
                  label
                  class="mr-1"
                >
                  {{ item.raw.type.toUpperCase() }}
                </v-chip>
                {{ item.raw.text }}
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

        <v-row v-if="!loading">
          <v-col cols="12">
            <v-textarea v-model="message" :label="$t('nominateTeam.fields.justification')" outlined dense />
          </v-col>
        </v-row>

        <v-row v-if="!loading">
          <v-col cols="12" md="6">
            <v-file-input
              v-model="image"
              :label="$t('nominateTeam.fields.optionalImage')"
              accept="image/*"
              prepend-icon="mdi-camera"
              variant="solo-filled"
              show-size
            />
          </v-col>
        </v-row>

        <v-row v-if="!loading">
          <v-col cols="12" md="4">
            <v-btn
              @click="indicaTime"
              color="#007FBC"
              depressed
              elevation="5"
              outlined
              :disabled="!team || !award || !room || !message"
              :loading="submitting"
            >
              {{ $t('nominateTeam.submit') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-form>

  <!-- ── Submission loader overlay ──────────────────────────────────────────── -->
  <v-overlay
    :model-value="submitting"
    class="d-flex align-center justify-center"
    persistent
    z-index="9999"
    style="backdrop-filter: blur(3px);"
  >
    <div class="submit-loader">
      <div class="spinner-wrap">
        <!-- Outer ring — FIRST yellow, clockwise -->
        <div class="ring ring-outer" />
        <!-- Inner ring — FIRST blue, counter-clockwise -->
        <div class="ring ring-inner" />
        <!-- Season logo in the centre -->
        <div class="logo-centre">
          <v-img
            :src="diveLogoSrc"
            width="64"
            height="64"
            contain
          />
        </div>
      </div>
      <span class="loader-label">{{ $t('nominateTeam.submitting') }}</span>
    </div>
  </v-overlay>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";
import { useTeams } from "@/composables/useTeams";
import { usePairs } from "@/composables/usePairs";
import diveLogoSrc from "@/assets/logo_frc_biocore_vertical.png";

const { apiRequest } = useApi();
const { t } = useI18n();
const eventStore = useEventStore();

const team      = ref(null);
const award     = ref(null);
const room      = ref(null);
const message   = ref("");
const image     = ref(null);
const submitting = ref(false);

// Raw teams from composable; transform for combobox display
const { teams: rawTeams, loading } = useTeams();
const teamOptions = computed(() =>
  rawTeams.value.map((t) => ({
    value: t.value,
    text: `${t.value} - ${t.text}`,
    state: t.state,
    school: t.school,
  }))
);

const isFTC = computed(() => eventStore.selectedEvent?.program === "ftc");

// Pairs from the Dashboard — replaces hardcoded room lists
const { pairOptions, loading: pairsLoading } = usePairs();

// Award names are official FIRST brand names — not translated
const premiosFRC = [
  { text: "Autonomous",               value: 1,  category: "MCI" },
  { text: "Creativity",               value: 2,  category: "MCI" },
  { text: "Excellence in Engineering",value: 3,  category: "MCI" },
  { text: "Industrial Design",        value: 4,  category: "MCI" },
  { text: "Innovation in Control",    value: 5,  category: "MCI" },
  { text: "Quality",                  value: 6,  category: "MCI" },
  { text: "Engineering Inspiration",  value: 7,  category: "AE"  },
  { text: "Gracious Professionalism", value: 8,  category: "AE"  },
  { text: "Imagery",                  value: 9,  category: "AE"  },
  { text: "Judges",                   value: 10, category: "AE"  },
  { text: "Rookie All Star",          value: 11, category: "AE"  },
  { text: "Rising All Star",          value: 12, category: "AE"  },
  { text: "Team Spirit",              value: 13, category: "AE"  },
  { text: "Sustainability",           value: 14, category: "AE"  },
];

const premiosFTC = [
  { text: "Think Award",   value: 2, category: "MCI" },
  { text: "Connect Award", value: 3, category: "AE"  },
  { text: "Innovate Award",value: 4, category: "MCI" },
  { text: "Design Award",  value: 5, category: "MCI" },
  { text: "Control Award", value: 6, category: "MCI" },
  { text: "Reach Award",   value: 7, category: "AE"  },
  { text: "Sustain Award", value: 8, category: "AE"  },
];

const premios = computed(() => (isFTC.value ? premiosFTC : premiosFRC));

const indicaTime = async () => {
  if (!team.value || !award.value || !room.value || !message.value) {
    alert(t("nominateTeam.errors.fillAllFields"));
    return;
  }

  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append("awardName", award.value.text);
    formData.append("motive", message.value);
    formData.append("judge", room.value.text);
    formData.append("category", award.value.category);
    formData.append("value", team.value.value);
    if (image.value) formData.append("image", image.value);

    await apiRequest("awards", {
      method: "POST",
      headers: { eventCode: eventStore.selectedEvent.value },
      body: formData,
    });

    team.value    = null;
    award.value   = null;
    room.value    = null;
    message.value = "";
    image.value   = null;
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* ── Submission overlay ───────────────────────────────────────────────────── */
.submit-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner-wrap {
  position: relative;
  width: 120px;
  height: 120px;
}

/* Shared ring base */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 4px solid transparent;
}

/* Outer ring — FIRST yellow, clockwise */
.ring-outer {
  inset: 0;
  border-top-color: #F7E326;
  border-right-color: rgba(247, 227, 38, 0.35);
  animation: spin-cw 1s linear infinite;
}

/* Inner ring — FIRST blue, counter-clockwise */
.ring-inner {
  inset: 16px;
  border: 3px solid transparent;
  border-bottom-color: #007FBC;
  border-left-color: rgba(0, 127, 188, 0.35);
  animation: spin-ccw 1.3s linear infinite;
}

/* Logo sits in the remaining centred space */
.logo-centre {
  position: absolute;
  inset: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-label {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@keyframes spin-cw {
  to { transform: rotate(360deg); }
}

@keyframes spin-ccw {
  to { transform: rotate(-360deg); }
}
</style>
