export function buildCategoryNameRecursively(category, allCategories) {
  if (!allCategories) {
    return;
  }
  if (!category.parentId) {
    return category.categoryName;
  }
  const parent = allCategories.find(
    (element) => element.categoryId === category.parentId
  );
  if (!parent) {
    return category.categoryName;
  }
  return (
    buildCategoryNameRecursively(parent, allCategories) +
    " > " +
    category.categoryName
  );
}
export function formatMoney(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
