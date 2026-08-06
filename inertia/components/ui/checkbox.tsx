import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId

    return (
      <label htmlFor={inputId} className={cn('ui-checkbox', disabled && 'is-disabled', className)}>
        <input
          id={inputId}
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className="ui-checkbox-input"
          {...props}
        />
        <span className="ui-checkbox-control" aria-hidden="true">
          <Check className="ui-checkbox-icon" strokeWidth={3} />
        </span>
        {label ? <span className="ui-checkbox-label">{label}</span> : null}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
