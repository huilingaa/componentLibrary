<template>
  <transition>
    <div>
      <div class="boxAllloading" v-if="type == 'loadingAll' && isActive"></div>
      <div v-show="isActive" :class="['c-toast', `c-toast--${type}`]">
        <div class="loading" v-if="type.includes('loading')"></div>
        {{ message }}
      </div>
    </div>
  </transition>
</template>

<script>
import { removeElement } from './helpers/remove-element'
import eventBus from './helpers/event-bus'

export default {
  name: 'toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'default'
    },
    duration: {
      type: [Number, Boolean],
      default: 500
    },
    onClose: {
      type: Function,
      default: () => {}
    },
    onClick: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      isActive: false,
      parentTop: null,
      parent: null,
      isHovered: false,
      timer: null
    }
  },
  beforeMount() {
    this.createParents()
  },
  mounted() {
    this.showNotice()
    if (this.duration && !this.type.includes('loading')) {
      // 如果传入的值为0可以持续保留在页面，需要手动销毁
      const timer = setTimeout(() => {
        this.close()
        clearTimeout(timer)
      }, this.duration)
    }
    eventBus.$on('toast-clear', this.close)
  },
  methods: {
    createParents() {
      this.parent = document.querySelector('.c-toast-container')
      if (!this.parent) {
        this.parent = document.createElement('div')
        this.parent.className = 'c-toast-container'
      }
      const container = document.body
      container.appendChild(this.parent)
    },
    showNotice() {
      this.parent.insertAdjacentElement('afterbegin', this.$el)
      this.isActive = true
    },
    close() {
      this.isActive = false
      eventBus.$emit('close')
      setTimeout(() => {
        this.onClose.apply(null, arguments)
        removeElement(this.$el)
      }, 150)
    }
  },
  beforeUnmount() {
    eventBus.$off('toast-clear', this.close)
  }
}
</script>
<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}
.boxAllloading {
  z-index: 1000;
  overflow-y: hidden;
  background: rgba(55, 55, 55, 0.6);
  position: absolute;
  width: 377px;
  border-radius: 10px;
  height: 668px;
  margin: auto;
  top: 0;
  left: 0 !important;
  bottom: 0;
  right: 0;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.c-toast {
  max-width: 280px;
  z-index: 11111111111;
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 6px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-toast--loading,
.c-toast--loadingAll {
  display: flex;
  flex-direction: column;
  padding: 0;
  width: 128px;
  height: 128px;
  background: #4c4c4c;
  border-radius: 10px;
  font-weight: 500;
  color: #ffffff;
}

.loading {
  width: 30px;
  height: 30px;
  margin-bottom: 8px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 100%;
  animation: circle infinite 0.75s linear;
}

@keyframes circle {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

.c-toast--info {
  max-width: 250px;
  word-break: break-all !important;
  /* word-wrap: break-word;
   */
  background: #4c4c4c;
  color: #ffffff;
}

.c-toast--success {
  background: #f1f9ec;
  color: #7bc032;
  border: 1px solid #7bc032;
}

.c-toast--error {
  background: #fdf1f1;
  color: #e76567;
  border: 1px solid #e76567;
}
</style>
