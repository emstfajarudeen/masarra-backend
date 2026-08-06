/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.web_login_page': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['webLoginPage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['webLoginPage']>>>
    }
  }
  'auth.web_login': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['webLogin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['webLogin']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.web_logout': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['webLogout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['webLogout']>>>
    }
  }
  'admin_panel.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['dashboard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['dashboard']>>>
    }
  }
  'admin_panel.reports': {
    methods: ["GET","HEAD"]
    pattern: '/admin/reports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['reports']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['reports']>>>
    }
  }
  'admin_panel.finance': {
    methods: ["GET","HEAD"]
    pattern: '/admin/finance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['finance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['finance']>>>
    }
  }
  'admin_panel.profile': {
    methods: ["GET","HEAD"]
    pattern: '/admin/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['profile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['profile']>>>
    }
  }
  'admin_panel.profile_update_password': {
    methods: ["PATCH"]
    pattern: '/admin/profile/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelPasswordChangeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelPasswordChangeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['profileUpdatePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['profileUpdatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.users': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelUserListFilterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['users']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['users']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.user_show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['userShow']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['userShow']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.games': {
    methods: ["GET","HEAD"]
    pattern: '/admin/games'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelGameListFilterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['games']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['games']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.game_create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/games/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameCreate']>>>
    }
  }
  'admin_panel.game_store': {
    methods: ["POST"]
    pattern: '/admin/games'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelGameFormValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelGameFormValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameStore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameStore']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.game_edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/games/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameEdit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.game_update': {
    methods: ["PUT"]
    pattern: '/admin/games/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelGameFormValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelGameFormValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.game_update_status': {
    methods: ["PATCH"]
    pattern: '/admin/games/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelPublishStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelPublishStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameUpdateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameUpdateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.game_show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/games/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameShow']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['gameShow']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.categories': {
    methods: ["GET","HEAD"]
    pattern: '/admin/categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelCategoryListFilterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categories']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categories']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.category_create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/categories/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryCreate']>>>
    }
  }
  'admin_panel.category_store': {
    methods: ["POST"]
    pattern: '/admin/categories'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelCategoryFormValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelCategoryFormValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryStore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryStore']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.category_edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/categories/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryEdit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.category_update': {
    methods: ["PUT"]
    pattern: '/admin/categories/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelCategoryFormValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelCategoryFormValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.category_update_status': {
    methods: ["PATCH"]
    pattern: '/admin/categories/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelPublishStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelPublishStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryUpdateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryUpdateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.category_show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryShow']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['categoryShow']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.questions': {
    methods: ["GET","HEAD"]
    pattern: '/admin/questions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelQuestionListFilterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questions']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.question_create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/questions/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionCreate']>>>
    }
  }
  'admin_panel.question_store': {
    methods: ["POST"]
    pattern: '/admin/questions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelQuestionFormValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelQuestionFormValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionStore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionStore']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.question_edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/questions/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionEdit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.question_update': {
    methods: ["PUT"]
    pattern: '/admin/questions/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelQuestionFormValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelQuestionFormValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.question_update_status': {
    methods: ["PATCH"]
    pattern: '/admin/questions/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelPublishStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelPublishStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionUpdateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionUpdateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.question_show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/questions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionShow']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['questionShow']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.media_assets': {
    methods: ["GET","HEAD"]
    pattern: '/admin/media-assets'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelMediaLibraryFilterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['mediaAssets']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['mediaAssets']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel_media_assets.store': {
    methods: ["POST"]
    pattern: '/admin/media-assets'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/media_assets').adminMediaAssetUploadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/media_assets').adminMediaAssetUploadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/media_assets_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/media_assets_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.content_pages': {
    methods: ["GET","HEAD"]
    pattern: '/admin/content-pages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContentPageListFilterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPages']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.content_page_create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/content-pages/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageCreate']>>>
    }
  }
  'admin_panel.content_page_store': {
    methods: ["POST"]
    pattern: '/admin/content-pages'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContentPageFormValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContentPageFormValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageStore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageStore']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.content_page_edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/content-pages/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageEdit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.content_page_update': {
    methods: ["PUT"]
    pattern: '/admin/content-pages/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContentPageFormValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContentPageFormValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.content_page_update_status': {
    methods: ["PATCH"]
    pattern: '/admin/content-pages/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContentPublishStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContentPublishStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageUpdateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contentPageUpdateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.contact_messages': {
    methods: ["GET","HEAD"]
    pattern: '/admin/contact-messages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContactMessageListFilterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contactMessages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contactMessages']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.contact_message_show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/contact-messages/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contactMessageShow']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contactMessageShow']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.user_update_status': {
    methods: ["PATCH"]
    pattern: '/admin/users/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelUserStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelUserStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['userUpdateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['userUpdateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_panel.contact_message_update_status': {
    methods: ["PATCH"]
    pattern: '/admin/contact-messages/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContactStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_panel_forms').adminPanelContactStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contactMessageUpdateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/panel_controller').default['contactMessageUpdateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.register': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'auth.send_phone_otp': {
    methods: ["POST"]
    pattern: '/api/v1/auth/otp/phone/send'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['sendPhoneOtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['sendPhoneOtp']>>>
    }
  }
  'auth.verify_phone_otp': {
    methods: ["POST"]
    pattern: '/api/v1/auth/otp/phone/verify'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').verifyOtpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').verifyOtpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['verifyPhoneOtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['verifyPhoneOtp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_controller').default['me']>>>
    }
  }
  'account.update_profile': {
    methods: ["PATCH"]
    pattern: '/api/v1/account/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/account').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/account').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_controller').default['updateProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_controller').default['updateProfile']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.change_password': {
    methods: ["PATCH"]
    pattern: '/api/v1/account/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/account').changePasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/account').changePasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_controller').default['changePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_controller').default['changePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account_history.game_history': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/game-history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/account_history').accountHistoryListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_history_controller').default['gameHistory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_history_controller').default['gameHistory']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account_history.game_history_show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/game-history/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/account_history').accountHistorySessionParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_history_controller').default['gameHistoryShow']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_history_controller').default['gameHistoryShow']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account_history.purchased_history': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/purchased-history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/account_history').accountPaymentHistoryListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_history_controller').default['purchasedHistory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_history_controller').default['purchasedHistory']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account_history.credit_transactions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/credit-transactions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/account_history').accountCreditTransactionListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_history_controller').default['creditTransactions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_history_controller').default['creditTransactions']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'content_pages.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/pages/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/content_page').showContentPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/content_pages_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/content_pages_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'contact_messages.store': {
    methods: ["POST"]
    pattern: '/api/v1/contact'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contact').submitContactMessageValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/contact').submitContactMessageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contact_messages_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contact_messages_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'media_assets.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/media-assets/:id/file'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/media_assets').mediaAssetIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media_assets_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media_assets_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'master_games.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/master/games'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/master_games_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/master_games_controller').default['index']>>>
    }
  }
  'master_games.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/master/games/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/master').showMasterGameValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/master_games_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/master_games_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'game_sessions.store': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/game_session').createGameSessionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/game_session').createGameSessionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'game_sessions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/game-sessions/:id/setup'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/game_session').gameSessionParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'game_sessions.update_teams': {
    methods: ["PATCH"]
    pattern: '/api/v1/game-sessions/:id/teams'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/game_session').updateGameSessionTeamsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/game_session').updateGameSessionTeamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['updateTeams']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['updateTeams']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'game_sessions.update_settings': {
    methods: ["PATCH"]
    pattern: '/api/v1/game-sessions/:id/settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/game_session').updateGameSessionSettingsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/game_session').updateGameSessionSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['updateSettings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['updateSettings']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'game_sessions.select_optional_category': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/optional-category'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/game_session').selectOptionalCategoryValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/game_session').selectOptionalCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['selectOptionalCategory']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['selectOptionalCategory']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'game_sessions.lock': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/lock'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/game_session').gameSessionParamsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/game_session').gameSessionParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['lock']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/game_sessions_controller').default['lock']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'game_session_payments.reserve_credits': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/reserve-credits'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/credit_reservation').reserveGameSessionCreditsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/credit_reservation').reserveGameSessionCreditsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/game_session_payments_controller').default['reserveCredits']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/game_session_payments_controller').default['reserveCredits']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'game_session_payments.create_category_payment_intent': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/category-payment-intent'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/payment').createCategoryPaymentIntentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/payment').createCategoryPaymentIntentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/game_session_payments_controller').default['createCategoryPaymentIntent']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/game_session_payments_controller').default['createCategoryPaymentIntent']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'gameplay.start': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/start'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gameplay').gameplaySessionParamsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gameplay').gameplaySessionParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['start']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['start']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'gameplay.start_next_round': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/rounds/next'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gameplay').gameplaySessionParamsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gameplay').gameplaySessionParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['startNextRound']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['startNextRound']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'gameplay.complete_round': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/rounds/:roundId/complete'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gameplay').completeRoundValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; roundId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gameplay').completeRoundValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['completeRound']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['completeRound']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'gameplay.abandon_round': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/rounds/:roundId/abandon'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gameplay').abandonRoundValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; roundId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gameplay').abandonRoundValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['abandonRound']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['abandonRound']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'round_questions.assign_question': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/rounds/:roundId/question'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/scoring').roundQuestionParamsValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; roundId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/scoring').roundQuestionParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/round_questions_controller').default['assignQuestion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/round_questions_controller').default['assignQuestion']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'round_questions.score': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/rounds/:roundId/score'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/scoring').scoreRoundValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; roundId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/scoring').scoreRoundValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/round_questions_controller').default['score']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/round_questions_controller').default['score']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'round_questions.scoreboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/game-sessions/:id/scoreboard'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gameplay').gameplaySessionParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/round_questions_controller').default['scoreboard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/round_questions_controller').default['scoreboard']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'gameplay.stop': {
    methods: ["POST"]
    pattern: '/api/v1/game-sessions/:id/stop'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gameplay').stopGameSessionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gameplay').stopGameSessionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['stop']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gameplay_controller').default['stop']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallet.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/wallet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['show']>>>
    }
  }
  'payments.confirm': {
    methods: ["POST"]
    pattern: '/api/v1/payments/:id/confirm'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/payment').confirmPaymentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/payment').confirmPaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['confirm']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/payments_controller').default['confirm']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_games.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/games'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/games_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/games_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_games.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/games'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').upsertAdminGameValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').upsertAdminGameValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/games_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/games_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_games.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/games/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/games_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/games_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_games.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/games/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').upsertAdminGameValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').upsertAdminGameValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/games_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/games_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_question_categories.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/games/:gameId/categories'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { gameId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminGameIdParamsValidator)>|InferInput<(typeof import('#validators/admin_cms').adminListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/question_categories_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/question_categories_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_question_categories.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/games/:gameId/categories'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').upsertAdminQuestionCategoryValidator)>>
      paramsTuple: [ParamValue]
      params: { gameId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').upsertAdminQuestionCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/question_categories_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/question_categories_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_question_categories.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/categories/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/question_categories_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/question_categories_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_question_categories.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/categories/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').upsertAdminQuestionCategoryValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').upsertAdminQuestionCategoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/question_categories_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/question_categories_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_questions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/questions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminQuestionListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/questions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/questions_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_questions.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/questions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').upsertAdminQuestionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').upsertAdminQuestionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/questions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/questions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_questions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/questions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/questions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/questions_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_questions.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/questions/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').upsertAdminQuestionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').upsertAdminQuestionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/questions_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/questions_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_media_assets.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/media-assets'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/media_assets').adminMediaAssetListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/media_assets_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/media_assets_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_api_media_assets.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/media-assets'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/media_assets').adminMediaAssetUploadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/media_assets').adminMediaAssetUploadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/media_assets_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/media_assets_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_media_assets.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/media-assets/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/media_assets').mediaAssetIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/media_assets_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/media_assets_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_content_pages.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/content-pages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content_pages_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content_pages_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_content_pages.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/content-pages'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').upsertAdminContentPageValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').upsertAdminContentPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content_pages_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content_pages_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_content_pages.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/content-pages/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content_pages_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content_pages_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_content_pages.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/content-pages/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').upsertAdminContentPageValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').upsertAdminContentPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/content_pages_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/content_pages_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_contact_messages.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/contact-messages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminListValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/contact_messages_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/contact_messages_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_contact_messages.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/contact-messages/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_cms').adminIdParamsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/contact_messages_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/contact_messages_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_contact_messages.update_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/contact-messages/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_cms').updateAdminContactMessageStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_cms').updateAdminContactMessageStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/contact_messages_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/contact_messages_controller').default['updateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_reports.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/dashboard/summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['summary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['summary']>>>
    }
  }
  'admin_reports.payments': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/reports/payments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['payments']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['payments']>>>
    }
  }
  'admin_reports.game_sessions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/reports/game-sessions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['gameSessions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['gameSessions']>>>
    }
  }
  'admin_reports.users': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/reports/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['users']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['users']>>>
    }
  }
  'admin_reports.contact_messages': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/reports/contact-messages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['contactMessages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/reports_controller').default['contactMessages']>>>
    }
  }
}
