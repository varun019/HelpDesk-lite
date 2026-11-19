import { ChevronDown, Check } from "lucide-react";
import { Select as BaseSelect } from "@base-ui/react/select";

export type SelectOption = { value: string; label: string };

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
};

export function Select({ value, onValueChange, options, placeholder, disabled, className = "", name, id }: Props) {
  return (
    <BaseSelect.Root items={options} value={value} onValueChange={(next) => onValueChange(String(next ?? ""))} disabled={disabled} name={name}>
      <BaseSelect.Trigger id={id} className={`inline-flex h-10 items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
        <BaseSelect.Value placeholder={placeholder} />
        <BaseSelect.Icon><ChevronDown className="size-4 text-slate-400" /></BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="z-50 outline-none">
          <BaseSelect.Popup className="max-h-64 min-w-[var(--anchor-width)] overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item key={option.value} value={option.value} className="flex cursor-pointer items-center justify-between rounded px-2.5 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-teal-50 data-[highlighted]:text-teal-800">
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator><Check className="size-4" /></BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
