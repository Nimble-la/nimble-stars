import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import * as React from "react";

const stageColors: Record<string, { bg: string; text: string; label: string }> = {
  submitted: { bg: "#DBEAFE", text: "#1D4ED8", label: "Submitted" },
  to_interview: { bg: "#FEF3C7", text: "#B45309", label: "To Interview" },
  approved: { bg: "#D1FAE5", text: "#047857", label: "Approved" },
  rejected: { bg: "#FEE2E2", text: "#B91C1C", label: "Rejected" },
};

interface StageChangeEmailProps {
  candidateName: string;
  fromStage: string;
  toStage: string;
  positionTitle: string;
  actorName: string;
  orgName: string;
  profileUrl: string;
}

export function StageChangeEmail({
  candidateName = "John Doe",
  fromStage = "submitted",
  toStage = "to_interview",
  positionTitle = "Senior Developer",
  actorName = "Jane Smith",
  orgName = "Acme Corp",
  profileUrl = "https://stars.nimble.la",
}: StageChangeEmailProps) {
  const from = stageColors[fromStage] || stageColors.submitted;
  const to = stageColors[toStage] || stageColors.submitted;

  return (
    <EmailLayout preview={`${actorName} moved ${candidateName} to ${to.label}`}>
      <Text style={heading}>Stage Change</Text>
      <Text style={body}>
        <strong>{actorName}</strong> moved <strong>{candidateName}</strong> from{" "}
        <span style={{ ...badge, backgroundColor: from.bg, color: from.text }}>
          {from.label}
        </span>{" "}
        to{" "}
        <span style={{ ...badge, backgroundColor: to.bg, color: to.text }}>
          {to.label}
        </span>
      </Text>
      <Text style={context}>
        Position: {positionTitle} &middot; {orgName}
      </Text>
      <Button style={cta} href={profileUrl}>
        View Candidate Profile
      </Button>
    </EmailLayout>
  );
}

export default StageChangeEmail;

const heading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#111827",
  margin: "16px 0 8px",
};

const body: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  lineHeight: "24px",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "600",
};

const context: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "4px 0 24px",
};

const cta: React.CSSProperties = {
  backgroundColor: "#111827",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
};
