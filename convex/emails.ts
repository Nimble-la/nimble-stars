import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendNotificationEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    templateName: v.string(),
    relatedEventType: v.string(),
    relatedCandidatePositionId: v.optional(v.id("candidatePositions")),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "notifications@stars.nimble.la";

    if (!apiKey) {
      console.error("[Email] RESEND_API_KEY not configured");
      await ctx.runMutation(internal.emails.logSentEmail, {
        to: args.to,
        subject: args.subject,
        templateName: args.templateName,
        relatedEventType: args.relatedEventType,
        relatedCandidatePositionId: args.relatedCandidatePositionId,
        sentAt: Date.now(),
        status: "failed",
        error: "RESEND_API_KEY not configured",
      });
      return;
    }

    const resend = new Resend(apiKey);

    try {
      const { data, error } = await resend.emails.send({
        from: `Nimble S.T.A.R.S <${fromEmail}>`,
        to: args.to,
        subject: args.subject,
        html: args.html,
      });

      if (error) {
        console.error("[Email] Resend error:", error);
        await ctx.runMutation(internal.emails.logSentEmail, {
          to: args.to,
          subject: args.subject,
          templateName: args.templateName,
          relatedEventType: args.relatedEventType,
          relatedCandidatePositionId: args.relatedCandidatePositionId,
          sentAt: Date.now(),
          status: "failed",
          error: error.message,
        });
        return;
      }

      await ctx.runMutation(internal.emails.logSentEmail, {
        to: args.to,
        subject: args.subject,
        templateName: args.templateName,
        relatedEventType: args.relatedEventType,
        relatedCandidatePositionId: args.relatedCandidatePositionId,
        sentAt: Date.now(),
        resendMessageId: data?.id,
        status: "sent",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Email] Exception:", message);
      await ctx.runMutation(internal.emails.logSentEmail, {
        to: args.to,
        subject: args.subject,
        templateName: args.templateName,
        relatedEventType: args.relatedEventType,
        relatedCandidatePositionId: args.relatedCandidatePositionId,
        sentAt: Date.now(),
        status: "failed",
        error: message,
      });
    }
  },
});

export const logSentEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    templateName: v.string(),
    relatedEventType: v.string(),
    relatedCandidatePositionId: v.optional(v.id("candidatePositions")),
    sentAt: v.number(),
    resendMessageId: v.optional(v.string()),
    status: v.union(v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLog", args);
  },
});
