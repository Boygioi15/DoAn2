export default function CategoryCard({ category, onClick }) {
  return (
    <div
      className="flex flex-col gap-3 w-full h-auto group cursor-pointer transition-transform duration-300 hover:scale-105"
      onClick={() => onClick?.(category)}
    >
      <div className="w-full h-auto relative">
        {category.img ? (
          <img
            src={category.img}
            alt={category.categoryName}
            className="w-full h-auto"
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Không có hình</span>
          </div>
        )}
      </div>
      <span className="text-(--color-preset-gray) text-[20px] font-bold leading-5 text-center">
        {category.categoryName}
      </span>
    </div>
  );
}
