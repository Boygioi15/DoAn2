import { frontendApi } from '@/api/frontendApi';
import { productApi } from '@/api/productApi';
import BriefProductCard from '@/reusable_components/BriefProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function HomePage() {
  const [allProduct, setAllproduct] = useState([]);
  const getAllProduct = async () => {
    try {
      const response = await productApi.getAllProduct();
      setAllproduct(response.data);
    } catch (error) {
      toast.error('Có lỗi khi lấy dữ liệu sản phẩm');
    }
  };
  useEffect(() => {
    getAllProduct();
  }, []);
  return (
    <div>
      <BannerRotator />
      {/* <img src="https://images.squarespace-cdn.com/content/v1/606d4bb793879d12d807d4c8/1b547f53-e6f9-461e-b9df-0104e04726b5/new-bg.jpg" /> */}
      <div className="flex flex-col">
        <h1>Tất cả sản phẩm</h1>
        <div className="flex gap-2 p-4">
          {allProduct &&
            allProduct.map((product) => (
              <BriefProductCard briefProduct={product} />
            ))}
        </div>
      </div>
    </div>
  );
}
function BannerRotator() {
  const [homepageBanner, setHomepageBanner] = useState([]);
  const [index, setIndex] = useState(0);
  const slideInterval = 3000;
  const getHomepageBanner = async () => {
    try {
      const response = await frontendApi.getHomepageBanner();
      setHomepageBanner(response.data); // must be array of URLs
    } catch (error) {
      toast.error('Có lỗi khi lấy dữ liệu banner');
    }
  };

  useEffect(() => {
    getHomepageBanner();
  }, []);

  // Auto slide
  useEffect(() => {
    if (homepageBanner.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % homepageBanner.length);
    }, slideInterval); //

    return () => clearInterval(timer);
  }, [homepageBanner]);

  if (homepageBanner.length === 0) return null;

  const prev = () => {
    setIndex((i) => (i - 1 + homepageBanner.length) % homepageBanner.length);
  };

  const next = () => {
    setIndex((i) => (i + 1) % homepageBanner.length);
  };

  return (
    <div className="relative w-full h-[450px] overflow-hidden">
      {/* Slides wrapper */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {homepageBanner.map((url, i) => (
          <img
            key={i}
            src={url}
            className="w-full h-[450px] object-cover flex-shrink-0"
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
        {homepageBanner.map((_, i) => (
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
const reusableStyle = {
  transitButton:
    'w-[56px] h-[56px] bg-[hsla(0,0%,100%,.4)] rounded-[4px] hover:bg-white cursor-pointer items-center justify-center flex text-[var(--color-preset-gray)]',
};
