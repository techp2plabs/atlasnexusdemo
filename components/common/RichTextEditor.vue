<template>
  <div class="rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800/50"
    >
      <template v-if="!isSourceMode">
        <button
          type="button"
          :class="btnClass(editor.isActive('bold'))"
          @click="editor.chain().focus().toggleBold().run()"
        >
          B
        </button>
        <button
          type="button"
          :class="btnClass(editor.isActive('italic'))"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <span class="italic">I</span>
        </button>
        <span class="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          :class="btnClass(editor.isActive('heading', { level: 1 }))"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          H1
        </button>
        <button
          type="button"
          :class="btnClass(editor.isActive('heading', { level: 2 }))"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </button>
        <button
          type="button"
          :class="btnClass(editor.isActive('heading', { level: 3 }))"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          H3
        </button>
        <span class="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          :class="btnClass(editor.isActive('bulletList'))"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          •
        </button>
        <button
          type="button"
          :class="btnClass(editor.isActive('orderedList'))"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          1.
        </button>
        <button
          type="button"
          :class="btnClass(editor.isActive('link'))"
          @click="setLink"
        >
          Link
        </button>
        <span class="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
        <button type="button" :class="btnClass(false)" @click="enterSourceMode">
          HTML
        </button>
      </template>
      <template v-else>
        <span class="px-1 text-xs font-medium text-gray-500 dark:text-gray-400">Editing raw HTML source</span>
        <span class="ml-auto flex items-center gap-1">
          <button type="button" :class="btnClass(false)" @click="cancelSourceMode">
            Cancel
          </button>
          <button
            type="button"
            class="rounded px-2 py-1 text-xs font-medium bg-brand-600 text-white hover:bg-brand-700"
            @click="applySourceMode"
          >
            Apply HTML
          </button>
        </span>
      </template>
    </div>
    <EditorContent
      v-if="!isSourceMode"
      :editor="editor"
      class="rich-text-content min-h-[200px] bg-white px-4 py-3 dark:bg-gray-900"
    />
    <textarea
      v-else
      v-model="sourceHtml"
      spellcheck="false"
      class="min-h-[200px] w-full resize-y bg-white px-4 py-3 font-mono text-xs text-gray-800 outline-none dark:bg-gray-900 dark:text-gray-100"
      placeholder="Paste raw HTML here, then click Apply HTML"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const btnClass = (active: boolean) => [
  'rounded px-2 py-1 text-xs font-medium transition-colors',
  active
    ? 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300'
    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
]

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
  ],
  onUpdate: ({ editor: ed }) => {
    emit('update:modelValue', ed.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value || '', { emitUpdate: false })
    }
  },
)

const isSourceMode = ref(false)
const sourceHtml = ref('')

const enterSourceMode = () => {
  if (!editor.value) return
  sourceHtml.value = editor.value.getHTML()
  isSourceMode.value = true
}

const applySourceMode = () => {
  if (!editor.value) return
  editor.value.commands.setContent(sourceHtml.value || '', { emitUpdate: true })
  isSourceMode.value = false
}

const cancelSourceMode = () => {
  isSourceMode.value = false
}

const setLink = () => {
  if (!editor.value) return
  const previousUrl = editor.value.getAttributes('link').href as string | undefined
  const url = window.prompt('URL', previousUrl || 'https://')
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.rich-text-content .tiptap {
  outline: none;
  min-height: 180px;
}

.rich-text-content .tiptap h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.75rem 0 0.5rem;
}

.rich-text-content .tiptap h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

.rich-text-content .tiptap h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
}

.rich-text-content .tiptap p {
  margin: 0.5rem 0;
}

.rich-text-content .tiptap ul,
.rich-text-content .tiptap ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.rich-text-content .tiptap a {
  color: #7c3aed;
  text-decoration: underline;
}
</style>
