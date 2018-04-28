<template>
  <v-dialog v-model="show" max-width="500px">
    <slot slot="activator" name="activator"></slot>
    <v-form @submit.prevent="save">
      <v-card>
        <v-toolbar color="primary" dark>
          <slot name="title">
            <v-toolbar-title>
              {{ title }}
            </v-toolbar-title>
          </slot>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-layout wrap>
              <slot></slot>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click.native="show = false">Cancel</v-btn>
          <v-btn color="primary" flat type="submit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>
<script>
export default {
  name: 'DialogForm',
  props: {
    title: { type: String }
  },
  data () {
    return {
      show: false
    }
  },
  methods: {
    save () {
      this.$emit('saved')
      this.show = false
    }
  },
  watch: {
    show (val) {
      if (val) {
        this.$emit('opened')
      }
    }
  }
}
</script>
