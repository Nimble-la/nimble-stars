// Simple HTML email templates for Convex actions
// These mirror the React Email templates but as plain HTML strings

const STAGE_LABELS: Record<string, string> = {
  submitted: "Submitted",
  to_interview: "To Interview",
  approved: "Approved",
  rejected: "Rejected",
};

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  submitted: { bg: "#DBEAFE", text: "#1D4ED8" },
  to_interview: { bg: "#FEF3C7", text: "#B45309" },
  approved: { bg: "#D1FAE5", text: "#047857" },
  rejected: { bg: "#FEE2E2", text: "#B91C1C" },
};

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0">
<div style="background:#fff;max-width:580px;margin:0 auto;padding:20px 0 48px">
  <div style="padding:32px 40px 16px">
    <div style="font-size:24px;font-weight:bold;color:#111827;margin:0;line-height:1">nimble</div>
    <div style="font-size:11px;color:#6b7280;margin:2px 0 0;letter-spacing:2px;text-transform:uppercase">S.T.A.R.S</div>
  </div>
  <div style="padding:0 40px">${content}</div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 40px">
  <div style="padding:0 40px">
    <p style="font-size:12px;color:#6b7280;margin:0">Nimble S.T.A.R.S &middot; <a href="https://nimble.la" style="color:#6b7280;text-decoration:underline">nimble.la</a></p>
    <p style="font-size:11px;color:#9ca3af;margin:8px 0 0">You received this because you're a user on the platform.</p>
  </div>
</div>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#111827;color:#fff;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;margin-top:8px">${text}</a>`;
}

function stageBadge(stage: string): string {
  const colors = STAGE_COLORS[stage] || STAGE_COLORS.submitted;
  const label = STAGE_LABELS[stage] || stage;
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;background:${colors.bg};color:${colors.text}">${label}</span>`;
}

export function stageChangeHtml(data: {
  actorName: string;
  candidateName: string;
  fromStage: string;
  toStage: string;
  positionTitle: string;
  orgName: string;
  profileUrl: string;
}): string {
  return wrap(`
    <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:16px 0 8px">Stage Change</h2>
    <p style="font-size:14px;color:#374151;line-height:24px">
      <strong>${data.actorName}</strong> moved <strong>${data.candidateName}</strong>
      from ${stageBadge(data.fromStage)} to ${stageBadge(data.toStage)}
    </p>
    <p style="font-size:13px;color:#6b7280;margin:4px 0 24px">Position: ${data.positionTitle} &middot; ${data.orgName}</p>
    ${btn("View Candidate Profile", data.profileUrl)}
  `);
}

export function newCommentHtml(data: {
  actorName: string;
  candidateName: string;
  positionTitle: string;
  commentPreview: string;
  profileUrl: string;
}): string {
  const preview =
    data.commentPreview.length > 200
      ? data.commentPreview.slice(0, 200) + "..."
      : data.commentPreview;
  return wrap(`
    <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:16px 0 8px">New Comment</h2>
    <p style="font-size:14px;color:#374151;line-height:24px">
      <strong>${data.actorName}</strong> left a comment on <strong>${data.candidateName}</strong>
    </p>
    <p style="font-size:13px;color:#6b7280;margin:4px 0 16px">Position: ${data.positionTitle}</p>
    <div style="border-left:3px solid #d1d5db;padding-left:16px;margin:0 0 24px">
      <p style="font-size:14px;color:#4b5563;font-style:italic;line-height:22px;margin:0">&ldquo;${preview}&rdquo;</p>
    </div>
    ${btn("View Comments", data.profileUrl)}
  `);
}

export function candidateAssignedHtml(data: {
  candidateName: string;
  positionTitle: string;
  orgName: string;
  currentRole?: string;
  profileUrl: string;
}): string {
  return wrap(`
    <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:16px 0 8px">New Candidate Assigned</h2>
    <p style="font-size:14px;color:#374151;line-height:24px">
      A new candidate has been added to <strong>${data.positionTitle}</strong>
    </p>
    <p style="font-size:13px;color:#6b7280;margin:4px 0 16px">${data.orgName}</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 24px">
      <p style="font-size:16px;font-weight:600;color:#111827;margin:0">${data.candidateName}</p>
      ${data.currentRole ? `<p style="font-size:13px;color:#6b7280;margin:4px 0 0">${data.currentRole}</p>` : ""}
    </div>
    ${btn("Review Candidate", data.profileUrl)}
  `);
}

// Workflow-specific: richer stage emails with next-step guidance
export function workflowToInterviewHtml(data: {
  candidateName: string;
  positionTitle: string;
  orgName: string;
  profileUrl: string;
}): string {
  return wrap(`
    <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:16px 0 8px">Interview Stage</h2>
    <p style="font-size:14px;color:#374151;line-height:24px">
      <strong>${data.candidateName}</strong> has been moved to the ${stageBadge("to_interview")} stage
      for <strong>${data.positionTitle}</strong>.
    </p>
    <p style="font-size:13px;color:#6b7280;margin:4px 0 8px">${data.orgName}</p>
    <div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:16px;margin:16px 0 24px">
      <p style="font-size:14px;color:#92400E;margin:0;font-weight:600">Next Step: Schedule an interview</p>
      <p style="font-size:13px;color:#92400E;margin:4px 0 0">Review the candidate's profile and coordinate interview scheduling.</p>
    </div>
    ${btn("Review Candidate", data.profileUrl)}
  `);
}

export function workflowApprovedHtml(data: {
  candidateName: string;
  positionTitle: string;
  orgName: string;
  profileUrl: string;
}): string {
  return wrap(`
    <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:16px 0 8px">Candidate Approved</h2>
    <p style="font-size:14px;color:#374151;line-height:24px">
      <strong>${data.candidateName}</strong> has been ${stageBadge("approved")}
      for <strong>${data.positionTitle}</strong>.
    </p>
    <p style="font-size:13px;color:#6b7280;margin:4px 0 8px">${data.orgName}</p>
    <div style="background:#D1FAE5;border:1px solid #10B981;border-radius:8px;padding:16px;margin:16px 0 24px">
      <p style="font-size:14px;color:#065F46;margin:0;font-weight:600">Next Step: Prepare offer</p>
      <p style="font-size:13px;color:#065F46;margin:4px 0 0">The candidate has been approved. Coordinate next steps for the hiring process.</p>
    </div>
    ${btn("View Candidate", data.profileUrl)}
  `);
}

export function workflowRejectedHtml(data: {
  candidateName: string;
  positionTitle: string;
  actorName: string;
  orgName: string;
  profileUrl: string;
}): string {
  return wrap(`
    <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:16px 0 8px">Candidate Rejected</h2>
    <p style="font-size:14px;color:#374151;line-height:24px">
      <strong>${data.candidateName}</strong> was ${stageBadge("rejected")}
      for <strong>${data.positionTitle}</strong> by <strong>${data.actorName}</strong>.
    </p>
    <p style="font-size:13px;color:#6b7280;margin:4px 0 24px">${data.orgName}</p>
    ${btn("View Details", data.profileUrl)}
  `);
}

export function adminCommentHtml(data: {
  candidateName: string;
  positionTitle: string;
  commentPreview: string;
  profileUrl: string;
}): string {
  const preview =
    data.commentPreview.length > 200
      ? data.commentPreview.slice(0, 200) + "..."
      : data.commentPreview;
  return wrap(`
    <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:16px 0 8px">Note from Nimble</h2>
    <p style="font-size:14px;color:#374151;line-height:24px">
      Nimble left a note on <strong>${data.candidateName}</strong>
    </p>
    <p style="font-size:13px;color:#6b7280;margin:4px 0 16px">Position: ${data.positionTitle}</p>
    <div style="border-left:3px solid #d1d5db;padding-left:16px;margin:0 0 24px">
      <p style="font-size:14px;color:#4b5563;font-style:italic;line-height:22px;margin:0">&ldquo;${preview}&rdquo;</p>
    </div>
    ${btn("View Comments", data.profileUrl)}
  `);
}

export function clientLoginHtml(data: {
  userName: string;
  orgName: string;
  loginTime: string;
  clientDetailUrl: string;
}): string {
  return wrap(`
    <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:16px 0 8px">Client Login</h2>
    <p style="font-size:14px;color:#374151;line-height:24px">
      <strong>${data.userName}</strong> from <strong>${data.orgName}</strong> logged in
    </p>
    <p style="font-size:13px;color:#6b7280;margin:4px 0 24px">${data.loginTime}</p>
    ${btn("View Client", data.clientDetailUrl)}
  `);
}
