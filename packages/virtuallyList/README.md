- 分页 页面太丑
- 下拉加载(懒加载)，首屏速度快，但是采用 push 语句，会在滚动时数据太长导致页面的卡顿
- 长列表
  只加载可视区域数据，即虚拟列表

# 实现思路

> vue-virtual-scroller 源码分析，参考 react-virtualize

根据可视区的高度以及 items 中每一项的高度(itemSize，可为高度或者是横向滑动的宽度)来决定页面展示多少个 item，能显示的 item 包装后放到了 pool 数组中进行渲染，页面滚动的时候动态的修改 pool 数组。为了在滚动的时候尽可能的减少开销，pool 中超出范围的 view 会回收到复用池，pool 中新增的 view 会优先从复用池中取出 view，如果没有复用的才会新增。

参考：https://juejin.cn/post/6993899069932306446#heading-0

```
优化点：
- 根据渲染结果动态的更新列表项的高度
- 数据更新后让缓存失效，并尽可能让失效缓存的范围最小

## 缺点
- 需要一次性请求全部数据量，首屏速度会慢点，
```

# 第二种方案

把列表项划成到固定大小的 Section 内，滑动的时候直接根据 scrollHeight 和 scrollTop 计算要展示哪个 Section 即可，不需要任何查找
参考：https://github.com/bvaughn/react-virtualized/blob/master/source/Collection/SectionManager.js
