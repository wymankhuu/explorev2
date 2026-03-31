'use client';

import { useState, useRef, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface FilterBarProps {
  filters: Record<string, string[]>;
  selected: Record<string, string[]>;
  onChange: (category: string, values: string[]) => void;
  onClearAll?: () => void;
}

const FILTER_LABELS: Record<string, string> = {
  gradeLevel: 'Grade Level',
  context: 'Context',
  useCases: 'Use Cases',
  features: 'Features',
};

function FilterDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, useCallback(() => setOpen(false), []));

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border text-[13px] font-medium transition-all ${
          selected.length > 0
            ? 'bg-blue-50 border-blue-200 text-blue-600'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none ml-0.5">
            {selected.length}
          </span>
        )}
        <ChevronDown size={13} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="filter-dropdown absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-lg z-50 p-1.5 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-[13px]"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20"
              />
              <span className="text-slate-700">{option}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full mt-0.5 px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-600 text-left"
            >
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({ filters, selected, onChange, onClearAll }: FilterBarProps) {
  const hasAnyFilter = Object.values(selected).some((v) => v.length > 0);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Object.entries(filters).map(([category, options]) => (
        <FilterDropdown
          key={category}
          label={FILTER_LABELS[category] || category}
          options={options}
          selected={selected[category] || []}
          onChange={(values) => onChange(category, values)}
        />
      ))}
      {hasAnyFilter && onClearAll && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-[13px] font-medium text-red-600 hover:bg-red-100 transition-all"
        >
          <X size={12} />
          Clear all
        </button>
      )}
    </div>
  );
}
