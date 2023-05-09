<!--
color:样式
title：名字
delay: 接口响应时间太久，给予控制
asyncFunc:
-->
<template>
  <div class="my-button ellipsis" :class="props.color" @click="handleClick">
    <img v-if="!statusAble || loading" src="@/assets/btnloading.svg" />
    <span v-if="title">{{ title }}</span>
    <slot />
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { defineEmits } from 'vue'
const emit = defineEmits(['editConfirm'])
const props = defineProps({
  color: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: null
  },
  delay: {
    type: Number,
    default: 500
  },
  statusAble: {
    type: Boolean,
    default: true
  },
  asyncFunc: {
    type: Function,
    default: () => {}
  }
})
const loading = ref(false)
const isFunc = computed(() => {
  return typeof props.asyncFunc === 'function'
})
const handleClick = () => {
  if (!props.statusAble) return
  emit('handleClick')
  // Bus.$emit('click', {})
  // const asyncFunc = props.asyncFunc
  // if (!isFunc.value || props.statusAble) {
  //   return
  // }
  // const ret = asyncFunc()
  // // 如果是异步函数，则显示loading
  // if (ret && ret.then) {
  //   loading.value = true
  //   ret.finally(() => {
  //     loading.value = false
  //   })
  // }
}
</script>
<style scoped>
.my-button {
  cursor: pointer;
  background-size: 100%, 100%;
  justify-content: center;
  width: 100%;
  display: flex;
  align-items: center;
  background-repeat: no-repeat;
  font-weight: 400;
}

.button1 {
  width: 344px;
  height: 48px;
  background-image: url('@/assets/btn/btnGreen344.png');
}

/* //////end////////// */

/* 整理 */

/* 1个的 344 */
.smallbutton1 {
  margin-top: 20px;
  width: 344px;
  height: 48px;
  color: #495d14;
  background-image: url('@/assets/btn/btnGreen344.png');
}
/* 1个的 249 */
.greenbutton249 {
  background-size: 100%, 100%;
  width: 249px;
  height: 42px;
  color: #495d14;
  background-image: url('@/assets/btn/home_icon_chongzhi.png');
}
/* 2个的 */
.smallbutton2 {
  background-size: 100%, 100%;
  background: url('@/assets/btn/btnGreen2.png') no-repeat;
  color: #495d14;
  width: 168px;
  height: 44px;
}
/* 3个的 */
.smallbutton3 {
  background-size: 100%, 100%;
  background-image: url('@/assets/btn/btnGreen3.png');
  color: #495d14;
  width: 102px;
  height: 43px;
}
/* 灰色的 */
/* 2 */
.greyMiddel {
  color: #ffffff;
  width: 168px;
  height: 44px;
  background-image: url('@/assets/btn/btnGrey2.png');
}
.greybutton1 {
  color: #ffffff;
  width: 346px;
  height: 44px;
  /* color: #ffffff; */
  background-image: url('@/assets/btn/btnGrey346.png');
}
.disabled1 {
  color: #ffffff;
  width: 346px;
  height: 44px;
  /*  */
  /* color: #ffffff; */
  background-image: url('@/assets/btn/disabled1.png');
}
.disabled2 {
  color: #ffffff;
  width: 168px;
  height: 44px;
  /* pointer-events: none; */
  /* color: #ffffff; */
  background-image: url('@/assets/btn/disabled2.png');
}
</style>
