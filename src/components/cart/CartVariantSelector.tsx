'use client';

import React from 'react';
import { AlertTriangle, Check, Loader2, Sparkles } from 'lucide-react';
import {
  findMatchingVariant,
  getColorHex,
  getEffectiveAttributes,
  isColorAttribute,
} from '@/utils/productVariants';

interface CartVariantSelectorProps {
  product: any;
  selection: Record<string, string>;
  missing: string[];
  isUpdating: boolean;
  highlight?: boolean;
  locale: string;
  onSelect: (attrName: string, value: string) => void;
}

/**
 * User-friendly inline variant selector for cart items — mirrors the Product Details page
 * selector so customers can immediately view, pick, or change Size / Color / Options with 1 tap.
 */
export default function CartVariantSelector({
  product,
  selection,
  missing,
  isUpdating,
  highlight,
  locale,
  onSelect,
}: CartVariantSelectorProps) {
  const attributes = React.useMemo(() => getEffectiveAttributes(product), [product]);
  const bn = locale === 'bn';
  const hasMissing = missing.length > 0;

  const hasVariantStock = Array.isArray(product?.variants)
    && product.variants.some((v: any) => (Number(v?.stockQuantity) || 0) > 0);

  if (attributes.length === 0) return null;

  const selectedCount = attributes.filter((a) => Boolean(selection[a.name])).length;

  return (
    <div
      className={`rounded-xl border p-3 sm:p-3.5 space-y-2.5 transition-all duration-300 bg-card ${
        hasMissing
          ? 'border-primary/35'
          : 'border-border/70'
      } ${highlight ? 'ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse' : ''}`}
    >
      {/* Header row matching Product Details page */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
        {hasMissing ? (
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-primary">
            <AlertTriangle size={14} className="shrink-0" />
            <span>
              {bn
                ? `অর্ডারের আগে ${missing.join(', ')} নির্বাচন করুন`
                : `Please select ${missing.join(', ')} before ordering`}
            </span>
          </span>
        ) : (
          <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles size={12} className="text-primary shrink-0" />
            <span>{bn ? 'ভ্যারিয়েন্ট ও অপশন নির্বাচন করুন' : 'Product Options & Variants'}</span>
          </span>
        )}

        {isUpdating ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary shrink-0">
            <Loader2 size={12} className="animate-spin" />
            <span>{bn ? 'আপডেট হচ্ছে...' : 'Updating...'}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono shrink-0">
            {!hasMissing && <Check size={11} className="text-emerald-600 stroke-[3]" />}
            <span>
              {selectedCount}/{attributes.length} {bn ? 'নির্বাচিত' : 'selected'}
            </span>
          </span>
        )}
      </div>

      {/* Attribute groups grid (1 col if single attribute, 2 cols on desktop if multiple) */}
      <div className={`grid grid-cols-1 ${attributes.length > 1 ? 'sm:grid-cols-2' : ''} gap-2.5`}>
        {attributes.map((attr) => {
          const isColor = isColorAttribute(attr.name);
          const selected = selection[attr.name];
          const isAttrMissing = !selected;

          return (
            <div
              key={attr.name}
              className={`space-y-1.5 bg-background p-2.5 rounded-lg border ${
                isAttrMissing ? 'border-primary/40' : 'border-border/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium text-[11px]">
                  {attr.name}:{' '}
                  <strong
                    className={
                      selected
                        ? 'font-extrabold text-foreground capitalize'
                        : 'font-extrabold text-primary'
                    }
                  >
                    {selected || (bn ? 'নির্বাচন করুন' : 'Select')}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {attr.options.map((opt) => {
                  const isSelected = selected === opt;
                  const hex = isColor ? getColorHex(opt) : null;

                  let isOptionOut = false;
                  if (hasVariantStock) {
                    const candidate = findMatchingVariant(product, { ...selection, [attr.name]: opt });
                    isOptionOut = !!candidate && (Number(candidate.stockQuantity) || 0) <= 0;
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isUpdating || isOptionOut}
                      onClick={() => !isSelected && onSelect(attr.name, opt)}
                      title={isOptionOut ? (bn ? 'স্টক নেই' : 'Out of stock') : opt}
                      aria-pressed={isSelected}
                      className={`min-w-[38px] min-h-[32px] px-2.5 sm:px-3 py-1 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'border-2 border-rose-600 bg-rose-600 text-white font-extrabold shadow-xs scale-[1.02]'
                          : isOptionOut
                            ? 'border border-dashed border-border bg-muted/40 text-muted-foreground/60 line-through cursor-not-allowed'
                            : 'border border-border bg-card text-foreground hover:border-rose-400 font-medium hover:bg-muted/40 cursor-pointer active:scale-95'
                      } disabled:cursor-not-allowed`}
                    >
                      {hex && (
                        <span
                          className={`w-3 h-3 rounded-full border shrink-0 ${
                            isSelected ? 'border-white' : 'border-black/20'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      )}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
