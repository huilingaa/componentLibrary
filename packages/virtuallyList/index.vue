<template>
  <div class="list-view" @scroll="handleScroll">
    <div
      class="list-view-phantom"
      :style="{
        height: contentHeight
      }"
    ></div>
    <div ref="content" class="list-view-content">
      <div
        class="list-view-item"
        :style="{
          height: itemHeight + 'px'
        }"
        v-for="(item, index) in visibleData"
        :key="index"
      >
        <!-- <sort /> -->
        <img :src="item.image" />
        {{ item.name }}--{{ index }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ListView',
  props: {
    data: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 30
    },
    itemSizeGetter: {
      type: Function
    }
  },

  //
  computed: {
    contentHeight() {
      const { data, itemSizeGetter } = this
      let total = 0
      for (let i = 0, j = data.length; i < j; i++) {
        total += itemSizeGetter.call(null, data[i], i)
      }
      return total
    }
    // contentHeight() {
    //   return this.data.length * this.itemHeight + 'px'
    // }
  },

  mounted() {
    this.updateVisibleData()
  },

  data() {
    return {
      visibleData: []
    }
  },

  methods: {
    updateVisibleData(scrollTop) {
      scrollTop = scrollTop || 0
      const start = this.findNearestItemIndex(scrollTop)
      const end = this.findNearestItemIndex(scrollTop + this.$el.clientHeight)
      this.visibleData = this.data.slice(start, Math.min(end + 1, this.data.length))
      // 把可见区域的 top 设置为起始元素在整个列表中的位置（使用 transform 是为了更好的性能）
      this.$refs.content.style.webkitTransform = `translate3d(0, ${this.getItemSizeAndOffset(start).offset}px, 0)`
    },
    // updateVisibleData(scrollTop) {
    //   scrollTop = scrollTop || 0
    //   const visibleCount = Math.ceil(this.$el.clientHeight / this.itemHeight)
    //   const start = Math.floor(scrollTop / this.itemHeight)
    //   const end = start + visibleCount
    //   this.visibleData = this.data.slice(start, end)
    //
    //   this.$refs.content.style.webkitTransform = `translate3d(0, ${start * this.itemHeight}px, 0)`
    // },
    findNearestItemIndex(scrollTop) {
      const { data, itemSizeGetter } = this
      let total = 0
      for (let i = 0, j = data.length; i < j; i++) {
        const size = itemSizeGetter.call(null, data[i], i)
        total += size
        if (total >= scrollTop || i === j - 1) {
          return i
        }
      }

      return 0
    },
    getItemSizeAndOffset(index) {
      const { data, itemSizeGetter } = this
      let total = 0
      for (let i = 0, j = Math.min(index, data.length - 1); i <= j; i++) {
        const size = itemSizeGetter.call(null, data[i], i)

        if (i === j) {
          return {
            offset: total,
            size
          }
        }
        total += size
      }

      return {
        offset: 0,
        size: 0
      }
    },

    handleScroll() {
      const scrollTop = this.$el.scrollTop
      this.updateVisibleData(scrollTop)
    }
  }
}
</script>
<style scoped>
.list-view {
  height: 400px;
  overflow: auto;
  position: relative;
  border: 1px solid #aaa;
}

.list-view-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.list-view-content {
  left: 0;
  right: 0;
  top: 0;
  position: absolute;
}

.list-view-item {
  border-bottom: 1px solid red;
  /* background: red; */
  padding: 5px;
  color: #666;
  line-height: 30px;
  box-sizing: border-box;
}
.list-view-item img {
  width: 100%;
  height: 100px;
}
</style>
