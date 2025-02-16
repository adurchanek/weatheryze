import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "us-east-2" });

export const sendEmail = async (to, subject, message) => {
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: message } },
    },
    Source: "admin@weatheryze.com",
  };

  const command = new SendEmailCommand(params);

  try {
    await ses.send(command);
    console.log("Email sent successfully:");
  } catch (error) {
    console.error("Error sending email:", error.message || error);
    throw new Error("Failed to send email.");
  }
};
