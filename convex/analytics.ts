import { query } from "./_generated/server";
import { v } from "convex/values";

const STAGES = ["submitted", "to_interview", "approved", "rejected"] as const;
const MS_PER_DAY = 86400000;

export const getOverview = query({
  args: {
    dateFrom: v.number(),
    dateTo: v.number(),
  },
  handler: async (ctx, args) => {
    const periodLength = args.dateTo - args.dateFrom;
    const prevFrom = args.dateFrom - periodLength;
    const prevTo = args.dateFrom;

    // Fetch all candidatePositions (limited for performance)
    const allCPs = await ctx.db.query("candidatePositions").order("desc").take(5000);

    const currentCPs = allCPs.filter(
      (cp) => cp.createdAt >= args.dateFrom && cp.createdAt <= args.dateTo
    );
    const prevCPs = allCPs.filter(
      (cp) => cp.createdAt >= prevFrom && cp.createdAt <= prevTo
    );

    function computeMetrics(cps: typeof allCPs) {
      const inPipeline = cps.filter((cp) => cp.stage !== "rejected").length;
      const approved = cps.filter((cp) => cp.stage === "approved").length;
      const rejected = cps.filter((cp) => cp.stage === "rejected").length;
      const total = approved + rejected;
      const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
      return { inPipeline, approved, rejected, approvalRate };
    }

    const current = computeMetrics(currentCPs);
    const prev = computeMetrics(prevCPs);

    // Open positions count
    const positions = await ctx.db.query("positions").collect();
    const openPositions = positions.filter((p) => p.status === "open").length;

    // Average time to hire (createdAt → approval), sample up to 100
    const approvedCPs = currentCPs.filter((cp) => cp.stage === "approved");
    let avgTimeToHire = 0;
    if (approvedCPs.length > 0) {
      const approvalTimes: number[] = [];
      for (const cp of approvedCPs.slice(0, 100)) {
        const logs = await ctx.db
          .query("activityLog")
          .withIndex("by_candidate_position", (q) =>
            q.eq("candidatePositionId", cp._id)
          )
          .collect();
        const approvalLog = logs.find((l) => l.toStage === "approved");
        if (approvalLog) {
          const days = (approvalLog.createdAt - cp.createdAt) / MS_PER_DAY;
          approvalTimes.push(days);
        }
      }
      if (approvalTimes.length > 0) {
        avgTimeToHire = Math.round(
          (approvalTimes.reduce((a, b) => a + b, 0) / approvalTimes.length) * 10
        ) / 10;
      }
    }

    return {
      totalCandidatesInPipeline: current.inPipeline,
      openPositions,
      avgTimeToHire,
      approvalRate: current.approvalRate,
      trends: {
        pipelineChange: current.inPipeline - prev.inPipeline,
        approvalRateChange: current.approvalRate - prev.approvalRate,
      },
    };
  },
});

export const getFunnel = query({
  args: {
    dateFrom: v.number(),
    dateTo: v.number(),
    orgId: v.optional(v.id("organizations")),
    positionId: v.optional(v.id("positions")),
  },
  handler: async (ctx, args) => {
    let cps = await ctx.db.query("candidatePositions").order("desc").take(5000);

    // Date filter
    cps = cps.filter(
      (cp) => cp.createdAt >= args.dateFrom && cp.createdAt <= args.dateTo
    );

    // Position filter
    if (args.positionId) {
      cps = cps.filter((cp) => cp.positionId === args.positionId);
    }

    // Org filter: get position IDs for the org
    if (args.orgId && !args.positionId) {
      const orgPositions = await ctx.db
        .query("positions")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId!))
        .collect();
      const positionIds = new Set(orgPositions.map((p) => p._id));
      cps = cps.filter((cp) => positionIds.has(cp.positionId));
    }

    const total = cps.length;
    const stageCounts = STAGES.map((stage) => ({
      stage,
      count: cps.filter((cp) => cp.stage === stage).length,
      percentage: total > 0
        ? Math.round((cps.filter((cp) => cp.stage === stage).length / total) * 100)
        : 0,
    }));

    // Conversion rates
    const submitted = stageCounts.find((s) => s.stage === "submitted")!.count;
    const toInterview = stageCounts.find((s) => s.stage === "to_interview")!.count;
    const approved = stageCounts.find((s) => s.stage === "approved")!.count;

    // Candidates that ever reached to_interview = currently in to_interview + approved + rejected (from to_interview)
    const passedToInterview = toInterview + approved;
    const submittedToInterview =
      submitted + passedToInterview > 0
        ? Math.round((passedToInterview / (submitted + passedToInterview)) * 100)
        : 0;
    const interviewToApproved =
      passedToInterview > 0
        ? Math.round((approved / passedToInterview) * 100)
        : 0;

    return {
      stages: stageCounts,
      total,
      conversionRates: {
        submittedToInterview,
        interviewToApproved,
      },
    };
  },
});

export const getStageBottlenecks = query({
  args: {
    dateFrom: v.number(),
    dateTo: v.number(),
    orgId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    let cps = await ctx.db.query("candidatePositions").order("desc").take(5000);

    cps = cps.filter(
      (cp) => cp.createdAt >= args.dateFrom && cp.createdAt <= args.dateTo
    );

    if (args.orgId) {
      const orgPositions = await ctx.db
        .query("positions")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId!))
        .collect();
      const positionIds = new Set(orgPositions.map((p) => p._id));
      cps = cps.filter((cp) => positionIds.has(cp.positionId));
    }

    const now = Date.now();
    const stageDurations: Record<string, number[]> = {
      submitted: [],
      to_interview: [],
      approved: [],
      rejected: [],
    };

    // Sample up to 200 CPs to keep activity log lookups reasonable
    const sampled = cps.slice(0, 200);

    for (const cp of sampled) {
      const logs = await ctx.db
        .query("activityLog")
        .withIndex("by_candidate_position", (q) =>
          q.eq("candidatePositionId", cp._id)
        )
        .collect();

      // Sort logs chronologically
      const sorted = logs
        .filter((l) => l.toStage)
        .sort((a, b) => a.createdAt - b.createdAt);

      // Track time in each stage
      let enteredStageAt = cp.createdAt; // started in "submitted"
      let currentStage = "submitted";

      for (const log of sorted) {
        if (log.fromStage && log.fromStage === currentStage) {
          const daysInStage = (log.createdAt - enteredStageAt) / MS_PER_DAY;
          stageDurations[currentStage]?.push(daysInStage);
          currentStage = log.toStage!;
          enteredStageAt = log.createdAt;
        }
      }

      // Time in current stage (still active)
      const daysInCurrent = (now - enteredStageAt) / MS_PER_DAY;
      stageDurations[currentStage]?.push(daysInCurrent);
    }

    return STAGES.map((stage) => {
      const durations = stageDurations[stage];
      const avg =
        durations.length > 0
          ? Math.round(
              (durations.reduce((a, b) => a + b, 0) / durations.length) * 10
            ) / 10
          : 0;
      return {
        stage,
        avgDays: avg,
        candidateCount: durations.length,
      };
    });
  },
});

export const getClientActivity = query({
  args: {
    dateFrom: v.number(),
    dateTo: v.number(),
  },
  handler: async (ctx, args) => {
    const orgs = await ctx.db.query("organizations").collect();
    const allPositions = await ctx.db.query("positions").collect();

    // Fetch CPs once and share across all orgs
    const allCPs = await ctx.db
      .query("candidatePositions")
      .order("desc")
      .take(5000);
    const dateCPs = allCPs.filter(
      (cp) => cp.createdAt >= args.dateFrom && cp.createdAt <= args.dateTo
    );

    // Build position → org mapping
    const positionToOrg = new Map<string, string>();
    for (const p of allPositions) {
      positionToOrg.set(p._id, p.orgId);
    }

    const results = await Promise.all(
      orgs.map(async (org) => {
        const orgPositions = allPositions.filter((p) => p.orgId === org._id);
        const openPositions = orgPositions.filter(
          (p) => p.status === "open"
        ).length;
        const positionIds = new Set(orgPositions.map((p) => p._id));

        const orgCPs = dateCPs.filter((cp) => positionIds.has(cp.positionId));

        // Users in this org
        const orgUsers = await ctx.db
          .query("users")
          .withIndex("by_org", (q) => q.eq("orgId", org._id))
          .collect();
        const clientUsers = orgUsers.filter((u) => u.role === "client");

        // Last active: most recent login
        let lastActive: number | null = null;
        for (const u of clientUsers) {
          if (u.lastLoginAt && (!lastActive || u.lastLoginAt > lastActive)) {
            lastActive = u.lastLoginAt;
          }
        }

        // Average response time: assignment → first client action (sample up to 50)
        const responseTimes: number[] = [];
        const clientUserIds = new Set(clientUsers.map((u) => u._id));
        for (const cp of orgCPs.slice(0, 50)) {
          const logs = await ctx.db
            .query("activityLog")
            .withIndex("by_candidate_position", (q) =>
              q.eq("candidatePositionId", cp._id)
            )
            .collect();
          const firstClientAction = logs
            .filter((l) => clientUserIds.has(l.userId))
            .sort((a, b) => a.createdAt - b.createdAt)[0];
          if (firstClientAction) {
            const days =
              (firstClientAction.createdAt - cp.createdAt) / MS_PER_DAY;
            responseTimes.push(days);
          }
        }

        const avgResponseTime =
          responseTimes.length > 0
            ? Math.round(
                (responseTimes.reduce((a, b) => a + b, 0) /
                  responseTimes.length) *
                  10
              ) / 10
            : null;

        return {
          orgId: org._id,
          orgName: org.name,
          openPositions,
          candidateCount: orgCPs.length,
          avgResponseTime,
          lastActive,
        };
      })
    );

    return results;
  },
});
