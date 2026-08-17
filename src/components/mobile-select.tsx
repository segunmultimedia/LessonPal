'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface MobileSelectOption {
  id: string;
  label: string;
}

interface MobileSelectProps {
  label: string;
  placeholder?: string;
  options: MobileSelectOption[];
  value: string | string[]; // string for single, string[] for multiple
  onChange: (value: any) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export function MobileSelect({
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
}: MobileSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    if (multiple) {
      const currentValue = (Array.isArray(value) ? value : []) as string[];
      if (currentValue.includes(optionId)) {
        onChange(currentValue.filter((id) => id !== optionId));
      } else {
        onChange([...currentValue, optionId]);
      }
    } else {
      onChange(optionId);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      const currentValue = (Array.isArray(value) ? value : []) as string[];
      if (currentValue.length === 0) return placeholder;
      if (currentValue.length === 1) {
        return options.find((o) => o.id === currentValue[0])?.label || placeholder;
      }
      return `${currentValue.length} selected`;
    }
    
    if (!value) return placeholder;
    return options.find((o) => o.id === value as string)?.label || placeholder;
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="w-full">
        <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
          className={`w-full px-4 py-3 border border-input bg-background rounded text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-1 focus:ring-ring
            ${disabled ? 'opacity-50 cursor-not-allowed bg-muted/50' : 'hover:border-blue-300 dark:hover:border-blue-700'}
          `}
        >
          <span className={`block truncate text-base ${(!value || (multiple && (value as string[]).length === 0)) ? 'text-muted-foreground' : 'text-foreground'}`}>
            {getDisplayText()}
          </span>
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* Full Screen Overlay / Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          
          <div className="bg-background w-full sm:max-w-md sm:rounded-xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-lg">{label}</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Content (Scrollable) */}
            <div className="overflow-y-auto overscroll-contain flex-1 p-4 pb-[env(safe-area-inset-bottom)]">
              <div className="space-y-2">
                {options.map((option) => {
                  const isSelected = multiple 
                    ? ((Array.isArray(value) ? value : []) as string[]).includes(option.id)
                    : value === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      className={`w-full px-4 py-4 rounded flex items-center justify-between text-left transition-colors border
                        ${isSelected 
                          ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                          : 'bg-white dark:bg-gray-900 border-border/50 hover:border-border'
                        }
                      `}
                    >
                      <span className={`text-base font-medium ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-foreground'}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multiple Selection Action */}
            {multiple && (
              <div className="p-4 border-t border-border pb-[env(safe-area-inset-bottom)]">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded transition-colors text-base"
                >
                  Confirm Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
