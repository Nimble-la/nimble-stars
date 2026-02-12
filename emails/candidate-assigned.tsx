import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import * as React from "react";

interface CandidateAssignedEmailProps {
  candidateName: string;
  positionTitle: string;
  orgName: string;
  currentRole?: string;
  profileUrl: string;
}

export function CandidateAssignedEmail({
  candidateName = "John Doe",
  positionTitle = "Senior Developer",
  orgName = "Acme Corp",
  currentRole,
  profileUrl = "https://stars.nimble.la",
}: CandidateAssignedEmailProps) {
  return (
    <EmailLayout
      preview={`New candidate added to ${positionTitle}`}
    >
      <Text style={heading}>New Candidate Assigned</Text>
      <Text style={body}>
        A new candidate has been added to <strong>{positionTitle}</strong>
      </Text>
      <Text style={context}>{orgName}</Text>
      <div style={candidateCard}>
        <Text style={candidateNameStyle}>{candidateName}</Text>
        {currentRole && (
          <Text style={candidateRole}>{currentRole}</Text>
        )}
      </div>
      <Button style={cta} href={profileUrl}>
        Review Candidate
      </Button>
    </EmailLayout>
  );
}

export default CandidateAssignedEmail;

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

const context: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "4px 0 16px",
};

const candidateCard: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 0 24px",
};

const candidateNameStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  margin: "0",
};

const candidateRole: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "4px 0 0",
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
