import { AdminLayout } from '~/components/admin/admin_layout'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface SettingsPayload extends Record<string, JSONDataTypes> {
  runtime: Record<string, JSONDataTypes>
  localization: Record<string, JSONDataTypes>
  storage: Record<string, JSONDataTypes>
  auth: Record<string, JSONDataTypes>
  payments: Record<string, JSONDataTypes>
  gameplay: Record<string, JSONDataTypes>
}

export interface AdminSettingsProps extends Record<string, JSONDataTypes> {
  settings: SettingsPayload
}

const sections = [
  ['runtime', 'Runtime', 'بيئة التشغيل'],
  ['localization', 'Localization', 'اللغات والمحتوى'],
  ['storage', 'Storage', 'الوسائط والتخزين'],
  ['auth', 'Authentication', 'الدخول والتحقق'],
  ['payments', 'Payments', 'المدفوعات والأرصدة'],
  ['gameplay', 'Gameplay', 'قواعد اللعب'],
] as const

const AdminSettings: React.FC<AdminSettingsProps> = ({ settings }) => {
  return (
    <AdminLayout
      title="إعدادات النظام"
      subtitle="مرجع تشغيلي للإعدادات الحالية والقرارات المعمارية المهمة. هذه الصفحة قراءة فقط."
    >
      <section className="admin-detail-hero">
        <div>
          <span className="admin-kicker">System configuration</span>
          <h2>Read-only operational map</h2>
          <p>
            هذه الصفحة لا تعرض أي مفاتيح سرية. الهدف منها توضيح القواعد الحالية للفريق أثناء التطوير
            والمراجعة.
          </p>
        </div>
        <div className="admin-detail-score">
          <strong>AR</strong>
          <span>English-ready</span>
        </div>
      </section>

      <section className="admin-settings-grid">
        {sections.map(([key, title, caption]) => (
          <article className="admin-settings-card" key={key}>
            <div>
              <span>{title}</span>
              <h2>{caption}</h2>
            </div>
            <dl>
              {Object.entries(settings[key]).map(([itemKey, value]) => (
                <div key={itemKey}>
                  <dt>{itemKey}</dt>
                  <dd>{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Implementation notes</h2>
            <p>Rules that should remain consistent in later backend phases.</p>
          </div>
        </div>
        <div className="admin-detail-copy">
          <p>
            Keep payment provider integration isolated behind services, keep storage disk-specific
            logic inside the media storage layer, and preserve Arabic-first translations with
            English columns/translation rows ready for later content.
          </p>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminSettings
