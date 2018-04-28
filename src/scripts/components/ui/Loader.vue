<template>
  <div>
    <div class='loader'>
      <v-progress-circular v-if="!loaded" indeterminate :size="50" color="primary" class="loader"></v-progress-circular>
    </div>
    <slot v-if="loaded"></slot>
  </div>
</template>
<script>
export default {
  name: 'Loader',
  props: {
    loaded: { type: Boolean, default: false }
  }
}
</script>
<style scope>
  .loader {
    text-align: center;
  }
</style>
