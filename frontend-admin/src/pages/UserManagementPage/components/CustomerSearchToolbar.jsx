import {
  InputWithStartAddOn,
  SelectWithStartAddOn,
} from "@/reusable-component/Input";

const sortByValueList = ["Mới nhất", "Cũ nhất", "Tên(A-Z)"];
export default function CustomerSearchToolbar({
  queryName,
  queryPhone,
  queryEmail,
  sortBy,
  onQueryNameChange,
  onQueryPhoneChange,
  onQueryEmailChange,
  onSortByChange,
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <InputWithStartAddOn
        addOnlabel={"Tên người dùng"}
        placeholder={"Nhập tên người dùng"}
        value={queryName}
        onInputValueChange={(e) => onQueryNameChange(e.target.value)}
      />

      <InputWithStartAddOn
        addOnlabel={"Email"}
        placeholder={"Nhập email người dùng"}
        value={queryEmail}
        onInputValueChange={(e) => onQueryEmailChange(e.target.value)}
      />
      <InputWithStartAddOn
        addOnlabel={"Số điện thoại"}
        placeholder={"Nhập số điện thoại người dùng"}
        value={queryPhone}
        onInputValueChange={(e) => onQueryPhoneChange(e.target.value)}
      />
      <SelectWithStartAddOn
        addOnlabel={"Sắp xếp"}
        selectValue={sortBy}
        onSelectValueChange={(value) => onSortByChange(value)}
        selectValueList={sortByValueList}
        placeholder={"Chọn cách sắp xếp"}
      />
    </div>
  );
}
