<template>
  <v-container>
    <v-card class="mx-auto" max-width="500">
      <CardTitlePage
        :titulo="$t('addUser.title')"
        icon="mdi-account-multiple-plus"
        :body="$t('addUser.description')"
      />

      <form @submit.prevent="handleSubmit(onSubmit)">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              :label="$t('addUser.fields.fullName')"
              v-model="fields.name.value"
              :error-messages="fields.name.errors"
              prepend-icon="mdi-account-edit"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :label="$t('addUser.fields.userName')"
              v-model="fields.userName.value"
              :error-messages="fields.userName.errors"
              prepend-icon="mdi-card-text-outline"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :label="$t('addUser.fields.password')"
              v-model="fields.password.value"
              :error-messages="fields.password.errors"
              type="password"
              prepend-icon="mdi-lock-question"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :label="$t('addUser.fields.repeatPassword')"
              v-model="fields.repeatPassword.value"
              :error-messages="fields.repeatPassword.errors"
              type="password"
              prepend-icon="mdi-lock-question"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-combobox
              :label="$t('addUser.fields.selectPermission')"
              v-model="fields.permission.value"
              :items="possiblePermissions"
              :error-messages="fields.permission.errors"
            />
          </v-col>
        </v-row>

        <v-btn type="submit" color="#007FBC" depressed outlined :disabled="!isValid">
          {{ $t('addUser.submit') }}
        </v-btn>
      </form>
    </v-card>

    <Loader :overlay="loader" />

    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">{{ dialogMessage.title }}</v-card-title>
        <v-img :src="require('../assets/warning.png')" />
        <v-card-text>{{ dialogMessage.message }}</v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useApi } from "@/composables/useApi";
import Loader from "./Loader.vue";
import CardTitlePage from "./CardTitlePage.vue";

const { apiRequest } = useApi();
const { t } = useI18n();

const loader = ref(false);
const dialog = ref(false);
const dialogMessage = ref({ title: "", message: "" });

const possiblePermissions = computed(() => [
  t("addUser.permissions.admin"),
  t("addUser.permissions.roomJudge"),
]);

const { handleSubmit, isValid } = useForm();

const name = useField("name", yup.string().required(() => t("addUser.errors.fullNameRequired")));
const userName = useField("userName", yup.string().required(() => t("addUser.errors.userNameRequired")));
const password = useField("password", yup.string().required(() => t("addUser.errors.passwordRequired")));
const repeatPassword = useField("repeatPassword", yup.string().required(() => t("addUser.errors.repeatPasswordRequired")));
const permission = useField("permission", yup.string().required(() => t("addUser.errors.permissionRequired")));

const fields = { name, userName, password, repeatPassword, permission };

const onSubmit = async (values) => {
  loader.value = true;
  try {
    if (values.password !== values.repeatPassword) {
      throw new Error(t("addUser.errors.passwordMismatch"));
    }

    const res = await apiRequest("users", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        userName: values.userName,
        password: values.password,
        repeatPassword: values.repeatPassword,
        permission: values.permission,
      }),
    });

    if (res?.SqlError) {
      if (res.SqlError.errno === 1062) throw new Error(t("addUser.errors.userAlreadyExists"));
      if (res.SqlError.errno === 1162) throw new Error(t("addUser.errors.passwordMismatch"));
    }

    Object.values(fields).forEach((f) => (f.value.value = ""));
    dialogMessage.value = {
      title: t("addUser.dialog.successTitle"),
      message: t("addUser.dialog.successMessage"),
    };
    dialog.value = true;
  } catch (err) {
    dialogMessage.value = {
      title: t("addUser.dialog.errorTitle"),
      message: err.message,
    };
    dialog.value = true;
  } finally {
    loader.value = false;
  }
};
</script>
