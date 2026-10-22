export function safeError(error: unknown): string {
  let message = error instanceof Error ? error.message : "Unknown content verification failure";
  for (const [name, secret] of Object.entries(process.env)) {
    if (/KEY|SECRET|TOKEN|DATABASE_URL/.test(name) && secret && secret.length > 8) {
      message = message.split(secret).join("[REDACTED]");
    }
  }
  return message;
}
