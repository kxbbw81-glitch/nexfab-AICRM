import type {
  AiCitation,
  AiGatewayStatus,
  AiQueueStatus,
  AiRunResult,
  AiTask,
  ApiEnvelope,
  ApiErrorEnvelope,
  Contact,
  Customer,
  DashboardData,
  DedupeResult,
  FollowUp,
  ImportReport,
  ImportTemplate,
  ImportTemplateList,
  Inquiry,
  InquiryItem,
  Lead,
  LeadConvertResult,
  ListEnvelope,
  NavigationData,
  OpsStatus,
  Opportunity,
  Product,
  ProductCategory,
  ProductDoc,
  Quote,
  QuoteApproval,
  QuoteCalculationResult,
  QuoteRuleSet,
  QuoteSendResult,
  QuoteVersion,
  ReconciliationResult,
  SalesOrder,
  SampleRequest,
  Shipment,
  OrderGate,
  OrderPayment,
  ToolCall,
  ToolFollowupCopyResult,
  ToolFxResult,
  ToolHsResult,
  ToolOcrResult,
  ToolWebsiteLinkResult,
  TradeDocument,
  UserSession,
  AiCapabilityContract,
  AgentKnowledge,
  AgentKnowledgeSearchResult,
  AgentSkill,
  AgentSkillMatchResult,
  RagResponse,
  SocialAccount,
  SocialInteraction,
  SocialPost,
  OutboundDraft,
  OperationsReport,
  TimelineEvent,
  CommissionReport,
  CommissionRecord,
  CustomerProfile,
  RetentionReport,
  ProductRecommendation,
  RepurchaseStatus,
} from './types'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public detail?: unknown) {
    super(message)
  }
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${basePath}/api/backend${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
    cache: 'no-store',
  })
  if (response.status === 204) return undefined as T
  // 修复说明：[中危-容错]，原因：网关 502/504 返回 HTML 或空 body 时 response.json() 抛 SyntaxError，技术细节直出到页面；现先取文本再解析，失败统一转为友好 ApiError。
  const text = await response.text()
  let payload: ApiEnvelope<T> | ApiErrorEnvelope
  try {
    payload = text ? (JSON.parse(text) as ApiEnvelope<T> | ApiErrorEnvelope) : ({} as ApiEnvelope<T>)
  } catch {
    if (response.status === 401) notifySessionExpired()
    throw new ApiError(response.status, 'NON_JSON_RESPONSE', '服务暂时不可用，请稍后重试。')
  }
  if (!response.ok) {
    if (response.status === 401) notifySessionExpired()
    const error = 'error' in payload ? payload.error : { code: `HTTP_${response.status}`, message: '请求失败。' }
    // 修复说明：[低危-契约一致性]，原因：detail 原优先取 payload.data，与错误信封契约不符；统一取 error.detail。
    throw new ApiError(response.status, error.code, error.message, 'error' in payload ? payload.error.detail : undefined)
  }
  return (payload as ApiEnvelope<T>).data
}

// 修复说明：[中危-会话体验]，原因：业务视图收到 401 只显示错误横幅，会话过期后用户停留在报错页；现派发全局事件由 CrmShell 监听回登录。
export const SESSION_EXPIRED_EVENT = 'nexfab:session-expired'
function notifySessionExpired() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
}

export async function apiBinary(path: string): Promise<{ blob: Blob; contentType: string | null; bytes: number }> {
  const response = await fetch(`${basePath}/api/backend${path}`, { credentials: 'include', cache: 'no-store' })
  const contentType = response.headers.get('content-type')
  if (!response.ok) {
    if (response.status === 401) notifySessionExpired()
    if (contentType?.includes('application/json')) {
      const payload = (await response.json()) as ApiErrorEnvelope
      const error = payload.error || { code: `HTTP_${response.status}`, message: '请求失败。' }
      throw new ApiError(response.status, error.code, error.message, error.detail)
    }
    throw new ApiError(response.status, `HTTP_${response.status}`, '二进制文件请求失败。')
  }
  const blob = await response.blob()
  return { blob, contentType, bytes: blob.size }
}

function json(method: 'POST' | 'PUT' | 'PATCH', body: Record<string, unknown>) {
  return { method, body: JSON.stringify(body) }
}

export const api = {
  login: (loginId: string, password: string) => apiFetch<{ user: UserSession }>('/api/auth/login', json('POST', { loginId, password })),
  logout: () => apiFetch<void>('/api/auth/logout', { method: 'POST' }),
  session: () => apiFetch<{ user: UserSession }>('/api/auth/session'),
  navigation: () => apiFetch<NavigationData>('/api/navigation'),
  dashboard: (range = 'today') => apiFetch<DashboardData>(`/api/dashboard?range=${encodeURIComponent(range)}`),
  opsStatus: () => apiFetch<OpsStatus>('/api/admin/ops/status'),

  aiGatewayStatus: () => apiFetch<AiGatewayStatus>('/api/ai-gateway/status'),
  aiQueueStatus: () => apiFetch<AiQueueStatus>('/api/ai-queue/status'),
  aiCapabilityContracts: (params = 'pageSize=20') => apiFetch<ListEnvelope<AiCapabilityContract>>(`/api/ai-capability-contracts?${params}`),
  aiTasks: (params = 'pageSize=20') => apiFetch<ListEnvelope<AiTask>>(`/api/ai-tasks?${params}`),
  aiTask: (taskId: string) => apiFetch<AiTask>(`/api/ai-tasks/${taskId}`),
  cancelAiTask: (taskId: string) => apiFetch<AiTask>(`/api/ai-tasks/${taskId}/cancel`, { method: 'POST' }),
  aiTaskCitations: (taskId: string, params = 'pageSize=20') => apiFetch<ListEnvelope<AiCitation>>(`/api/ai-tasks/${taskId}/citations?${params}`),
  agentSkills: (params = 'pageSize=20') => apiFetch<ListEnvelope<AgentSkill>>(`/api/agent-library/skills?${params}`),
  agentSkill: (skillId: string) => apiFetch<AgentSkill>(`/api/agent-library/skills/${encodeURIComponent(skillId)}`),
  matchAgentSkills: (body: { goal: string; activeModule?: string }) => apiFetch<AgentSkillMatchResult>('/api/agent-library/skills/match', json('POST', body)),
  agentKnowledge: (params = 'pageSize=20') => apiFetch<ListEnvelope<AgentKnowledge>>(`/api/agent-library/knowledge?${params}`),
  agentKnowledgeDetail: (knowledgeId: string) => apiFetch<AgentKnowledge>(`/api/agent-library/knowledge/${encodeURIComponent(knowledgeId)}`),
  searchAgentKnowledge: (body: { query: string; activeModule?: string }) => apiFetch<AgentKnowledgeSearchResult>('/api/agent-library/knowledge/search', json('POST', body)),
  ragQuery: (body: Record<string, unknown>) => apiFetch<RagResponse>('/api/rag/query', json('POST', body)),
  runAiGateway: (body: Record<string, unknown>) => apiFetch<AiRunResult>('/api/ai-gateway/run', json('POST', body)),
  toolCalls: (params = 'pageSize=20') => apiFetch<ListEnvelope<ToolCall>>(`/api/tool-calls?${params}`),
  createToolCall: (body: Record<string, unknown>) => apiFetch<ToolCall>('/api/tool-calls', json('POST', body)),
  confirmToolCall: (toolCallId: string, body: Record<string, unknown>) => apiFetch<ToolCall>(`/api/tool-calls/${toolCallId}/confirm`, json('POST', body)),
  recordToolCallResult: (toolCallId: string, body: Record<string, unknown>) => apiFetch<ToolCall>(`/api/tool-calls/${toolCallId}/result`, json('POST', body)),

  importTemplates: () => apiFetch<ImportTemplateList>('/api/import/templates'),
  importTemplate: (type: string) => apiFetch<ImportTemplate>(`/api/import/templates/${encodeURIComponent(type)}`),
  importRows: (type: string, body: Record<string, unknown>) => apiFetch<ImportReport>(`/api/import/${encodeURIComponent(type)}`, json('POST', body)),

  leads: (params = 'pageSize=8') => apiFetch<ListEnvelope<Lead>>(`/api/leads?${params}`),
  lead: (id: string) => apiFetch<Lead>(`/api/leads/${id}`),
  createLead: (body: Record<string, unknown>) => apiFetch<Lead>('/api/leads', json('POST', body)),
  createLeadFollowUp: (leadId: string, body: Record<string, unknown>) => apiFetch<FollowUp>(`/api/leads/${leadId}/follow-ups`, json('POST', body)),
  convertLead: (leadId: string, body: Record<string, unknown>) => apiFetch<LeadConvertResult>(`/api/leads/${leadId}/convert`, json('POST', body)),

  socialAccounts: (params = 'pageSize=20') => apiFetch<ListEnvelope<SocialAccount>>(`/api/social-accounts?${params}`),
  createSocialAccount: (body: Record<string, unknown>) => apiFetch<SocialAccount>('/api/social-accounts', json('POST', body)),
  socialPosts: (params = 'pageSize=20') => apiFetch<ListEnvelope<SocialPost>>(`/api/social-posts?${params}`),
  createSocialPost: (body: Record<string, unknown>) => apiFetch<SocialPost>('/api/social-posts', json('POST', body)),
  submitSocialPost: (id: string) => apiFetch<SocialPost>(`/api/social-posts/${id}/submit-review`, json('POST', {})),
  approveSocialPost: (id: string, note = '') => apiFetch<SocialPost>(`/api/social-posts/${id}/approve`, json('POST', { note })),
  recordSocialPostPublished: (id: string) => apiFetch<SocialPost>(`/api/social-posts/${id}/record-published`, json('POST', {})),
  socialInteractions: (params = 'pageSize=20') => apiFetch<ListEnvelope<SocialInteraction>>(`/api/social-interactions?${params}`),
  createSocialInteraction: (body: Record<string, unknown>) => apiFetch<SocialInteraction>('/api/social-interactions', json('POST', body)),
  convertSocialInteractionToLead: (id: string, body: Record<string, unknown>) => apiFetch<{ interaction: SocialInteraction; lead: Lead }>(`/api/social-interactions/${id}/convert-to-lead`, json('POST', body)),

  outboundDrafts: (params = 'pageSize=20') => apiFetch<ListEnvelope<OutboundDraft>>(`/api/outbound-drafts?${params}`),
  createOutboundDraft: (body: Record<string, unknown>) => apiFetch<OutboundDraft>('/api/outbound-drafts', json('POST', body)),
  submitOutboundDraft: (id: string) => apiFetch<OutboundDraft>(`/api/outbound-drafts/${id}/submit-review`, json('POST', {})),
  approveOutboundDraft: (id: string, note = '') => apiFetch<OutboundDraft>(`/api/outbound-drafts/${id}/approve`, json('POST', { note })),
  recordOutboundDraftManualSend: (id: string) => apiFetch<OutboundDraft>(`/api/outbound-drafts/${id}/record-manual-send`, json('POST', {})),
  operationsReport: () => apiFetch<OperationsReport>('/api/analytics/operations-report'),

  inquiries: (params = 'pageSize=8') => apiFetch<ListEnvelope<Inquiry>>(`/api/inquiries?${params}`),
  inquiry: (id: string) => apiFetch<Inquiry>(`/api/inquiries/${id}`),
  createInquiry: (body: Record<string, unknown>) => apiFetch<Inquiry>('/api/inquiries', json('POST', body)),
  addInquiryItem: (inquiryId: string, body: Record<string, unknown>) => apiFetch<InquiryItem>(`/api/inquiries/${inquiryId}/items`, json('POST', body)),
  addInquiryMessage: (inquiryId: string, body: Record<string, unknown>) => apiFetch<unknown>(`/api/inquiries/${inquiryId}/messages`, json('POST', body)),
  updateInquiryStatus: (inquiryId: string, status: string) => apiFetch<Inquiry>(`/api/inquiries/${inquiryId}/status`, json('POST', { status })),

  customers: (params = 'pageSize=8') => apiFetch<ListEnvelope<Customer>>(`/api/customers?${params}`),
  customer: (id: string) => apiFetch<Customer>(`/api/customers/${id}`),
  customerProfile: (id: string) => apiFetch<CustomerProfile>(`/api/customers/${id}/profile`),
  customerProductRecommendations: (id: string, query = '') => apiFetch<{ customerId: string; items: ProductRecommendation[]; limitations: string[] }>(`/api/customers/${id}/product-recommendations${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  customerRepurchase: (id: string) => apiFetch<RepurchaseStatus>(`/api/customers/${id}/repurchase`),
  createRepurchaseFollowUp: (id: string, content: string) => apiFetch<FollowUp>(`/api/customers/${id}/repurchase/follow-ups`, json('POST', { content })),
  customerCsv: () => apiBinary('/api/customers/export'),
  productCsv: () => apiBinary('/api/products/export'),
  deleteCustomer: (id: string) => apiFetch<void>(`/api/customers/${id}`, { method: 'DELETE' }),
  createCustomer: (body: Record<string, unknown>) => apiFetch<Customer>('/api/customers', json('POST', body)),
  contacts: (customerId: string, params = 'pageSize=8') => apiFetch<ListEnvelope<Contact>>(`/api/customers/${customerId}/contacts?${params}`),
  createContact: (customerId: string, body: Record<string, unknown>) => apiFetch<Contact>(`/api/customers/${customerId}/contacts`, json('POST', body)),
  dedupe: (body: Record<string, unknown>) => apiFetch<DedupeResult>('/api/tools/dedupe', json('POST', body)),
  toolOcr: (body: Record<string, unknown>) => apiFetch<ToolOcrResult>('/api/tools/ocr', json('POST', body)),
  toolWebsiteLink: (body: Record<string, unknown>) => apiFetch<ToolWebsiteLinkResult>('/api/tools/website-link', json('POST', body)),
  toolFx: (params: string) => apiFetch<ToolFxResult>(`/api/tools/fx?${params}`),
  toolFollowupCopy: (body: Record<string, unknown>) => apiFetch<ToolFollowupCopyResult>('/api/tools/followup-copy', json('POST', body)),
  toolHs: (params: string) => apiFetch<ToolHsResult>(`/api/tools/hs?${params}`),

  opportunities: (params = 'pageSize=8') => apiFetch<ListEnvelope<Opportunity>>(`/api/opportunities?${params}`),
  createOpportunity: (body: Record<string, unknown>) => apiFetch<Opportunity>('/api/opportunities', json('POST', body)),
  createOpportunityFollowUp: (opportunityId: string, body: Record<string, unknown>) => apiFetch<FollowUp>(`/api/opportunities/${opportunityId}/follow-ups`, json('POST', body)),

  productCategories: (params = 'pageSize=50') => apiFetch<ListEnvelope<ProductCategory>>(`/api/product-categories?${params}`),
  createProductCategory: (body: Record<string, unknown>) => apiFetch<ProductCategory>('/api/product-categories', json('POST', body)),
  products: (params = 'pageSize=20') => apiFetch<ListEnvelope<Product>>(`/api/products?${params}`),
  createProduct: (body: Record<string, unknown>) => apiFetch<Product>('/api/products', json('POST', body)),
  archiveProduct: (id: string) => apiFetch<Product>(`/api/products/${id}`, { method: 'DELETE' }),
  productDocs: (productId: string, params = 'pageSize=20') => apiFetch<ListEnvelope<ProductDoc>>(`/api/products/${productId}/docs?${params}`),
  createProductDoc: (productId: string, body: Record<string, unknown>) => apiFetch<ProductDoc>(`/api/products/${productId}/docs`, json('POST', body)),

  quoteRuleSets: (params = 'pageSize=20') => apiFetch<ListEnvelope<QuoteRuleSet>>(`/api/quote-rule-sets?${params}`),
  calculateQuote: (body: Record<string, unknown>) => apiFetch<QuoteCalculationResult>('/api/quotes/calculate', json('POST', body)),
  quickQuote: (body: Record<string, unknown>) => apiFetch<Quote>('/api/quotes/quick', json('POST', body)),
  quotes: (params = 'pageSize=20') => apiFetch<ListEnvelope<Quote>>(`/api/quotes?${params}`),
  quote: (quoteId: string) => apiFetch<Quote>(`/api/quotes/${quoteId}`),
  quoteVersions: (quoteId: string, params = 'pageSize=20') => apiFetch<ListEnvelope<QuoteVersion>>(`/api/quotes/${quoteId}/versions?${params}`),
  lockQuoteVersion: (quoteId: string, versionId: string, body: Record<string, unknown>) => apiFetch<QuoteVersion | { status: string; approval: QuoteApproval; margin: Record<string, unknown> }>(`/api/quotes/${quoteId}/versions/${versionId}/lock`, json('POST', body)),
  quotePdf: (quoteId: string, versionId: string) => apiBinary(`/api/quotes/${quoteId}/versions/${versionId}/pdf`),
  sendQuote: (quoteId: string, body: Record<string, unknown>) => apiFetch<QuoteSendResult>(`/api/quotes/${quoteId}/send`, json('POST', body)),
  quoteApprovals: (quoteId: string, params = 'pageSize=20') => apiFetch<ListEnvelope<QuoteApproval>>(`/api/quotes/${quoteId}/approvals?${params}`),

  samples: (params = 'pageSize=20') => apiFetch<ListEnvelope<SampleRequest>>(`/api/samples?${params}`),
  sample: (sampleId: string) => apiFetch<SampleRequest>(`/api/samples/${sampleId}`),
  createSample: (body: Record<string, unknown>) => apiFetch<SampleRequest>('/api/samples', json('POST', body)),
  updateSampleStatus: (sampleId: string, body: Record<string, unknown>) => apiFetch<SampleRequest>(`/api/samples/${sampleId}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  convertSampleToOrder: (sampleId: string) => apiFetch<{ sample: SampleRequest; order: SalesOrder }>(`/api/samples/${sampleId}/convert-to-order`, { method: 'POST' }),

  orders: (params = 'pageSize=20') => apiFetch<ListEnvelope<SalesOrder>>(`/api/orders?${params}`),
  order: (orderId: string) => apiFetch<SalesOrder>(`/api/orders/${orderId}`),
  createOrderFromQuote: (quoteId: string) => apiFetch<SalesOrder>(`/api/orders/from-quote/${quoteId}`, { method: 'POST' }),
  orderGate: (orderId: string) => apiFetch<OrderGate>(`/api/orders/${orderId}/gate`),

  payments: (params = 'pageSize=20') => apiFetch<ListEnvelope<OrderPayment>>(`/api/payments?${params}`),
  createPayment: (body: Record<string, unknown>) => apiFetch<OrderPayment>('/api/payments', json('POST', body)),
  confirmPayment: (paymentId: string) => apiFetch<OrderPayment>(`/api/payments/${paymentId}/confirm`, { method: 'POST' }),

  tradeDocuments: (params = 'pageSize=20') => apiFetch<ListEnvelope<TradeDocument>>(`/api/trade-documents?${params}`),
  generateTradeDocument: (orderId: string, body: Record<string, unknown>) => apiFetch<TradeDocument>(`/api/orders/${orderId}/documents/generate`, json('POST', body)),
  reviewTradeDocument: (documentId: string, body: Record<string, unknown>) => apiFetch<TradeDocument>(`/api/trade-documents/${documentId}/review`, json('POST', body)),
  reconciliation: (orderId: string) => apiFetch<ReconciliationResult>(`/api/orders/${orderId}/reconciliation`),

  shipments: (params = 'pageSize=20') => apiFetch<ListEnvelope<Shipment>>(`/api/shipments?${params}`),
  updateFulfillmentStatus: (orderId: string, body: Record<string, unknown>) => apiFetch<SalesOrder>(`/api/orders/${orderId}/fulfillment/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  createShipment: (orderId: string, body: Record<string, unknown>) => apiFetch<Shipment>(`/api/orders/${orderId}/shipments`, json('POST', body)),
  updateShipmentStatus: (shipmentId: string, body: Record<string, unknown>) => apiFetch<Shipment>(`/api/shipments/${shipmentId}/status`, { method: 'PATCH', body: JSON.stringify(body) }),

  // 修复说明：[P1-台账外]，原因：沟通时间线与提成导航需要消费已有后端接口。
  timeline: (params: string) => apiFetch<ListEnvelope<TimelineEvent>>(`/api/timeline?${params}`),
  commissions: (params = '') => apiFetch<CommissionReport>(`/api/commissions${params ? `?${params}` : ''}`),
  commissionRecords: (params = 'pageSize=15') => apiFetch<ListEnvelope<CommissionRecord>>(`/api/commission-records?${params}`),
  retention: (params = '') => apiFetch<RetentionReport>(`/api/repurchase${params ? `?${params}` : ''}`),
}
