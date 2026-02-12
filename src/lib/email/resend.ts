import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "notifications@stars.nimble.la";

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<{ id?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: `Nimble S.T.A.R.S <${FROM_EMAIL}>`,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("[Resend] Failed to send email:", error);
      return { error: error.message };
    }

    return { id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Resend] Exception sending email:", message);
    return { error: message };
  }
}
