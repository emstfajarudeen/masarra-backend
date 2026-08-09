import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface NumberChipsProps {
  values: number[]
  onChange: (values: number[]) => void
  placeholder?: string
  min?: number
}

export const NumberChips: React.FC<NumberChipsProps> = ({
  values,
  onChange,
  placeholder,
  min = 1,
}) => {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    const num = Number.parseInt(inputValue.trim(), 10)
    if (!Number.isNaN(num) && num >= min && !values.includes(num)) {
      onChange([...values, num].sort((a, b) => a - b))
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (num: number) => {
    onChange(values.filter((v) => v !== num))
  }

  return (
    <div className="admin-number-chips-container">
      <div className="flex items-center gap-2 max-w-[200px]">
        <Input
          type="number"
          min={min}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'أدخل رقماً'}
          className="text-center"
        />
        <Button
          type="button"
          onClick={handleAdd}
          variant="outline"
          className="shrink-0 h-10 w-10 p-0"
        >
          <Plus className="h-5 w-5 text-[var(--masarra-purple)]" />
        </Button>
      </div>
      <div className="admin-number-chips-list">
        {values.map((val) => (
          <span key={val} className="admin-number-chip">
            <span>{val}</span>
            <button
              type="button"
              onClick={() => handleRemove(val)}
              className="admin-number-chip-remove"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="text-xs text-[var(--masarra-muted)] italic">
            اضغط على زر (+) أو Enter لإضافة خيارات.
          </span>
        )}
      </div>
    </div>
  )
}
