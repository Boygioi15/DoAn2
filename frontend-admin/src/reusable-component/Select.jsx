import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
            className={"-ms-px rounded-l-none rounded-r-[4px] grow shadow-none"}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {selectValueList.map((selectValue) => (
              <SelectItem value={selectValue}>{selectValue}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
