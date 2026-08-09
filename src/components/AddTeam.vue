<template>
  <v-form ref="form">
    <v-container>
      <CardTitlePage
        :titulo="$t('addTeam.title')"
        icon="mdi-shield-plus-outline"
        :body="$t('addTeam.description')"
      />

      <v-row>
        <v-container>
          <v-col cols="12">
            <v-text-field
              prepend-icon="mdi-card-text-outline"
              :label="$t('addTeam.fields.teamName')"
              v-model="teamName"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              :label="$t('addTeam.fields.teamNumber')"
              prepend-icon="mdi-pound-box-outline"
              v-model="teamNumber"
              :rules="[rules.teamNumber]"
              v-mask="'###############'"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              :label="$t('addTeam.fields.school')"
              prepend-icon="mdi-pound-box-outline"
              v-model="school"
            />
          </v-col>

          <v-col cols="12">
            <v-combobox
              v-model="state"
              :items="estados"
              :label="$t('addTeam.fields.selectState')"
            />
          </v-col>

          <v-col cols="12">
            <v-btn :rounded="true" :outlined="true" @click="adicionaTime">
              {{ $t('addTeam.submit') }}
            </v-btn>
          </v-col>
        </v-container>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useApi } from "@/composables/useApi";
import CardTitlePage from "./CardTitlePage.vue";

const { apiRequest } = useApi();
const { t } = useI18n();
const form = ref(null);

const teamName = ref("");
const teamNumber = ref("");
const school = ref("");
const state = ref("");

const rules = {
  teamNumber: (value) => /^(0|[1-9][0-9]*)$/.test(value) || t("addTeam.errors.invalidNumber"),
};

const estados = [
  { text: "AC", value: "AC" }, { text: "AL", value: "AL" }, { text: "AP", value: "AP" },
  { text: "AM", value: "AM" }, { text: "CE", value: "CE" }, { text: "DF", value: "DF" },
  { text: "ES", value: "ES" }, { text: "GO", value: "GO" }, { text: "MA", value: "MA" },
  { text: "MT", value: "MT" }, { text: "MS", value: "MS" }, { text: "MG", value: "MG" },
  { text: "PA", value: "PA" }, { text: "PB", value: "PB" }, { text: "PR", value: "PR" },
  { text: "PE", value: "PE" }, { text: "PI", value: "PI" }, { text: "RJ", value: "RJ" },
  { text: "RN", value: "RN" }, { text: "RS", value: "RS" }, { text: "RO", value: "RO" },
  { text: "RR", value: "RR" }, { text: "SC", value: "SC" }, { text: "SP", value: "SP" },
  { text: "SE", value: "SE" }, { text: "TO", value: "TO" },
];

const adicionaTime = async () => {
  await apiRequest("teams?bulk=true", {
    method: "POST",
    body: JSON.stringify({
      text: teamName.value,
      value: teamNumber.value,
      school: school.value,
      state: state.value?.value ?? state.value,
    }),
  });
  form.value?.reset();
};
</script>

<style scoped>
.container-inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
