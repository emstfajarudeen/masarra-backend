import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DateFieldProps {
  name: string
  id?: string
  defaultValue?: string
  placeholder?: string
  className?: string
}

const WIRE_FORMAT = 'yyyy-MM-dd'
const DISPLAY_FORMAT = 'dd/MM/yyyy'

function parseWireDate(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, WIRE_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

/**
 * A shadcn date picker (Popover + Calendar) that stays compatible with
 * native GET forms by mirroring the selected date into a hidden input
 * using the `yyyy-MM-dd` wire format the backend already expects.
 */
export function DateField({ name, id, defaultValue, placeholder, className }: DateFieldProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => parseWireDate(defaultValue))
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <input type="hidden" name={name} value={date ? format(date, WIRE_FORMAT) : ''} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'w-[180px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, DISPLAY_FORMAT) : (placeholder ?? 'Pick a date')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              setDate(selected)
              setOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </>
  )
}
