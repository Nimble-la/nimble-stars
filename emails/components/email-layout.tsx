import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>nimble</Text>
            <Text style={tagline}>S.T.A.R.S</Text>
          </Section>

          <Section style={content}>{children}</Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Nimble S.T.A.R.S &middot;{" "}
              <Link href="https://nimble.la" style={footerLink}>
                nimble.la
              </Link>
            </Text>
            <Text style={footerNote}>
              You received this because you&apos;re a user on the platform.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "580px",
};

const header: React.CSSProperties = {
  padding: "32px 40px 16px",
};

const logo: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#111827",
  margin: "0",
  lineHeight: "1",
};

const tagline: React.CSSProperties = {
  fontSize: "11px",
  color: "#6b7280",
  margin: "2px 0 0",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
};

const content: React.CSSProperties = {
  padding: "0 40px",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "32px 40px",
};

const footer: React.CSSProperties = {
  padding: "0 40px",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "0",
};

const footerLink: React.CSSProperties = {
  color: "#6b7280",
  textDecoration: "underline",
};

const footerNote: React.CSSProperties = {
  fontSize: "11px",
  color: "#9ca3af",
  margin: "8px 0 0",
};
