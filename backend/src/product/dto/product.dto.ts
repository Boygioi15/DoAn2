export class CreateProductDto {
  productName: string;
  categoryId: string;

  propertyList: string;
  sizeGuidance: string;
  description: string;

  variant1Data: string;
  variant2Data: string;
  totalVariant: string;
  variantTableData: string;
  //after pushing file
  display_thumbnail_image: string;
}
export class ProductSizeGuidanceDto {
  productId?: string;
  name: string;
  fit: Record<string, { min: number; max: number }>;
}
export class ProductPropertyDto {
  productId?: string;
  name: string;
  value: string;
}
export class ProductVariantDetailDto {
  variantId: string;
  stock: number;
  seller_sku: string;
  platform_sku: string;
  price: number;
  isOpenToSale: boolean;
}
class VariantData {
  name: string;
  index: string;
  valueList: string[];
}
