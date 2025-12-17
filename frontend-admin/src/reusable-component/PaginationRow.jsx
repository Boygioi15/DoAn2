import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePageNumberArray } from "@/utils";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

export default function PaginationRow({
  size,
  from, //page
  totalItem, //page
  onSizeChange,
  onFromChange,

  itemName,
}) {
  const totalPage = Math.ceil(totalItem / size);
  const pageNumberArray = generatePageNumberArray(totalPage, from, size);

  // console.log("S:", size);
  // console.log("F:", from);
  // console.log("TI:", totalItem);
  // console.log("TP:", totalPage);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-6 max-sm:justify-center">
      <div className="flex shrink-0 items-center gap-3">
        <Label>Số {itemName} mỗi dòng</Label>
        <Select
          value={size.toString()}
          onValueChange={(value) => onSizeChange(Number(value))}
        >
          <SelectTrigger className="w-fit whitespace-nowrap">
            <SelectValue placeholder="Select number of results" />
          </SelectTrigger>
          <SelectContent className="[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="text-muted-foreground flex grow items-center justify-end whitespace-nowrap max-sm:justify-center">
        <p
          className="text-muted-foreground text-sm whitespace-nowrap"
          aria-live="polite"
        >
          Hiện đang hiển thị từ{" "}
          <span className="text-foreground">{(from - 1) * size + 1}</span> đến{" "}
          <span className="text-foreground">
            {" "}
            <span className="text-foreground">
              {Math.min(from * size, totalItem)}
            </span>{" "}
          </span>{" "}
          của <span className="text-foreground">{totalItem}</span> {itemName}
        </p>
      </div>
      <Pagination className="w-fit max-sm:mx-0">
        <PaginationContent>
          {from > 1 && (
            <PaginationItem>
              <Button
                aria-label="Tới trang đầu"
                size="icon"
                className="rounded-full"
                variant="ghost"
                onClick={() => onFromChange(1)}
              >
                <ChevronFirstIcon className="size-4" />
              </Button>
            </PaginationItem>
          )}

          {from > 1 && (
            <PaginationItem>
              <Button
                aria-label="Tới trang trước"
                size="icon"
                className="rounded-full"
                variant="ghost"
                onClick={() => onFromChange(from - 1)}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
            </PaginationItem>
          )}
          {pageNumberArray.map((_from) => (
            <PaginationItem key={_from}>
              <Button
                variant={Number(from) === Number(_from) ? "outline" : "ghost"}
                className="rounded-full"
                onClick={() => onFromChange(_from)}
              >
                {_from}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            {from < totalPage && (
              <Button
                aria-label="Tới trang kế"
                size="icon"
                className="rounded-full"
                variant="ghost"
                onClick={() => onFromChange(from + 1)}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            )}
          </PaginationItem>
          {from < totalPage && (
            <PaginationItem>
              <Button
                aria-label="Tới trang cuối"
                size="icon"
                className="rounded-full"
                variant="ghost"
                onClick={() => onFromChange(totalPage)}
              >
                <ChevronLastIcon className="size-4" />
              </Button>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
