import { frontendApi } from '@/api/frontendApi';
import { productApi } from '@/api/productApi';
import BriefProductCard from '@/reusable_components/BriefProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function HomePage() {
  const [homepageSetting, setHomepageSetting] = useState(null);
  const getHomepageSetting = async () => {
    try {
      const response = await frontendApi.getHomepageSetting();
      setHomepageSetting(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu homepage setting');
    }
  };
  useEffect(() => {
    getHomepageSetting();
  }, []);
  return (
    <div>
      {homepageSetting && homepageSetting.heroCarousel && (
        <HeroCarousel heroCarousel={homepageSetting.heroCarousel} />
      )}
      {/* <img src="https://images.squarespace-cdn.com/content/v1/606d4bb793879d12d807d4c8/1b547f53-e6f9-461e-b9df-0104e04726b5/new-bg.jpg" /> */}
      <div className="flex flex-col"></div>
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
    <div className="relative w-full h-[600px] overflow-hidden">
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
const reusableStyle = {
  transitButton:
    'w-[56px] h-[56px] bg-[hsla(0,0%,100%,.4)] rounded-[4px] hover:bg-white cursor-pointer items-center justify-center flex text-[var(--color-preset-gray)]',
};
