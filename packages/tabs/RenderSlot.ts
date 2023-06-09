import { defineComponent, h } from 'vue'

export default defineComponent({
  props: {
    slots: [Object, String]
  },
  setup(props) {
    return () => [h('div', {}, props.slots)]
  }
})
