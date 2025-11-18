"use client";

import { useState } from "react";

import { CircleCheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

const ComboBoxWithSearch = ({
  textPlaceholder,
  optionPlaceHolder,
  comboboxValue,
  comboboxValueList,
  onValueChange,
  defaultValue,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="grow space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {comboboxValue ? (
              comboboxValueList.find(
                (_comboboxValue) => _comboboxValue.id === comboboxValue
              )?.display
            ) : (
              <span className="text-muted-foreground">{textPlaceholder}</span>
            )}
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Tìm kiếm" className="h-9" />
            <CommandList>
              <CommandEmpty>{optionPlaceHolder}</CommandEmpty>
              <CommandGroup>
                {comboboxValueList.map((_comboboxValue) => (
                  <CommandItem
                    key={_comboboxValue.id}
                    value={_comboboxValue.id}
                    onSelect={(currentValue) => {
                      onValueChange(
                        currentValue === comboboxValue ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    {_comboboxValue.display}
                    <CircleCheckIcon
                      className={cn(
                        "ml-auto fill-blue-500 stroke-white",
                        comboboxValue === _comboboxValue.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ComboBoxWithSearch;
