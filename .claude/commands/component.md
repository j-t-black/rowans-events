# Create Nuxt UI Pro Component

Create a new Vue component using Nuxt UI 4 Pro conventions.

## Context
- This project uses Nuxt UI 4 Pro with dark theme
- Font is Fira Code (monospace)
- Accent color is #d0232a (red)
- Use `<script setup lang="ts">` syntax
- Prefer Nuxt UI components over custom HTML

## Common Nuxt UI Pro Components
- `<UButton>` - Buttons (color="primary" for accent)
- `<UCard>` - Content containers
- `<UTable>` - Data tables with sorting/actions
- `<USelect>` - Dropdown selects
- `<UInput>` - Text inputs
- `<UForm>` - Forms with validation
- `<UModal>` - Modal dialogs
- `<UDropdown>` - Dropdown menus
- `<UBadge>` - Status badges

## Template
```vue
<script setup lang="ts">
// Props
const props = defineProps<{
  // ...
}>()

// Emits
const emit = defineEmits<{
  // ...
}>()

// State and logic
</script>

<template>
  <!-- Use Nuxt UI components -->
</template>
```

Please specify:
1. Component name
2. Purpose/functionality
3. Props needed
4. Events to emit
