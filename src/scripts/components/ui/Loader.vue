<template>
  <div>
    <div v-if="loading" class='loader'>
      <v-progress-circular  indeterminate :size="50" color="primary" class="loader"></v-progress-circular>
    </div>
    <slot v-else></slot>
  </div>
</template>
<script>
export default {
  name: 'Loader',
  props: {
    loading: { type: Boolean, default: true }
  }
}
</script>
<style scope>
  .loader {
    text-align: center;
  }
</style>
