import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  dir?: 'ltr' | 'rtl'
}

/**
 * Convenience wrapper around the Radix Select compound component.
 * Renders a fully custom dropdown while staying compatible with GET
 * forms: when `name` is provided, Radix emits a hidden native select
 * that participates in native form submission.
 */
export function SelectField({
  name,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder,
  disabled,
  className,
  dir,
}: SelectFieldProps) {
  return (
    <Select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      dir={dir}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
