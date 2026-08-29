"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Store, Tag, Loader2 } from "lucide-react";
import {
  getPopularRecommendations,
  getSearchRecommendations,
  type SearchRecommendation,
} from "@/actions/search-recommendation";

type Props = {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchRecommendationDropdown({
  query,
  isOpen,
  onClose,
  onSelect,
  inputRef,
}: Props) {
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const [popular, setPopular] = useState<SearchRecommendation[]>([]);
  const [suggestions, setSuggestions] = useState<SearchRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchIdRef = useRef(0);

  const debouncedQuery = useDebounce(query, 250);

  const showPopular = isOpen && query.trim().length === 0;
  const showSuggestions = isOpen && debouncedQuery.trim().length >= 2;

  const [activeIdx, setActiveIdx] = useState(-1);
  const [prevQuery, setPrevQuery] = useState(debouncedQuery);
  if (prevQuery !== debouncedQuery) {
    setPrevQuery(debouncedQuery);
    setActiveIdx(-1);
  }

  // Fetch popular recommendations
  useEffect(() => {
    if (!showPopular) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getPopularRecommendations();
        if (!cancelled) setPopular(data);
      } catch {
        if (!cancelled) setPopular([]);
      }
    })();
    return () => { cancelled = true; };
  }, [showPopular]);

  // Fetch search suggestions
  useEffect(() => {
    if (!showSuggestions) return;
    const id = ++fetchIdRef.current;
    let cancelled = false;
    (async () => {
      if (!cancelled) setLoading(true);
      try {
        const data = await getSearchRecommendations(debouncedQuery.trim());
        if (!cancelled && id === fetchIdRef.current) {
          setSuggestions(data);
        }
      } catch {
        if (!cancelled && id === fetchIdRef.current) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled && id === fetchIdRef.current) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedQuery, showSuggestions]);

  const items = useMemo(
    () => (showSuggestions ? suggestions : showPopular ? popular : []),
    [showSuggestions, suggestions, showPopular, popular],
  );

  const handleSelect = useCallback(
    (item: SearchRecommendation) => {
      onSelect(item.name);
      router.push(`/user/search?q=${encodeURIComponent(item.name)}`);
      onClose();
    },
    [onSelect, router, onClose],
  );

  const handleSearchAll = useCallback(() => {
    const q = query.trim();
    if (q) {
      onSelect(q);
      router.push(`/user/search?q=${encodeURIComponent(q)}`);
      onClose();
    }
  }, [query, onSelect, router, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        handleSelect(items[activeIdx]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items, activeIdx, handleSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        listRef.current &&
        !listRef.current.contains(target) &&
        inputRef?.current &&
        !inputRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, inputRef]);

  if (!isOpen) return null;

  if (showSuggestions && !loading && items.length === 0) {
    return (
      <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white p-4 text-center shadow-lift animate-fade-in-fast">
        <p className="text-sm text-gray-400">
          Tidak ada rekomendasi untuk &quot;{query.trim()}&quot;
        </p>
        <p className="mt-1 text-xs text-gray-300">
          Coba: nama produk, nama komoditas, atau nama petani
        </p>
      </div>
    );
  }

  if (items.length === 0 && !loading) return null;

  const typeIcon = (type: SearchRecommendation["type"]) => {
    switch (type) {
      case "category":
        return <Tag size={14} className="text-blue-500" />;
      case "farmer":
        return <Store size={14} className="text-amber-500" />;
      default:
        return <Search size={14} className="text-primary" />;
    }
  };

  const typeLabel = (type: SearchRecommendation["type"]) => {
    switch (type) {
      case "category":
        return "Kategori";
      case "farmer":
        return "Petani";
      default:
        return null;
    }
  };

  return (
    <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-lift animate-fade-in-fast">
      <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1.5">
        {showPopular && popular.length > 0 && (
          <div className="px-3.5 pt-2 pb-1">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Pencarian Populer
            </p>
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="px-3.5 pt-2 pb-1">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Pencarian Terkait
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Mencari...
          </div>
        )}

        {!loading &&
          items.map((item, i) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => handleSelect(item)}
              className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors duration-100 ${
                activeIdx === i
                  ? "bg-primary/5 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {showPopular && (
                <TrendingUp
                  size={14}
                  className={`shrink-0 ${
                    activeIdx === i ? "text-primary" : "text-orange-400"
                  }`}
                />
              )}
              {showSuggestions && typeIcon(item.type)}

              <span className="min-w-0 flex-1 truncate font-medium">
                {item.name}
              </span>

              {item.transactionCount != null && item.transactionCount > 0 && (
                <span className="shrink-0 text-xs text-gray-400">
                  {item.transactionCount} transaksi
                </span>
              )}

              {showSuggestions && typeLabel(item.type) && (
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                  {typeLabel(item.type)}
                </span>
              )}
            </button>
          ))}
      </div>

      {showSuggestions && !loading && query.trim() && (
        <button
          type="button"
          onClick={handleSearchAll}
          className="flex w-full items-center gap-2 border-t border-gray-100 px-3.5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          <Search size={14} />
          Cari &quot;{query.trim()}&quot;
        </button>
      )}
    </div>
  );
}
