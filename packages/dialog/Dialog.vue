<template>
  <transition :name="animation">
    <div
      v-show="state.visible"
      ref="el"
      :class="{
        [`${prefixCls}-dialog-modal`]: true,
        modal: !modal,
        center: center
      }"
      :style="{ zIndex: zIndex }"
      @click="btnClick('modal')"
    >
      <div
        ref="dialogEl"
        :class="{
          [prefixCls + '-dialog']: true,
          [className]: className,
          [prefixCls + '-dialog-isAlert']: isAlert
        }"
        :style="{
          width: width,
          top: state.top,
          left: state.left,
          background: state.backgroundColor,

          'transition-duration': state.moveFlag ? '0s' : ''
        }"
        @click.stop
      >
        <!-- {{ props.backgroundColor }}[]] -->
        <div
          v-if="content || $slots.default"
          :style="{ height: height }"
          :class="{
            [prefixCls + '-dialog-alert']: isAlert,
            [prefixCls + '-dialog-content']: true
          }"
        >
          <div v-if="content" :class="[prefixCls + '-dialog-text']">{{ content }}</div>
          <slot v-else></slot>
        </div>
        <div v-if="$slots.footer" :class="`${prefixCls}-dialog-footer`">
          <slot name="footer"></slot>
        </div>
        <div v-if="confirm || cancel" :class="`${prefixCls}-dialog-footer`" class="font">
          <div v-if="cancel" class="left" type="cancel" @click="btnClick('cancel')">
            {{ cancel }}
          </div>
          <div v-if="confirm" class="right" type="primary" @click="btnClick('confirm')">
            {{ confirm }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { reactive, computed, onMounted, nextTick, ref, onBeforeUnmount, watch } from 'vue'
import prefixCls from '../prefix'
import { getOffset, scrollTop, getWindow, getScrollbarWidth } from '../util/dom'
export interface StateStyle {
  //[propName: string]: any
  autoTime: number
  visible: boolean
  left?: string
  backgroundColor?: string
  top?: string
  moveFlag: boolean
  scrollbar: any
  isDestroy: boolean
}
const props = withDefaults(
  defineProps<{
    zIndex?: number
    modelValue?: boolean
    backgroundColor?: string
    title?: string // 标题，也可通过具名 slot 传入，title优先
    content?: string
    appendToBody?: boolean // Dialog 自身是否插入至 body 元素上
    top?: string // 默认弹出时距离顶部的距离
    width?: string
    height?: string // 内容区域的高度
    center?: string // 垂直对齐
    modal?: boolean // 是否需要遮罩层
    closeModal?: boolean // 是否可以通过点击 modal 关闭 Dialog
    lockScroll?: boolean // 是否在 Dialog 出现时将 body 滚动锁定
    className?: string
    showClose?: boolean // 是否显示关闭按钮
    confirm?: string // 确认按钮
    cancel?: string // 取消按钮
    callback?: Function
    move?: boolean // 允许拖动窗口
    autoClose?: number // 自动关闭时间
    closeTips?: string // 自动关闭时提示语,大写S会被替换为具体时间
    beforeClose?: Function // 关闭前的回调
    animation?: string
    isAlert?: boolean // 用于区别引用形式，组件或者是插件，不需要通过外部传参。true时关闭弹窗时同时从body移除
    remove?: Function // 用于移动message弹窗
    icon?: string | number // 主要用于this.$dialog中常见的几种提示
    close?: Function // 关闭动画完成时回调
    cancelCallback?: Function //取消回调
  }>(),
  {
    zIndex: 999,
    modelValue: false,
    backgroundColor: '#f7f7f7',
    appendToBody: true, // Dialog 自身是否插入至 body 元素上
    modal: true, // 是否需要遮罩层
    closeModal: true, // 是否可以通过点击 modal 关闭 Dialog
    lockScroll: true, // 是否在 Dialog 出现时将 body 滚动锁定
    showClose: true, // 是否显示关闭按钮
    move: false, // 允许拖动窗口
    autoClose: 0, // 自动关闭时间
    closeTips: 'S秒后自动关闭', // 自动关闭时提示语,大写S会被替换为具体时间
    animation: 'fade',
    icon: 0, // 主要用于this.$dialog中常见的几种提示
    className: ''
  }
)
const emits = defineEmits<{ (e: 'update:modelValue', modelValue: boolean): void }>()
const el = ref()
const headEl = ref()
const dialogEl = ref()
const state = reactive<StateStyle>({
  autoTime: props.autoClose, // 自动关闭时间
  visible: props.modelValue, // 控制窗口显示隐藏
  left: '',
  backgroundColor: props.backgroundColor || '#f7f7f7',
  top: props.top,
  moveFlag: false,
  scrollbar: {},
  isDestroy: false
})
let clearTime = 0
watch(
  () => props.modelValue,
  (bool: boolean) => {
    state.visible = bool
    bool && autoCloseFn() // 调用自动关闭
    setScrollBarLock(bool) // 锁住
  }
)
const autoCloseFn = () => {
  // 自动关闭
  if (props.autoClose > 0) {
    state.autoTime = props.autoClose
    clearTime = window.setInterval(() => {
      if (state.autoTime > 1) {
        state.autoTime--
      } else {
        // emit('callback')
        props.callback && props.callback()
        close()
      }
    }, 1000)
  }
}
const open = () => {
  state.visible = true
  autoCloseFn() // 调用自动关闭
  setScrollBarLock(true) // 锁住
}
const duration = 500 // 动画完成时间，由css控制，这里设个500
const close = () => {
  state.visible = false
  if (props.autoClose) {
    window.clearInterval(clearTime)
  }
  // message方法时移除，延时移除可保留过渡动画
  if (props.isAlert && props.remove) {
    window.setTimeout(() => {
      props.remove && props.remove()
    }, duration)
  }
  emits('update:modelValue', false)
  setScrollBarLock(false) // 解锁
  if (typeof props.close === 'function') {
    // 动画完成后回调，动画时间由css控制目前设置都为300
    window.setTimeout(() => {
      props.close && props.close()
    }, duration)
  }
}

const btnClick = (type: string) => {
  console.log('btnClick', type)
  // 点击遮罩层不允许操作时
  if (!props.closeModal && type === 'modal') {
    return false
  }
  // 点确定并且绑定了回调事件时，由确定回调关闭
  // 自动关闭时不处理，即时间没到也可以点确定取消直接关闭
  // console.log('props.callback')
  // console.log(props.callback)
  if (!props.autoClose && type === 'confirm' && props.callback) {
    // emit('callback', close) // 将关闭方法传出去
    props.callback(close) // 回调时使用return true关闭
    console.log(console)
    return false
  }
  if (type === 'cancel' && props.cancelCallback) {
    props.cancelCallback(close)
    return false
  }
  if (props.beforeClose && !props.beforeClose(type, close)) {
    // beforeClose返回false时阻止关闭
    // props.beforeClose(type, close)
    return false
  } else {
    close()
  }
}
const btnClick11 = (data: string) => {
  // childRef()
  console.log('childRef', data)
  // childRef.btnClick(data)
}
defineExpose({ open, close, btnClick })

const setScrollBarLock = (bool: boolean) => {
  // console.log('[]',props.lockScroll)

  if (props.lockScroll) {
    // console.log(state.scrollbar,'[][]')
    // 滚动body滚动
    const { hasScroll, width } = state.scrollbar
    if (hasScroll && bool) {
      // 当前页面有滚动条
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = width + 'px' // 滚动条的宽，防抖动
    }
    if (!bool && hasScroll) {
      // 解锁
      document.body.style.overflow = ''
      document.body.style.paddingRight = '' // 滚动条的宽，防抖动
    }
  }
}
onMounted(() => {
  nextTick(() => {
    if (props.appendToBody && el.value) {
      document.body.appendChild(el.value)
    }
    if (props.lockScroll) {
      console.log('滚动条宽')
      state.scrollbar = getScrollbarWidth(true) // 滚动条宽
    }
  })
})
onBeforeUnmount(() => {
  if (props.appendToBody && el.value.parentNode) {
    el.value.parentNode.removeChild(el.value)
  }
  clearTime && window.clearInterval(clearTime)
})
</script>

<style scoped lang="scss">
.left,
.right {
  cursor: pointer;
}
.ak-dialog-footer {
  display: flex;
}
.ak-dialog-modal {
  overflow-y: hidden;
  background: rgba(55, 55, 55, 0.6);
  position: absolute;
  // width: 375px;
  // height: 667px;
  width: 377px;
  border-radius: 10px;
  height: 668px;
  margin: auto;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.ak-drawer {
  position: absolute;
}
.ak-drawer-top {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}
.ak-drawer-bottom {
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.ak-dialog {
  // background: #f7f7f7;
  border-radius: 8px;
}

.font {
  display: flex;

  .right {
    color: #a8d03d !important;
    font-weight: 500;
    border-left: 1px solid #dddddd;
  }

  .left,
  .right {
    width: 50%;
    text-align: center;
    padding: 11px 0;
    color: #333333;
    font-size: 12px;
    border-top: 1px solid #dddddd;
  }
}
</style>
