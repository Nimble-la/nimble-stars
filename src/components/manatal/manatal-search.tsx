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
import { ManatalCandidateCard } from "./manatal-candidate-card";
import { Search, X, Loader2, AlertCircle } from "lucide-react";
import type { ManatalCandidate } from "@/lib/types/manatal";

interface ManatalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (manatalId: number) => Promise<void>;
  onImported?: () => void;
}

const PAGE_SIZE = 10;

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
    if (!debouncedQuery.trim()) {
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchAction({
        query: debouncedQuery,
        page,
        pageSize: PAGE_SIZE,
      });
      setResults(data.results ?? []);
      setTotalCount(data.count ?? 0);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, searchAction]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  const handleImport = async (manatalId: number) => {
    setImportingId(manatalId);
    try {
      await onImport(manatalId);
      onImported?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
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
              placeholder="Search candidates by name..."
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

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Results */}
          <ScrollArea className="h-[calc(100vh-240px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !hasSearched ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Start typing to search Manatal
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
