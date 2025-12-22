export class CreateProductDto {
  productName: string;
  categoryId: string;

  propertyList: string;
  sizeList: string;
  description: string;

  variant1Data: string;
  variant2Data: string;
  totalVariant: string;
  isDrafted: string;
  variantTableData: string;
  //after pushing file
  display_thumbnail_image: string;
}
export class ProductSizeDto {
  name: string;
  fit: Record<string, { min: number; max: number }>;
}
export class ProductPropertyDto {
  name: string;
  value: string;
}
class VariantData {
  name: string;
  index: string;
  valueList: string[];
}
