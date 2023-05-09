<!--
 * @Author: mouse
 * @Date: 2023-02-01 13:56:17
 * @LastEditTime: 2023-02-15 17:19:09
 * @LastEditors: mouse
 * @Description:
 * @FilePath: /mixmarvel-sdk-web/src/components/header.vue
 * @project:
-->
<template>
  <header class="header">
    <div class="header-button is-left" @click="goBack()">
      <img class="image_2" src="@/assets/bc7bce5821309d7c092617119c21489b.png" />
      <span class="text">{{ title }}</span>
    </div>
    <div class="header-button is-right">
      <slot></slot>
      <img @click="jump" v-show="isright" class="image-right" src="@/assets/1f23a06fcf53c575291bd1a1095ce944.png" />
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { reactive } from 'vue'

const router = useRouter()
const state = reactive({})

const goBack = () => {
  props.url ? router.push(props.url) : router.go(-1)
}
const emits = defineEmits(['handle'])
const jump = () => {
  emits('jumpUrl', '')
}

const props = defineProps({
  title: {
    type: String,
    default: null
  },
  isright: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    default: null
  }
})
</script>

<style lang="scss" scoped>
.header {
  user-select: none;
  font-size: 18;
  width: 100%;
  height: 64px;
  padding: 0 15px;
  box-sizing: border-box;
  line-height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .is-left {
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .image_2 {
    align-items: center;
    display: block;
    width: 11px;
    height: 16px;
    margin: 0 8px 0 0;
  }

  .image-right {
    width: 16px;
    height: 16px;
  }
  .text {
    font-size: 19px;
    font-weight: Medium;
  }
  .header-button {
    cursor: pointer;
  }
}
</style>
