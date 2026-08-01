/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  auth: {
    webLoginPage: typeof routes['auth.web_login_page']
    webLogin: typeof routes['auth.web_login']
    webLogout: typeof routes['auth.web_logout']
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    me: typeof routes['auth.me']
    logout: typeof routes['auth.logout']
    sendPhoneOtp: typeof routes['auth.send_phone_otp']
    verifyPhoneOtp: typeof routes['auth.verify_phone_otp']
  }
  adminPanel: {
    dashboard: typeof routes['admin_panel.dashboard']
    reports: typeof routes['admin_panel.reports']
    finance: typeof routes['admin_panel.finance']
    settings: typeof routes['admin_panel.settings']
    users: typeof routes['admin_panel.users']
    userShow: typeof routes['admin_panel.user_show']
    games: typeof routes['admin_panel.games']
    gameCreate: typeof routes['admin_panel.game_create']
    gameStore: typeof routes['admin_panel.game_store']
    gameEdit: typeof routes['admin_panel.game_edit']
    gameUpdate: typeof routes['admin_panel.game_update']
    gameUpdateStatus: typeof routes['admin_panel.game_update_status']
    gameShow: typeof routes['admin_panel.game_show']
    categories: typeof routes['admin_panel.categories']
    categoryCreate: typeof routes['admin_panel.category_create']
    categoryStore: typeof routes['admin_panel.category_store']
    categoryEdit: typeof routes['admin_panel.category_edit']
    categoryUpdate: typeof routes['admin_panel.category_update']
    categoryUpdateStatus: typeof routes['admin_panel.category_update_status']
    categoryUpdateAvailability: typeof routes['admin_panel.category_update_availability']
    categoryShow: typeof routes['admin_panel.category_show']
    questions: typeof routes['admin_panel.questions']
    questionCreate: typeof routes['admin_panel.question_create']
    questionStore: typeof routes['admin_panel.question_store']
    questionEdit: typeof routes['admin_panel.question_edit']
    questionUpdate: typeof routes['admin_panel.question_update']
    questionUpdateStatus: typeof routes['admin_panel.question_update_status']
    questionShow: typeof routes['admin_panel.question_show']
    mediaAssets: typeof routes['admin_panel.media_assets']
    contentPages: typeof routes['admin_panel.content_pages']
    contentPageCreate: typeof routes['admin_panel.content_page_create']
    contentPageStore: typeof routes['admin_panel.content_page_store']
    contentPageEdit: typeof routes['admin_panel.content_page_edit']
    contentPageUpdate: typeof routes['admin_panel.content_page_update']
    contentPageUpdateStatus: typeof routes['admin_panel.content_page_update_status']
    contactMessages: typeof routes['admin_panel.contact_messages']
    contactMessageShow: typeof routes['admin_panel.contact_message_show']
    userUpdateStatus: typeof routes['admin_panel.user_update_status']
    contactMessageUpdateStatus: typeof routes['admin_panel.contact_message_update_status']
  }
  adminPanelMediaAssets: {
    store: typeof routes['admin_panel_media_assets.store']
  }
  account: {
    me: typeof routes['account.me']
    updateProfile: typeof routes['account.update_profile']
    changePassword: typeof routes['account.change_password']
  }
  accountHistory: {
    gameHistory: typeof routes['account_history.game_history']
    gameHistoryShow: typeof routes['account_history.game_history_show']
    purchasedHistory: typeof routes['account_history.purchased_history']
    creditTransactions: typeof routes['account_history.credit_transactions']
  }
  contentPages: {
    show: typeof routes['content_pages.show']
  }
  contactMessages: {
    store: typeof routes['contact_messages.store']
  }
  mediaAssets: {
    show: typeof routes['media_assets.show']
  }
  masterGames: {
    index: typeof routes['master_games.index']
    show: typeof routes['master_games.show']
  }
  gameSessions: {
    store: typeof routes['game_sessions.store']
    show: typeof routes['game_sessions.show']
    updateTeams: typeof routes['game_sessions.update_teams']
    updateSettings: typeof routes['game_sessions.update_settings']
    selectOptionalCategory: typeof routes['game_sessions.select_optional_category']
    lock: typeof routes['game_sessions.lock']
  }
  gameSessionPayments: {
    reserveCredits: typeof routes['game_session_payments.reserve_credits']
    createCategoryPaymentIntent: typeof routes['game_session_payments.create_category_payment_intent']
  }
  gameplay: {
    start: typeof routes['gameplay.start']
    startNextRound: typeof routes['gameplay.start_next_round']
    completeRound: typeof routes['gameplay.complete_round']
    abandonRound: typeof routes['gameplay.abandon_round']
    stop: typeof routes['gameplay.stop']
  }
  roundQuestions: {
    assignQuestion: typeof routes['round_questions.assign_question']
    score: typeof routes['round_questions.score']
    scoreboard: typeof routes['round_questions.scoreboard']
  }
  wallet: {
    show: typeof routes['wallet.show']
  }
  payments: {
    confirm: typeof routes['payments.confirm']
  }
  adminGames: {
    index: typeof routes['admin_games.index']
    store: typeof routes['admin_games.store']
    show: typeof routes['admin_games.show']
    update: typeof routes['admin_games.update']
  }
  adminQuestionCategories: {
    index: typeof routes['admin_question_categories.index']
    store: typeof routes['admin_question_categories.store']
    show: typeof routes['admin_question_categories.show']
    update: typeof routes['admin_question_categories.update']
  }
  adminQuestions: {
    index: typeof routes['admin_questions.index']
    store: typeof routes['admin_questions.store']
    show: typeof routes['admin_questions.show']
    update: typeof routes['admin_questions.update']
  }
  adminMediaAssets: {
    index: typeof routes['admin_media_assets.index']
    show: typeof routes['admin_media_assets.show']
  }
  adminApiMediaAssets: {
    store: typeof routes['admin_api_media_assets.store']
  }
  adminContentPages: {
    index: typeof routes['admin_content_pages.index']
    store: typeof routes['admin_content_pages.store']
    show: typeof routes['admin_content_pages.show']
    update: typeof routes['admin_content_pages.update']
  }
  adminContactMessages: {
    index: typeof routes['admin_contact_messages.index']
    show: typeof routes['admin_contact_messages.show']
    updateStatus: typeof routes['admin_contact_messages.update_status']
  }
  adminReports: {
    summary: typeof routes['admin_reports.summary']
    payments: typeof routes['admin_reports.payments']
    gameSessions: typeof routes['admin_reports.game_sessions']
    users: typeof routes['admin_reports.users']
    contactMessages: typeof routes['admin_reports.contact_messages']
  }
}
