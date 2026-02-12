import { Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import * as React from "react";

interface LoginEntry {
  userName: string;
  orgName: string;
  loginTime: string;
}

interface LoginDigestEmailProps {
  logins: LoginEntry[];
}

export function LoginDigestEmail({
  logins = [
    { userName: "Jane Smith", orgName: "Acme Corp", loginTime: "3:45 PM" },
    { userName: "Bob Wilson", orgName: "Tech Inc", loginTime: "2:30 PM" },
  ],
}: LoginDigestEmailProps) {
  return (
    <EmailLayout preview={`${logins.length} client logins today`}>
      <Text style={heading}>Login Summary</Text>
      <Text style={body}>
        {logins.length} client{logins.length !== 1 ? "s" : ""} logged in
        recently.
      </Text>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>User</th>
            <th style={th}>Organization</th>
            <th style={th}>Time</th>
          </tr>
        </thead>
        <tbody>
          {logins.map((login, i) => (
            <tr key={i}>
              <td style={td}>{login.userName}</td>
              <td style={td}>{login.orgName}</td>
              <td style={td}>{login.loginTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </EmailLayout>
  );
}

export default LoginDigestEmail;

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
  margin: "0 0 16px",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  margin: "0 0 24px",
};

const th: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  padding: "8px 12px",
  borderBottom: "2px solid #e5e7eb",
  textAlign: "left" as const,
};

const td: React.CSSProperties = {
  fontSize: "14px",
  color: "#374151",
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
};
