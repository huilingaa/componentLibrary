<template>
  <div class="text-ellipsis" ref="boxEl">
    <template v-if="direction === 'start'">
      {{ isExpand ? textVisible : '' }}<span v-if="isEll" class="text-ellipsis-action" @click="onActionClick">{{ actionText }}</span
      >{{ isExpand ? '' : textVisible }}
    </template>
    <template v-else-if="direction === 'middle'">
      {{ mulText[1].length == 0 ? content : mulText[0] + mulText[1] }}
    </template>
    <template v-else>
      {{ textVisible }}
      <span v-if="isEll" :class="single && 'is-block'" class="text-ellipsis-action" @click="onActionClick">
        {{ actionText }}
        <img ref="arrowImg" src="@/assets/xiala.png" />
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import ResizeObserver from 'resize-observer-polyfill'
import tooltip from '../tooltip/index'
const props = defineProps({
  // 文本内容
  content: {
    type: String,
    default: '',
    required: true
  },
  // 省略行数
  rows: {
    type: Number,
    default: 2
  },
  // 省略位置
  direction: {
    type: String,
    default: 'end'
  },
  // 展开文案
  expandText: {
    type: String,
    default: '展开'
  },
  // 收起文案
  collapseText: {
    type: String,
    default: '收起'
  },
  // 省略点
  dot: {
    type: String,
    default: '...'
  },
  // 是否监听容器
  observer: {
    type: Boolean,
    default: true
  },
  // 操作按钮单独一行
  single: {
    type: Boolean,
    default: false
  }
})

const text = ref('') // 显示的省略文本内容
const mulText = ref(['', '']) // 显示的省略文本内容,direction=middle时,存储开头和结尾的省略文本
const isEll = ref(false) // 是否省略
const isExpand = ref(false) // 是否展开
const boxEl = ref<null | HTMLElement>(null) // 容器dom
const arrowImg = ref<null | HTMLElement>(null) // 箭头

const actionText = computed(() => {
  return isExpand.value ? props.collapseText : props.expandText
})

const textVisible = computed(() => {
  return isExpand.value ? props.content : text.value
})

function toNum(val: any): number {
  if (!val) return 0
  return parseFloat(val)
}

// 展开/收起点击
function onActionClick() {
  isExpand.value = !isExpand.value
}

// 监听容器尺寸变化
let observer: any
function observerBox() {
  if (!boxEl.value) return
  observer = new ResizeObserver(() => {
    calcContent()
  })
  observer.observe(boxEl.value)
}

// 移除监听容器尺寸变化
function unObserverBox() {
  if (!boxEl.value) return
  observer.unobserve(boxEl.value)
}

onBeforeMount(() => {
  calcContent()
})

onMounted(() => {
  props.observer && observerBox()
})

onUnmounted(() => {
  props.observer && unObserverBox()
})

watch(() => [props.content, props.rows, props.direction, props.single, props.expandText, props.dot], calcContent)

// 计算显示的内容
async function calcContent() {
  // 用新的div模拟文本内的容器环境
  function cloneBox() {
    if (!boxEl.value) return

    // 复制样式
    const originStyle = window.getComputedStyle(boxEl.value)
    const div = document.createElement('div')
    const styleNames: string[] = Array.prototype.slice.apply(originStyle)
    styleNames.forEach((name) => {
      div.style.setProperty(name, originStyle.getPropertyValue(name))
    })
    // 重置样式
    div.style.position = 'fixed'
    div.style.zIndex = '-9999'
    div.style.top = '-9999px'
    div.style.height = 'auto'
    div.style.minHeight = 'auto'
    div.style.maxHeight = 'auto'
    // 插入body
    div.textContent = props.content
    document.body.appendChild(div)
    return div
  }

  function calcEllText(div: HTMLElement, maxHeight: number) {
    switch (props.direction) {
      case 'middle':
        return calcEllTextMiddle(div, maxHeight)
      case 'start':
        return calcEllTextStart(div, maxHeight)
      default:
        return calcEllTextEnd(div, maxHeight)
    }
  }

  // 如果文本溢出了，就要去计算省略文本的内容是多少，从容器里将文本一个字一个字地拿出来，从末尾开始拿，拿到恰好容器的高度等于maxHeight，剩下就是省略文本了。
  // 为了加快拿的速度，此时可以使用二分法去加快计算的速度。

  // 计算省略的文本内容(结束位置)
  function calcEllTextEnd(div: HTMLElement, maxHeight: number) {
    // 二分法计算省略时的文本
    const { content, dot, expandText, single } = props
    let l = 0
    let r = content.length
    let res = -1

    // 图片占的位置arrowImg.value.offsetWidth，需要将图片的位置算上去，先用2个字的宽度替代 bug

    while (l <= r) {
      const mid = Math.floor((l + r) / 2)
      //
      div.textContent = content.slice(0, mid) + dot + (single ? '' : expandText) + expandText
      if (div.offsetHeight <= maxHeight) {
        // 未溢出
        l = mid + 1
        res = mid // 记录满足条件的值
      } else {
        // 溢出
        r = mid - 1
      }
    }
    return content.slice(0, res) + dot
  }

  // 计算省略的文本内容(开始位置)
  function calcEllTextStart(div: HTMLElement, maxHeight: number) {
    // 二分法计算省略时的文本
    const { content, dot, expandText } = props
    let l = 0
    let r = content.length
    let res = -1
    while (l <= r) {
      const mid = Math.floor((l + r) / 2)
      div.textContent = expandText + dot + content.slice(mid)
      if (div.offsetHeight <= maxHeight) {
        // 未溢出
        r = mid - 1
        res = mid // 记录满足条件的值
      } else {
        // 溢出
        l = mid + 1
      }
    }
    return dot + content.slice(res)
  }

  // 计算省略的文本内容(中间位置)
  function calcEllTextMiddle(div: HTMLElement, maxHeight: number) {
    // 二分法计算省略时的文本
    const { content, dot } = props
    let l = 0
    let r = content.length
    let res = -1
    while (l <= r) {
      const mid = Math.floor((l + r) / 2)
      div.textContent = content.slice(0, mid) + dot + content.slice(-mid)
      if (div.offsetHeight <= maxHeight) {
        // 未溢出
        l = mid + 1
        res = mid // 记录满足条件的值
      } else {
        // 溢出
        r = mid - 1
      }
    }
    return [content.slice(0, res) + dot, content.slice(-res)]
  }

  await nextTick()
  // 需要克隆一个样式、大小一样的容器，并设置 fixed 固定布局，插入到body下。避免频繁操作dom，并获取dom位置的值，触发多次重绘重排造成的性能卡顿
  const div = cloneBox()
  if (!div) return

  const { paddingBottom, paddingTop, lineHeight } = div.style
  // 最大高度: 行高 * 行数 + 上下内边距;
  // 补: 加上 1/2 为了增加最大高度的安全范围
  const maxHeight = (props.rows + 1 / 2) * toNum(lineHeight) + toNum(paddingTop) + toNum(paddingBottom)
  // 内容溢出,则进行文本省略
  if (maxHeight < div.offsetHeight) {
    isEll.value = true
    const ellText = calcEllText(div, maxHeight)
    if (Array.isArray(ellText)) {
      mulText.value = ellText
    } else {
      text.value = ellText
    }
  } else {
    // 内容未溢出
    isEll.value = false
    text.value = props.content
  }
  document.body.removeChild(div)
}
</script>

<style lang="scss" scoped>
.text-ellipsis {
  line-height: 1.5;
  white-space: pre-wrap;
}
.text-ellipsis-action {
  // display: flex;
  color: #a8d03d;
  cursor: pointer;
  &.is-block {
    display: block;
  }
  &:hover {
    opacity: 0.85;
  }
}
.text-ellipsis-action::after {
  // width: 10px;
  // height: 6px;
  // display: inline-block;
  // content: '';
  // background: url('@/assets/xiala.png') no-repeat;
  // background-size: contain;
  // margin-left: 2px;
}
</style>
