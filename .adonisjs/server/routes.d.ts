import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'auth.web_login_page': { paramsTuple?: []; params?: {} }
    'auth.web_login': { paramsTuple?: []; params?: {} }
    'auth.web_logout': { paramsTuple?: []; params?: {} }
    'admin_panel.dashboard': { paramsTuple?: []; params?: {} }
    'admin_panel.reports': { paramsTuple?: []; params?: {} }
    'admin_panel.finance': { paramsTuple?: []; params?: {} }
    'admin_panel.settings': { paramsTuple?: []; params?: {} }
    'admin_panel.users': { paramsTuple?: []; params?: {} }
    'admin_panel.user_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.games': { paramsTuple?: []; params?: {} }
    'admin_panel.game_create': { paramsTuple?: []; params?: {} }
    'admin_panel.game_store': { paramsTuple?: []; params?: {} }
    'admin_panel.game_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.game_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.game_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.game_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.categories': { paramsTuple?: []; params?: {} }
    'admin_panel.category_create': { paramsTuple?: []; params?: {} }
    'admin_panel.category_store': { paramsTuple?: []; params?: {} }
    'admin_panel.category_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_update_availability': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.questions': { paramsTuple?: []; params?: {} }
    'admin_panel.question_create': { paramsTuple?: []; params?: {} }
    'admin_panel.question_store': { paramsTuple?: []; params?: {} }
    'admin_panel.question_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.question_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.question_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.question_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.media_assets': { paramsTuple?: []; params?: {} }
    'admin_panel_media_assets.store': { paramsTuple?: []; params?: {} }
    'admin_panel.content_pages': { paramsTuple?: []; params?: {} }
    'admin_panel.content_page_create': { paramsTuple?: []; params?: {} }
    'admin_panel.content_page_store': { paramsTuple?: []; params?: {} }
    'admin_panel.content_page_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.content_page_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.content_page_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.contact_messages': { paramsTuple?: []; params?: {} }
    'admin_panel.contact_message_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.user_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.contact_message_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.send_phone_otp': { paramsTuple?: []; params?: {} }
    'auth.verify_phone_otp': { paramsTuple?: []; params?: {} }
    'account.me': { paramsTuple?: []; params?: {} }
    'account.update_profile': { paramsTuple?: []; params?: {} }
    'account.change_password': { paramsTuple?: []; params?: {} }
    'account_history.game_history': { paramsTuple?: []; params?: {} }
    'account_history.game_history_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account_history.purchased_history': { paramsTuple?: []; params?: {} }
    'account_history.credit_transactions': { paramsTuple?: []; params?: {} }
    'content_pages.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'contact_messages.store': { paramsTuple?: []; params?: {} }
    'media_assets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'master_games.index': { paramsTuple?: []; params?: {} }
    'master_games.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'game_sessions.store': { paramsTuple?: []; params?: {} }
    'game_sessions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_sessions.update_teams': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_sessions.update_settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_sessions.select_optional_category': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_sessions.lock': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_session_payments.reserve_credits': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_session_payments.create_category_payment_intent': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gameplay.start': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gameplay.start_next_round': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gameplay.complete_round': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'roundId': ParamValue} }
    'gameplay.abandon_round': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'roundId': ParamValue} }
    'round_questions.assign_question': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'roundId': ParamValue} }
    'round_questions.score': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'roundId': ParamValue} }
    'round_questions.scoreboard': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gameplay.stop': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallet.show': { paramsTuple?: []; params?: {} }
    'payments.confirm': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_games.index': { paramsTuple?: []; params?: {} }
    'admin_games.store': { paramsTuple?: []; params?: {} }
    'admin_games.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_games.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_question_categories.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'admin_question_categories.store': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'admin_question_categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_question_categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_questions.index': { paramsTuple?: []; params?: {} }
    'admin_questions.store': { paramsTuple?: []; params?: {} }
    'admin_questions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_questions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_media_assets.index': { paramsTuple?: []; params?: {} }
    'admin_api_media_assets.store': { paramsTuple?: []; params?: {} }
    'admin_media_assets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_content_pages.index': { paramsTuple?: []; params?: {} }
    'admin_content_pages.store': { paramsTuple?: []; params?: {} }
    'admin_content_pages.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_content_pages.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_contact_messages.index': { paramsTuple?: []; params?: {} }
    'admin_contact_messages.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_contact_messages.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_reports.summary': { paramsTuple?: []; params?: {} }
    'admin_reports.payments': { paramsTuple?: []; params?: {} }
    'admin_reports.game_sessions': { paramsTuple?: []; params?: {} }
    'admin_reports.users': { paramsTuple?: []; params?: {} }
    'admin_reports.contact_messages': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'auth.web_login_page': { paramsTuple?: []; params?: {} }
    'admin_panel.dashboard': { paramsTuple?: []; params?: {} }
    'admin_panel.reports': { paramsTuple?: []; params?: {} }
    'admin_panel.finance': { paramsTuple?: []; params?: {} }
    'admin_panel.settings': { paramsTuple?: []; params?: {} }
    'admin_panel.users': { paramsTuple?: []; params?: {} }
    'admin_panel.user_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.games': { paramsTuple?: []; params?: {} }
    'admin_panel.game_create': { paramsTuple?: []; params?: {} }
    'admin_panel.game_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.game_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.categories': { paramsTuple?: []; params?: {} }
    'admin_panel.category_create': { paramsTuple?: []; params?: {} }
    'admin_panel.category_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.questions': { paramsTuple?: []; params?: {} }
    'admin_panel.question_create': { paramsTuple?: []; params?: {} }
    'admin_panel.question_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.question_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.media_assets': { paramsTuple?: []; params?: {} }
    'admin_panel.content_pages': { paramsTuple?: []; params?: {} }
    'admin_panel.content_page_create': { paramsTuple?: []; params?: {} }
    'admin_panel.content_page_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.contact_messages': { paramsTuple?: []; params?: {} }
    'admin_panel.contact_message_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'account.me': { paramsTuple?: []; params?: {} }
    'account_history.game_history': { paramsTuple?: []; params?: {} }
    'account_history.game_history_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account_history.purchased_history': { paramsTuple?: []; params?: {} }
    'account_history.credit_transactions': { paramsTuple?: []; params?: {} }
    'content_pages.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'media_assets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'master_games.index': { paramsTuple?: []; params?: {} }
    'master_games.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'game_sessions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'round_questions.scoreboard': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallet.show': { paramsTuple?: []; params?: {} }
    'admin_games.index': { paramsTuple?: []; params?: {} }
    'admin_games.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_question_categories.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'admin_question_categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_questions.index': { paramsTuple?: []; params?: {} }
    'admin_questions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_media_assets.index': { paramsTuple?: []; params?: {} }
    'admin_media_assets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_content_pages.index': { paramsTuple?: []; params?: {} }
    'admin_content_pages.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_contact_messages.index': { paramsTuple?: []; params?: {} }
    'admin_contact_messages.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_reports.summary': { paramsTuple?: []; params?: {} }
    'admin_reports.payments': { paramsTuple?: []; params?: {} }
    'admin_reports.game_sessions': { paramsTuple?: []; params?: {} }
    'admin_reports.users': { paramsTuple?: []; params?: {} }
    'admin_reports.contact_messages': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'auth.web_login_page': { paramsTuple?: []; params?: {} }
    'admin_panel.dashboard': { paramsTuple?: []; params?: {} }
    'admin_panel.reports': { paramsTuple?: []; params?: {} }
    'admin_panel.finance': { paramsTuple?: []; params?: {} }
    'admin_panel.settings': { paramsTuple?: []; params?: {} }
    'admin_panel.users': { paramsTuple?: []; params?: {} }
    'admin_panel.user_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.games': { paramsTuple?: []; params?: {} }
    'admin_panel.game_create': { paramsTuple?: []; params?: {} }
    'admin_panel.game_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.game_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.categories': { paramsTuple?: []; params?: {} }
    'admin_panel.category_create': { paramsTuple?: []; params?: {} }
    'admin_panel.category_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.questions': { paramsTuple?: []; params?: {} }
    'admin_panel.question_create': { paramsTuple?: []; params?: {} }
    'admin_panel.question_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.question_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.media_assets': { paramsTuple?: []; params?: {} }
    'admin_panel.content_pages': { paramsTuple?: []; params?: {} }
    'admin_panel.content_page_create': { paramsTuple?: []; params?: {} }
    'admin_panel.content_page_edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.contact_messages': { paramsTuple?: []; params?: {} }
    'admin_panel.contact_message_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'account.me': { paramsTuple?: []; params?: {} }
    'account_history.game_history': { paramsTuple?: []; params?: {} }
    'account_history.game_history_show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account_history.purchased_history': { paramsTuple?: []; params?: {} }
    'account_history.credit_transactions': { paramsTuple?: []; params?: {} }
    'content_pages.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'media_assets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'master_games.index': { paramsTuple?: []; params?: {} }
    'master_games.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'game_sessions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'round_questions.scoreboard': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallet.show': { paramsTuple?: []; params?: {} }
    'admin_games.index': { paramsTuple?: []; params?: {} }
    'admin_games.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_question_categories.index': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'admin_question_categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_questions.index': { paramsTuple?: []; params?: {} }
    'admin_questions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_media_assets.index': { paramsTuple?: []; params?: {} }
    'admin_media_assets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_content_pages.index': { paramsTuple?: []; params?: {} }
    'admin_content_pages.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_contact_messages.index': { paramsTuple?: []; params?: {} }
    'admin_contact_messages.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_reports.summary': { paramsTuple?: []; params?: {} }
    'admin_reports.payments': { paramsTuple?: []; params?: {} }
    'admin_reports.game_sessions': { paramsTuple?: []; params?: {} }
    'admin_reports.users': { paramsTuple?: []; params?: {} }
    'admin_reports.contact_messages': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.web_login': { paramsTuple?: []; params?: {} }
    'auth.web_logout': { paramsTuple?: []; params?: {} }
    'admin_panel.game_store': { paramsTuple?: []; params?: {} }
    'admin_panel.category_store': { paramsTuple?: []; params?: {} }
    'admin_panel.question_store': { paramsTuple?: []; params?: {} }
    'admin_panel_media_assets.store': { paramsTuple?: []; params?: {} }
    'admin_panel.content_page_store': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.send_phone_otp': { paramsTuple?: []; params?: {} }
    'auth.verify_phone_otp': { paramsTuple?: []; params?: {} }
    'contact_messages.store': { paramsTuple?: []; params?: {} }
    'game_sessions.store': { paramsTuple?: []; params?: {} }
    'game_sessions.select_optional_category': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_sessions.lock': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_session_payments.reserve_credits': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_session_payments.create_category_payment_intent': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gameplay.start': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gameplay.start_next_round': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gameplay.complete_round': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'roundId': ParamValue} }
    'gameplay.abandon_round': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'roundId': ParamValue} }
    'round_questions.assign_question': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'roundId': ParamValue} }
    'round_questions.score': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'roundId': ParamValue} }
    'gameplay.stop': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.confirm': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_games.store': { paramsTuple?: []; params?: {} }
    'admin_question_categories.store': { paramsTuple: [ParamValue]; params: {'gameId': ParamValue} }
    'admin_questions.store': { paramsTuple?: []; params?: {} }
    'admin_api_media_assets.store': { paramsTuple?: []; params?: {} }
    'admin_content_pages.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'admin_panel.game_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.question_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.content_page_update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_games.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_question_categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_questions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_content_pages.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'admin_panel.game_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.category_update_availability': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.question_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.content_page_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.user_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_panel.contact_message_update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.update_profile': { paramsTuple?: []; params?: {} }
    'account.change_password': { paramsTuple?: []; params?: {} }
    'game_sessions.update_teams': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'game_sessions.update_settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_contact_messages.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}