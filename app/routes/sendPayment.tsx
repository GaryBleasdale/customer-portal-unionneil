import { json, type ActionFunction } from "@remix-run/node";
import { Resend } from "resend";
import BoletoEmail from "~/components/ui/boletoEmail";

export const action: ActionFunction = async ({ request }) => {
  const {
    billingMonth,
    patientTitle,
    patientName,
    dueDate,
    recipientEmails,
    AdditionalInfo,
    boletoURL,
    faturaURL,
  } = await request.json();

  const extractFileId = (url: string): string | null => {
    const match = url.match(/\/d\/([^/]+)\//);
    return match ? match[1] : null;
  };

  const boletoFileId = extractFileId(boletoURL);
  const faturaFileId = extractFileId(faturaURL);
  const boletoDirectUrl = boletoFileId
    ? `https://drive.google.com/uc?export=download&id=${boletoFileId}`
    : boletoURL;
  const faturaDirectUrl = faturaFileId
    ? `https://drive.google.com/uc?export=download&id=${faturaFileId}`
    : faturaURL;

  const emailData = {
    from: "Portal Union Neil <atendimento@unionneil.com.br>",
    to: recipientEmails,
    subject: `Seu Boleto da UNION NEIL ref: ${billingMonth}`,
    react: (
      <BoletoEmail
        billingMonth={billingMonth}
        patientTitle={patientTitle}
        patientName={patientName}
        dueDate={dueDate}
        AdditionalInfo={AdditionalInfo}
        boletoURL={boletoDirectUrl}
        faturaURL={faturaDirectUrl}
      />
    ),
  };

  const resend = new Resend(process.env.RESEND_KEY);

  const boletoSend = await resend.emails.send(emailData);
  console.log("boletoSend", boletoSend);

  return null;
};
