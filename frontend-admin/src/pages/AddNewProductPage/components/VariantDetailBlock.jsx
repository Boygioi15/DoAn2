import { useContext, useEffect } from "react";
import { EditProductPageContext } from "../EditProductPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";

export default function VariantDetailBlock() {
  const addProductContext = useContext(EditProductPageContext);
  //how many variant?
  let total = 0;
  let v1Exist = false;
  if (addProductContext.variant1) {
    let v1Length = 0;
    for (const value of addProductContext.variant1.valueList) {
      if (value.name.trim().length > 0) {
        v1Length++;
      }
    }
    if (v1Length > 0) {
      v1Exist = true;
    }
  }
  let v2Exist = false;
  if (addProductContext.variant2) {
    let v2Length = 0;
    for (const value of addProductContext.variant2.valueList) {
      if (value.name.trim().length > 0) {
        v2Length++;
      }
    }
    if (v2Length > 0) {
      v2Exist = true;
    }
  }
  if (v1Exist) total++;
  if (v2Exist) total++;
  // console.log("V1: ", addProductContext.variant1, v1Exist);
  // console.log("V2: ", addProductContext.variant2, v2Exist);

  const setNewvariantDetailList_Temp = (newvariantDetail, index) => {
    const newList = [...addProductContext.variantDetailList];
    newList[index] = newvariantDetail;
    addProductContext.setVariantDetailList(newList);
  };

  // useEffect(() => {
  //   console.log("VL: ", addProductContext.variantDetailList);
  // }, [addProductContext.variantDetailList]);
  return (
    <div className={`${reusableStyle.inputBlock}`}>
      <div className="flex flex-row justify-between items-center ">
        <h2>Chi tiết biến thể</h2>
        {addProductContext.edit &&
          addProductContext.initialProductData &&
          !addProductContext.initialProductData.isDrafted && (
            <h6 className="text-muted-foreground">
              Chế độ cập nhật - Không sửa sku
            </h6>
          )}
      </div>
      <h6>
        Nhập chi tiết giá bán, số lượng kho hàng và các thông tin khác cho biến
        thể
      </h6>
      <h2>Giá bán & Kho hàng </h2>
      {addProductContext.variantDetailList.length > 0 ? (
        <div className="space-y-2">
          {total > 0 ? (
            <section className="flex gap-2 *:>m-w-[100px]">
              <Input
                placeholder="Giá"
                value={addProductContext.allPrice}
                id={"all-price"}
                onChange={(e) => addProductContext.setAllPrice(e.target.value)}
              />
              <Input
                placeholder="Kho hàng"
                id={"all-stock"}
                value={addProductContext.allStock}
                onChange={(e) => addProductContext.setAllStock(e.target.value)}
              />
              <Input
                className={
                  addProductContext.edit &&
                  addProductContext.initialProductData &&
                  !addProductContext.initialProductData.isDrafted &&
                  " opacity-20 pointer-events-none"
                }
                id={"all-seller-sku"}
                placeholder="SellerSku"
                value={addProductContext.allSellerSku}
                onChange={(e) =>
                  addProductContext.setAllSellerSku(e.target.value)
                }
              />
              <Button
                id={"apply-all-submit"}
                onClick={addProductContext.handleSubmitApplyAllToolbar}
              >
                Áp dụng cho tất cả
              </Button>
              <Button
                onClick={addProductContext.handleRefreshApplyAllToolbar}
                variant={"outline"}
              >
                Làm mới
              </Button>
            </section>
          ) : (
            <h6>Trường hợp không có biến thể</h6>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                {v1Exist && (
                  <TableHead className="w-[100px]">
                    {addProductContext.variant1.name}
                  </TableHead>
                )}
                {v2Exist && (
                  <TableHead className="w-[100px]">
                    {addProductContext.variant2.name}
                  </TableHead>
                )}
                <TableHead>Giá</TableHead>
                <TableHead>Kho hàng</TableHead>
                <TableHead>SellerSku</TableHead>
                <TableHead className="w-0">Mở bán</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addProductContext.variantDetailList.map((row, index) => (
                <TableRow
                  key={index}
                  className={!row.isOpenToSale && "bg-gray-100"}
                >
                  {row.v1_name && (
                    <TableCell>
                      <Label>{row.v1_name}</Label>
                    </TableCell>
                  )}
                  {row.v2_name && (
                    <TableCell>
                      <Label>{row.v2_name}</Label>
                    </TableCell>
                  )}
                  <TableCell>
                    <Input
                      value={row.price}
                      onChange={(e) => {
                        setNewvariantDetailList_Temp(
                          {
                            ...row,
                            price: e.target.value,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.stock}
                      onChange={(e) => {
                        setNewvariantDetailList_Temp(
                          {
                            ...row,
                            stock: e.target.value,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell
                    className={
                      addProductContext.edit &&
                      addProductContext.initialProductData &&
                      !addProductContext.initialProductData.isDrafted &&
                      " opacity-20 pointer-events-none"
                    }
                  >
                    <Input
                      value={row.seller_sku}
                      onChange={(e) => {
                        setNewvariantDetailList_Temp(
                          {
                            ...row,
                            seller_sku: e.target.value,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      disabled={!row.isInUse}
                      checked={row.isOpenToSale}
                      onCheckedChange={(e) => {
                        setNewvariantDetailList_Temp(
                          {
                            ...row,
                            isOpenToSale: e,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {addProductContext.formErrors.variantDetailListError.length > 0 && (
            <ul style={{ marginBottom: "-4px" }} className="ul-error">
              {addProductContext.formErrors.variantDetailListError.map(
                (element, idx) => (
                  <li key={idx}>{element}</li>
                )
              )}
            </ul>
          )}
        </div>
      ) : (
        <h6>Hãy tạo hoàn chỉnh biến thể trước!</h6>
      )}
    </div>
  );
}

const reusableStyle = {
  inputBlock:
    "flex flex-col p-[16px] pt-[20px] gap-[20px] rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
