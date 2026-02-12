import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Nimble S.T.A.R.S
        </h1>
        <p className="text-lg text-muted-foreground">
          Sourcing Talent And Recruiting Solutions
        </p>
        <Link
          href="/design-system"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          View Design System
        </Link>
      </main>
    </div>
  );
}
