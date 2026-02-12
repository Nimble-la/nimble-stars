"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ManatalCandidateCard } from "./manatal-candidate-card";
import { Search, X, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { ManatalCandidate } from "@/lib/types/manatal";

interface ManatalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (manatalId: number) => Promise<void>;
  onImported?: () => void;
}

const PAGE_SIZE = 10;
const MIN_QUERY_LENGTH = 2;

export function ManatalSearch({
  open,
  onOpenChange,
  onImport,
  onImported,
}: ManatalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ManatalCandidate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);

  const searchAction = useAction(api.manatal.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchIdRef = useRef(0);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Perform search
  const doSearch = useCallback(async () => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed || trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
      return;
    }

    const currentSearchId = ++searchIdRef.current;

    setLoading(true);
    setError(null);
    try {
      const data = await searchAction({
        query: trimmed,
        page,
        pageSize: PAGE_SIZE,
      });
      // Ignore stale results from previous searches
      if (currentSearchId !== searchIdRef.current) return;
      setResults(data.results ?? []);
      setTotalCount(data.count ?? 0);
      setHasSearched(true);
    } catch (err) {
      if (currentSearchId !== searchIdRef.current) return;
      const message = err instanceof Error ? err.message : "Search failed";
      setError(getSearchErrorMessage(message));
      setResults([]);
    } finally {
      if (currentSearchId === searchIdRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedQuery, page, searchAction]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  const handleImport = async (manatalId: number) => {
    setImportingId(manatalId);
    try {
      await onImport(manatalId);
      toast.success("Candidate imported successfully");
      onImported?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      if (message.includes("already been imported")) {
        toast.warning("This candidate has already been imported");
      } else if (message.includes("API key")) {
        toast.error("Manatal API key is not configured. Please check settings.");
      } else if (message.includes("timed out")) {
        toast.error("Import timed out. Please try again.");
      } else {
        toast.error(message);
      }
    } finally {
      setImportingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setTotalCount(0);
      setPage(1);
      setError(null);
      setHasSearched(false);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Import from Manatal</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name (min. 2 characters)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Error with retry */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p>{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 px-2 text-red-700 hover:text-red-900 hover:bg-red-100"
                  onClick={() => {
                    setError(null);
                    doSearch();
                  }}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          <ScrollArea className="h-[calc(100vh-240px)]">
            {loading ? (
              <div className="space-y-3 p-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : !hasSearched ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {query.length > 0 && query.length < MIN_QUERY_LENGTH
                  ? `Type at least ${MIN_QUERY_LENGTH} characters to search`
                  : "Start typing to search Manatal"}
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No candidates found
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Showing {results.length} of {totalCount} results
                </p>
                {results.map((candidate) => (
                  <ManatalCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onImport={handleImport}
                    importing={importingId === candidate.id}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getSearchErrorMessage(message: string): string {
  if (message.includes("API key")) {
    return "Manatal API key is not configured. Please contact an administrator.";
  }
  if (message.includes("timed out")) {
    return "The search request timed out. Please try again.";
  }
  if (message.includes("Rate limited") || message.includes("429")) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (message.includes("Could not connect")) {
    return "Could not connect to Manatal. Please check your connection and try again.";
  }
  return message;
}
