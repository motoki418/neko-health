import { assertHousehold } from "@/lib/auth";

export default async function SecretLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  await assertHousehold(secret);
  return <>{children}</>;
}
