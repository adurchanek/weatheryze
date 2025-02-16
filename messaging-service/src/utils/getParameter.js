import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import getDevEnvVariable from "../../config.js";

const client = new SSMClient({ region: "us-east-2" });

export async function getParameter(name) {
  if (process.env.NODE_ENV === "development") {
    return getDevEnvVariable(name);
  }
  try {
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    });
    const response = await client.send(command);
    return response.Parameter.Value;
  } catch (error) {
    console.error(`Error fetching parameter ${name}:`, error);
    throw error;
  }
}
