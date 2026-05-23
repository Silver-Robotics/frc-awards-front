<template>
  <v-form ref="form">
    <v-container fluid>
      <CardTitlePage
        titulo="Adicionar Foto"
        icon="mdi-camera"
        body="Anexe uma imagem para o time selecionado."
        class="card-title"
      />

      <Loader :overlay="loading" />

      <v-row>
        <v-col cols="12" md="6">
          <v-combobox
            v-model="team"
            :items="teams"
            item-title="text"
            item-value="value"
            label="Selecione o time"
            density="comfortable"
            outlined
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-file-input
            @change="onFileChange"
            prepend-icon="mdi-image-plus"
            accept="image/*"
            label="Anexar imagem"
            density="comfortable"
            outlined
          />
        </v-col>
      </v-row>

      <v-row justify="center" class="mt-4">
        <v-btn
          @click="addPhoto"
          color="#1E5AA8"
          variant="outlined"
          elevation="4"
          :disabled="!canSubmit"
        >
          Enviar
        </v-btn>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useApi } from "@/composables/useApi";
import CardTitlePage from "./CardTitlePage.vue";
import Loader from "./Loader.vue";

const { apiRequest } = useApi();
const form = ref(null);

const teams = ref([]);
const loading = ref(false);
const team = ref(null);
const myFileObject = ref(null);

const canSubmit = computed(() => team.value && myFileObject.value);

const onFileChange = (e) => {
  myFileObject.value = e;
};

onMounted(async () => {
  loading.value = true;
  try {
    const result = await apiRequest("teams", { method: "GET" });
    teams.value = result.map((t) => ({
      text: `${t.value} - ${t.text}`,
      value: t.value,
    }));
  } finally {
    loading.value = false;
  }
});

const addPhoto = async () => {
  if (!canSubmit.value) return;

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", myFileObject.value);
    formData.append("bodyReq", JSON.stringify({ value: team.value.value }));

    await apiRequest("teams/picture", { method: "POST", body: formData });

    form.value?.reset();
    team.value = null;
    myFileObject.value = null;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.card-title {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.v-btn {
  font-family: "Roboto", sans-serif;
  text-transform: none;
  font-weight: 500;
}

.v-combobox,
.v-file-input {
  font-family: "Roboto", sans-serif;
}
</style>
