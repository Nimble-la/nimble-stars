import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    createdAt: v.number(),
  }),

  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("client")),
    orgId: v.optional(v.id("organizations")),
    supabaseUserId: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index("by_org", ["orgId"])
    .index("by_supabase_id", ["supabaseUserId"]),

  positions: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("closed")),
    orgId: v.id("organizations"),
    createdAt: v.number(),
  }).index("by_org", ["orgId"]),

  candidates: defineTable({
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    currentRole: v.optional(v.string()),
    currentCompany: v.optional(v.string()),
    summary: v.optional(v.string()),
    manatalUrl: v.optional(v.string()),
    manatalId: v.optional(v.number()),
    manatalImportedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_manatal_id", ["manatalId"]),

  candidateFiles: defineTable({
    candidateId: v.id("candidates"),
    fileUrl: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    uploadedAt: v.number(),
  }).index("by_candidate", ["candidateId"]),

  candidatePositions: defineTable({
    candidateId: v.id("candidates"),
    positionId: v.id("positions"),
    stage: v.union(
      v.literal("submitted"),
      v.literal("to_interview"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastInteractionAt: v.number(),
  })
    .index("by_position", ["positionId"])
    .index("by_candidate", ["candidateId"])
    .index("by_position_and_candidate", ["positionId", "candidateId"])
    .index("by_stage", ["stage"]),

  comments: defineTable({
    body: v.string(),
    userId: v.id("users"),
    candidatePositionId: v.id("candidatePositions"),
    createdAt: v.number(),
  }).index("by_candidate_position", ["candidatePositionId"]),

  activityLog: defineTable({
    action: v.string(),
    fromStage: v.optional(v.string()),
    toStage: v.optional(v.string()),
    userId: v.id("users"),
    userName: v.string(),
    candidatePositionId: v.id("candidatePositions"),
    createdAt: v.number(),
  })
    .index("by_candidate_position", ["candidatePositionId"])
    .index("by_created_at", ["createdAt"]),

  notifications: defineTable({
    type: v.union(
      v.literal("stage_change"),
      v.literal("new_comment"),
      v.literal("client_login"),
      v.literal("candidate_assigned")
    ),
    message: v.string(),
    isRead: v.boolean(),
    userId: v.id("users"),
    relatedCandidatePositionId: v.optional(v.id("candidatePositions")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),

  emailLog: defineTable({
    to: v.string(),
    subject: v.string(),
    templateName: v.string(),
    relatedEventType: v.string(),
    relatedCandidatePositionId: v.optional(v.id("candidatePositions")),
    sentAt: v.number(),
    resendMessageId: v.optional(v.string()),
    status: v.union(v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
  }).index("by_event", ["relatedEventType", "relatedCandidatePositionId"]),
});
