<template>
  <v-container>
    <v-card class="mx-auto" max-width="500">
      <CardTitlePage
        titulo="Adicionar Usuário"
        icon="mdi-account-multiple-plus"
        body="Adicionar um usuário ao sistema."
      />

      <form @submit.prevent="handleSubmit(onSubmit)">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              label="Nome completo"
              v-model="fields.name.value"
              :error-messages="fields.name.errors"
              prepend-icon="mdi-account-edit"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              label="Nome do Usuário"
              v-model="fields.userName.value"
              :error-messages="fields.userName.errors"
              prepend-icon="mdi-card-text-outline"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              label="Senha"
              v-model="fields.password.value"
              :error-messages="fields.password.errors"
              type="password"
              prepend-icon="mdi-lock-question"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              label="Repita a senha"
              v-model="fields.repeatPassword.value"
              :error-messages="fields.repeatPassword.errors"
              type="password"
              prepend-icon="mdi-lock-question"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-combobox
              label="Selecione a permissão"
              v-model="fields.permission.value"
              :items="possiblePermissions"
              :error-messages="fields.permission.errors"
            />
          </v-col>
        </v-row>

        <v-btn type="submit" color="#1E5AA8" depressed outlined :disabled="!isValid">
          Adicionar
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
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useApi } from "@/composables/useApi";
import Loader from "./Loader.vue";
import CardTitlePage from "./CardTitlePage.vue";

const { apiRequest } = useApi();

const loader = ref(false);
const dialog = ref(false);
const dialogMessage = ref({ title: "", message: "" });
const possiblePermissions = ["Administrador", "Juiz de Sala"];

const { handleSubmit, isValid } = useForm();

const name = useField("name", yup.string().required("Nome completo é obrigatório"));
const userName = useField("userName", yup.string().required("Nome de usuário é obrigatório"));
const password = useField("password", yup.string().required("Senha é obrigatória"));
const repeatPassword = useField("repeatPassword", yup.string().required("Confirmação é obrigatória"));
const permission = useField("permission", yup.string().required("Permissão é obrigatória"));

const fields = { name, userName, password, repeatPassword, permission };

const onSubmit = async (values) => {
  loader.value = true;
  try {
    if (values.password !== values.repeatPassword) {
      throw new Error("Senhas não conferem!");
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
      if (res.SqlError.errno === 1062) throw new Error("Usuário já existe!");
      if (res.SqlError.errno === 1162) throw new Error("Senhas não conferem!");
    }

    Object.values(fields).forEach((f) => (f.value.value = ""));
    dialogMessage.value = { title: "Sucesso", message: "Usuário adicionado!" };
    dialog.value = true;
  } catch (err) {
    dialogMessage.value = { title: "Erro", message: err.message };
    dialog.value = true;
  } finally {
    loader.value = false;
  }
};
</script>
