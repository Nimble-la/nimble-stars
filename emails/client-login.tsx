import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import * as React from "react";

interface ClientLoginEmailProps {
  userName: string;
  orgName: string;
  loginTime: string;
  clientDetailUrl: string;
}

export function ClientLoginEmail({
  userName = "Jane Smith",
  orgName = "Acme Corp",
  loginTime = "Feb 12, 2026 at 3:45 PM",
  clientDetailUrl = "https://stars.nimble.la/admin/clients",
}: ClientLoginEmailProps) {
  return (
    <EmailLayout preview={`${userName} from ${orgName} logged in`}>
      <Text style={heading}>Client Login</Text>
      <Text style={body}>
        <strong>{userName}</strong> from <strong>{orgName}</strong> logged in
      </Text>
      <Text style={timestamp}>{loginTime}</Text>
      <Button style={cta} href={clientDetailUrl}>
        View Client
      </Button>
    </EmailLayout>
  );
}

export default ClientLoginEmail;

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

const timestamp: React.CSSProperties = {
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
