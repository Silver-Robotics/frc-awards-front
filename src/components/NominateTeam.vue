<template>
  <v-form ref="form">
    <v-container fluid>
      <v-card elevation="2" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">{{ $t('nominateTeam.title') }}</v-card-title>

        <!-- Loading skeleton -->
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
            <v-combobox
              v-model="room"
              :items="isFTC ? salasFTC : salasFRC"
              item-title="text"
              :label="$t('nominateTeam.fields.selectRoom')"
              variant="solo-filled"
            />
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
              color="#1E5AA8"
              depressed
              elevation="5"
              outlined
              :disabled="!team || !award || !room || !message"
            >
              {{ $t('nominateTeam.submit') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";
import { useTeams } from "@/composables/useTeams";

const { apiRequest } = useApi();
const { t } = useI18n();
const eventStore = useEventStore();

const team = ref(null);
const award = ref(null);
const room = ref(null);
const message = ref("");
const image = ref(null);

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

const salasFRC = [
  { text: "Ayslan / Luiz" },
  { text: "Antonio / JP" },
  { text: "Leo / Beatriz" },
  { text: "Eduardo / Carlos" },
  { text: "Thiago / Juliane" },
  { text: "Francisco / Erika" },
  { text: "Arthur / Sara" },
  { text: "Ivan / Duda" },
];

const salasFTC = [
  { text: "Sala A" },
  { text: "Sala B" },
  { text: "Sala C" },
  { text: "Sala D" },
  { text: "Sala E" },
];

const premios = computed(() => (isFTC.value ? premiosFTC : premiosFRC));

const indicaTime = async () => {
  if (!team.value || !award.value || !room.value || !message.value) {
    alert(t("nominateTeam.errors.fillAllFields"));
    return;
  }

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

  team.value = null;
  award.value = null;
  room.value = null;
  message.value = "";
  image.value = null;
};
</script>
