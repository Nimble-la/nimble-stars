"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadFile } from "@/lib/supabase/storage";
import { toast } from "sonner";

export default function NewClientPage() {
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrg = useMutation(api.organizations.create);
  const router = useRouter();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let logoUrl: string | undefined;

      if (logoFile) {
        const path = `orgs/${Date.now()}-${logoFile.name}`;
        logoUrl = await uploadFile("logos", path, logoFile);
      }

      const id = await createOrg({
        name: name.trim(),
        logoUrl,
        primaryColor,
      });

      toast.success("Client created");
      router.push(`/admin/clients/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create client");
      setError(
        err instanceof Error ? err.message : "Failed to create client"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Client</h1>
        <p className="text-muted-foreground">
          Create a new client organization with branding.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Organization Name *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                required
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label htmlFor="logo" className="text-sm font-medium">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={logoPreview ?? ""} />
                  <AvatarFallback>
                    {name ? name.slice(0, 2).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <label htmlFor="color" className="text-sm font-medium">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border p-0.5"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="max-w-[120px]"
                />
                <div
                  className="h-10 flex-1 rounded-md border"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? "Creating..." : "Create Client"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
