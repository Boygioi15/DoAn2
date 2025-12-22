import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContext } from "react";
import { AddNewProductPageContext } from "../AddNewProductPage";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Minus } from "lucide-react";

export default function SizeBlock() {
  const addProductContext = useContext(AddNewProductPageContext);
  if (addProductContext.sizeList.length === 0)
    return (
      <div className={`${reusableStyle.inputBlock}`}>
        <h2>Bảng kích thước</h2>
        <h6>
          Tạo bảng gợi ý kích thước để người dùng có thể căn cứ vào đó để chọn
          sản phẩm phù hợp
        </h6>
        <span>Hãy đặt kích thước trước khi bắt đầu</span>
      </div>
    );
  return (
    <div className={`${reusableStyle.inputBlock}`}>
      <h2>Bảng kích thước</h2>
      <h6>
        Tạo bảng gợi ý kích thước để người dùng có thể căn cứ vào đó để chọn sản
        phẩm phù hợp
      </h6>
      <Table className="">
        <TableHeader className="[&_td]:font-medium">
          <TableRow>
            <TableCell className={"text-center"}>Size</TableCell>
            <TableCell className="w-40 text-center">
              {" "}
              <Checkbox
                checked={addProductContext.useSize1}
                onCheckedChange={(value) =>
                  addProductContext.setUseSize1(value)
                }
              />{" "}
              Chiều cao(cm)
            </TableCell>
            <TableCell className="w-40 text-center">
              {" "}
              <Checkbox
                checked={addProductContext.useSize2}
                onCheckedChange={(value) =>
                  addProductContext.setUseSize2(value)
                }
              />{" "}
              Cân nặng (kg)
            </TableCell>
            <TableCell className="w-40 text-center">
              <Checkbox
                checked={addProductContext.useSize3}
                onCheckedChange={(value) =>
                  addProductContext.setUseSize3(value)
                }
              />{" "}
              Vòng 1 (cm)
            </TableCell>
            <TableCell className="w-40 text-center">
              <Checkbox
                checked={addProductContext.useSize4}
                onCheckedChange={(value) =>
                  addProductContext.setUseSize4(value)
                }
              />{" "}
              Vòng 2 (cm)
            </TableCell>
            <TableCell className="w-40 text-center">
              <Checkbox
                checked={addProductContext.useSize5}
                onCheckedChange={(value) =>
                  addProductContext.setUseSize5(value)
                }
              />{" "}
              Vòng 3 (cm)
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {addProductContext.sizeList.map((size, index) => (
            <TableRow key={index}>
              <TableCell className={"text-center"}>{size.name}</TableCell>
              <TableCellMinMax
                disabled={!addProductContext.useSize1}
                valueMin={size.fit.height.min}
                valueMax={size.fit.height.max}
                onValueChangeMin={(value) => {
                  const newSize = { ...size };
                  newSize.fit.height.min = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
                onValueChangeMax={(value) => {
                  const newSize = { ...size };
                  newSize.fit.height.max = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
              />
              <TableCellMinMax
                disabled={!addProductContext.useSize2}
                valueMin={size.fit.weight.min}
                valueMax={size.fit.weight.max}
                onValueChangeMin={(value) => {
                  const newSize = { ...size };
                  newSize.fit.weight.min = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
                onValueChangeMax={(value) => {
                  const newSize = { ...size };
                  newSize.fit.weight.max = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
              />
              <TableCellMinMax
                disabled={!addProductContext.useSize3}
                valueMin={size.fit.bust.min}
                valueMax={size.fit.bust.max}
                onValueChangeMin={(value) => {
                  const newSize = { ...size };
                  newSize.fit.bust.min = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
                onValueChangeMax={(value) => {
                  const newSize = { ...size };
                  newSize.fit.bust.max = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
              />
              <TableCellMinMax
                disabled={!addProductContext.useSize4}
                valueMin={size.fit.waist.min}
                valueMax={size.fit.waist.max}
                onValueChangeMin={(value) => {
                  const newSize = { ...size };
                  newSize.fit.waist.min = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
                onValueChangeMax={(value) => {
                  const newSize = { ...size };
                  newSize.fit.waist.max = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
              />
              <TableCellMinMax
                disabled={!addProductContext.useSize5}
                valueMin={size.fit.hip.min}
                valueMax={size.fit.hip.max}
                onValueChangeMin={(value) => {
                  const newSize = { ...size };
                  newSize.fit.hip.min = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
                onValueChangeMax={(value) => {
                  const newSize = { ...size };
                  newSize.fit.hip.max = value;

                  const newSizeList = [...addProductContext.sizeList];
                  newSizeList[index] = newSize;
                  addProductContext.setSizeList(newSizeList);
                }}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
function TableCellMinMax({
  valueMin,
  onValueChangeMin,
  valueMax,
  onValueChangeMax,
  disabled,
}) {
  return (
    <TableCell
      className={
        "w-fit border-r border-l " +
        (disabled && " pointer-events-none opacity-50")
      }
    >
      <div className="grid grid-cols-[4fr_5px_4fr] gap-2 items-center">
        <Input
          value={valueMin}
          onChange={(e) => onValueChangeMin(e.target.value)}
        />
        -
        <Input
          value={valueMax}
          onChange={(e) => onValueChangeMax(e.target.value)}
        />
      </div>
    </TableCell>
  );
}
const reusableStyle = {
  inputBlock:
    "flex flex-col p-[16px] pt-[20px] gap-[20px] rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
