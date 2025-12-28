export function buildCategoryTree(categoryList) {
  if (!categoryList) {
    return;
  }
  function BuildRecursiveChildren(categoryList, currentCategory) {
    const allChildren = categoryList.filter(
      (category) => category.parentId === currentCategory._id
    );
    // console.log("CP: ", currentCategory);
    // console.log("CC: ", allChildren);
    if (allChildren.length === 0) {
      return;
    }

    currentCategory.children = allChildren;
    currentCategory.children.forEach((children) =>
      BuildRecursiveChildren(categoryList, children)
    );
  }
  const cleanedData = categoryList.map((category) => ({
    name: category.categoryName,
    _id: category.categoryId,
    id: category.categoryId,
    parentId: category.parentId,
  }));
  //first tier
  const categoryTree = cleanedData.filter((category) => !category.parentId);
  categoryTree.map((children) => BuildRecursiveChildren(cleanedData, children));
  return categoryTree;
}

export function buildCategoryNameRecursively(category, categoryList) {
  if (!categoryList) {
    return;
  }
  if (!category.parentId) {
    return category.categoryName;
  }
  const parent = categoryList.find(
    (element) => element.categoryId === category.parentId
  );
  if (!parent) {
    return category.categoryName;
  }
  return (
    buildCategoryNameRecursively(parent, categoryList) +
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
export function buildQueryStringFromObject(queryString) {
  return new URLSearchParams(queryString).toString();
}
