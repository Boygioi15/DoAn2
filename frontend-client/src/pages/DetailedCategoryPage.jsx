import { productApi } from '@/api/productApi';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import BriefProductCard from '@/reusable_components/BriefProductCard';
import { buildQueryStringFromObject, formatMoney, parseVND } from '@/util';
import { Check, ChevronDown, ChevronUpIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import notFoundProductImage from '@/assets/notFoundProduct.png';
import noImageFound from '@/assets/noImageFound.jpg';
import allCategory from '@/assets/allCategory.png';

const pageSize = 15;
export const colorMap = {
  Be: '#D8BE8A',
  Hồng: '#E98AAE',
  Nâu: '#7A5034',
  Trắng: '#fafafa',
  Xanh: '#2B6FCF',
  Xám: '#9E9E9E',
  Đen: '#1A1A1A',
  Đỏ: '#D62C2C',
};

// Define the standard order for string sizes
const stringOrder = ['S', 'M', 'L', 'XL', 'XXL'];

// Sort function
const sortSizeList = (sizeList) => {
  const sorted = sizeList.sort((a, b) => {
    const isANumber = typeof a === 'number';
    const isBNumber = typeof b === 'number';

    if (isANumber && isBNumber) return a - b; // numeric sort
    if (isANumber) return -1; // numbers first
    if (isBNumber) return 1; // numbers first

    // both are strings → sort by predefined order
    return stringOrder.indexOf(a) - stringOrder.indexOf(b);
  });
  return sorted;
};

export default function DetailedCategoryManagementPage() {
  const [searchParam, setSearchParam] = useSearchParams();
  const { category1Id, category2Id, category3Id } = useParams();

  const navigate = useNavigate();
  const [productList, setProductList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [searchResultMetadata, setSearchResultMetadata] = useState({
    totalItem1: 0,
    totalItem2: 0,
    allSize: [],
    allColor: [],
    priceRange: [0, 999999999],
  });

  const sortBy = useMemo(() => searchParam.get('sortBy'), [searchParam]);
  const selectedColor = useMemo(
    () => searchParam.getAll('color'),
    [searchParam]
  );
  const selectedSize = useMemo(() => searchParam.getAll('size'), [searchParam]);
  const [priceRangeValue, setpriceRangeValue] = useState([-1, -1]);
  useEffect(() => {
    if (!searchParam.get('priceMin') || !searchParam.get('priceMax')) return;
    const bot = parseVND(searchParam.get('priceMin'));
    const top = parseVND(searchParam.get('priceMax'));
    setpriceRangeValue[(bot, top)];
  }, [searchParam]);

  const [currentPage, setCurrentPage] = useState(1);
  const getNewProductList = async () => {
    try {
      setListLoading(true);
      window.scrollTo({ top: 250, behavior: 'smooth' });
      const queryObject = formQueryObject();
      queryObject.from = 1;
      const response = await productApi.getAllProduct(
        buildQueryStringFromObject(queryObject)
      );
      setProductList(response.data.productList);
      if (response.data.productList && response.data.productList.length === 0)
        return;

      const metadata = response.data.metadata;
      if (searchParam.get('priceMin') && searchParam.get('priceMax')) {
        setpriceRangeValue([
          searchParam.get('priceMin'),
          searchParam.get('priceMax'),
        ]);
      } else if (priceRangeValue[0] === -1 && priceRangeValue[1] === -1) {
        setpriceRangeValue([metadata.minPrice, metadata.maxPrice]);
      }

      setSearchResultMetadata({
        totalItem1: metadata.totalItem1,
        totalItem2: metadata.totalItem2,
        allColor: metadata.allColors.sort(),
        allSize: sortSizeList(metadata.allSizes),
        priceRange: [metadata.minPrice, metadata.maxPrice],
      });
      setCurrentPage(1);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu sản phẩm');
    } finally {
      setListLoading(false);
    }
  };
  const handleSelectingSortBy = (value) => {
    const params = new URLSearchParams(searchParam);
    params.set('sortBy', value);
    setSearchParam(params);
  };
  const handleSelectingColor = (color) => {
    const params = new URLSearchParams(searchParam);
    if (selectedColor.find((_color) => _color === color)) {
      params.delete('color', color);
    } else {
      params.append('color', color);
    }
    setSearchParam(params);
  };
  const handleSelectingSize = (size) => {
    const params = new URLSearchParams(searchParam);
    if (selectedSize.find((_size) => _size === size)) {
      params.delete('size', size);
    } else {
      params.append('size', size);
    }
    setSearchParam(params);
  };
  const handleUpdatingPriceValueToRouter = () => {
    const params = new URLSearchParams(searchParam);
    params.set('priceMin', priceRangeValue[0]);
    params.set('priceMax', priceRangeValue[1]);
    setSearchParam(params);
  };
  const handleAddMoreProduct = async () => {
    try {
      setAddLoading(true);
      const query = formQueryObject();
      query.from = currentPage + 1;
      const response = await productApi.getAllProduct(
        buildQueryStringFromObject(query)
      );
      setProductList((prev) => [...prev, ...response.data.productList]);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi tải thêm dữ liệu');
    } finally {
      setAddLoading(false);
    }
  };
  const formQueryObject = () => {
    const queryObject = {};
    const query = searchParam.get('query');
    if (query) queryObject.query = query;
    queryObject.size = pageSize;
    if (searchParam.get('sortBy'))
      queryObject.sortBy = searchParam.get('sortBy');
    if (searchParam.get('color'))
      queryObject.colorList = searchParam.getAll('color');
    if (searchParam.get('size'))
      queryObject.sizeList = searchParam.getAll('size');
    if (searchParam.get('priceMin'))
      queryObject.priceMin = searchParam.get('priceMin');
    if (searchParam.get('priceMax'))
      queryObject.priceMax = searchParam.get('priceMax');
    console.log({ category1Id, category2Id, category3Id });
    if (category2Id || category3Id) {
      console.log('C2: ', category2Id);
      let categoryId = category2Id;
      if (category3Id) {
        categoryId = category3Id;
      }
      queryObject.categoryId = categoryId;
    }

    return queryObject;
  };

  const priceSliderRange = useMemo(() => {
    const totalDistance =
      searchResultMetadata.priceRange[1] - searchResultMetadata.priceRange[0];
    const gap1 = priceRangeValue[0] - searchResultMetadata.priceRange[0];
    const gap2 = priceRangeValue[1] - searchResultMetadata.priceRange[0];

    return [(gap1 / totalDistance) * 100, (gap2 / totalDistance) * 100];
  }, [searchResultMetadata, priceRangeValue]);

  ////CATEGORY HANDLING
  const [selectedCat2Id, setSelectedCat2Id] = useState(category2Id);
  const [cat2List, setCat2List] = useState([]);
  const [selectedCat3Id, setSelectedCat3Id] = useState(category3Id || '');
  const [cat3List, setCat3List] = useState([]);
  const getCat2List = async () => {
    if (!category1Id) return;

    try {
      const response = await productApi.getAllDirectChildrenOfCategory(
        category1Id
      );
      setCat2List(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu danh mục');
    }
  };
  const getCat3List = async () => {
    if (!selectedCat2Id) return;
    try {
      const response = await productApi.getAllDirectChildrenOfCategoryWithImage(
        selectedCat2Id
      );
      setCat3List(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu danh mục');
    }
  };
  useEffect(() => {
    getCat2List();
  }, [category1Id]);
  useEffect(() => {
    setSelectedCat2Id(category2Id);
  }, [category2Id]);

  useEffect(() => {
    getCat3List();
  }, [selectedCat2Id]);

  useEffect(() => {
    getNewProductList();
  }, [searchParam, category2Id, category3Id]);

  let mainScreenState = 'productList';
  if (listLoading) {
    mainScreenState = 'loading';
  } else if (productList.length === 0) {
    mainScreenState = 'empty';
  }

  return (
    <div className="flex flex-col gap-10 pt-10 pl-20 pr-20 pb-25">
      {cat3List.length > 0 && (
        <span className="text-[36px] font-extrabold">
          {selectedCat3Id.trim().length > 0
            ? cat3List.find((cat) => cat.categoryId === selectedCat3Id)
                .categoryName
            : 'Tất cả'}
        </span>
      )}
      {cat3List.length > 0 && (
        <div className="flex gap-2 ">
          <div
            className="flex flex-col w-40 h-fit cursor-pointer"
            onClick={() => {
              setSelectedCat3Id('');
              navigate(`/category/${category1Id}/${category2Id}`);
            }}
          >
            <img
              src={allCategory}
              className={
                'w-full h-55 ' +
                ('' === selectedCat3Id && ' pb-1 border-b border-b-black')
              }
            />
            <span className="text-[12px] font-bold leading-6">Tất cả</span>
          </div>
          {cat3List.map((cat3) => (
            <div
              className="flex flex-col w-40 h-fit cursor-pointer"
              onClick={() => {
                navigate(
                  `/category/${category1Id}/${category2Id}/${cat3.categoryId}`
                );
                setSelectedCat3Id(cat3.categoryId);
              }}
            >
              <img
                src={cat3.img ? cat3.img : noImageFound}
                className={
                  'w-full h-55 ' +
                  (cat3.categoryId === selectedCat3Id &&
                    ' pb-1 border-b border-b-black')
                }
              />
              <span className="text-[12px] font-bold leading-6">
                {cat3.categoryName}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-[2fr_7fr] gap-4 text-[14px] font-medium relative">
        <div className="flex flex-col h-screen gap-4 sticky top-5 pt-5 overflow-scroll">
          {/* Cat2 list */}
          <Collapsible
            className={'w-full ' + reusableStyle.filterBlock}
            defaultOpen
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className={'w-full justify-between'}>
                <span className={reusableStyle.filterBlockTitle}>Danh mục</span>
                <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent
              className={`flex flex-col gap-1 ${reusableStyle.filterBlockContent}`}
            >
              {cat2List.map((cat2) => (
                <Button
                  variant={'ghost'}
                  className={
                    'justify-start  ' +
                    (selectedCat2Id === cat2.categoryId &&
                      ' text-[red] hover:text-[red]')
                  }
                  onClick={() => {
                    setSelectedCat3Id('');
                    navigate(`/category/${category1Id}/${cat2.categoryId}`);
                  }}
                >
                  {cat2.categoryName}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
          {/* color */}
          {productList.length > 0 && (
            <Collapsible
              className={'w-full ' + reusableStyle.filterBlock}
              defaultOpen
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className={'w-full justify-between'}>
                  <span className={reusableStyle.filterBlockTitle}>
                    Màu sắc
                  </span>
                  <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent
                className={`grid grid-cols-5 gap-1 space-y-1 ${reusableStyle.filterBlockContent}`}
              >
                {searchResultMetadata.allColor.map((color) => (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={
                          reusableStyle.colorButton +
                          (selectedColor.find((_color) => _color === color) &&
                            'border-black')
                        }
                        onClick={() => handleSelectingColor(color)}
                      >
                        <div
                          style={{
                            backgroundColor: colorMap[color] || '#111111',
                          }}
                          className="w-full h-full rounded-full flex items-center justify-center text-white"
                        >
                          {selectedColor.find((_color) => _color === color) && (
                            <Check />
                          )}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{color}</TooltipContent>
                  </Tooltip>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          {/* price */}
          {productList.length > 0 && (
            <Collapsible
              className={'w-full ' + reusableStyle.filterBlock}
              defaultOpen
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className={'w-full justify-between'}>
                  <span className={reusableStyle.filterBlockTitle}>
                    Kích cỡ
                  </span>
                  <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent
                className={`grid grid-cols-5 gap-1 space-y-1 ${reusableStyle.filterBlockContent}`}
              >
                {searchResultMetadata.allSize.map((size) => (
                  <button
                    className={
                      reusableStyle.sizeButton +
                      (selectedSize.find((_size) => _size === size) &&
                        reusableStyle.sizeButtonSelected)
                    }
                    onClick={() => handleSelectingSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          {/* size */}

          {productList.length > 0 && (
            <Collapsible
              className={'w-full' + reusableStyle.filterBlock}
              defaultOpen
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className={'w-full justify-between'}>
                  <span className={reusableStyle.filterBlockTitle}>
                    Khoảng giá
                  </span>
                  <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent
                className={`${reusableStyle.filterBlockContent}`}
              >
                <div className="flex flex-col gap-4 mt-1">
                  <div className="flex justify-between items-center gap-4">
                    <Input
                      value={formatMoney(priceRangeValue[0])}
                      onChange={(e) => {
                        let value = parseVND(e.target.value);
                        const temp = [Number(value), priceRangeValue[1]];
                        setpriceRangeValue(temp);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdatingPriceValueToRouter();
                        }
                      }}
                      onMouseLeave={(e) => {
                        handleUpdatingPriceValueToRouter();
                      }}
                      className={'max-w-[200px]!'}
                    />
                    <span className="text-2xl font-bold">-</span>
                    <Input
                      value={formatMoney(priceRangeValue[1])}
                      onChange={(e) => {
                        let value = parseVND(e.target.value);
                        const temp = [priceRangeValue[0], Number(value)];
                        setpriceRangeValue(temp);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdatingPriceValueToRouter();
                        }
                      }}
                      onMouseLeave={(e) => {
                        handleUpdatingPriceValueToRouter();
                      }}
                      className={'max-w-[200px]!'}
                    />
                  </div>

                  <Slider
                    value={priceSliderRange}
                    onValueChange={(value) => {
                      const [value1, value2] = value;
                      const bot =
                        (Number(value1) / 100) *
                          (searchResultMetadata.priceRange[1] -
                            searchResultMetadata.priceRange[0]) +
                        searchResultMetadata.priceRange[0];
                      const top =
                        (value2 / 100) *
                          (searchResultMetadata.priceRange[1] -
                            searchResultMetadata.priceRange[0]) +
                        searchResultMetadata.priceRange[0];
                      setpriceRangeValue([bot, top]);
                    }}
                    onValueCommit={() => {
                      handleUpdatingPriceValueToRouter();
                    }}
                    max={100}
                    step={5}
                    className={''}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
        {mainScreenState === 'empty' && (
          <div className="w-full h-full flex flex-col gap-4 items-center justify-center pb-20">
            <img src={notFoundProductImage} className="-mt-20" />
            <span className="text-xl font-bold -mt-20">
              {' '}
              Không tìm thấy sản phẩm!
            </span>
            <span className="max-w-[500px] leading-5">
              Vui lòng thay đổi tiêu chí tìm kiếm và thử lại, hoặc truy cập
              Trang chủ để xem sản phẩm phổ biến nhất của chúng tôi!
            </span>
          </div>
        )}
        {mainScreenState === 'loading' && (
          <div className="w-full h-full flex flex-col gap-4 items-center justify-center bg-gray-50">
            <Spinner className="size-10 text-blue-500" />
            <h1>Đang tải kết quả</h1>
          </div>
        )}
        {mainScreenState === 'productList' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-6">
              <div>{searchResultMetadata.totalItem2} kết quả</div>
              <div className="flex gap-2 items-center">
                <span className="text-muted-foreground">Sắp xếp theo: </span>
                <Select
                  defaultValue={searchParam.get('sortBy') || ''}
                  onValueChange={(value) => {
                    handleSelectingSortBy(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="alphabetical-az">
                      Theo tên(A-Z)
                    </SelectItem>
                    <SelectItem value="alphabetical-za">
                      Theo tên(Z-A)
                    </SelectItem>
                    <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                    <SelectItem value="price-desc">Giá giảm dần</SelectItem>
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
            {currentPage * pageSize < searchResultMetadata.totalItem2 && (
              <button
                className="button-standard-1 max-w-[500px] self-center mt-5 flex gap-2"
                onClick={() => {
                  handleAddMoreProduct();
                }}
                disabled={addLoading}
              >
                {addLoading && <Spinner />}
                XEM THÊM
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
const reusableStyle = {
  filterBlock: 'flex flex-col gap-2 pb-5 border-b border-b-gray-100 rounded-0',
  filterBlockTitle: 'text-[14px] font-bold',
  filterBlockContent: 'pl-4',
  colorButton:
    'w-[48px] h-[48px] p-1 border border-[var(--color-preset-border-color)] rounded-full cursor-pointer hover:border-[var(--color-preset-gray)] ',
  sizeButton:
    'w-[48px] h-[48px] flex items-center justify-center border border-[var(--color-preset-border-color)] rounded-[4px] cursor-pointer hover:border-[var(--color-preset-gray)] ',
  sizeButtonSelected: 'bg-[var(--color-preset-gray)] text-white',
};
