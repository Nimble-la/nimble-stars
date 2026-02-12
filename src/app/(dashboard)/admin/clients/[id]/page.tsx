"use client";

import { useParams } from "next/navigation";

export default function ClientDetailPage() {
  const params = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold">Client Detail</h1>
      <p className="mt-2 text-muted-foreground">
        Client ID: {params.id as string}
      </p>
    </div>
  );
}
