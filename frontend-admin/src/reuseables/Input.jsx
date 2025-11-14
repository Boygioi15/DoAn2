import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InputBlock_Input({
  label,
  isRequired,
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
        type="email"
        placeholder={placeholder}
        required={isRequired}
        value={inputValue}
        onChange={onInputValueChange}
        className={"bg-white"}
      />
    </div>
  );
}
