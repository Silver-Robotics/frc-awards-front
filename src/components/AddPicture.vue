<template>
  <v-form ref="form">
    <v-container fluid>
      <CardTitlePage
        :titulo="$t('addPicture.title')"
        icon="mdi-camera"
        :body="$t('addPicture.description')"
      />

      <Loader :overlay="loading" />

      <v-row>
        <v-col cols="12" md="6">
          <v-combobox
            v-model="team"
            :items="teams"
            item-title="text"
            item-value="value"
            :label="$t('addPicture.fields.selectTeam')"
            density="comfortable"
            outlined
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-file-input
            v-model="myFileObject"
            prepend-icon="mdi-image-plus"
            accept="image/jpeg, image/png"
            :label="$t('addPicture.fields.attachImage')"
            density="comfortable"
            outlined
          />
        </v-col>
      </v-row>

      <!-- ── Photo preview ──────────────────────────────────────────────────── -->
      <v-row v-if="team" justify="center" class="mt-2 mb-2">
        <v-col cols="12" sm="8" md="5" class="d-flex flex-column align-center">
          <v-card variant="outlined" rounded="lg" width="100%" class="photo-card">
            <v-img
              :src="displayImage || standardImg"
              height="240"
              cover
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center h-100">
                  <v-progress-circular indeterminate color="grey-lighten-2" />
                </div>
              </template>

              <!-- "preview" badge when a new file is staged -->
              <div v-if="previewUrl" class="preview-badge">
                <v-icon icon="mdi-image-edit-outline" size="13" class="mr-1" />
                {{ $t('addPicture.newPreview') }}
              </div>
            </v-img>
          </v-card>

          <span class="text-caption text-medium-emphasis mt-2">
            <template v-if="previewUrl">
              {{ $t('addPicture.newPreview') }}
            </template>
            <template v-else-if="displayImage">
              {{ $t('addPicture.currentPhoto') }}
            </template>
            <template v-else>
              <v-icon icon="mdi-image-off-outline" size="13" class="mr-1 text-disabled" />
              {{ $t('addPicture.noPhoto') }}
            </template>
          </span>
        </v-col>
      </v-row>

      <v-row justify="center" class="mt-3">
        <v-btn
          @click="addPhoto"
          color="#007FBC"
          variant="outlined"
          elevation="4"
          :disabled="!canSubmit"
          :loading="uploading"
        >
          {{ $t('addPicture.submit') }}
        </v-btn>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useApi } from "@/composables/useApi";
import { useTeams } from "@/composables/useTeams";
import { useEventStore } from "@/stores/eventStore";
import CardTitlePage from "./CardTitlePage.vue";
import Loader from "./Loader.vue";
import standardImg from "@/assets/fotos_times/standard.webp";

const { apiRequest } = useApi();
const eventStore = useEventStore();
const form = ref(null);

// useTeams already sends the eventCode header and reacts to event changes
const { teams: rawTeams, loading, refresh: refreshTeams } = useTeams();

const teams = computed(() =>
  rawTeams.value.map((t) => ({
    text: `${t.value} - ${t.text}`,
    value: t.value,
  }))
);

const team       = ref(null);
const myFileObject = ref(null);
const uploading  = ref(false);
const previewUrl = ref(null);

// Look up the full team record (including imageLink) from rawTeams
const selectedTeamData = computed(() => {
  const teamValue = team.value?.value ?? team.value;
  if (!teamValue) return null;
  return rawTeams.value.find((t) => t.value === teamValue) ?? null;
});

// Image to display: file preview takes priority over the stored S3 photo
const displayImage = computed(() =>
  previewUrl.value || selectedTeamData.value?.imageLink || null
);

// Generate / revoke object URL whenever the file selection changes
watch(myFileObject, (newFile) => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  if (newFile instanceof File) {
    previewUrl.value = URL.createObjectURL(newFile);
  }
});

// Clean up the object URL when the component is destroyed
onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

const canSubmit = computed(() => team.value && myFileObject.value);

const addPhoto = async () => {
  if (!canSubmit.value) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", myFileObject.value);
    formData.append("bodyReq", JSON.stringify({ value: team.value.value ?? team.value }));

    await apiRequest("teams/picture", {
      method: "POST",
      headers: { eventCode: eventStore.selectedEvent.value },
      body: formData,
    });

    // Refresh teams so the new presigned URL is available immediately
    await refreshTeams();

    form.value?.reset();
    team.value      = null;
    myFileObject.value = null;
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.photo-card {
  overflow: hidden;
  background: #f5f5f5;
}

.preview-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(4px);
}

.v-btn {
  font-family: "Roboto", sans-serif;
  text-transform: none;
  font-weight: 500;
}
</style>
