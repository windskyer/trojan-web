const Mixins = import.meta.glob('./svg/*.svg', { eager: true })

export default {
  mixins: Object.values(Mixins).map(v => v.default)
}
