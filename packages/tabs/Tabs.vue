<template>
  <div :class="`${prefixCls}-tabs ${tabPosition}`" ref="tabsEl">
    <slot></slot>
    <div class="tabs-nav hideScollbar" :style="{ width: tabsWidth ? tabsWidth + 'px' : '' }">
      <div class="tabs-scroll hideScollbar" id="nav" ref="tabsScrollEl">
        <div class="tabs-tab hideScollbar" ref="tabsTabEl" :style="transformStyle">
          <div
            v-for="(item, index) in paneSlots"
            :key="index"
            class="tabs-item"
            id="navitem"
            :class="{
              disabled: item.disabled,
              active: getShow(item, index)
            }"
            @click="tabsClick(item, index)"
          >
            <span v-if="item.label" :id="item.name">{{ item.label }}</span>
            <span v-else-if="item.slots?.label">
              <RenderSlot :slots="item.slots?.label()" />
            </span>
          </div>
        </div>
      </div>
    </div>
    <slot name="content"></slot>
    <div v-if="showContent" class="tabs-content">
      <template v-for="(slot, index) in paneSlots" :key="index">
        <div v-show="getShow(slot, index)">
          <RenderSlot :slots="slot.slots" />
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import prefixCls from '../prefix'
import { ref, onMounted, provide, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import RenderSlot from './RenderSlot'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    beforeLeave?: Function
    showContent?: boolean // 是否显示切换内容
    tabPosition?: 'top' | 'right' | 'bottom' | 'left'
    closable?: boolean // 显示关闭标签
  }>(),
  {
    modelValue: 'tab-1',
    showContent: true,
    tabPosition: 'top',
    closable: false
  }
)
const emits = defineEmits<{
  (e: 'update:modelValue', index: string): void
  (e: 'change', props: string, index: number): void
}>()

const activeKey = ref(props.modelValue)
const paneSlots: any = ref([])
const tabsEl = ref()
const tabsTabEl = ref()
const tabsScrollEl = ref() // 滚动区域
const isScroll = ref<boolean>(false) // 是否需要滚动
const moveWidth = ref<number>(0) // 已经移动的宽
const maxmoveWidth = ref<number>(0) // 已经移动的宽
const tabsWidth = ref<number>()
const transformStyle = computed(() => {
  console.log('需要的最后', moveWidth.value, maxmoveWidth.value)
  // 控制临界值限制
  if (moveWidth.value > maxmoveWidth.value) {
    moveWidth.value = maxmoveWidth.value + 4
  }
  if (moveWidth.value < 0) {
    moveWidth.value = 0
  }
  return {
    transform: `translateX(-${moveWidth.value}px)`
  }
})

// 滚动范围限制下
const scrollInit = () => {
  nextTick(() => {
    const nav = document.getElementById('nav')
    var flag // 鼠标按下
    var downX // 鼠标点击的x下标
    var scrollLeft // 当前元素滚动条的偏移量
    nav.addEventListener('mousedown', function (event) {
      event.stopPropagation()
      flag = true
      downX = event.clientX // 获取到点击的x下标
      scrollLeft = moveWidth.value // 获取当前元素滚动条的偏移量
    })
    nav.addEventListener('mousemove', function (event) {
      if (flag) {
        event.preventDefault()
        event.stopPropagation()
        var moveX = event.clientX // 获取移动的x轴
        var scrollX = moveX - downX // 当前移动的x轴下标减去刚点击下去的x轴下标得到鼠标滑动距离
        moveWidth.value = scrollLeft - scrollX // 鼠标按下的滚动条偏移量减去当前鼠标的滑动距离
      }
    })
    // 鼠标抬起停止拖动
    nav.addEventListener('mouseup', function () {
      flag = false
    })
    // 鼠标离开元素停止拖动
    nav.addEventListener('mouseleave', function (event) {
      flag = false
    })
  })
}
const prevNext = (type: string, index: number) => {
  // 滑动的距离
  moveWidth.value = type == 'next' ? moveWidth.value + 180 : moveWidth.value - 180
}
const tabsClick = (item: any, index: number) => {
  var idx = paneSlots.value.findIndex((item: any) => {
    return activeKey.value == item.name
  })
  if (activeKey.value == item.name) return
  if (tabsTabEl.value.offsetWidth > 375) {
    prevNext(idx < index ? 'next' : 'pre', index)
  }

  activeKey.value = item.name || 'tab-' + (index + 1)
  emits('change', item, index)
  emits('update:modelValue', activeKey.value)
}

onMounted(() => {
  maxmoveWidth.value = tabsTabEl.value.offsetWidth - tabsEl.value.offsetWidth - 20 //移动量
  setActiveKey() // 根据key定位
  scrollInit()
  window.addEventListener('resize', scrollInit, false)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', scrollInit, false)
})

provide(`${prefixCls}ChildrenList`, (slots: any) => {
  paneSlots.value.push(slots)
})
const getShow = (item: any, index: number) => {
  if (item.name) {
    return item.name === activeKey.value
  } else {
    return activeKey.value === 'tab-' + (index + 1)
  }
}
// 设置初始化值
const setActiveKey = () => {
  var idx = paneSlots.value.findIndex((item: any) => {
    return activeKey.value == item.name
  })
  let temp = document.getElementById(activeKey.value).getBoundingClientRect().x - document.getElementById('navitem').getBoundingClientRect().x
  if (idx == 0 || tabsTabEl.value.offsetWidth < 375) return
  console.log('需要的', paneSlots.value.length, moveWidth.value, maxmoveWidth.value)

  if (idx == paneSlots.value.length - 1) {
    moveWidth.value = maxmoveWidth.value
  } else {
    moveWidth.value = temp / 2 // temp移动量，/2居中处理
  }
}
</script>

<style>
#nav {
  overflow-x: auto;
  overflow-y: hidden;
  user-select: none;
}
.tabs-content,
.tabs-nav {
  width: 100%;
}
</style>
