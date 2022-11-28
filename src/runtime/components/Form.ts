import FormImpl from './FormImpl'
import { defineComponent } from '#imports'

export default defineComponent({
  props: {
    replace: {
      type: Boolean,
      default: false,
    },
    onSubmit: {
      type: Function,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    return () => h(FormImpl, { ...props }, slots.default)
  },
})
