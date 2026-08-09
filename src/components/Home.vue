<template>
  <v-card class="mx-auto home-card" max-width="344" outlined>
    <v-list-item three-line>
      <v-list-item-content>
        <div class="overline mb-4">{{ $t('home.section') }}</div>
        <v-list-item-title class="headline mb-1">{{ $t('home.title') }}</v-list-item-title>
        <v-list-item-subtitle>{{ $t('home.subtitle') }}</v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-avatar tile size="80" color="grey">
        <v-icon>mdi-home</v-icon>
      </v-list-item-avatar>
    </v-list-item>
  </v-card>
</template>

<style scoped>
.home-card {
  margin-top: 2rem;
  padding-top: 2rem;
}
</style>
