<template>
  <v-container>
    <v-tabs v-model="activeTab" background-color="#007FBC" dark>
      <v-tab value="init">{{ $t('dashboard.tabs.initialization') }}</v-tab>
      <v-tab value="judges">{{ $t('dashboard.tabs.judges') }}</v-tab>
      <v-tab value="pairs">{{ $t('dashboard.tabs.pairs') }}</v-tab>
      <v-tab value="day2">{{ $t('dashboard.tabs.day2') }}</v-tab>
    </v-tabs>

    <div class="tab-content">

      <!-- ── Event initialisation ── -->
      <div v-if="activeTab === 'init'">
        <v-text-field
          autocomplete="off"
          v-model="eventCode"
          :label="$t('dashboard.fields.eventCode')"
          prepend-icon="mdi-pound-box-outline"
          variant="solo-filled"
        />

        <v-combobox
          autocomplete="off"
          v-model="program"
          :items="programs"
          item-title="text"
          item-value="value"
          prepend-icon="mdi-application-braces-outline"
          :label="$t('dashboard.fields.selectProgram')"
          variant="solo-filled"
        />

        <v-btn
          class="add-button"
          color="#007FBC"
          variant="outlined"
          elevation="3"
          @click="startEvent"
          :loading="loader"
        >
          {{ $t('dashboard.submit.initializeEvent') }}
        </v-btn>
      </div>

      <!-- ── Judge management ── -->
      <div v-else-if="activeTab === 'judges'">
        <JudgesManager />
      </div>

      <!-- ── Pairs & team distribution ── -->
      <div v-else-if="activeTab === 'pairs'">
        <PairsManager />
      </div>

      <!-- ── Day 2 follow-up matrix ── -->
      <div v-else-if="activeTab === 'day2'">
        <Day2Matrix />
      </div>

    </div>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useApi } from "@/composables/useApi";
import JudgesManager from "./JudgesManager.vue";
import PairsManager  from "./PairsManager.vue";
import Day2Matrix    from "./Day2Matrix.vue";

const { apiRequest } = useApi();

const activeTab = ref("init");
const loader    = ref(false);

const eventCode = ref("");
const program   = ref("");
const programs  = [
  { text: "FRC", value: "frc" },
  { text: "FTC", value: "ftc" },
];

const startEvent = async () => {
  loader.value = true;
  try {
    await apiRequest("events", {
      method: "POST",
      body: JSON.stringify({ eventCode: eventCode.value, program: program.value }),
    });
  } finally {
    loader.value = false;
  }
};
</script>

<style scoped>
.tab-content {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.add-button {
  width: fit-content;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.25s ease;
  border-color: #007FBC;
  color: #007FBC;
}

.add-button:hover {
  background-color: #007FBC;
  color: white;
  transform: scale(1.03);
}
</style>
