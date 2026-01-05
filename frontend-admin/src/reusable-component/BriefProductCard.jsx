import { formatMoney } from "@/utils";
import { Edit, ShoppingCart } from "lucide-react";
import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function BriefProductCard({ briefProduct }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 w-full h-auto">
      <div className="w-full h-auto relative">
        <img
          className="w-full h-auto cursor-pointer"
          src={briefProduct.thumbnailURL}
        />
        <Button
          className="bottom-[10px] right-[10px] bg-white rounded-full absolute p-2 text-black"
          variant={"ghost"}
          onClick={() => {
            navigate(`/edit-product/${briefProduct.productId}?edit=true`);
          }}
        >
          <Edit />
        </Button>
      </div>
      <span className="text-[14px] font-medium pl-2">{briefProduct.name}</span>
      <span className="text-[14px] font-bold pl-2">
        {briefProduct.sellingPriceBot
          ? formatMoney(briefProduct.sellingPriceBot) + " VNĐ"
          : "Không xác định"}
      </span>
    </div>
  );
}
