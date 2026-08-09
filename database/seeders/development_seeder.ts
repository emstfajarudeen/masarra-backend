import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Game from '#models/game'
import GameTranslation from '#models/game_translation'
import QuestionCategory from '#models/question_category'
import QuestionCategoryTranslation from '#models/question_category_translation'
import Question from '#models/question'
import QuestionTranslation from '#models/question_translation'
import GameSession from '#models/game_session'
import GameSessionTeam from '#models/game_session_team'
import GameSessionRound from '#models/game_session_round'
import CreditTransaction from '#models/credit_transaction'
import Payment from '#models/payment'
import ContentPage from '#models/content_page'
import ContentPageTranslation from '#models/content_page_translation'
import ContactMessage from '#models/contact_message'
import FunRule from '#models/fun_rule'
import MediaAsset from '#models/media_asset'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class DevelopmentSeeder extends BaseSeeder {
  async run() {
    // --- Fun Rules ---
    await FunRule.updateOrCreateMany('code', [
      {
        code: 'normal',
        nameAr: 'نقاط عادية',
        nameEn: 'Normal Points',
        descriptionAr: 'احتساب النقاط بشكل عادي بدون تأثيرات إضافية',
        descriptionEn: 'Standard scoring without additional effects',
        effectType: 'normal',
        config: {},
        isActive: true,
        sortOrder: 1,
      },
      {
        code: 'steal',
        nameAr: 'خصم 3 نقاط',
        nameEn: 'Steal 3 Points',
        descriptionAr: 'خصم 3 نقاط من الفرق المنافسة عند الإجابة الصحيحة',
        descriptionEn: 'Deduct 3 points from other teams upon correct answer',
        effectType: 'steal',
        config: { pointsStolen: 3 },
        isActive: true,
        sortOrder: 2,
      },
      {
        code: 'transfer',
        nameAr: 'تحويل النقاط',
        nameEn: 'Transfer Points',
        descriptionAr: 'تحويل نقاط السؤال للفريق المحدد',
        descriptionEn: 'Transfer question points to a chosen team',
        effectType: 'transfer',
        config: {},
        isActive: true,
        sortOrder: 3,
      },
      {
        code: 'freeze',
        nameAr: 'تجميد',
        nameEn: 'Freeze',
        descriptionAr: 'تجميد رصيد النقاط للجولات القادمة',
        descriptionEn: 'Freeze point balances for upcoming turns',
        effectType: 'freeze',
        config: {},
        isActive: true,
        sortOrder: 4,
      },
      {
        code: 'double',
        nameAr: 'مضاعفة',
        nameEn: 'Double Points',
        descriptionAr: 'مضاعفة نقاط السؤال الحالية',
        descriptionEn: 'Double the current question points',
        effectType: 'double',
        config: { multiplier: 2 },
        isActive: true,
        sortOrder: 5,
      },
    ])

    // --- Users (regular players) ---
    const users = await User.updateOrCreateMany('email', [
      {
        firstName: 'أحمد',
        lastName: 'الشمري',
        email: 'ahmed@example.com',
        phoneNumber: '+96550001111',
        password: 'password',
        status: 'active',
        role: 'user',
        preferredLocale: 'ar',
        emailVerifiedAt: DateTime.now(),
        phoneVerifiedAt: DateTime.now(),
        termsAcceptedAt: DateTime.now().minus({ days: 30 }),
      },
      {
        firstName: 'فاطمة',
        lastName: 'العلي',
        email: 'fatima@example.com',
        phoneNumber: '+96550002222',
        password: 'password',
        status: 'active',
        role: 'user',
        preferredLocale: 'ar',
        emailVerifiedAt: DateTime.now(),
        phoneVerifiedAt: DateTime.now(),
        termsAcceptedAt: DateTime.now().minus({ days: 25 }),
      },
      {
        firstName: 'محمد',
        lastName: 'الراشد',
        email: 'mohammed@example.com',
        phoneNumber: '+96550003333',
        password: 'password',
        status: 'active',
        role: 'user',
        preferredLocale: 'ar',
        emailVerifiedAt: DateTime.now(),
        phoneVerifiedAt: DateTime.now(),
        termsAcceptedAt: DateTime.now().minus({ days: 20 }),
      },
      {
        firstName: 'نورة',
        lastName: 'الصالح',
        email: 'noura@example.com',
        phoneNumber: '+96550004444',
        password: 'password',
        status: 'active',
        role: 'user',
        preferredLocale: 'en',
        emailVerifiedAt: DateTime.now(),
        phoneVerifiedAt: DateTime.now(),
        termsAcceptedAt: DateTime.now().minus({ days: 15 }),
      },
      {
        firstName: 'عبدالله',
        lastName: 'الكندري',
        email: 'abdullah@example.com',
        phoneNumber: '+96550005555',
        password: 'password',
        status: 'suspended',
        role: 'user',
        preferredLocale: 'ar',
        emailVerifiedAt: DateTime.now(),
        phoneVerifiedAt: null,
        termsAcceptedAt: DateTime.now().minus({ days: 10 }),
      },
      {
        firstName: 'سارة',
        lastName: 'المطيري',
        email: 'sara@example.com',
        phoneNumber: '+96550006666',
        password: 'password',
        status: 'active',
        role: 'user',
        preferredLocale: 'ar',
        emailVerifiedAt: DateTime.now(),
        phoneVerifiedAt: DateTime.now(),
        termsAcceptedAt: DateTime.now().minus({ days: 5 }),
      },
    ])

    // --- Games ---
    const games = await Game.updateOrCreateMany('slug', [
      {
        slug: 'masarra-classic',
        status: 'published',
        minTeamCount: 2,
        maxTeamCount: 6,
        allowedRoundCounts: JSON.stringify([5, 10, 15]) as any,
        allowedQuestionDurations: JSON.stringify([30, 40, 60]) as any,
        baseRoundCreditCost: 1,
        optionalCategoriesEnabled: true,
        sortOrder: 1,
        publishedAt: DateTime.now().minus({ days: 60 }),
      },
      {
        slug: 'masarra-speed',
        status: 'published',
        minTeamCount: 2,
        maxTeamCount: 4,
        allowedRoundCounts: JSON.stringify([5, 10]) as any,
        allowedQuestionDurations: JSON.stringify([15, 20]) as any,
        baseRoundCreditCost: 2,
        optionalCategoriesEnabled: false,
        sortOrder: 2,
        publishedAt: DateTime.now().minus({ days: 30 }),
      },
      {
        slug: 'masarra-challenge',
        status: 'draft',
        minTeamCount: 2,
        maxTeamCount: 8,
        allowedRoundCounts: JSON.stringify([10, 20]) as any,
        allowedQuestionDurations: JSON.stringify([30, 45]) as any,
        baseRoundCreditCost: 1,
        optionalCategoriesEnabled: true,
        sortOrder: 3,
        publishedAt: null,
      },
    ])

    // --- Game Translations ---
    for (const game of games) {
      await GameTranslation.updateOrCreate(
        { gameId: game.id, locale: 'ar' },
        {
          gameId: game.id,
          locale: 'ar',
          title:
            game.slug === 'masarra-classic'
              ? 'مسرّة كلاسيك'
              : game.slug === 'masarra-speed'
                ? 'مسرّة سبيد'
                : 'مسرّة تحدي',
          description:
            game.slug === 'masarra-classic'
              ? 'اللعبة الأساسية للمعارف العامة مع فرق متعددة وجولات مرنة.'
              : game.slug === 'masarra-speed'
                ? 'نسخة سريعة بأسئلة قصيرة وتوقيت ضيق.'
                : 'تحديات متقدمة مع ميكانيكيات سرقة وتجميد النقاط.',
          instructions: 'قسّموا أنفسكم لفرق، اختاروا عدد الجولات، وابدأوا المنافسة!',
          metadata: {},
        }
      )
    }

    // --- Question Categories ---
    const classicGame = games.find((g) => g.slug === 'masarra-classic')!
    const categories = await QuestionCategory.updateOrCreateMany('slug', [
      {
        gameId: classicGame.id,
        slug: 'ramadan-2026',
        status: 'published',
        priceAmount: '2.000',
        priceCurrency: 'KWD',
        sortOrder: 1,
        publishedAt: DateTime.now().minus({ days: 45 }),
      },
      {
        gameId: classicGame.id,
        slug: 'national-day',
        status: 'published',
        priceAmount: '1.500',
        priceCurrency: 'KWD',
        sortOrder: 2,
        publishedAt: DateTime.now().minus({ days: 30 }),
      },
      {
        gameId: classicGame.id,
        slug: 'eid-pack',
        status: 'draft',
        priceAmount: '2.500',
        priceCurrency: 'KWD',
        sortOrder: 3,
        publishedAt: null,
      },
    ])

    for (const category of categories) {
      const title =
        category.slug === 'ramadan-2026'
          ? 'رمضان 2026'
          : category.slug === 'national-day'
            ? 'اليوم الوطني'
            : 'حزمة العيد'
      await QuestionCategoryTranslation.updateOrCreate(
        { questionCategoryId: category.id, locale: 'ar' },
        {
          questionCategoryId: category.id,
          locale: 'ar',
          title,
          description: `أسئلة خاصة بمناسبة ${title}`,
          metadata: {},
        }
      )
    }

    // --- Questions (10 per game, some with category) ---
    const questionData = [
      { prompt: 'ما هي عاصمة الكويت؟', answer: 'الكويت', type: 'knowledge' as const },
      { prompt: 'كم عدد محافظات الكويت؟', answer: '6', type: 'knowledge' as const },
      { prompt: 'متى استقلت الكويت؟', answer: '1961', type: 'knowledge' as const },
      { prompt: 'ما هو أطول برج في الكويت؟', answer: 'برج الحمراء', type: 'knowledge' as const },
      { prompt: 'ما اسم العملة الكويتية؟', answer: 'الدينار الكويتي', type: 'knowledge' as const },
      { prompt: 'تحدّ: اذكر 5 دول خليجية في 15 ثانية', answer: null, type: 'challenge' as const },
      {
        prompt: 'من هو مؤسس الكويت الحديثة؟',
        answer: 'الشيخ مبارك الصباح',
        type: 'knowledge' as const,
      },
      { prompt: 'ما هو الطبق الشعبي الأشهر؟', answer: 'المچبوس', type: 'knowledge' as const },
      { prompt: 'تحدّ: ارسم علم الكويت في 20 ثانية', answer: null, type: 'challenge' as const },
      { prompt: 'كم عدد أبراج الكويت؟', answer: '3', type: 'knowledge' as const },
      { prompt: 'ما هو أكبر حقل نفطي في الكويت؟', answer: 'حقل برقان', type: 'knowledge' as const },
      { prompt: 'في أي سنة بُني سور الكويت الثالث؟', answer: '1920', type: 'knowledge' as const },
      {
        prompt: 'ما هو أول مسجد بُني في الكويت؟',
        answer: 'مسجد الخليفة',
        type: 'knowledge' as const,
      },
      { prompt: 'تحدّ: اذكر 3 أسواق كويتية قديمة', answer: null, type: 'challenge' as const },
      { prompt: 'ما اسم جزيرة كويتية مشهورة؟', answer: 'فيلكا', type: 'knowledge' as const },
    ]

    const questions: Question[] = []
    for (const [i, qd] of questionData.entries()) {
      const gameId = i < 10 ? classicGame.id : games[1].id
      const categoryId = i < 3 ? categories[0].id : i < 5 ? categories[1].id : null

      const question = await Question.updateOrCreate(
        { gameId, sortOrder: i + 1 },
        {
          gameId,
          questionCategoryId: categoryId,
          status: i < 12 ? 'published' : 'draft',
          type: qd.type,
          basePoints: qd.type === 'challenge' ? 10 : 5,
          sortOrder: i + 1,
          metadata: { contentMode: 'text', effectLogic: i % 5 === 0 ? 'double' : 'normal' },
          publishedAt: i < 12 ? DateTime.now().minus({ days: 20 - i }) : null,
        }
      )

      await QuestionTranslation.updateOrCreate(
        { questionId: question.id, locale: 'ar' },
        {
          questionId: question.id,
          locale: 'ar',
          prompt: qd.prompt,
          correctAnswer: qd.answer,
          explanation: qd.answer ? `الجواب الصحيح هو: ${qd.answer}` : null,
          metadata: {},
        }
      )

      questions.push(question)
    }

    // --- Game Sessions ---
    const sessionStatuses: Array<'completed' | 'active' | 'cancelled' | 'ready'> = [
      'completed',
      'completed',
      'completed',
      'active',
      'cancelled',
      'ready',
    ]

    for (let i = 0; i < 6; i++) {
      const host = users[i]
      const status = sessionStatuses[i]
      const selectedRoundCount = [5, 10, 5, 10, 5, 10][i]
      const completedRounds =
        status === 'completed' ? selectedRoundCount : status === 'active' ? 3 : 0

      const session = await GameSession.create({
        hostUserId: host.id,
        gameId: classicGame.id,
        optionalQuestionCategoryId: i < 2 ? categories[0].id : null,
        status,
        selectedRoundCount,
        selectedQuestionDuration: 30,
        creditReservationStatus:
          status === 'completed' ? 'forfeited' : status === 'active' ? 'reserved' : 'not_reserved',
        reservedCreditCount: selectedRoundCount,
        completedRoundCount: completedRounds,
        refundedCreditCount: status === 'cancelled' ? selectedRoundCount : 0,
        currentRoundNumber: status === 'active' ? 4 : null,
        startedAt: status !== 'ready' ? DateTime.now().minus({ hours: 3 - i }) : null,
        endedAt: status === 'completed' ? DateTime.now().minus({ hours: 2 - i }) : null,
        stoppedAt: status === 'cancelled' ? DateTime.now().minus({ hours: 1 }) : null,
        stopReason: status === 'cancelled' ? 'Host cancelled the session.' : null,
      })

      // Teams
      const teamColors = ['#4B7BEC', '#FC5C65', '#26DE81', '#FED330']
      const teamNames = ['النجوم', 'الأبطال', 'الصقور', 'الفرسان']
      const teams: GameSessionTeam[] = []
      for (let t = 0; t < 3; t++) {
        const team = await GameSessionTeam.create({
          gameSessionId: session.id,
          name: teamNames[t],
          normalizedName: teamNames[t].toLowerCase(),
          color: teamColors[t],
          score: status === 'completed' ? (3 - t) * 15 + Math.floor(Math.random() * 10) : 0,
          sortOrder: t + 1,
        })
        teams.push(team)
      }

      // Rounds
      for (let r = 0; r < completedRounds; r++) {
        const question = questions[r % questions.length]
        await GameSessionRound.create({
          gameSessionId: session.id,
          roundNumber: r + 1,
          status: 'completed',
          creditOutcome: 'charged',
          questionId: question.id,
          winnerTeamId: teams[r % teams.length].id,
          scoringRule: r % 4 === 0 ? 'double' : 'normal',
          awardedPoints: r % 4 === 0 ? 10 : 5,
          startedAt: DateTime.now().minus({ hours: 2, minutes: 30 - r * 3 }),
          completedAt: DateTime.now().minus({ hours: 2, minutes: 28 - r * 3 }),
          metadata: {},
        })
      }

      // Credit transactions for sessions
      if (status === 'completed' || status === 'active') {
        await CreditTransaction.create({
          userId: host.id,
          gameSessionId: session.id,
          type: 'reservation',
          amount: -selectedRoundCount,
          currency: 'KWD',
          idempotencyKey: `seed-reserve-${session.id}`,
          description: `حجز ${selectedRoundCount} أرصدة للجلسة`,
          metadata: {},
        })
      }
      if (status === 'cancelled') {
        await CreditTransaction.create({
          userId: host.id,
          gameSessionId: session.id,
          type: 'refund',
          amount: selectedRoundCount,
          currency: 'KWD',
          idempotencyKey: `seed-refund-${session.id}`,
          description: `استرجاع أرصدة الجلسة الملغاة`,
          metadata: {},
        })
      }
    }

    // --- Credit grants for users ---
    for (const user of users.slice(0, 4)) {
      await CreditTransaction.updateOrCreate(
        { userId: user.id, idempotencyKey: `seed-grant-${user.id}` },
        {
          userId: user.id,
          type: 'grant',
          amount: 20,
          currency: 'KWD',
          idempotencyKey: `seed-grant-${user.id}`,
          description: 'رصيد ترحيبي',
          metadata: {},
        }
      )
    }

    // --- Payments ---
    const paymentStatuses: Array<'paid' | 'pending' | 'failed'> = [
      'paid',
      'paid',
      'paid',
      'pending',
      'failed',
      'paid',
    ]
    for (let i = 0; i < 6; i++) {
      await Payment.create({
        userId: users[i].id,
        payableType: 'optional_category',
        method: i % 2 === 0 ? 'direct' : 'wallet',
        status: paymentStatuses[i],
        amount: categories[i % categories.length].priceAmount ?? '2.000',
        currency: 'KWD',
        provider: i % 2 === 0 ? 'tap' : null,
        providerReference: i % 2 === 0 ? `TAP-${randomUUID().slice(0, 8).toUpperCase()}` : null,
        idempotencyKey: `seed-payment-${i}-${users[i].id}`,
        metadata: {},
        paidAt: paymentStatuses[i] === 'paid' ? DateTime.now().minus({ days: 10 - i }) : null,
        expiresAt: paymentStatuses[i] === 'pending' ? DateTime.now().plus({ hours: 2 }) : null,
      })
    }

    // --- Content Pages ---
    const pageData = [
      {
        slug: 'terms',
        status: 'published' as const,
        title: 'الشروط والأحكام',
        body: 'هذه الشروط والأحكام تنظم استخدامك لمنصة مسرة. باستخدام المنصة، فإنك توافق على الالتزام بهذه الشروط.',
      },
      {
        slug: 'privacy',
        status: 'published' as const,
        title: 'سياسة الخصوصية',
        body: 'نحن في مسرة نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفقاً لأفضل الممارسات العالمية.',
      },
      {
        slug: 'about',
        status: 'published' as const,
        title: 'عن مسرة',
        body: 'مسرة هي منصة ألعاب معرفية تفاعلية للعائلة والأصدقاء. صُممت لتجمع الناس حول المعرفة والمرح.',
      },
      {
        slug: 'how-to-play',
        status: 'draft' as const,
        title: 'طريقة اللعب',
        body: 'اختر لعبة، كوّن فريقك، وابدأ الإجابة على الأسئلة. كل جولة تكلف رصيداً واحداً.',
      },
    ]

    for (const pd of pageData) {
      const page = await ContentPage.updateOrCreate(
        { slug: pd.slug },
        {
          slug: pd.slug,
          status: pd.status,
          sortOrder: pageData.indexOf(pd) + 1,
          publishedAt: pd.status === 'published' ? DateTime.now().minus({ days: 40 }) : null,
        }
      )
      await ContentPageTranslation.updateOrCreate(
        { contentPageId: page.id, locale: 'ar' },
        {
          contentPageId: page.id,
          locale: 'ar',
          title: pd.title,
          excerpt: pd.body.slice(0, 80),
          body: pd.body,
          metadata: {},
        }
      )
    }

    // --- Contact Messages ---
    const messages = [
      {
        name: 'خالد العنزي',
        email: 'khaled@gmail.com',
        msg: 'كيف أقدر أسترجع رصيدي بعد إلغاء الجلسة؟',
        status: 'new' as const,
      },
      {
        name: 'ريم المهنا',
        email: 'reem@outlook.com',
        msg: 'هل يمكنني إضافة أسئلة خاصة بي؟ أريد استخدام المنصة لحفلة عائلية.',
        status: 'reviewed' as const,
      },
      {
        name: 'يوسف الحربي',
        email: 'yousef@yahoo.com',
        msg: 'واجهت مشكلة في الدفع عبر tap. الرجاء المساعدة.',
        status: 'new' as const,
      },
      {
        name: 'منى الفضلي',
        email: 'mona@icloud.com',
        msg: 'شكراً على المنصة الرائعة! استمتعنا كثيراً في التجمع العائلي.',
        status: 'archived' as const,
      },
      {
        name: 'علي الدوسري',
        email: 'ali.d@gmail.com',
        msg: 'هل تدعمون اللغة الإنجليزية في الأسئلة؟',
        status: 'new' as const,
      },
    ]

    for (const m of messages) {
      await ContactMessage.updateOrCreate(
        { email: m.email },
        {
          fullName: m.name,
          email: m.email,
          message: m.msg,
          status: m.status,
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        }
      )
    }

    // --- Media Assets ---
    const mediaData = [
      { name: 'question-bg-1.jpg', mime: 'image/jpeg', ext: 'jpg', size: 245000 },
      { name: 'intro-video.mp4', mime: 'video/mp4', ext: 'mp4', size: 8500000 },
      { name: 'victory-sound.mp3', mime: 'audio/mpeg', ext: 'mp3', size: 320000 },
      { name: 'team-banner.png', mime: 'image/png', ext: 'png', size: 180000 },
      { name: 'celebration.mp4', mime: 'video/mp4', ext: 'mp4', size: 5200000 },
    ]

    for (const md of mediaData) {
      await MediaAsset.updateOrCreate(
        { originalName: md.name },
        {
          uploaderUserId: users[0].id,
          disk: 'local',
          visibility: 'public',
          originalName: md.name,
          fileName: `${randomUUID()}.${md.ext}`,
          mimeType: md.mime,
          extension: md.ext,
          sizeBytes: md.size,
          path: `uploads/${md.name}`,
          url: `/uploads/${md.name}`,
          metadata: {},
        }
      )
    }

    console.log('Development seed complete.')
  }
}
