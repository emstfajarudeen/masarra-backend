import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/categories': ExtractProps<(typeof import('../../inertia/pages/admin/categories.tsx'))['default']>
    'admin/category_form': ExtractProps<(typeof import('../../inertia/pages/admin/category_form.tsx'))['default']>
    'admin/category_show': ExtractProps<(typeof import('../../inertia/pages/admin/category_show.tsx'))['default']>
    'admin/contact_message_show': ExtractProps<(typeof import('../../inertia/pages/admin/contact_message_show.tsx'))['default']>
    'admin/contact_messages': ExtractProps<(typeof import('../../inertia/pages/admin/contact_messages.tsx'))['default']>
    'admin/content_page_form': ExtractProps<(typeof import('../../inertia/pages/admin/content_page_form.tsx'))['default']>
    'admin/content_pages': ExtractProps<(typeof import('../../inertia/pages/admin/content_pages.tsx'))['default']>
    'admin/dashboard': ExtractProps<(typeof import('../../inertia/pages/admin/dashboard.tsx'))['default']>
    'admin/finance': ExtractProps<(typeof import('../../inertia/pages/admin/finance.tsx'))['default']>
    'admin/game_form': ExtractProps<(typeof import('../../inertia/pages/admin/game_form.tsx'))['default']>
    'admin/game_show': ExtractProps<(typeof import('../../inertia/pages/admin/game_show.tsx'))['default']>
    'admin/games': ExtractProps<(typeof import('../../inertia/pages/admin/games.tsx'))['default']>
    'admin/media_assets': ExtractProps<(typeof import('../../inertia/pages/admin/media_assets.tsx'))['default']>
    'admin/profile': ExtractProps<(typeof import('../../inertia/pages/admin/profile.tsx'))['default']>
    'admin/question_form': ExtractProps<(typeof import('../../inertia/pages/admin/question_form.tsx'))['default']>
    'admin/question_show': ExtractProps<(typeof import('../../inertia/pages/admin/question_show.tsx'))['default']>
    'admin/questions': ExtractProps<(typeof import('../../inertia/pages/admin/questions.tsx'))['default']>
    'admin/reports': ExtractProps<(typeof import('../../inertia/pages/admin/reports.tsx'))['default']>
    'admin/user_show': ExtractProps<(typeof import('../../inertia/pages/admin/user_show.tsx'))['default']>
    'admin/users': ExtractProps<(typeof import('../../inertia/pages/admin/users.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
  }
}
