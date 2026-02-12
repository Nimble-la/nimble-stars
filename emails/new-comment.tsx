import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import * as React from "react";

interface NewCommentEmailProps {
  candidateName: string;
  positionTitle: string;
  actorName: string;
  commentPreview: string;
  profileUrl: string;
}

export function NewCommentEmail({
  candidateName = "John Doe",
  positionTitle = "Senior Developer",
  actorName = "Jane Smith",
  commentPreview = "This candidate looks great for the role. I think we should move forward with the interview process.",
  profileUrl = "https://stars.nimble.la",
}: NewCommentEmailProps) {
  const truncated =
    commentPreview.length > 200
      ? commentPreview.slice(0, 200) + "..."
      : commentPreview;

  return (
    <EmailLayout preview={`${actorName} commented on ${candidateName}`}>
      <Text style={heading}>New Comment</Text>
      <Text style={body}>
        <strong>{actorName}</strong> left a comment on{" "}
        <strong>{candidateName}</strong>
      </Text>
      <Text style={context}>Position: {positionTitle}</Text>
      <div style={quoteBlock}>
        <Text style={quoteText}>&ldquo;{truncated}&rdquo;</Text>
      </div>
      <Button style={cta} href={profileUrl}>
        View Comments
      </Button>
    </EmailLayout>
  );
}

export default NewCommentEmail;

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

const quoteBlock: React.CSSProperties = {
  borderLeft: "3px solid #d1d5db",
  paddingLeft: "16px",
  margin: "0 0 24px",
};

const quoteText: React.CSSProperties = {
  fontSize: "14px",
  color: "#4b5563",
  fontStyle: "italic",
  lineHeight: "22px",
  margin: "0",
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
