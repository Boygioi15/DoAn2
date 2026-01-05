import { frontendApi } from '@/api/frontendApi';
import { productApi } from '@/api/productApi';
import BriefProductCard from '@/reusable_components/BriefProductCard';
import CategoryCard from '@/reusable_components/CategoryCard';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
  Headphones,
  Package,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Custom hook for scroll animations
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return [elementRef, isVisible];
}

export default function HomePage() {
  const [homepageSetting, setHomepageSetting] = useState(null);
  const [featuredProductList, setFeaturedProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHomepageSetting = async () => {
    try {
      const response = await frontendApi.getHomepageSetting();
      setHomepageSetting(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu homepage setting');
    }
  };

  const getFeaturedProductList = async () => {
    try {
      const response = await productApi.getAllProduct(
        'limit=8&sort=-createdAt'
      );
      setFeaturedProductList(response.data.productList.slice(0, 12) || []);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy sản phẩm nổi bật');
    }
  };

  const getCategories = async () => {
    try {
      const response =
        await productApi.getAllDirectChildrenOfCategoryWithImage();
      setCategories(response.data.slice(0, 6) || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHomepageSetting();
    getFeaturedProductList();
    getCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      {homepageSetting && homepageSetting.heroCarousel && (
        <HeroCarousel heroCarousel={homepageSetting.heroCarousel} />
      )}
      <div className="mt-10 px-35 space-y-15 mb-10">
        {/* Features Section */}
        <FeaturesSection />

        {/* Categories Section */}
        {categories.length > 0 && <CategoriesSection categories={categories} />}

        {/* Featured ProductList */}
        {featuredProductList && featuredProductList.length > 0 && (
          <FeaturedProductListSection productList={featuredProductList} />
        )}
      </div>
    </div>
  );
}
function HeroCarousel({ heroCarousel }) {
  const [index, setIndex] = useState(0);
  const slideInterval = 3000;

  // Auto slide
  useEffect(() => {
    if (heroCarousel.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroCarousel.length);
    }, slideInterval); //

    return () => clearInterval(timer);
  }, [heroCarousel]);

  if (heroCarousel.length === 0) return null;

  const prev = () => {
    setIndex((i) => (i - 1 + heroCarousel.length) % heroCarousel.length);
  };

  const next = () => {
    setIndex((i) => (i + 1) % heroCarousel.length);
  };

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      {/* Slides wrapper */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {heroCarousel.map((hero, i) => (
          <img
            key={i}
            src={hero.url}
            className="w-full h-full object-cover flex-shrink-0 cursor-pointer"
          />
        ))}
      </div>

      {/* Left button */}
      <button
        onClick={prev}
        className={`absolute left-4 top-1/2 -translate-y-1/2 ${reusableStyle.transitButton}`}
      >
        <ChevronLeft />
      </button>

      {/* Right button */}
      <button
        onClick={next}
        className={`absolute right-4 top-1/2 -translate-y-1/2 ${reusableStyle.transitButton}`}
      >
        <ChevronRight />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {heroCarousel.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-3 w-3 rounded-full transition ${
              index === i ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Features Section Component
function FeaturesSection() {
  const [ref, isVisible] = useScrollAnimation();

  const features = [
    {
      icon: <Package className="w-8 h-8" />,
      title: '100+ sản phẩm',
      description: 'Đa dạng và phong phú',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Miễn phí vận chuyển',
      description: 'Đơn hàng trên 500.000đ',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Thanh toán an toàn',
      description: 'Bảo mật 100%',
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Đổi trả dễ dàng',
      description: 'Trong vòng 7 ngày',
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Hỗ trợ 24/7',
      description: 'Luôn sẵn sàng giúp bạn',
    },
  ];

  return (
    <div
      ref={ref}
      className={`w-full py-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold mb-3"
          style={{ color: 'var(--color-preset-gray)' }}
        >
          Ở chúng tôi, bạn sẽ tìm thấy:
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-red-50"
          >
            <div className="mb-4" style={{ color: 'var(--color-preset-red)' }}>
              {feature.icon}
            </div>
            <h3
              className="font-semibold text-lg mb-2"
              style={{ color: 'var(--color-preset-gray)' }}
            >
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Categories Section Component
function CategoriesSection({ categories }) {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`w-full transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="text-center mb-10">
        <h2
          className="text-3xl font-bold mb-3"
          style={{ color: 'var(--color-preset-gray)' }}
        >
          Danh mục sản phẩm
        </h2>
        <p className="text-gray-600">Hãy chọn sản phẩm phù hợp với bạn</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onClick={(cat) => {
              navigate(`/category/${cat.categoryId}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Featured ProductList Section Component
function FeaturedProductListSection({ productList }) {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollAnimation();
  console.log('PL: ', productList);
  return (
    <div
      ref={ref}
      className={`w-full transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="text-center mb-10">
        <h2
          className="text-3xl font-bold mb-3"
          style={{ color: 'var(--color-preset-gray)' }}
        >
          Sản phẩm nổi bật
        </h2>
        <p className="text-gray-600">
          Những sản phẩm mới nhất và được yêu thích nhất
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productList.map((product) => (
          <BriefProductCard key={product._id} briefProduct={product} />
        ))}
      </div>
      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/search')}
          className="button-standard-1 p-4!"
        >
          Xem thêm
        </button>
      </div>
    </div>
  );
}

const reusableStyle = {
  transitButton:
    'w-[56px] h-[56px] bg-[hsla(0,0%,100%,.4)] rounded-[4px] hover:bg-white cursor-pointer items-center justify-center flex text-[var(--color-preset-gray)]',
};
