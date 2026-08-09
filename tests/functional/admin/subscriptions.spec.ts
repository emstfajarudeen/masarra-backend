import SubscriptionPlan from '#models/subscription_plan'
import SubscriptionPlanTranslation from '#models/subscription_plan_translation'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createAdmin() {
  return User.create({
    firstName: 'Admin',
    lastName: 'Subs',
    email: `admin-subs-${Date.now()}@example.com`,
    phoneNumber: '+96551110001',
    password: 'Password123!',
    role: 'admin',
    termsAcceptedAt: DateTime.utc(),
  })
}

test.group('Admin subscription plans', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('blocks non-admin users from the subscriptions page', async ({ client }) => {
    const regular = await User.create({
      firstName: 'Regular',
      lastName: 'User',
      email: `user-subs-${Date.now()}@example.com`,
      phoneNumber: '+96551110002',
      password: 'Password123!',
      role: 'user',
      termsAcceptedAt: DateTime.utc(),
    })

    const response = await client
      .get('/admin/subscriptions')
      .loginAs(regular)
      .header('Accept', 'text/html')
    response.assertStatus(403)
  })

  test('creates, lists, edits and archives a subscription plan', async ({ client, assert }) => {
    const admin = await createAdmin()

    const createPage = await client
      .get('/admin/subscriptions/create')
      .loginAs(admin)
      .header('Accept', 'text/html')
    createPage.assertStatus(200)

    const store = await client
      .post('/admin/subscriptions')
      .loginAs(admin)
      .header('Accept', 'text/html')
      .form({
        slug: 'family-plan',
        status: 'published',
        title: 'باقة العائلة',
        priceAmount: '20.000',
        roundsGranted: 30,
        maxTeams: 6,
        isFeatured: true,
        badgeLabel: 'الأكثر شيوعاً',
        ctaLabel: 'اشترك الآن',
      })
    store.assertStatus(200)

    const plan = await SubscriptionPlan.findByOrFail('slug', 'family-plan')
    assert.equal(plan.status, 'published')
    assert.equal(plan.roundsGranted, 30)
    assert.equal(plan.maxTeams, 6)
    assert.isTrue(plan.isFeatured)
    assert.equal(plan.priceCurrency, 'KWD')
    assert.isNotNull(plan.publishedAt)

    const translation = await SubscriptionPlanTranslation.query()
      .where('subscription_plan_id', plan.id)
      .where('locale', 'ar')
      .firstOrFail()
    assert.equal(translation.title, 'باقة العائلة')

    const list = await client
      .get('/admin/subscriptions?status=published')
      .loginAs(admin)
      .header('Accept', 'text/html')
    list.assertStatus(200)

    const editPage = await client
      .get(`/admin/subscriptions/${plan.id}/edit`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    editPage.assertStatus(200)

    const detail = await client
      .get(`/admin/subscriptions/${plan.id}`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    detail.assertStatus(200)

    const statusChange = await client
      .patch(`/admin/subscriptions/${plan.id}/status`)
      .form({ status: 'archived' })
      .loginAs(admin)
      .header('Accept', 'text/html')
    statusChange.assertStatus(200)

    await plan.refresh()
    assert.equal(plan.status, 'archived')
    assert.isNull(plan.publishedAt)
  })

  test('deletes a subscription plan', async ({ client, assert }) => {
    const admin = await createAdmin()

    const plan = await SubscriptionPlan.create({
      slug: 'starter-plan',
      status: 'draft',
      priceAmount: '2.000',
      priceCurrency: 'KWD',
      roundsGranted: 10,
      maxTeams: 6,
      isFeatured: false,
    })

    await SubscriptionPlanTranslation.create({
      subscriptionPlanId: plan.id,
      locale: 'ar',
      title: 'باقة البداية',
      metadata: {},
    })

    const destroy = await client
      .delete(`/admin/subscriptions/${plan.id}`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    destroy.assertStatus(200)

    const remaining = await SubscriptionPlan.find(plan.id)
    assert.isNull(remaining)

    const remainingTranslations = await SubscriptionPlanTranslation.query().where(
      'subscription_plan_id',
      plan.id
    )
    assert.lengthOf(remainingTranslations, 0)
  })
})
