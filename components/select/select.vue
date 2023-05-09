<template>
  <div class="tk-select" ref="abc">
    <div ref="select_button" class="tk-select-button" @click="selectOpenBtn">
      <slot></slot>
      <div class="select-icon" :class="{ selectOpen: selectOpen }">
        <van-icon class="iconfont" class-prefix="iconfont" slot="iconfont" slot-scope="props" style="transform: scale(0.5)" color="rgb(203, 203, 203)" name="swap_icon_xiala" />
      </div>
    </div>
    <!-- 下拉框 修复找不到数据的显示问题 -->
    <teleport to="body">
      <transition name="select">
        <div v-show="selectOpen" :style="dropdownStyle" class="tk-select-dropdown">
          <ul class="hideScollbar">
            <slot name="selectDropDown"></slot>
          </ul>
          <span class="arrow"></span>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { tokenFun } from '@/utils/token'
import Bus from './selectBus'
import { nextTick, ref, onMounted, computed, watch, toRefs, onDeactivated, provide, getCurrentInstance } from 'vue'
const page = getCurrentInstance()
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    // 父组件 v-model 没有指定参数名，则默认是 modelValue
    type: Object,
    default: ''
  },
  // width,position
  typeSelect: {
    type: String,
    default: 'simple'
  }
})
const abc = ref(null)

document.body.addEventListener('click', (e) => {
  let target = e.target

  // 如果target 不等于body 或者 不等于 abc，进入循环体
  while (target !== document.body && target !== abc.value) {
    target = target.parentNode
  }

  // 退出循环体的时候，表示target === body 或者 等于自己的abc

  if (target !== abc.value) {
    // 隐藏自己
    selectOpen.value = false
  }
})

// // input初始化
const selctValue = ref(props.modelValue)
// // 如果父组件传过来的数据是异步获取的，则需要进行监听
watch(
  () => props.modelValue,
  () => {
    selctValue.value = props.modelValue
    console.log('选中的值', props.modelValue)
  },
  { deep: true }
)

watch(selctValue, (oldVar, newVar) => {
  emits('update:modelValue', selctValue.value)
})
// 打开状态
const selectOpen = ref(false)

const selectOpenBtn = () => {
  if (props.typeSelect !== 'simple') {
    emits('btmInitData', '') // input点击时数据全部显示
  }
  selectOpen.value = !selectOpen.value
}
const select_button = ref(null)
const select_dropdown = ref(null)

// 下拉框位置
const dropdownPosition = ref({ x: 0, y: 0, w: 0 })
// 下拉框位置
const dropdownStyle = computed(() => {
  return {
    left: `${dropdownPosition.value.x - 4}px`,
    top: `${dropdownPosition.value.y}px`
  }
})

watch(selectOpen, (val) => {
  if (val) calculateLocation() // 计算位置
})

// 计算位置
function calculateLocation() {
  var select_button_dom = select_button.value.getBoundingClientRect()
  dropdownPosition.value.w = select_button_dom.width
  dropdownPosition.value.x = select_button_dom.left
  dropdownPosition.value.y = select_button_dom.top + select_button_dom.height + 5
}

const choseItem = (item) => {
  selctValue.value = item
}

defineExpose({
  choseItem
})

onMounted(() => {
  Bus.$on('chooseSelectItem', (res) => {
    if (res.token === page.token) {
      selctValue.value = res.value
      selectOpen.value = false
      Bus.$emit('chooseActive', { token: token, value: selctValue.value })
    }
  })
  if (props.Initial) {
    selctValue.value = props.Initial
    Bus.$emit('chooseActive', { token: token, value: selctValue.value })
  }
})

var token = 'select-' + tokenFun()
// 获取生成的token
page.token = token
// 给子元素派发token
provide('token', token)

onDeactivated(() => {
  window.removeEventListener('click')
  window.removeEventListener('touchstart')
  Bus.$off('chooseSelectItem')
})
</script>

<style lang="scss" scoped>
.bigSelect .tk-select {
  width: 100%;
}

input {
  width: 100%;
}

.tk-select-dropdown ul {
  max-height: 200px;
  overflow-y: auto;
}

.bigSelect .tk-select-button {
  background-color: transparent !important;
}

.arrow {
  display: block;
  width: 0;
  height: 0;
  border-bottom: 6px solid #dcdee0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  position: absolute;
  left: 45%;
  top: -6px;
}

.arrow:after {
  display: block;
  content: '';
  position: absolute;
  left: -6px;
  top: 1px;
  width: 0;
  height: 0;
  border-bottom: 6px solid #fff;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
}

.tk-select-dropdown ul {
  border-radius: 0% !important;
  box-shadow: none !important;
}

.tk-select-dropdown {
  z-index: 50000;
  padding: 10px 0;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.tk-select-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: border 0.2s;
}

.tk-select-button span {
  font-weight: 500;
  user-select: none;
}

.select-icon {
  // width: 32px;
  // height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  .arrowImg {
    width: 0.63rem;
    height: 0.38rem;
    // margin-right: 0.3rem;
    // flex-shrink: 0;
    // width: 1.31rem;
    // height: 1.31rem;
  }
}

.select-icon.selectOpen {
  transform: rotate(180deg);
}

// 下拉框
.tk-select-dropdown {
  position: fixed;
}

.tk-select-dropdown ul {
  /* overflow: hidden; */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(35, 38, 47, 0.1);
}

.select-enter-from,
.select-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.select-enter-active,
.select-leave-active {
  transform-origin: top center;
  transition: opacity 0.4s cubic-bezier(0.5, 0, 0, 1.25), transform 0.2s cubic-bezier(0.5, 0, 0, 1.25);
}
</style>
