<template>
  <v-overlay :value="overlay" absolute>
    <v-progress-circular
      color="#007FBC"
      indeterminate
      size="128"
    ></v-progress-circular>
  </v-overlay>
</template>

<script>
export default {
  props: {
    overlay: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.v-overlay__content {
  display: flex !important;
  justify-content: center;
  align-items: center;
}
</style>