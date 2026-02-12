"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import { uploadFile } from "@/lib/supabase/storage";
import type { Id } from "../../../../../../convex/_generated/dataModel";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function EditDialog({
  org,
  onSave,
}: {
  org: { name: string; logoUrl?: string; primaryColor?: string; _id: string };
  onSave: (data: { name: string; logoUrl?: string; primaryColor?: string }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(org.name);
  const [primaryColor, setPrimaryColor] = useState(org.primaryColor ?? "#3B82F6");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        const path = `orgs/${Date.now()}-${logoFile.name}`;
        logoUrl = await uploadFile("logos", path, logoFile);
      }
      await onSave({ name, logoUrl, primaryColor });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo</label>
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={logoPreview ?? org.logoUrl ?? ""} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border p-0.5"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="max-w-[120px]"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const org = useQuery(api.organizations.getDetail, {
    orgId: orgId as Id<"organizations">,
  });
  const updateOrg = useMutation(api.organizations.update);

  if (org === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (org === null) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Client Not Found</h1>
        <Button variant="outline" onClick={() => router.push("/admin/clients")}>
          Back to Clients
        </Button>
      </div>
    );
  }

  const handleSave = async (data: {
    name: string;
    logoUrl?: string;
    primaryColor?: string;
  }) => {
    await updateOrg({
      orgId: org._id,
      name: data.name,
      logoUrl: data.logoUrl,
      primaryColor: data.primaryColor,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={org.logoUrl ?? ""} />
          <AvatarFallback className="text-lg">
            {org.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{org.name}</h1>
            {org.primaryColor && (
              <div
                className="h-5 w-5 rounded-full border"
                style={{ backgroundColor: org.primaryColor }}
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(org.createdAt)}
          </p>
        </div>
        <EditDialog org={org} onSave={handleSave} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="positions">
        <TabsList>
          <TabsTrigger value="positions">
            Positions ({org.positions.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({org.users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {org.positions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No positions yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Candidates</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {org.positions.map((pos) => (
                      <TableRow key={pos._id}>
                        <TableCell className="font-medium">
                          {pos.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={pos.status === "open" ? "default" : "secondary"}
                            className={
                              pos.status === "open"
                                ? "bg-stage-approved text-white"
                                : ""
                            }
                          >
                            {pos.status === "open" ? "Open" : "Closed"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {pos.candidateCount}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(pos.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              {org.users.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No users yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {org.users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
