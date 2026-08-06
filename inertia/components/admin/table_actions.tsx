import { Eye, MoreVertical, Pencil, ScanEye, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown_menu'

export function EditIconLink({ href }: { href: string }) {
  return (
    <a href={href} className="admin-icon-btn" title="Edit" aria-label="Edit">
      <Pencil className="h-4 w-4" />
    </a>
  )
}

export function ViewIconLink({ href }: { href: string }) {
  return (
    <a href={href} className="admin-icon-btn" title="View" aria-label="View">
      <Eye className="h-4 w-4" />
    </a>
  )
}

export function PreviewIconLink({ href }: { href: string }) {
  return (
    <a href={href} className="admin-icon-btn" title="Preview" aria-label="Preview">
      <ScanEye className="h-4 w-4" />
    </a>
  )
}

/**
 * A 3-dot overflow menu for row actions. Currently hosts the Delete
 * action. `onDelete` is optional so the menu can be reused as more
 * overflow actions are added.
 */
export function RowActionMenu({
  onDelete,
  children,
}: {
  onDelete?: () => void
  children?: ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="admin-icon-btn" aria-label="More actions" title="More">
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {children}
        {onDelete ? (
          <DropdownMenuItem
            onSelect={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 />
            <span>Delete</span>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
