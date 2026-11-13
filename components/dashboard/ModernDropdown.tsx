"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
}

interface ModernDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
}

export default function ModernDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  icon,
  searchable = false,
}: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-[#0F172A] flex items-center justify-between gap-2.5 transition-all shadow-2xs cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 min-w-[140px]"
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-[#0A192F] shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-slate-900" : ""
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-auto z-50 mt-1.5 min-w-[200px] max-w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100 font-sans">
          {/* Optional Search */}
          {searchable && options.length > 5 && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-3 text-center text-xs text-slate-400">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-slate-100 text-[#0F172A] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#0A192F]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
