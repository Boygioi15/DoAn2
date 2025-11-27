import { productApi } from '@/api/productApi';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import BriefProductCard from '@/reusable_components/BriefProductCard';
import { buildQueryStringFromObject } from '@/util';
import { ChevronDown, ChevronUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const pageSize = 15;
export default function SearchPage() {
  const [searchParam, setSearchParam] = useSearchParams();
  const [productList, setProductList] = useState([]);
  const [totalItem, setTotalItem] = useState(0);
  const [priceSlideValue, setPriceSlideValue] = useState([25, 75]);
  const [currentPage, setCurrentPage] = useState(1);
  const getProductList = async () => {
    try {
      const filterParam = {};
      const query = searchParam.get('query');
      if (query) filterParam.query = query;
      filterParam.from = currentPage;
      filterParam.size = pageSize;
      const response = await productApi.getAllProduct(
        buildQueryStringFromObject(filterParam)
      );
      setProductList((prev) => [...prev, ...response.data.data]);
      setTotalItem(response.data.total);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu sản phẩm');
    }
  };
  useEffect(() => {
    getProductList();
  }, [currentPage]);
  //param
  return (
    <div className="grid grid-cols-[2fr_8fr] gap-4 text-[14px] font-medium pl-25 pr-25 pb-25">
      <div className="flex flex-col gap-4">
        <Collapsible className={'w-full ' + reusableStyle.filterBlock}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className={'w-full justify-between'}>
              <span>Màu sắc</span>
              <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
        <Collapsible className={'w-full ' + reusableStyle.filterBlock}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className={'w-full justify-between'}>
              <span>Kích thước</span>
              <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
        <Collapsible className={'w-full' + reusableStyle.filterBlock}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className={'w-full justify-between'}>
              <span>Khoảng giá</span>
              <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center gap-4">
                <Input
                  value={priceSlideValue[0]}
                  onChange={(e) => {
                    setPriceSlideValue([e.target.value, priceSlideValue[1]]);
                  }}
                  className={'max-w-[200px]!'}
                />
                <span>-</span>
                <Input
                  value={priceSlideValue[1]}
                  onChange={(e) => {
                    setPriceSlideValue([priceSlideValue[0], e, target.value]);
                  }}
                  className={'max-w-[200px]!'}
                />
              </div>

              <Slider
                value={[Number(priceSlideValue[0]), Number(priceSlideValue[1])]}
                onValueChange={setPriceSlideValue}
                max={100}
                step={1}
                className={''}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-6">
          <div>
            {totalItem} kết quả cho "<b>{searchParam.get('query')}</b>"
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-muted-foreground">Sắp xếp theo: </span>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {productList &&
            productList.map((product) => (
              <BriefProductCard briefProduct={product} />
            ))}
        </div>
        {currentPage * pageSize < totalItem && (
          <button
            className="button-standard-1 max-w-[500px] self-center mt-5"
            onClick={() => {
              setCurrentPage((prev) => prev + 1);
            }}
          >
            XEM THÊM
          </button>
        )}
      </div>
    </div>
  );
}
const reusableStyle = {
  filterBlock: 'flex mb-2 border-b border-b-gray-100 rounded-0',
};
