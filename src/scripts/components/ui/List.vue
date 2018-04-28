<template>
  <v-layout column class="body-1 list-container">
    <v-layout row justify-start class="list-header" v-if="c_hasHeader">
      <v-icon class="icon"></v-icon>
      <slot name="header"><div class="title-container"><span class="title">{{ title }}</span></div></slot>
      <v-spacer></v-spacer>
      <v-menu class="right-icon text-xs-center" offset-y left>
        <v-btn icon small slot="activator">
          <v-icon color="grey darken-1">more_vert</v-icon>
        </v-btn>
        <v-list>
          <div v-for="(action, actionName) in actions" :key="actionName">
            <dialog-form v-if="action.dialog" :title="action.text" @saved="(val) => $emit(actionName, val)" @opened="$emit(actionName + '-dialog-opened')">
              <v-list-tile class="action-button" slot="activator">
                <v-list-tile-title>{{ action.text }}</v-list-tile-title>
              </v-list-tile>
              <slot slot="title" :name="action + '-form-title'"></slot>
              <slot :name="actionName + '-form'"></slot>
            </dialog-form>
            <v-list-tile v-else @click="$emit(actionName)" slot="activator">
              <v-list-tile-title>{{ action.text }}</v-list-tile-title>
            </v-list-tile>
          </div>
        </v-list>
      </v-menu>
    </v-layout>
    <loader class="list-body" :loaded="loaded">
      <draggable v-model="d_items" :options="{ group: c_group }" @change="itemMoved" @start="itemDragStart" @end="itemDragEnd" :move="itemDragging">
        <v-layout row justify-start class="list-row"
                  v-for="(item, index) in d_items"
                  :key="item[keyProp]"
                  :class="{ selected: index === selectedIndex, hovered: !moving && index === hoverIndex }"
                  @click="selectedIndex = index"
                  @mouseover="hoverIndex = index"
                  @mouseout="hoverIndex = -1">
          <v-icon class="icon"></v-icon>
          <slot name="item" :props="item">{{ item[textProp] }}</slot>
          <v-spacer></v-spacer>
          <div class="right-icon text-xs-center">
            <v-icon v-show="index === selectedIndex">keyboard_arrow_right</v-icon>
          </div>
        </v-layout>
      </draggable>
    </loader>
  </v-layout>
</template>
<script>
import draggable from 'vuedraggable'
import Loader from '@/scripts/components/ui/Loader.vue'
import DialogForm from '@/scripts/components/ui/DialogForm.vue'
export default {
  name: 'List',
  components: {
    draggable,
    Loader,
    DialogForm
  },
  props: {
    items: { type: Array, required: true },
    keyProp: { type: String, default: 'id' },
    textProp: { type: String, default: 'text' },
    actions: { type: Object },
    async: { type: Boolean, default: true },
    title: { type: String },
    group: { type: String },
    adderText: { type: String, default: '' },
    selectable: { type: Boolean, default: true }
  },
  data () {
    return {
      d_items: [],
      loaded: !this.async,
      showAddDialog: false,
      selectedIndex: 0,
      hoverIndex: -1,
      moving: false
    }
  },
  computed: {
    c_hasHeader () {
      return this.$slots.header || this.title !== null
    },
    c_group () {
      return this.group || this.title || ''
    }
  },
  watch: {
    items (newItems) {
      this.loaded = true
      this.d_items = newItems
    }
  },
  methods: {
    added () {
      this.$emit('insert')
    },
    dialogOpened () {
      this.$emit('insert-dialog-opened')
    },
    itemMoved (e) {
      if (e.moved) {
        this.$emit('reorder', this.items, e.moved.oldIndex, e.moved.newIndex)
      }
    },
    itemDragStart (e) {
      this.moving = true
    },
    itemDragging (e) {
      this.selectedIndex = -1
    },
    itemDragEnd (e) {
      this.moving = false
      this.selectedIndex = e.newIndex
    }
  }
}
</script>
<style scoped>
  .list-container {
    flex-basis: auto;
  }
  .list-header, .list-adder, .list-row {
    padding-left: 20px;
    padding-right: 0px;
    padding-top: 4px;
    padding-bottom: 4px;
    color: #757575;
  }
  .list-adder, .list-row {
    background: white;
    cursor: pointer;
  }
  .list-adder:hover {
    background: #e0f0f5;
  }
  .list-row.hovered, .list-row.selected {
    background: #f0f0f0;
  }
  .list-header {
    background: #f5f5f5;
    border: 1px solid;
    border-color: #d7d7d7;
  }
  .list-adder{
    line-height: 36px;
    color: #039be5;
    border-left: 1px solid;
    border-right: 1px solid;
    border-color: #d7d7d7;
  }
  .list-row {
    line-height: 24px;
  }
  .list-body {
    border-left: 1px solid;
    border-right: 1px solid;
    border-bottom: 1px solid;
    border-color: #d7d7d7;
  }
  .right-icon {
    width: 50px;
  }
  .title-container {
    height:20px;
    margin-top: auto;
    margin-bottom: auto;
  }
  .action-button:hover {
    background: rgba(0, 0, 0, .12);
    cursor: pointer;
  }
</style>
