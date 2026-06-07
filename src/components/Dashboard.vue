<template>
  <v-container>
    <v-tabs v-model="activeTab" background-color="#598290" dark>
      <v-tab value="init">{{ $t('dashboard.tabs.initialization') }}</v-tab>
      <v-tab value="judges">{{ $t('dashboard.tabs.judges') }}</v-tab>
    </v-tabs>

    <div class="tab-content">
      <!-- Event initialisation tab -->
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
          color="#598290"
          variant="outlined"
          elevation="3"
          @click="startEvent"
          :loading="loader"
        >
          {{ $t('dashboard.submit.initializeEvent') }}
        </v-btn>
      </div>

      <!-- Judge management tab -->
      <div v-else-if="activeTab === 'judges'">
        <v-row class="align-start" no-gutters>
          <!-- Judge list -->
          <v-col cols="12" md="5" lg="4">
            <v-card max-width="450">
              <v-list density="compact">
                <v-list-subheader>{{ $t('dashboard.tabs.judges') }}</v-list-subheader>

                <v-list-item
                  v-if="judges.length > 0"
                  v-for="(judge, i) in judges"
                  :key="i"
                  :ripple="false"
                  tabindex="-1"
                  class="static-list-item"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-account-supervisor" />
                  </template>

                  <v-list-item-title>{{ judge.judgeName }}</v-list-item-title>

                  <template v-slot:append>
                    <v-btn class="delete-btn" icon="mdi-delete-outline" variant="text" />
                  </template>
                </v-list-item>

                <v-card v-else :text="$t('dashboard.messages.noJudgesRegistered')" />
              </v-list>
            </v-card>
          </v-col>

          <!-- Add judge input -->
          <v-col cols="12" md="7" lg="8" class="pl-6">
            <v-text-field
              autocomplete="off"
              v-model="judgeName"
              :label="$t('dashboard.fields.judgeName')"
              prepend-icon="mdi-account-multiple-check"
              variant="solo-filled"
            />

            <v-btn
              class="add-button-judge"
              color="#598290"
              variant="outlined"
              elevation="3"
              @click="addJudge"
              :loading="loader"
              :disabled="!judgeName || judgeName.trim().length < 1"
            >
              {{ $t('dashboard.submit.addJudges') }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, watch } from "vue";
import { useApi } from "@/composables/useApi";
import { useEventStore } from "@/stores/eventStore";

const { apiRequest } = useApi();
const eventStore = useEventStore();

const activeTab = ref("init");
const loader = ref(false);
const judges = ref([]);

// Event initialisation
const eventCode = ref("");
const program = ref("");
const programs = [
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

// Judge management
const judgeName = ref("");

const fetchJudges = async () => {
  if (!eventStore.selectedEvent?.value) return;
  try {
    judges.value = await apiRequest("judges", {
      method: "GET",
      headers: { eventCode: eventStore.selectedEvent.value },
    });
  } catch {
    judges.value = [];
  }
};

const addJudge = async () => {
  try {
    await apiRequest("judges", {
      method: "POST",
      headers: { eventCode: eventStore.selectedEvent.value },
      body: JSON.stringify({ judgeName: judgeName.value }),
    });
    await fetchJudges();
  } finally {
    judgeName.value = "";
  }
};

watch(
  () => eventStore.selectedEvent,
  (newVal, oldVal) => {
    if (newVal?.value && newVal.value !== oldVal?.value) fetchJudges();
  },
  { immediate: true }
);
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
  border-color: #1e5aa8;
  color: #1e5aa8;
}

.add-button:hover {
  background-color: #1e5aa8;
  color: white;
  transform: scale(1.03);
}

.add-button-judge {
  width: fit-content;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.25s ease;
  border-color: #1e5aa8;
  color: #b2ebf2;
  margin-left: 2rem;
}

.static-list-item {
  pointer-events: none;
  user-select: none;
  cursor: default;
}

.static-list-item .v-btn {
  pointer-events: auto;
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
</style>
