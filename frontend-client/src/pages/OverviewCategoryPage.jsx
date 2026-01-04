import { categoryApi } from '@/api/categoryApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function OverviewCategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [landingData, setLandingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLandingData = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getCategoryLandingPage(categoryId);
      setLandingData(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu trang danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      getLandingData();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      {landingData?.heroImage && (
        <div className="w-full h-[600px]">
          <img
            src={landingData.heroImage}
            alt="Category Hero"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Bạn cần tìm Section */}
      {landingData?.childrenCategories &&
        landingData.childrenCategories.length > 0 && (
          <CategorySlider
            categories={landingData.childrenCategories}
            onCategoryClick={(cat) =>
              navigate(`/category/${categoryId}/${cat.categoryId}`)
            }
          />
        )}
    </div>
  );
}

function CategorySlider({ categories, onCategoryClick }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = (direction) => {
    const container = document.getElementById('category-slider');
    if (!container) return;

    const scrollAmount = 300;
    const newPosition =
      direction === 'left'
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    setScrollPosition(newPosition);
  };

  const updateScrollButtons = () => {
    const container = document.getElementById('category-slider');
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = document.getElementById('category-slider');
    if (!container) return;

    container.addEventListener('scroll', updateScrollButtons);
    updateScrollButtons();

    return () => container.removeEventListener('scroll', updateScrollButtons);
  }, []);

  return (
    <div className="w-full py-12 px-8">
      <h2 className="text-3xl font-bold mb-8">BẠN CẦN TÌM</h2>
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Slider Container */}
        <div
          id="category-slider"
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <div
              key={category.categoryId}
              onClick={() => onCategoryClick(category)}
              className="shrink-0 w-48 cursor-pointer group"
            >
              <div className="w-full h-48 mb-3 overflow-hidden rounded-lg">
                {category.img ? (
                  <img
                    src={category.img}
                    alt={category.categoryName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <h3 className="text-center font-semibold text-sm group-hover:underline">
                {category.categoryName}
              </h3>
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
