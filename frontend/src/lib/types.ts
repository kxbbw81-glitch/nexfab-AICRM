export type Role = 'sales' | 'manager' | 'finance' | 'exec' | 'admin'

export interface UserSession {
  id: string
  email: string
  name: string
  role: Uppercase<Role>
  status: string
  teamId: string | null
}

export interface NavBadge { n: number; type: 'blue' | 'red' | 'amber' | 'purple' | 'gray' }
export interface NavSubItem { name: string; ai?: boolean; demo?: boolean; badge?: NavBadge }
export interface NavModule {
  id: string
  name: string
  icon: string
  phase: string
  roles: Role[]
  badge?: NavBadge
  subs: NavSubItem[]
}
export interface NavigationData {
  role: Role
  roleName: string
  defaultExpanded: string[]
  modules: NavModule[]
}
export interface DashboardMetric { id: string; label: string; value: number; scope: string }
export interface DashboardActionCard { id: string; title: string; status: string; count: number; href: string }
export interface DashboardBusinessItem { id: string; label: string; value: number; severity?: 'green' | 'amber' | 'red' }
export interface DashboardBusinessOverview {
  mode: 'CURRENT_CUMULATIVE_OVERVIEW' | string
  rangeLabel: string
  note: string
  funnel: DashboardBusinessItem[]
  revenue: DashboardBusinessItem[]
  operations: DashboardBusinessItem[]
  risks: DashboardBusinessItem[]
}
export interface DashboardData {
  role: string
  range: string
  generatedAt: string
  metrics: DashboardMetric[]
  queues: { todoItems: unknown[]; notificationItems: unknown[] }
  actionCards: DashboardActionCard[]
  business?: DashboardBusinessOverview
  aiMode: string
  noExternalSideEffects: boolean
}
export interface ApiEnvelope<T> { data: T }
export interface ApiErrorEnvelope { error: { code: string; message: string; detail?: unknown } }

export interface ListEnvelope<T> { items: T[]; page: number; pageSize: number; total: number }

export interface AgentSkill {
  id: string
  name: string
  version: string
  category: string
  description: string
  status: string
  priority: number
  triggers: string[]
  keywords: string[]
  modules: string[]
  toolRefs: string[]
  instructionLength: number
  executionMode: 'GUIDED_EXISTING_API_ONLY'
  instructions?: string
}

export interface AgentSkillMatchResult {
  goalPreview: string
  matches: Array<{ skill: AgentSkill; matchScore: number; matchReasons: string[] }>
  executionMode: 'GUIDED_EXISTING_API_ONLY'
  notice: string
}

export interface AgentKnowledge {
  id: string
  kind: string
  module: string
  title: string
  summary: string
  keywords: string[]
  roles: string[]
  toolRefs: string[]
  version: string
  source: 'IMPORTED_AGENT_KNOWLEDGE'
  content?: string
  successCriteria?: string[]
  failureCases?: string[]
}

export interface AgentKnowledgeSearchResult {
  queryPreview: string
  status: 'ANSWERED_WITH_SOURCES' | 'INSUFFICIENT_CONTEXT'
  answer: string
  sources: Array<{ id: string; title: string; module: string; version: string; score: number }>
  limitations: string[]
}
export interface CountSummary { [key: string]: number }
export interface OwnerSummary { id: string; name: string; role?: string; teamId?: string | null }

export interface Lead {
  id: string
  code?: string
  source: string
  channel?: string | null
  companyName: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
  country?: string | null
  language?: string | null
  productInterest?: Record<string, unknown> | null
  buyerRole?: string | null
  status: string
  priority: string
  ownerId?: string | null
  owner?: OwnerSummary | null
  _count?: CountSummary
  createdAt?: string
  updatedAt?: string
}

export interface InquiryItem {
  id?: string
  productName: string
  quantity?: number | string | null
  unit?: string | null
  specs?: Record<string, unknown> | null
  notes?: string | null
}

export interface ChannelMessage {
  id: string
  direction: string
  channel: string
  sender?: string | null
  content: string
  occurredAt?: string
}

export interface Inquiry {
  id: string
  code?: string
  leadId?: string | null
  customerId?: string | null
  opportunityId?: string | null
  subject: string
  content: string
  source: string
  channel?: string | null
  language?: string | null
  status: string
  priority: string
  requirements?: Record<string, unknown> | null
  missingFields?: Record<string, unknown> | null
  aiExtracted?: boolean
  lead?: Lead | null
  customer?: Customer | null
  items?: InquiryItem[]
  messages?: ChannelMessage[]
  _count?: CountSummary
  createdAt?: string
  updatedAt?: string
}

export interface Customer {
  id: string
  name: string
  country?: string | null
  website?: string | null
  ownerId?: string | null
  owner?: OwnerSummary | null
  opportunities?: Opportunity[]
  _count?: CountSummary
  createdAt?: string
  updatedAt?: string
}

export interface Contact {
  id: string
  customerId: string
  name: string
  title?: string | null
  email?: string | null
  phone?: string | null
  createdAt?: string
}

export interface Opportunity {
  id: string
  customerId: string
  name: string
  stage: string
  amount?: string | number | null
  currency: string
  customer?: Customer
  owner?: OwnerSummary | null
  createdAt?: string
  updatedAt?: string
}

export interface FollowUp {
  id: string
  type: string
  content: string
  dueAt?: string | null
  completedAt?: string | null
  author?: OwnerSummary | null
  createdAt?: string
}

export interface DedupeCandidate {
  customer: Customer
  matches: Array<{ type: string; value?: string; reason?: string }>
}

export interface DedupeResult {
  fingerprints: Array<{ type: string; value?: string; hash?: string; normalized?: string; source?: string }>
  candidates: DedupeCandidate[]
  hiddenCount?: number
  hasDuplicates: boolean
  mode?: string
}

export interface ToolOcrResult {
  mode: string
  imageName: string
  extracted: { contactName?: string | null; companyName?: string | null; email?: string | null; phone?: string | null; website?: string | null }
  limitations: string[]
}

export interface ToolWebsiteLinkResult {
  customer: Customer
  normalizedDomain: string
  mode: string
}

export interface ToolFxResult {
  from: string
  to: string
  amount: number
  rate: number
  convertedAmount: number
  mode: string
  asOf: string
  limitations: string[]
}

export interface ToolFollowupCopyResult {
  copy: string
  mode: string
  scenario: string
  language: string
  limitations: string[]
}

export interface ToolHsResult {
  items: Array<{ code: string; keyword: string; zh: string; note: string }>
  total: number
  mode: string
  limitations: string[]
}

export interface LeadConvertResult {
  lead: Lead
  customer: Customer
  opportunity?: Opportunity | null
}

export interface SocialAccount {
  id: string
  platform: string
  displayName: string
  status: string
  accountRef?: string | null
  fallbackMode: string
  integrationLinked?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SocialPost {
  id: string
  socialAccountId?: string | null
  platform: string
  title?: string | null
  body: string
  contentType: string
  status: string
  campaignCode?: string | null
  scheduledAt?: string | null
  publishedAt?: string | null
  approvalNote?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface SocialInteraction {
  id: string
  socialPostId?: string | null
  platform: string
  interactionType: string
  authorAlias?: string | null
  content: string
  intent: string
  proposedReply?: string | null
  status: string
  leadId?: string | null
  campaignCode?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface OutboundDraft {
  id: string
  customerId: string
  opportunityId?: string | null
  channel: string
  recipient: string
  subject: string
  body: string
  campaignCode?: string | null
  status: string
  approvalNote?: string | null
  sentAt?: string | null
  externalCall: false
  createdAt?: string
  updatedAt?: string
}

export interface OperationsReport { generatedAt: string; scope: string; source: string; business: DashboardBusinessOverview; alerts: Array<{ id: string; level: string; title: string; value: number; recommendation: string; source: string; requiresHumanReview: boolean }>; retentionSignals: Array<{ customerId: string; inactiveDays: number; lastActivityAt: string; status: string; source: string; requiresHumanReview: boolean }>; forecast: Array<{ currency: string; pipelineAmount: number; weightedAmount: number; byStage: Record<string, number>; method: string; requiresHumanReview: boolean }>; limitations: string[]; noExternalSideEffects: boolean }

export interface ProductCategory {
  id: string
  name: string
  parentId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ProductDoc {
  id: string
  productId: string
  type: string
  status: string
  fileUrl: string
  validUntil?: string | null
  createdAt?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  categoryId: string
  category?: ProductCategory | null
  specs: Record<string, unknown>
  packing: Record<string, unknown>
  costVersions: Record<string, unknown>
  active?: boolean
  _count?: CountSummary
  createdAt?: string
  updatedAt?: string
}

export interface QuoteRuleSet {
  id: string
  code: string
  name: string
  status: string
  currency: string
  source?: string | null
  rules: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface QuoteCalculationLine {
  lineNo: number
  productId: string
  sku: string
  name: string
  quantity: number
  unitCostCny: number
  packagingCostCny: number
  unitCostUsd: number
  exwUnitPrice: number
  exwTotal: number
  costTotalUsd: number
  weightKg?: number
  volumeM3?: number
}

export interface QuoteCalculationResult {
  ruleSet: {
    code: string
    source?: string
    currency: string
    fxRateCnyPerUsd: number
    marginRate: number
    minimumMarginRate: number
  }
  tradeTerm: 'EXW' | 'FOB' | 'CIF' | 'DDP'
  currency: string
  lines: QuoteCalculationLine[]
  charges: Record<string, number>
  totals: {
    quantity: number
    costTotal: number
    exwTotal: number
    fobTotal: number
    cifTotal: number
    ddpTotal: number
    selectedTotal: number
    selectedUnitPrice: number
    grossMargin: number
    grossMarginRate: number
  }
  approval: { required: boolean; reason: string | null; minimumMarginRate: number; actualMarginRate: number }
}

export interface QuoteVersion {
  id: string
  quoteId: string
  version: number
  items: Array<Record<string, unknown>>
  notes?: string | null
  totalAmount: number | string
  totalCost: number | string
  grossMargin: number | string
  lockStatus?: string
  lockedAt?: string | null
  pdfSnapshot?: Record<string, unknown> | null
  createdAt?: string
}

export interface Quote {
  id: string
  customerId: string
  opportunityId?: string | null
  currency: string
  status: string
  totalAmount: number | string
  totalCost: number | string
  grossMargin: number | string
  notes?: string | null
  customer?: Customer
  opportunity?: Opportunity | null
  versions?: QuoteVersion[]
  _count?: CountSummary
  createdAt?: string
  updatedAt?: string
}

export interface QuoteApproval {
  id: string
  quoteId: string
  quoteVersionId: string
  type: string
  status: string
  reason?: string | null
  note?: string | null
  createdAt?: string
}

export interface QuoteSendResult {
  status: string
  quoteId: string
  quoteVersionId: string
  communicationEvent?: unknown
}

export interface SampleRequest {
  id: string
  customerId: string
  productId: string
  quoteId?: string | null
  salesOrderId?: string | null
  quantity: number | string
  currency: string
  estimatedCost?: number | string | null
  shippingAddress?: string | null
  note?: string | null
  status: string
  courier?: string | null
  trackingNo?: string | null
  feedback?: Record<string, unknown> | null
  customer?: Customer
  product?: Pick<Product, 'id' | 'sku' | 'name' | 'active'>
  owner?: OwnerSummary | null
  createdAt?: string
  updatedAt?: string
}

export interface SalesOrderItem {
  id: string
  salesOrderId: string
  productId?: string | null
  sku?: string | null
  name: string
  quantity: number | string
  unitPrice: number | string
  unitCost?: number | string | null
  amount: number | string
  cost?: number | string | null
  snapshot?: Record<string, unknown> | null
}

export interface SalesOrder {
  id: string
  orderNo: string
  customerId: string
  quoteId?: string | null
  currency: string
  totalAmount: number | string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  customer?: Customer
  quote?: Pick<Quote, 'id' | 'currency' | 'totalAmount' | 'status'>
  items?: SalesOrderItem[]
  _count?: CountSummary
  createdAt?: string
  updatedAt?: string
}

export interface OrderGate {
  orderId: string
  orderNo: string
  currency: string
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  canShip: boolean
  paymentStatus: string
  fulfillmentStatus: string
  requirements: string[]
}

export interface OrderPayment {
  id: string
  salesOrderId: string
  customerId: string
  amount: number | string
  currency: string
  status: string
  receivedAt?: string
  note?: string | null
  salesOrder?: SalesOrder
  customer?: Customer
  createdAt?: string
  confirmedAt?: string | null
}

export interface TradeDocument {
  id: string
  salesOrderId: string
  customerId: string
  type: 'PI' | 'CI' | 'PL' | 'SC'
  version: number
  documentNo: string
  currency: string
  totalAmount: number | string
  status: string
  sourceHash?: string
  snapshot?: { consistency?: { blockers?: string[]; warnings?: string[]; readyToShip?: boolean } } & Record<string, unknown>
  createdAt?: string
  reviewedAt?: string | null
}

export interface ReconciliationResult {
  orderId: string
  orderNo: string
  currency: string
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  approvedDocumentTypes: string[]
  readyToShip: boolean
  blockers: string[]
  sourceCounts: { items: number; payments: number; documents: number }
}

export interface Shipment {
  id: string
  salesOrderId: string
  customerId: string
  status: string
  transportMode: string
  carrier?: string | null
  trackingNo?: string | null
  bookingNo?: string | null
  billOfLadingNo?: string | null
  containerNo?: string | null
  etd?: string
  atd?: string
  eta?: string | null
  deliveredAt?: string | null
  note?: string | null
  salesOrder?: SalesOrder
  customer?: Customer
  createdAt?: string
}



export interface ImportTemplateColumn { field: string; description: string; constraint: string }
export interface ImportTemplate {
  type: string
  version: string
  noBusinessSampleData: boolean
  columns: ImportTemplateColumn[]
  csvHeader: string
  csvDictionary?: string
}
export interface ImportReportRow { row: number; id?: string; code?: string; status?: string; name?: string; sku?: string; preview?: boolean; [key: string]: unknown }
export interface ImportIssueRow { row: number; code: string; message?: string; candidates?: Array<{ customerId: string; matchTypes: string[] }>; [key: string]: unknown }
export interface ImportReport {
  type?: string
  dryRun: boolean
  total: number
  created?: ImportReportRow[]
  wouldCreate?: ImportReportRow[]
  updated?: ImportReportRow[]
  skipped?: ImportIssueRow[]
  conflicts?: ImportIssueRow[]
  errors?: ImportIssueRow[]
  summary: { created?: number; wouldCreate?: number; updated?: number; skipped?: number; conflicts?: number; errors?: number }
  noBusinessSampleData?: boolean
}
export interface ImportTemplateList { items: ImportTemplate[]; total: number }

export interface AiGatewayStatus {
  enabled: boolean
  provider?: string | null
  defaultModel?: string | null
  localDraft: boolean
  secretsExposed: boolean
  cloudReady: boolean
  policy: Record<string, unknown>
  queue?: AiQueueStatus
}

export interface AiCapabilityContract {
  id: string
  code: string
  name: string
  module: string
  level: string
  version: string
  status: string
  promptCode?: string | null
  promptVersion?: string | null
  outputSchemaCode?: string | null
  outputSchemaVersion?: string | null
  specSummary?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface AiTask {
  id: string
  module: string
  purpose: string
  level: string
  status: string
  provider: string
  model?: string | null
  promptCode?: string | null
  promptVersion?: string | null
  capabilityCode?: string | null
  capabilityVersion?: string | null
  outputSchemaCode?: string | null
  outputSchemaVersion?: string | null
  inputSummary?: Record<string, unknown> | null
  output?: Record<string, unknown> | null
  errorCode?: string | null
  errorMessage?: string | null
  tokens?: number | null
  cost?: string | number | null
  dataSentToCloud: boolean
  durationMs?: number | null
  createdBy?: OwnerSummary | null
  _count?: { feedbacks?: number; citations?: number }
  createdAt?: string
  updatedAt?: string
}

export interface AiCitation {
  id: string
  aiTaskId: string
  sourceType: string
  sourceId?: string | null
  knowledgeDocumentId?: string | null
  knowledgeChunkId?: string | null
  title?: string | null
  sourceName?: string | null
  version?: string | null
  locator?: string | null
  confidence?: number | null
  createdAt?: string
}

export interface RagSource {
  documentId?: string
  chunkId?: string
  fileName?: string
  title?: string
  version?: string
  type?: string
  heading?: string
  paragraph?: number
  productId?: string | null
}

export interface RagResponse {
  answer: string
  sources: RagSource[]
  confidence: number
  mode: string
  status: string
  limitations: string[]
  queryPreview: string
  context?: Record<string, unknown>
  aiTaskId?: string
}

export interface AiRunResult {
  task: AiTask
  output: Record<string, unknown>
  requiresHumanConfirmation: boolean
  capability?: AiCapabilityContract | null
  outputSchema?: { code: string; version: string } | null
  queue?: AiQueueStatus
  eventsUrl?: string
}

export interface ToolCall {
  id: string
  aiTaskId?: string | null
  module: string
  toolName: string
  action: string
  status: string
  riskLevel: string
  requiresHumanConfirmation: boolean
  confirmedById?: string | null
  confirmedBy?: OwnerSummary | null
  confirmedAt?: string | null
  executedAt?: string | null
  errorCode?: string | null
  errorMessage?: string | null
  createdById?: string | null
  createdBy?: OwnerSummary | null
  createdAt?: string
  updatedAt?: string
}

export interface AiQueueStatus {
  enabled: boolean
  backend: 'bullmq-redis' | 'memory' | 'disabled' | string
  redisConfigured: boolean
  productionReady: boolean
  fallback: boolean
  sse: boolean
  warning?: string
  accepted?: boolean
  jobId?: string | number
}

export interface OpsStatus {
  at: string
  configuration: { database: string; session: string; pii: string; ai: string; ready: boolean }
  database: { reachable: boolean; mode: string; probe: string; latencyMs: number }
  queue: AiQueueStatus
  process: { uptimeSeconds: number; rssMiB: number; heapUsedMiB: number }
  backup: { mode: string; automatedExecution: boolean; note: string }
}

export interface AiTaskEvent {
  id: string
  taskId: string
  at: string
  type: string
  status: string | null
  stage: string | null
  terminal: boolean
  tokens: number
  cost: string
  durationMs: number
  dataSentToCloud: boolean
  summary?: Record<string, unknown>
  queueBackend?: string | null
  errorCode?: string | null
}

// 修复说明：[P1-台账外]，原因：沟通时间线/提成视图接入真实后端所需类型（字段与 Prisma 模型对齐）。
export type TimelineEvent = {
  id: string
  customerId: string
  opportunityId: string | null
  type: string
  direction: string
  summary: string
  occurredAt: string
  customer?: { id: string; name: string }
  opportunity?: { id: string; name: string; stage: string } | null
}

export type CommissionRow = {
  salesId: string
  sales: { id: string; name: string; email: string | null; role: string | null; teamId: string | null }
  currency: string
  orderCount: number
  totalAmount: number
  confirmedPaidAmount: number
  outstandingAmount: number
  commissionAmount: number
  potentialCommission: number
  collectionRate: number
  orderIds: string[]
}

export type CommissionReport = {
  rows: CommissionRow[]
  stats: {
    salesCount: number; orderCount: number; totalAmount: number; confirmedPaidAmount: number
    outstandingAmount: number; commissionAmount: number; potentialCommission: number
    collectionRate: number; appliedRate: number
    byCurrency: { currency: string; orderCount: number; totalAmount: number; confirmedPaidAmount: number; commissionAmount: number }[]
  }
  period: { from: string | null; to: string | null }
  sourcePolicy: string
}

export type CommissionRecord = {
  id: string
  salesId: string
  currency: string
  periodStart: string | null
  periodEnd: string | null
  rate: number
  orderCount: number
  totalAmount: number
  confirmedPaidAmount: number
  commissionAmount: number
  status: string
  sales?: { id: string; name: string; email: string; role: string; teamId: string | null }
}

export type CustomerProfileContact = {
  id: string
  name: string
  title?: string | null
  email?: string | null
  phone?: string | null
}

export type CustomerProfileTimelineEvent = {
  id: string
  type: string
  summary?: string | null
  occurredAt?: string | null
  userName?: string | null
}

export type CustomerProfile = {
  customer: {
    id: string
    name: string
    country: string | null
    website: string | null
    owner?: OwnerSummary | null
    createdAt?: string | null
  }
  profile: { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH'; factors: { profileCompletion: number; commercialActivity: number }; missing: string[] }
  counts: { contacts: number; opportunities: number; orders: number }
  opportunityStats?: {
    total: number
    totalAmount: number
    wonCount: number
    stageBreakdown: Array<{ stage: string; count: number; amount: number }>
  }
  orderStats?: {
    total: number
    totalAmount: number
    totalPaid: number
    outstanding: number
    collectionRate: number
    statusBreakdown: Array<{ status: string; count: number; amount: number }>
  }
  contacts: CustomerProfileContact[]
  timeline: CustomerProfileTimelineEvent[]
}

export type ProductRecommendation = { id: string; sku: string; name: string; reason: string }
export type RepurchaseStatus = { customerId: string; deliveredOrders: number; eligible: boolean; recommendation: string; opportunityId: string | null }

export type RetentionRow = {
  customerId: string
  name?: string
  companyName?: string
  country?: string | null
  customerLevel?: string | null
  ownerName?: string | null
  lastDealAt?: string | null
  lastDealAmount?: number
  dealCount: number
  totalAmount: number
  repurchaseAt?: string | null
  daysLeft: number
  window: 'overdue' | 'near' | 'upcoming' | string
}

export type RetentionReport = {
  rows: RetentionRow[]
  cycleDays?: number
  stats: { total: number; overdue: number; near: number; totalAmount: number }
}
