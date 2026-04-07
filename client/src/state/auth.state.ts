export let pendingVerificationEmail: string | null = null;

export function setPendingVerificationEmail(email: string | null) {
  pendingVerificationEmail = email;
}
