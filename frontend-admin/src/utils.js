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

export const formatDate = (date) => {
  // console.log(date);
  const _d = new Date(date);
  return _d.toLocaleDateString("vi-vn", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
export function generatePageNumberArray(totalPage, currentPage, pageSlot) {
  let start, end;
  // console.log("T: ", totalPage);
  // console.log("C: ", currentPage);
  // console.log("P: ", pageSlot);
  const pageNumberArray = [];

  if (currentPage <= pageSlot) {
    start = 1;
    end = Math.min(pageSlot, totalPage);
  } else if (currentPage > totalPage - pageSlot) {
    start = totalPage - pageSlot + 1;
    end = totalPage;
  } else {
    const length = Math.floor(pageSlot / 2);
    start = currentPage - length;
    end = currentPage + length;
  }
  for (let i = start; i <= end; i++) {
    pageNumberArray.push(i);
  }
  // console.log(pageNumberArray);
  return pageNumberArray;
}
