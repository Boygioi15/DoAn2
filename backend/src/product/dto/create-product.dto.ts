export class CreateProductDto {
  productName: string;
  categoryId: string;

  propertyList: string;
  description: string;

  variant1Data: string;
  variant2Data: string;
  totalVariant: string;
  isDrafted: string;
  variantTableData: string;
  //after pushing file
  display_thumbnail_image: string;
}
class ProductProperty {
  name: string;
  value: string;
}
class VariantData {
  name: string;
  index: string;
  valueList: string[];
}
