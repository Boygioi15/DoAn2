import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InputBlock_Input({
  label,
  isRequired,
  description,
  placeholder,
  inputValue,
  onInputValueChange,
}) {
  return (
    <div className="w-full space-y-[8px]">
      <Label className="gap-1  text-[14px]">
        {isRequired && <span className="text-destructive">*</span>} {label}
      </Label>
      <Label className="gap-1 text-[12px] text-muted-foreground">
        {description}
      </Label>
      <Input
        type="email"
        placeholder={placeholder}
        required={isRequired}
        value={inputValue}
        onChange={onInputValueChange}
      />
    </div>
  );
}
