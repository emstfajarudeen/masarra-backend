import { BaseSeeder } from '@adonisjs/lucid/seeders'
import FunRule from '#models/fun_rule'

export default class FunRuleSeeder extends BaseSeeder {
  async run() {
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
  }
}
