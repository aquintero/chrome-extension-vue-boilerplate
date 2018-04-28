<template>
  <v-layout column class="body-1 list-container">
    <v-layout row justify-start class="list-header" v-if="c_hasHeader">
      <v-icon class="icon"></v-icon>
      <slot name="header"><div class="title-container"><span class="title">{{ title }}</span></div></slot>
      <v-spacer></v-spacer>
      <v-menu v-if="actions" class="right-icon text-xs-center" offset-y left>
        <v-btn icon small slot="activator">
          <v-icon color="grey darken-1">more_vert</v-icon>
        </v-btn>
        <v-list>
          <div v-if="!('condition' in action) || action.condition" v-for="(action, actionName) in actions" :key="actionName">
            <dialog-form class="action-button" v-if="action.dialog" :title="action.text" @saved="trigger(actionName, action)" @opened="trigger(actionName + '-dialog-opened', action)">
              <v-list-tile slot="activator">
                <v-list-tile-title>{{ action.text }}</v-list-tile-title>
              </v-list-tile>
              <slot slot="title" :name="action + '-form-title'"></slot>
              <slot :name="actionName + '-form'"></slot>
            </dialog-form>
            <v-list-tile v-else @click="trigger(actionName, action)" slot="activator">
              <v-list-tile-title>{{ action.text }}</v-list-tile-title>
            </v-list-tile>
          </div>
        </v-list>
      </v-menu>
    </v-layout>
    <loader :loading="loading">
      <draggable v-model="d_items" @change="itemMoved" @start="itemDragStart" @end="itemDragEnd" :move="itemDragging">
        <div v-for="(item, index) in d_items" :key="item[keyProp]">
          <v-layout row justify-start class="list-row"
                    :class="{ selected: index === selectedIndex, hovered: !moving && index === hoverIndex }"
                    @click="select(index)"
                    @mouseover="hoverIndex = index"
                    @mouseout="hoverIndex = -1">
            <v-icon class="icon"></v-icon>
            <slot name="item" :props="item">{{ item[textProp] }}</slot>
            <v-spacer></v-spacer>
            <div class="right-icon text-xs-center">
              <v-icon v-show="index === selectedIndex">keyboard_arrow_right</v-icon>
            </div>
          </v-layout>
        </div>
      </draggable>
    </loader>
    <v-spacer></v-spacer>
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
    actions: { type: Object, default: () => {} },
    loading: { type: Boolean, default: true },
    title: { type: String },
    adderText: { type: String, default: '' },
    selectedItem: { type: Object }
  },
  data () {
    return {
      d_items: [],
      showAddDialog: false,
      selectedIndex: -1,
      hoverIndex: -1,
      moving: false
    }
  },
  computed: {
    c_hasHeader () {
      return this.$slots.header || this.title !== null
    }
  },
  watch: {
    items (newItems) {
      this.d_items = newItems
      if (newItems.length > 0) {
        this.selectedIndex = 0
        this.$emit('selected', this.d_items[this.selectedIndex])
      } else {
        this.selectedIndex = -1
      }
    },
    selectedItem (item) {
      this.selectedIndex = this.d_items.findIndex(i => i.id === item.id)
    }
  },
  methods: {
    trigger (actionName, action) {
      this.$emit(actionName)
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
      this.$emit('selected', this.d_items[this.selectedIndex])
    },
    select (index) {
      this.selectedIndex = index
      this.$emit('selected', this.d_items[this.selectedIndex])
    }
  }
}
</script>
<style scoped>
  .list-container {
    flex-basis: auto;
    min-height: 100%;
    border-left: 1px solid;
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-color: #d7d7d7;
  }
  .list-header, .list-adder, .list-row {
    padding-left: 20px;
    padding-right: 0px;
    padding-top: 4px;
    padding-bottom: 4px;
    color: #757575;
  }
  .list-header {
    height: 50px;
    max-height: 50px;
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
    border-bottom: 1px solid;
    border-color: #d7d7d7;
  }
  .list-row {
    line-height: 24px;
  }
  .right-icon {
    width: 50px;
  }
  .title-container {
    height:20px;
    margin-top: auto;
    margin-bottom: auto;
  }
  .action-button {
    width: 100%;
  }
  .action-button:hover {
    background: rgba(0, 0, 0, .12);
    cursor: pointer;
  }
</style>
