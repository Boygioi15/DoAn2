import ReactQuill from "react-quill-new";
import { AddNewProductPageContext } from "../AddNewProductPage";
import { useContext } from "react";

export default function DescriptionBlock() {
  const addProductContext = useContext(AddNewProductPageContext);
  return (
    <div
      id="descripton"
      className={
        reusableStyle.inputBlock +
        (addProductContext.formErrors.descriptionError.length > 0 &&
          reusableStyle.errorBorder)
      }
    >
      <h2>Mô tả sản phẩm</h2>
      <ReactQuill
        theme="snow"
        value={addProductContext.productDescription}
        onChange={addProductContext.setProductDescription}
        className="flex flex-col min-h-[400px] max-h-[400px] overflow-clip pb-45px"
      />
      {addProductContext.formErrors.descriptionError.length > 0 && (
        <ul
          style={{ marginTop: "-50px", marginBottom: "-4px" }}
          className="ul-error"
        >
          {addProductContext.formErrors.descriptionError.map((element, idx) => (
            <li key={idx}>{element}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
const reusableStyle = {
  inputBlock:
    "flex flex-col p-[16px] pt-[20px] gap-[20px] rounded-[8px] bg-[white] w-full h-auto shadow-lg ",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
