import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { clientLoginHtml } from "./emailTemplates";

export const getBySupabaseId = query({
  args: { supabaseUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_supabase_id", (q) =>
        q.eq("supabaseUserId", args.supabaseUserId)
      )
      .unique();
  },
});

export const listByOrg = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const createAdmin = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    supabaseUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "admin",
      supabaseUserId: args.supabaseUserId,
      isActive: true,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const createClientUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    orgId: v.id("organizations"),
    supabaseUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "client",
      orgId: args.orgId,
      supabaseUserId: args.supabaseUserId,
      isActive: true,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;
    const updates: Record<string, string | boolean> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.isActive !== undefined) updates.isActive = fields.isActive;
    await ctx.db.patch(userId, updates);
  },
});

export const recordLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    await ctx.db.patch(args.userId, { lastLoginAt: now });

    // Only create notification for client logins, debounced to 1 per hour
    if (user.role === "client") {
      const shouldNotify = !user.lastLoginAt || now - user.lastLoginAt > ONE_HOUR;
      if (shouldNotify) {
        // Get org name for the notification message
        let orgName = "Unknown";
        if (user.orgId) {
          const org = await ctx.db.get(user.orgId);
          if (org) orgName = org.name;
        }

        // Notify all admin users
        const admins = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("role"), "admin"))
          .collect();

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stars.nimble.la";
        const loginTime = new Date(now).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        });

        await Promise.all(
          admins.map(async (admin) => {
            await ctx.db.insert("notifications", {
              type: "client_login",
              message: `${user.name} from ${orgName} logged in`,
              isRead: false,
              userId: admin._id,
              createdAt: now,
            });
            await ctx.scheduler.runAfter(0, api.emails.sendNotificationEmail, {
              to: admin.email,
              subject: `Client Login: ${user.name} from ${orgName}`,
              html: clientLoginHtml({
                userName: user.name,
                orgName,
                loginTime,
                clientDetailUrl: `${baseUrl}/admin/clients`,
              }),
              templateName: "client-login",
              relatedEventType: "client_login",
            });
          })
        );
      }
    }
  },
});

export const updateSupabaseId = mutation({
  args: {
    userId: v.id("users"),
    supabaseUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { supabaseUserId: args.supabaseUserId });
  },
});
