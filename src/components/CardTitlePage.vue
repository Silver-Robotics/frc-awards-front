<template>
  <div class="page-header mb-6">
    <div class="d-flex align-center" style="gap: 10px">
      <v-icon :icon="icon" color="#007FBC" size="28" />
      <h1 class="text-h5 font-weight-bold page-title">{{ titulo }}</h1>
    </div>
    <p v-if="body" class="text-body-2 text-medium-emphasis page-body mt-1">{{ body }}</p>
    <v-divider class="mt-3" />
  </div>
</template>

<script>
export default {
  props: {
    titulo: String,
    icon:   String,
    body:   String,
  },
};
</script>

<style scoped>
.page-header {
  padding-top: 0.25rem;
}
.page-title {
  letter-spacing: -0.01em;
}
.page-body {
  padding-left: 38px; /* aligns with the title text, past the icon */
}
</style>
