<template>
  <v-card class="mx-auto" max-width="700" color="#7CAEC6" shaped>
    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title class="headline mb-1">{{
          titulo
        }}</v-list-item-title>
        <v-list-item-subtitle
          ><b>{{ body }} </b></v-list-item-subtitle
        >
      </v-list-item-content>

      <v-list-item-avatar>
        <v-icon large>{{ icon }}</v-icon>
      </v-list-item-avatar>
    </v-list-item>
  </v-card>
</template>

<script>
export default {
  props: {
    titulo: String,
    icon: String,
    body: String,
  },
};
</script>

