/**
 * @typedef {Object} Workspace
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} ownerUserId
 * @property {string | null} planCode
 * @property {string | null} subscriptionStatus
 * @property {string} createdAt
 */

/**
 * @typedef {Object} WorkspaceMember
 * @property {string} id
 * @property {string} workspaceId
 * @property {string} userId
 * @property {"owner" | "admin" | "member"} role
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ProspectAnalysis
 * @property {string} id
 * @property {string} prospectId
 * @property {string} workspaceId
 * @property {number} version
 * @property {number} opportunityScore
 * @property {string} scoreLabel
 * @property {Array<{label: string, value: number, note: string}>} scoreBreakdown
 * @property {Array<{name: string, critical: boolean}>} missingFeatures
 * @property {Array<{id: string, catalogId: string, service: string, shortService: string, confidence: number, revenue: number, unit: string, icon: string, desc: string, billingType: string, oneTimePrice: number, oneTimeMaxPrice: number, setupPrice: number, setupMaxPrice: number, monthlyPrice: number, monthlyMaxPrice: number, clientMonthlyGain: number, billingNote: string, pricingLabel: string}>} recommendedServices
 * @property {Array<{type: string, title: string, desc: string, priority: string, impact: number}>} opportunities
 * @property {Array<{action: string, impact: string, effort: string, tag: string}>} actionPlan
 * @property {{oneTime: {min: number, max: number}, monthly: {min: number, max: number}, firstYear: {min: number, max: number}}} pricingSummary
 * @property {{min: number, max: number}} revenue
 * @property {string[]} weaknesses
 * @property {"heuristic" | "ai"} source
 */

/**
 * @typedef {Object} ProspectKit
 * @property {string} id
 * @property {string} prospectId
 * @property {string} workspaceId
 * @property {{whatsapp: string, instagram: string, facebook: string, email: {subject: string, body: string}}} channelMessages
 * @property {{before: string[], after: string[], summary: string}} proposalSnapshot
 */

/**
 * @typedef {Object} Prospect
 * @property {string} id
 * @property {string} workspaceId
 * @property {string} name
 * @property {string} industry
 * @property {string} city
 * @property {string} website
 * @property {string} instagram
 * @property {string} facebook
 * @property {string} whatsapp
 * @property {string} notes
 * @property {"new" | "analyzed" | "kit-ready" | "contacted"} status
 * @property {number} opportunityScore
 * @property {string | null} lastActivityAt
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {ProspectAnalysis | null} analysis
 * @property {ProspectKit | null} kit
 */

/**
 * @typedef {Object} DashboardMetrics
 * @property {number} totalProspects
 * @property {number} analyzedProspects
 * @property {number} kitsReady
 * @property {number} revenueMinTotal
 * @property {number} monthlyPotentialTotal
 * @property {number} oneTimePotentialTotal
 * @property {Prospect | null} topProspect
 * @property {Prospect[]} rankedProspects
 * @property {Array<{id: string, label: string, desc: string, targetView: string}>} recommendations
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} fullName
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {Object<string, string>} errors
 */

/**
 * @typedef {Object} ListProspectsResult
 * @property {Prospect[]} prospects
 * @property {number} total
 */

export {};
