import React, { useEffect, useRef } from 'react'
import 'quill/dist/quill.snow.css'

interface QuillEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Quill is uncontrolled by design: once mounted, Quill owns its own DOM and
 * internal Delta model. We only seed it with the initial value on mount and
 * report changes upward. We deliberately do NOT push the `value` prop back
 * into Quill on every keystroke — doing so (via raw `innerHTML` assignment)
 * fights Quill's own model, resets the cursor, and can throw, which breaks
 * typing entirely. If the caller needs to reset content programmatically
 * (e.g. switching records), remount this component with a `key` prop.
 */
export const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, placeholder }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<any>(null)

  // Use refs for callbacks/initial value to avoid re-initializing Quill when they change.
  const onChangeRef = useRef(onChange)
  const initialValueRef = useRef(value)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let active = true

    // Load Quill dynamically to avoid SSR errors
    import('quill').then(({ default: Quill }) => {
      if (!active || !container) return

      const quill = new Quill(container, {
        theme: 'snow',
        placeholder: placeholder || '',
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
          ],
        },
      })

      quillRef.current = quill

      if (initialValueRef.current) {
        quill.clipboard.dangerouslyPasteHTML(initialValueRef.current)
      }

      quill.on('text-change', () => {
        const html = quill.root.innerHTML
        onChangeRef.current(html === '<p><br></p>' ? '' : html)
      })
    })

    return () => {
      active = false
      if (container) {
        container.innerHTML = ''
      }
    }
    // Intentionally empty: Quill is initialized once per mount. See comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="border border-border rounded-md bg-white text-black quill-editor-wrapper">
      <div ref={containerRef} style={{ minHeight: '150px' }} />
    </div>
  )
}
