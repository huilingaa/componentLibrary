# 采用这种形式才能实现样式高度自定义，关于它的三种形式，通过组件二实现

```js
   // 最基本的点击选中，样式class自定义 simple
   <tk-select v-model="state.modelTokenValue">
          <div class="showSelect">
            <img :src="state.modelTokenValue.value.img" class="selectImg" />
            <span class="font_3">{{ state.modelTokenValue.value.crypto }}</span>
          </div>
          <template #selectDropDown>
            <tk-select-item class="select-option li" :value="item" v-for="(item, index) in state.tokenList" :key="index">
              <img :src="item.img" class="selectImg" />
              <span class="font_3">{{ item.crypto }}</span>
            </tk-select-item>
          </template>
   </tk-select>
```

- 目前的三种形式

- mode="inputSelect"

`typeSelect：['simple','inputSelect','pushItem']`

# 阶段一

#### inputselect 类型的，只需要在 tk-select 上加 typeSelect="inputSelect"

#### pushItem 类型的

```js
 mode="plus"  @click=" (e) => {e.stopPropagation()}"
```
