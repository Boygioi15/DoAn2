import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Group, NumberField } from "react-aria-components";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InputBlock_Input({
  inputId,
  label,
  isRequired,
  disabled,
  description,
  placeholder,
  inputValue,
  onInputValueChange,
  containerClassname,
}) {
  return (
    <div className={`w-full space-y-2 ${containerClassname}`}>
      <Label className="gap-1  text-[14px]">
        {isRequired && <span className="text-destructive">*</span>} {label}
      </Label>
      {description && (
        <Label className="gap-1 text-[12px] text-muted-foreground">
          {description}
        </Label>
      )}
      <Input
        id={inputId}
        disabled={disabled}
        placeholder={placeholder}
        required={isRequired}
        value={inputValue}
        onChange={onInputValueChange}
        className={"bg-white"}
      />
    </div>
  );
}
export function InputBlock_NumberField({
  value,
  onValueChange,
  minValue,
  numberFieldClassName,
  onIncrement,
  onDecrement,
}) {
  return (
    <NumberField
      onChange={onValueChange}
      defaultValue={4}
      minValue={minValue}
      className="w-full max-w-xs space-y-2"
    >
      <Group className="dark:bg-input/30 border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-[3px] md:text-sm">
        <Input className="selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none" />
        <div className="flex h-[calc(100%+2px)] flex-col">
          <Button
            slot="increment"
            className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onIncrement}
          >
            <PlusIcon className="size-3" />
            <span className="sr-only">Increment</span>
          </Button>
          <Button
            slot="decrement"
            className="border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onDecrement}
          >
            <MinusIcon className="size-3" />
            <span className="sr-only">Decrement</span>
          </Button>
        </div>
      </Group>
    </NumberField>
  );
}

export const InputWithStartAddOn = ({
  addOnlabel,
  placeholder,
  inputValue,
  onInputValueChange,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex w-full rounded-md shadow-xs">
        <span className="border-input bg-gray-100 inline-flex items-center rounded-l-none border px-3 text-sm min-w-fit">
          {addOnlabel}
        </span>
        <Input
          type="text"
          placeholder={placeholder}
          className="-ms-px rounded-l-none shadow-none min-w-0!"
          value={inputValue}
          onInput={onInputValueChange}
        />
      </div>
    </div>
  );
};
export const DateSelectWithStartAddOn = ({
  addOnLabel,
  placeholder,
  inputValue,
  onInputValueChange,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-full min-w-0 space-y-2">
      <div className="flex rounded-md shadow-xs">
        <span className="border-input bg-gray-100 inline-flex items-center rounded-l-none border px-3 text-sm min-w-fit">
          {addOnLabel}
        </span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="flex-1 justify-between font-normal rounded-none min-w-0!"
            >
              {inputValue
                ? format(inputValue, "dd/MM/yyyy", { locale: vi })
                : placeholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              locale={vi}
              selected={inputValue}
              onSelect={(date) => {
                onInputValueChange(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
export const SelectWithStartAddOn = ({
  addOnlabel,
  defaultValue,
  placeholder,
  selectValue,
  selectValueList,
  onSelectValueChange,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex rounded-md shadow-xs">
        <span className="border-input bg-gray-100 inline-flex items-center rounded-l-none border px-3 text-sm min-w-fit">
          {addOnlabel}
        </span>
        <Select value={selectValue} onValueChange={onSelectValueChange}>
          <SelectTrigger
            className={"-ms-px rounded-l-none rounded-r-lg grow shadow-none"}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {selectValueList.map((select) => (
              <SelectItem value={select.value} key={select.value}>
                {select.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
