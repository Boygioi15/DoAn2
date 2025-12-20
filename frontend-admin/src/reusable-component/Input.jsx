import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Group, NumberField } from "react-aria-components";

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
      <div className="flex rounded-md shadow-xs">
        <span className="border-input bg-gray-100 inline-flex items-center rounded-l-none border px-3 text-sm min-w-fit">
          {addOnlabel}
        </span>
        <Input
          type="text"
          placeholder={placeholder}
          className="-ms-px rounded-l-none shadow-none"
          value={inputValue}
          onInput={onInputValueChange}
        />
      </div>
    </div>
  );
};
