export function validatePassword(password: string): boolean {
  const regex = /^.{10,}$/;
  return regex.test(password);
}
