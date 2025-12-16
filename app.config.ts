export default defineAppConfig({
  ui: {
    colors: {
      primary: 'red',
      neutral: 'zinc',
    },
    button: {
      defaultVariants: {
        color: 'primary',
      },
    },
    card: {
      slots: {
        root: 'bg-zinc-900 border-zinc-800',
      },
    },
    input: {
      slots: {
        root: 'bg-zinc-900 border-zinc-700',
      },
    },
    select: {
      slots: {
        root: 'bg-zinc-900 border-zinc-700',
      },
    },
  },
})
