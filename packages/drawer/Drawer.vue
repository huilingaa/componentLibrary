<!--
 * @Author: mouse
 * @Date: 2023-02-24 09:56:40
 * @LastEditTime: 2023-03-10 15:24:10
 * @LastEditors: mouse
 * @Description: 
 * @FilePath: /mixmarvel-sdk-web/src/packages/drawer/Drawer.vue
 * @project: 
-->
<template>
  <Dialog ref="dialogEl" :backgroundColor="props.backgroundColor" v-model="visible" animation="slide" :class-name="`${prefixCls}-drawer ${prefixCls}-drawer-${direction}`">
    <slot></slot>
  </Dialog>
</template>

<script lang="ts" setup>
import prefixCls from '../prefix'
import { ref, watch } from 'vue'
import { Dialog } from '../dialog'
const props = withDefaults(
  defineProps<{
    modelValue?: boolean // rgb格式，初始值
    direction?: string
    backgroundColor?: string
  }>(),
  {
    backgroundColor: '#f7f7f7',
    modelValue: false,
    direction: 'bottom'
  }
)
const emits = defineEmits<{
  (e: 'update:modelValue', modelValue: boolean): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v: boolean) => {
    visible.value = v
  }
)
watch(
  () => visible.value,
  (v: boolean) => {
    emits('update:modelValue', v)
  }
)
</script>
