export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="py-8 mx-auto flex flex-col gap-12 items-start">{children}</div>
  );
}
