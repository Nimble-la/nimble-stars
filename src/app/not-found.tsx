import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-muted-foreground">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
        <p className="mt-12 text-sm text-muted-foreground">
          nimble <span className="text-muted-foreground/50">S.T.A.R.S</span>
        </p>
      </div>
    </div>
  );
}
