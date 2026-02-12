"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <Separator />
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Nimble S.T.A.R.S — Design System
          </h1>
          <p className="mt-2 text-muted-foreground">
            shadcn/ui components and project theme variables.
          </p>
        </div>

        {/* Stage Colors */}
        <Section title="Stage Colors">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-stage-submitted" />
              <span className="text-sm">Submitted (#3B82F6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-stage-interview" />
              <span className="text-sm">To Interview (#F59E0B)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-stage-approved" />
              <span className="text-sm">Approved (#10B981)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-stage-rejected" />
              <span className="text-sm">Rejected (#EF4444)</span>
            </div>
          </div>
        </Section>

        {/* Nimble Grays */}
        <Section title="Nimble Grays">
          <div className="flex flex-wrap gap-4">
            {[
              { name: "Black", cls: "bg-nimble-black" },
              { name: "Gray 900", cls: "bg-nimble-gray-900" },
              { name: "Gray 600", cls: "bg-nimble-gray-600" },
              { name: "Gray 400", cls: "bg-nimble-gray-400" },
              { name: "Gray 200", cls: "bg-nimble-gray-200" },
              { name: "Gray 100", cls: "bg-nimble-gray-100" },
              { name: "Gray 50", cls: "bg-nimble-gray-50" },
              { name: "White", cls: "bg-nimble-white border" },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-md ${c.cls}`} />
                <span className="text-sm">{c.name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Client Theming */}
        <Section title="Client Theming">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-client-primary" />
              <span className="text-sm">Client Primary</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-client-primary-hover" />
              <span className="text-sm">Client Primary Hover</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 rounded-md bg-client-primary-light border" />
              <span className="text-sm">Client Primary Light</span>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Button">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Input */}
        <Section title="Input">
          <div className="flex flex-col gap-4 max-w-sm">
            <Input placeholder="Type something..." />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Controlled input"
            />
            <Input disabled placeholder="Disabled" />
          </div>
        </Section>

        {/* Textarea */}
        <Section title="Textarea">
          <div className="max-w-sm">
            <Textarea placeholder="Write a comment..." />
          </div>
        </Section>

        {/* Select */}
        <Section title="Select">
          <div className="max-w-sm">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="to_interview">To Interview</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        {/* Badge */}
        <Section title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-stage-submitted text-white hover:bg-stage-submitted/90">
              Submitted
            </Badge>
            <Badge className="bg-stage-interview text-white hover:bg-stage-interview/90">
              To Interview
            </Badge>
            <Badge className="bg-stage-approved text-white hover:bg-stage-approved/90">
              Approved
            </Badge>
            <Badge className="bg-stage-rejected text-white hover:bg-stage-rejected/90">
              Rejected
            </Badge>
          </div>
        </Section>

        {/* Avatar */}
        <Section title="Avatar">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>MB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>NS</AvatarFallback>
            </Avatar>
          </div>
        </Section>

        {/* Card */}
        <Section title="Card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Candidate</CardTitle>
                <CardDescription>
                  Candidate information for the position.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  John Smith — Senior Frontend Developer
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">View profile</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Position</CardTitle>
                <CardDescription>Open position details.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Frontend Developer — Acme Corp
                </p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-stage-approved text-white">Open</Badge>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Table */}
        <Section title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Smith</TableCell>
                <TableCell>Frontend Developer</TableCell>
                <TableCell>
                  <Badge className="bg-stage-submitted text-white">
                    Submitted
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Doe</TableCell>
                <TableCell>Backend Developer</TableCell>
                <TableCell>
                  <Badge className="bg-stage-interview text-white">
                    To Interview
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Alex Johnson</TableCell>
                <TableCell>UX Designer</TableCell>
                <TableCell>
                  <Badge className="bg-stage-approved text-white">
                    Approved
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        {/* Tabs */}
        <Section title="Tabs">
          <Tabs defaultValue="candidates">
            <TabsList>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="candidates" className="mt-4">
              <p className="text-sm text-muted-foreground">
                List of candidates assigned to this position.
              </p>
            </TabsContent>
            <TabsContent value="positions" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Open positions for the organization.
              </p>
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Recent activity history.
              </p>
            </TabsContent>
          </Tabs>
        </Section>

        {/* Dialog */}
        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to move this candidate to the next
                  stage?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        {/* Sheet */}
        <Section title="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open side panel</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Candidate details</SheetTitle>
                <SheetDescription>
                  Full information for the selected candidate.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">John Smith</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    john@example.com
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </Section>

        {/* Dropdown Menu */}
        <Section title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Options</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Change stage</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        {/* Tooltip */}
        <Section title="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover over me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a sample tooltip</p>
            </TooltipContent>
          </Tooltip>
        </Section>

        {/* Separator */}
        <Section title="Separator">
          <div className="space-y-2">
            <p className="text-sm">Content above</p>
            <Separator />
            <p className="text-sm">Content below</p>
          </div>
        </Section>

        {/* ScrollArea */}
        <Section title="ScrollArea">
          <ScrollArea className="h-48 w-full rounded-md border p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="py-2 text-sm">
                List item #{i + 1} — Sample candidate
              </div>
            ))}
          </ScrollArea>
        </Section>

        {/* Skeleton */}
        <Section title="Skeleton">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
