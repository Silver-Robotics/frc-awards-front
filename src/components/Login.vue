<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="headline">{{ $t('login.title') }}</v-card-title>

          <v-card-text>
            <Form :validation-schema="schema" @submit="login">
              <v-row>
                <v-col cols="12">
                  <Field
                    name="userName"
                    as="v-text-field"
                    :label="$t('login.userName')"
                    prepend-icon="mdi-card-text-outline"
                    v-model="userName"
                  />
                  <ErrorMessage name="userName">
                    <template #default="{ message }">
                      <v-alert type="error" dense text>{{ message }}</v-alert>
                    </template>
                  </ErrorMessage>
                </v-col>

                <v-col cols="12">
                  <Field
                    name="password"
                    as="v-text-field"
                    :label="$t('login.password')"
                    prepend-icon="mdi-lock-question"
                    type="password"
                    v-model="password"
                  />
                  <ErrorMessage name="password">
                    <template #default="{ message }">
                      <v-alert type="error" dense text>{{ message }}</v-alert>
                    </template>
                  </ErrorMessage>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-btn color="#68C3E2" type="submit" class="ma-2" block>
                    {{ $t('login.submit') }}
                  </v-btn>
                </v-col>
              </v-row>
            </Form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useApi } from "@/composables/useApi";

const router = useRouter();
const { apiRequest } = useApi();
const { t } = useI18n();

const userName = ref("");
const password = ref("");

const schema = computed(() =>
  yup.object({
    userName: yup.string().required(t("login.errors.userNameRequired")),
    password: yup.string().required(t("login.errors.passwordRequired")),
  })
);

const login = async () => {
  try {
    const data = await apiRequest(
      "users/login",
      {
        method: "POST",
        body: JSON.stringify({ userName: userName.value, password: password.value }),
      },
      false
    );

    if (data?.status === "success") {
      router.push("/listTeams");
    } else {
      throw new Error(data?.message || t("login.errors.loginFailed"));
    }
  } catch (err) {
    alert(err.message);
  } finally {
    userName.value = "";
    password.value = "";
  }
};
</script>

<style scoped>
.v-card {
  padding: 1rem;
}
</style>
