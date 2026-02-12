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
            Componentes shadcn/ui y variables de tema del proyecto.
          </p>
        </div>

        {/* Stage Colors */}
        <Section title="Colores de Etapa">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-stage-presentado" />
              <span className="text-sm">Presentado (#3B82F6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-stage-entrevistar" />
              <span className="text-sm">A Entrevistar (#F59E0B)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-stage-aprobado" />
              <span className="text-sm">Aprobado (#10B981)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-stage-rechazado" />
              <span className="text-sm">Rechazado (#EF4444)</span>
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
            <Input placeholder="Escribe algo..." />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Input controlado"
            />
            <Input disabled placeholder="Deshabilitado" />
          </div>
        </Section>

        {/* Textarea */}
        <Section title="Textarea">
          <div className="max-w-sm">
            <Textarea placeholder="Escribe un comentario..." />
          </div>
        </Section>

        {/* Select */}
        <Section title="Select">
          <div className="max-w-sm">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presentado">Presentado</SelectItem>
                <SelectItem value="a_entrevistar">A Entrevistar</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
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
            <Badge className="bg-stage-presentado text-white hover:bg-stage-presentado/90">
              Presentado
            </Badge>
            <Badge className="bg-stage-entrevistar text-white hover:bg-stage-entrevistar/90">
              A Entrevistar
            </Badge>
            <Badge className="bg-stage-aprobado text-white hover:bg-stage-aprobado/90">
              Aprobado
            </Badge>
            <Badge className="bg-stage-rechazado text-white hover:bg-stage-rechazado/90">
              Rechazado
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
                <CardTitle>Candidato</CardTitle>
                <CardDescription>
                  Información del candidato para la posición.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Juan Pérez — Desarrollador Frontend Senior
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Ver perfil</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Posición</CardTitle>
                <CardDescription>Detalle de la posición abierta.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Frontend Developer — Acme Corp
                </p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-stage-aprobado text-white">Abierta</Badge>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Table */}
        <Section title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Juan Pérez</TableCell>
                <TableCell>Frontend Developer</TableCell>
                <TableCell>
                  <Badge className="bg-stage-presentado text-white">
                    Presentado
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>María García</TableCell>
                <TableCell>Backend Developer</TableCell>
                <TableCell>
                  <Badge className="bg-stage-entrevistar text-white">
                    A Entrevistar
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Carlos López</TableCell>
                <TableCell>UX Designer</TableCell>
                <TableCell>
                  <Badge className="bg-stage-aprobado text-white">
                    Aprobado
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        {/* Tabs */}
        <Section title="Tabs">
          <Tabs defaultValue="candidatos">
            <TabsList>
              <TabsTrigger value="candidatos">Candidatos</TabsTrigger>
              <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
              <TabsTrigger value="actividad">Actividad</TabsTrigger>
            </TabsList>
            <TabsContent value="candidatos" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Lista de candidatos asignados a esta posición.
              </p>
            </TabsContent>
            <TabsContent value="posiciones" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Posiciones abiertas de la organización.
              </p>
            </TabsContent>
            <TabsContent value="actividad" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Historial de actividad reciente.
              </p>
            </TabsContent>
          </Tabs>
        </Section>

        {/* Dialog */}
        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Abrir diálogo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar acción</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas mover este candidato a la
                  siguiente etapa?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        {/* Sheet */}
        <Section title="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Abrir panel lateral</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Detalle del candidato</SheetTitle>
                <SheetDescription>
                  Información completa del candidato seleccionado.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium">Nombre</p>
                  <p className="text-sm text-muted-foreground">Juan Pérez</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    juan@ejemplo.com
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
              <Button variant="outline">Opciones</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ver perfil</DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Mover etapa</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        {/* Tooltip */}
        <Section title="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover sobre mí</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Este es un tooltip de ejemplo</p>
            </TooltipContent>
          </Tooltip>
        </Section>

        {/* Separator */}
        <Section title="Separator">
          <div className="space-y-2">
            <p className="text-sm">Contenido arriba</p>
            <Separator />
            <p className="text-sm">Contenido abajo</p>
          </div>
        </Section>

        {/* ScrollArea */}
        <Section title="ScrollArea">
          <ScrollArea className="h-48 w-full rounded-md border p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="py-2 text-sm">
                Elemento de lista #{i + 1} — Candidato de ejemplo
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
