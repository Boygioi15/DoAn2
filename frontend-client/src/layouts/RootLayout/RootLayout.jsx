import { Outlet, Link, useNavigate } from 'react-router-dom';
import './RootLayout.css';
import ModalContextProvider, {
  ModalContext,
} from '../../contexts/ModalContext';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import UltilityContextProvider_1 from '../../contexts/UltilityContext_1';
import { UltilityContext_1 } from '../../contexts/UltilityContext_1';
import topBannerSample from '../../assets/topBannerSample.webp';
import { FiSearch } from 'react-icons/fi';
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa';

import useAuthStore from '../../contexts/zustands/AuthStore';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import Breadcrumbs from '@/reusable_components/Breadcrumb';
import { frontendApi } from '@/api/frontendApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowDownToLine,
  CircleUserRound,
  Headset,
  Image,
  MessageCircle,
  Mic,
  User,
} from 'lucide-react';
import { CartWrapper } from './CartComponent';
import { SpeechToTextDialog } from '@/reusable_components/SpeechToTextDialog';
import { ChatBot } from '@/components/ChatBot';
import { ImageSearchDialog } from '@/reusable_components/ImageSearchDialog';

export default function RootLayout({ children }) {
  return (
    <ModalContextProvider>
      <UltilityContextProvider_1>
        <div className="relative">
          <TopLayout />
          <Breadcrumbs />
          {children}
          <Outlet />
          <div className="fixed bottom-10 right-7 flex flex-col gap-5 z-50">
            <ChatBot />
            <Button
              className={
                'rounded-full w-[60px] h-[60px] bg-[#edf1f5] hover:bg-[#edf1f5] cursor-pointer'
              }
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowDownToLine className="rotate-180 w-[24px]! h-[24px]! text-black" />
            </Button>
          </div>

          <BotLayout />
        </div>
      </UltilityContextProvider_1>
    </ModalContextProvider>
  );
}

export function TopLayout() {
  const { openModal } = useContext(ModalContext);
  const { convenience_1 } = useContext(UltilityContext_1);
  const navigate = useNavigate();
  //get img and link of top banner from be

  //check login state with refresh token
  const authStore = useAuthStore.getState();
  let loggedIn = false;
  loggedIn = !!authStore.refreshToken;

  const [layoutSetting, setLayoutSetting] = useState(null);
  const [search, setSearch] = useState('');
  const [isSpeechToTextOpen, setIsSpeechToTextOpen] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapsibleRef = useRef(null);
  const [collapsibleHeight, setCollapsibleHeight] = useState(0);
  const lastScrollY = useRef(0);

  const getLayoutSetting = async () => {
    try {
      const response = await frontendApi.getLayoutSetting();
      setLayoutSetting(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu layout setting');
    }
  };
  const handleSpeechTranscript = (transcript) => {
    setSearch(transcript);
    navigate(`/search?query=${encodeURIComponent(transcript)}`);
  };

  const handleImageSearchResults = (productList, searchImage) => {
    // Navigate to search results page with image search results
    // console.log('PL : ', productList);
    // console.log('OIL : ', originalImageUrl);

    navigate('/search-by-image', {
      state: {
        productList,
        searchImage,
      },
    });
  };

  // Track scroll direction for collapse/expand behavior
  useEffect(() => {
    const SCROLL_THRESHOLD = 10; // Minimum scroll delta to trigger state change

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      // console.log('Y: ', currentScrollY);
      // console.log('LCY: ', lastScrollY);

      if (Math.abs(scrollDelta) < 10) return;
      if (scrollDelta > 0 && currentScrollY > 100) {
        // Scrolling down & past threshold - collapse
        console.log('Collapsing');
        setIsCollapsed(true);
      } else if (scrollDelta < 0) {
        // Scrolling up - expand
        console.log('Opening');
        setIsCollapsed(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    getLayoutSetting();
  }, []);

  // Measure collapsible content height
  useEffect(() => {
    if (collapsibleRef.current) {
      const updateHeight = () => {
        setCollapsibleHeight(collapsibleRef.current.offsetHeight);
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [layoutSetting]);

  return (
    <div
      className="TopLayout sticky top-0 z-49 bg-white transition-transform duration-300 ease-in-out"
      style={{
        transform: isCollapsed
          ? `translateY(-${collapsibleHeight}px)`
          : 'translateY(0)',
      }}
    >
      <SpeechToTextDialog
        open={isSpeechToTextOpen}
        onOpenChange={setIsSpeechToTextOpen}
        onTranscript={handleSpeechTranscript}
      />
      <ImageSearchDialog
        open={isImageSearchOpen}
        onOpenChange={setIsImageSearchOpen}
        onSearchResults={handleImageSearchResults}
      />
      <div ref={collapsibleRef}>
        {layoutSetting && layoutSetting.announcementBar && (
          <AnnouncementBar announcementBar={layoutSetting.announcementBar} />
        )}
        {layoutSetting?.announcementCarousel && (
          <AnnouncementCarousel
            announcementCarousel={layoutSetting.announcementCarousel}
          />
        )}
        <div className="TopLayout_Toolbar">
          <div
            className="bg-(--color-preset-red) flex justify-center items-center cursor-pointer text-white text-[24px] font-bold px-3"
            onClick={() => navigate('/')}
          >
            SilkShop
          </div>
          <div className="TopLayout_Toolbar_Right">
            <div className="input-with-icon-before">
              <FiSearch style={{ fontSize: '24px' }} />
              <input
                placeholder="Tìm kiếm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/search?query=${encodeURIComponent(search)}`);
                  }
                }}
              />
              <Button
                variant={'ghost'}
                size={'icon'}
                className="ml-2"
                onClick={() => setIsSpeechToTextOpen(true)}
                title="Tìm kiếm bằng giọng nói"
              >
                <Mic style={{ width: '20px', height: '20px' }} />
              </Button>
              <Button
                variant={'ghost'}
                size={'icon'}
                onClick={() => setIsImageSearchOpen(true)}
                title="Tìm kiếm bằng hình ảnh"
              >
                <Image style={{ width: '20px', height: '20px' }} />
              </Button>
            </div>
            {!loggedIn ? (
              <Button
                variant={'ghost'}
                className={
                  'flex flex-col gap-1 h-full p-1! items-center justify-center'
                }
                onClick={() => {
                  navigate('/auth/sign-in');
                }}
              >
                <CircleUserRound style={{ width: '24px', height: '24px' }} />
                <span className="text-[14px] font-medium">Đăng nhập</span>
              </Button>
            ) : (
              <Button
                variant={'ghost'}
                className={
                  'flex flex-col gap-1 h-full p-1! items-center justify-center'
                }
                onClick={() => {
                  navigate('/profile/account-info');
                }}
              >
                <User style={{ width: '24px', height: '24px' }} />
                <span className="text-[14px] font-medium">Tài khoản</span>
              </Button>
            )}
            <CartWrapper />
            <Button
              variant={'ghost'}
              className={
                'flex flex-col gap-1 h-full p-1! items-center justify-center'
              }
            >
              <Headset style={{ width: '24px', height: '24px' }} />
              <span className="text-[14px] font-medium">Liên hệ</span>
            </Button>
          </div>
        </div>
      </div>
      {layoutSetting && layoutSetting.categoryData && (
        <TopLayout_CategorySelector categoryData={layoutSetting.categoryData} />
      )}
    </div>
  );
}
function AnnouncementBar({ announcementBar }) {
  return (
    <Link className="AnnouncementBar" to={announcementBar.relativePath}>
      <img src={announcementBar.url} />
    </Link>
  );
}
function AnnouncementCarousel({ announcementCarousel }) {
  const [messageIndex, setMessageIndex] = useState(1);
  const [slideClass, setSlideClass] = useState('');
  const [slideDirection, setSlideDirection] = useState('next');
  const handleMessageIndex = (state) => {
    setSlideDirection(state ? 'next' : 'prev');
    setSlideClass('slide-out');

    setTimeout(() => {
      setMessageIndex((prev) =>
        state
          ? (prev + 1) % announcementCarousel.length
          : (prev - 1 + announcementCarousel.length) %
            announcementCarousel.length
      );
      setSlideClass('slide-in');
    }, 300);
  };
  //auto move forward for message
  useEffect(() => {
    const interval = setInterval(() => {
      handleMessageIndex(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [announcementCarousel, messageIndex]);

  // Reset class after animation
  useEffect(() => {
    const timer = setTimeout(() => setSlideClass(''), 300);
    return () => clearTimeout(timer);
  }, [messageIndex]);
  return (
    <div className="TopLayout_Message">
      <MdArrowBackIos
        className="hover-icon"
        onClick={() => {
          handleMessageIndex(false);
        }}
      />
      <div style={{ width: '500px' }}></div>
      <div className={`message-text ${slideClass} ${slideDirection}`}>
        {announcementCarousel[messageIndex]}
      </div>

      <MdArrowForwardIos
        className="hover-icon"
        onClick={() => {
          handleMessageIndex(true);
        }}
      />
    </div>
  );
}
function TopLayout_CategorySelector({ categoryData }) {
  const navigate = useNavigate();
  return (
    <div className="flex w-full bg-(--color-preset-gray) pl-25 pr-25 relative">
      {categoryData.map((t1) => (
        <div className="group" key={t1.name}>
          <button
            className="category-button"
            onClick={() => {
              navigate(`/category/${t1.categoryId}`);
            }}
          >
            {t1.name}
          </button>
          <div
            className="
              absolute left-0 z-100
              hidden group-hover:block
              bg-white shadow-lg border pl-25 pr-25 pt-10 pb-10
              w-screen 
            "
          >
            {t1.subCategory?.length > 0 ? (
              <div className="flex gap-2">
                <div className="flex flex-col gap-2">
                  <Link className={reusableStyle.categoryLink}>
                    Sản phẩm mới
                  </Link>
                  <Link className={reusableStyle.categoryLink}>Giá tốt</Link>
                  <Link className={reusableStyle.categoryLink}>Free ship</Link>
                </div>
                <div className="w-px bg-gray-300"></div>
                <div className="flex flex-col ml-5 gap-2">
                  <h3>Danh mục sản phẩm</h3>
                  <div className="flex flex-col flex-wrap max-h-[200px] gap-2">
                    {t1.subCategory.map((t2) => (
                      <Link
                        className={reusableStyle.categoryLink}
                        key={t2.categoryId}
                        to={`/category/${t1.categoryId}/${t2.categoryId}`}
                      >
                        {t2.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Không có danh mục con</div>
            )}
          </div>
        </div>
      ))}
      <button className="category-button">Sản phẩm mới</button>
      <button className="category-button">Free ship</button>
    </div>
  );
}
function IconBlock({ icon, name, handleOnClick, note }) {
  return (
    <button className="icon-block" onClick={handleOnClick}>
      {icon}
      <div>{name}</div>
    </button>
  );
}
export function BotLayout() {
  return (
    <div className="bg-(--color-preset-gray) text-white p-10 pb-20 flex justify-around gap-10 flex-col">
      <div className="BotLayout_Title">Trường đại học CNTT UIT - Khoa CNPM</div>
      <div className="flex gap-20">
        <div className={reusableStyle.textColumn}>
          <div> Địa chỉ: Khu phố 6 - phường Linh Trung</div>
          <div> SĐT: 0123-456-789</div>
          <div> Email: uit@uit.edu.vn</div>
        </div>
        <div className={reusableStyle.textColumn}>
          <div className={reusableStyle.textColumnTitle}>SilkShop</div>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/about"
          >
            Giới thiệu
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/news"
          >
            Tin tức
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/contact"
          >
            Liên hệ
          </Link>
        </div>
        <div className={reusableStyle.textColumn}>
          <div className={reusableStyle.textColumnTitle}>Hỗ trợ</div>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/f-a-q"
          >
            Hỏi đáp
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/loyal-customer-condition"
          >
            Điều kiện & Điều khoản KHTT
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/loyal-customer-policy"
          >
            Chính sách KHTT
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/delivery-policy"
          >
            Chính sách vận chuyển
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/customer-security-policy"
          >
            Chính sách bảo mật thông tin KH
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/general-size-guidance"
          >
            Bảng tham khảo kích cỡ chung
          </Link>
        </div>

        <div className={reusableStyle.textColumn}>
          <div className={reusableStyle.textColumnTitle}>Tài khoản</div>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/auth/sign-in"
          >
            Đăng nhập/ đăng ký
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/#"
          >
            Mã ưu đãi
          </Link>
          <Link
            className={reusableStyle.smallText + reusableStyle.smallTextHover}
            to="/loyal-customer-policy"
          >
            Lịch sử đặt hàng
          </Link>
        </div>
        <div className={reusableStyle.textColumn}>
          <div className={reusableStyle.textColumnTitle}>
            Theo dõi chúng tôi
          </div>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/canifa.fanpage/"
              alt="facebook"
              aria-label="facebook"
              target="_blank"
              className="
                block w-9 h-9
                bg-white border border-slate-200 rounded
                bg-center bg-no-repeat
                bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUuMDU1IDEzLjEwM1YyNGg1LjE1M1YxMy4xMDRoNC4yMzRsLjY3OS00LjQ0OWgtNC45MTNWNS41NjNjMC0uODYzLjgxLTEuNTYzIDEuODEtMS41NjNoMy4xODNWMGgtNC40NDhDNy42MDYgMCA1LjA1NSAyLjIwMiA1LjA1NSA0LjkydjMuNzM1SC44djQuNDQ4aDQuMjU0eiIgZmlsbD0iIzMzM0Y0OCIvPjwvc3ZnPg==')]
              "
            />
            <a
              href="https://www.facebook.com/canifa.fanpage/"
              alt="facebook"
              aria-label="facebook"
              target="_blank"
              className="
                block w-9 h-9
                bg-white border border-slate-200 rounded
                bg-center bg-no-repeat
                bg-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI0Ljk3NiA3LjM1Yy0uMDU5LTEuMzI4LS4yNzQtMi4yNDEtLjU4MS0zLjAzM0E2LjEwMyA2LjEwMyAwIDAwMjIuOTQ4IDIuMSA2LjE1MyA2LjE1MyAwIDAwMjAuNzM2LjY2Yy0uNzk1LS4zMDgtMS43MDQtLjUyMy0zLjAzMi0uNTgyQzE2LjM2NS4wMTUgMTUuOTQgMCAxMi41NDYgMFM4LjcyNy4wMTUgNy4zOTQuMDczQzYuMDY2LjEzMiA1LjE1Mi4zNDcgNC4zNjEuNjU0QTYuMSA2LjEgMCAwMDIuMTQ0IDIuMWE2LjE1NSA2LjE1NSAwIDAwLTEuNDQgMi4yMTJDLjM5NSA1LjExLjE4IDYuMDE3LjEyMSA3LjM0NS4wNiA4LjY4My4wNDQgOS4xMDguMDQ0IDEyLjUwMmMwIDMuMzk1LjAxNSAzLjgyLjA3MyA1LjE1My4wNTkgMS4zMjguMjc0IDIuMjQxLjU4MiAzLjAzMy4zMTcuODQuODEgMS41OTIgMS40NDUgMi4yMTdhNi4xNTMgNi4xNTMgMCAwMDIuMjEyIDEuNDRjLjc5Ni4zMDggMS43MDUuNTIzIDMuMDMzLjU4MiAxLjMzMy4wNTggMS43NTguMDczIDUuMTUzLjA3MyAzLjM5NCAwIDMuODE5LS4wMTUgNS4xNTItLjA3MyAxLjMyOC0uMDU5IDIuMjQyLS4yNzQgMy4wMzMtLjU4MWE2LjM5NiA2LjM5NiAwIDAwMy42NTgtMy42NThjLjMwNy0uNzk2LjUyMi0xLjcwNS41OC0zLjAzMy4wNi0xLjMzNC4wNzQtMS43NTguMDc0LTUuMTUzIDAtMy4zOTQtLjAwNS0zLjgxOS0uMDYzLTUuMTUyem0tMi4yNTIgMTAuMjA3Yy0uMDUzIDEuMjIxLS4yNTkgMS44OC0uNDMgMi4zMmE0LjE0NyA0LjE0NyAwIDAxLTIuMzczIDIuMzczYy0uNDQuMTcyLTEuMTA0LjM3Ny0yLjMyLjQzLTEuMzE5LjA1OS0xLjcxNC4wNzMtNS4wNS4wNzMtMy4zMzUgMC0zLjczNi0uMDE0LTUuMDUtLjA3My0xLjIyLS4wNTMtMS44OC0uMjU4LTIuMzItLjQzYTMuODQ2IDMuODQ2IDAgMDEtMS40MzUtLjkzMiAzLjg4NiAzLjg4NiAwIDAxLS45MzMtMS40MzZjLS4xNy0uNDQtLjM3Ni0xLjEwNC0uNDMtMi4zMi0uMDU4LTEuMzE5LS4wNzMtMS43MTQtLjA3My01LjA1IDAtMy4zMzUuMDE1LTMuNzM2LjA3My01LjA1LjA1NC0xLjIyLjI2LTEuODguNDMtMi4zMmEzLjggMy44IDAgMDEuOTM4LTEuNDM1IDMuODggMy44OCAwIDAxMS40MzYtLjkzM2MuNDQtLjE3IDEuMTAzLS4zNzYgMi4zMi0uNDMgMS4zMTgtLjA1OCAxLjcxNC0uMDczIDUuMDUtLjA3MyAzLjM0IDAgMy43MzUuMDE1IDUuMDUuMDczIDEuMjIuMDU0IDEuODguMjYgMi4zMTkuNDNhMy44NSAzLjg1IDAgMDExLjQzNi45MzNjLjQxNS40MDUuNzMyLjg5My45MzMgMS40MzYuMTcuNDQuMzc1IDEuMTAzLjQzIDIuMzIuMDU4IDEuMzE4LjA3MiAxLjcxNC4wNzIgNS4wNSAwIDMuMzM1LS4wMTQgMy43MjUtLjA3MyA1LjA0NHoiIGZpbGw9IiMzMzNGNDgiLz48cGF0aCBkPSJNMTIuNTQ2IDYuMDgxYTYuNDI0IDYuNDI0IDAgMDAtNi40MjIgNi40MjMgNi40MjQgNi40MjQgMCAwMDYuNDIyIDYuNDIyIDYuNDI0IDYuNDI0IDAgMDA2LjQyMi02LjQyMiA2LjQyNCA2LjQyNCAwIDAwLTYuNDIyLTYuNDIzem0wIDEwLjU4OGE0LjE2NyA0LjE2NyAwIDExLjAwMS04LjMzMyA0LjE2NyA0LjE2NyAwIDAxMCA4LjMzM3ptOC4xNzYtMTAuODQyYTEuNSAxLjUgMCAxMS0zIDAgMS41IDEuNSAwIDAxMyAweiIgZmlsbD0iIzMzM0Y0OCIvPjwvc3ZnPg==)]
              "
            />
            <a
              href="https://www.facebook.com/canifa.fanpage/"
              alt="facebook"
              aria-label="facebook"
              target="_blank"
              className="
                block w-9 h-9
                bg-white border border-slate-200 rounded
                bg-center bg-no-repeat
                bg-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMiIGhlaWdodD0iMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIxLjY4NyAxMi42NTVjLS4yNTktMS4xMjItMS4xNzctMS45NS0yLjI4Mi0yLjA3My0yLjYxNi0uMjkzLTUuMjY1LS4yOTQtNy45MDEtLjI5My0yLjYzOC0uMDAxLTUuMjg3IDAtNy45MDMuMjkzLTEuMTA1LjEyMy0yLjAyMi45NS0yLjI4IDIuMDczLS4zNjggMS41OTgtLjM3MyAzLjM0My0uMzczIDQuOTg5IDAgMS42NDUgMCAzLjM5LjM2OCA0Ljk4OC4yNTggMS4xMjIgMS4xNzYgMS45NSAyLjI4IDIuMDczIDIuNjE3LjI5MyA1LjI2Ni4yOTQgNy45MDMuMjkzIDIuNjM3LjAwMSA1LjI4NSAwIDcuOTAzLS4yOTMgMS4xMDQtLjEyMyAyLjAyMi0uOTUxIDIuMjgtMi4wNzMuMzY4LTEuNTk4LjM3LTMuMzQzLjM3LTQuOTg4IDAtMS42NDYuMDAyLTMuMzktLjM2NS00Ljk4OXptLTE0LjcyIDEuMjM5SDUuNDR2OC4xMTZINC4wMjJ2LTguMTE2aC0xLjV2LTEuMzNoNC40NDZ2MS4zM3ptMy44NTQgOC4xMTZIOS41NDV2LS43NjhjLS41MDcuNTgyLS45ODguODY1LTEuNDU3Ljg2NS0uNDExIDAtLjY5NC0uMTY2LS44MjItLjUyMy0uMDctLjIxMy0uMTEyLS41NS0uMTEyLTEuMDQ3di01LjU2NWgxLjI3NXY1LjE4MmMwIC4yOTkgMCAuNDU0LjAxMS40OTYuMDMuMTk4LjEyOC4yOTguMjk5LjI5OC4yNTUgMCAuNTIzLS4xOTcuODA2LS41OTd2LTUuMzc5aDEuMjc2djcuMDM4em00Ljg0NS0yLjExMmMwIC42NS0uMDQ0IDEuMTItLjEyOSAxLjQxOC0uMTcuNTI0LS41MTEuNzkxLTEuMDE5Ljc5MS0uNDUzIDAtLjg5MS0uMjUyLTEuMzE4LS43Nzl2LjY4M2gtMS4yNzV2LTkuNDQ3SDEzLjJ2My4wODVjLjQxMi0uNTA3Ljg1LS43NjMgMS4zMTgtLjc2My41MDggMCAuODQ5LjI2NyAxLjAyLjc5NC4wODUuMjgzLjEyOC43NDguMTI4IDEuNDE1djIuODAzem00LjgxMy0xLjE3NGgtMi41NXYxLjI0N2MwIC42NTIuMjEzLjk3Ny42NTEuOTc3LjMxNCAwIC40OTctLjE3LjU3LS41MTIuMDEyLS4wNjkuMDI4LS4zNTIuMDI4LS44NjRoMS4zMDF2LjE4N2MwIC40MS0uMDE1LjY5NC0uMDI3LjgyMWExLjgyIDEuODIgMCAwMS0uMjk4Ljc2NGMtLjM1My41MTEtLjg3Ni43NjMtMS41NDIuNzYzLS42NjcgMC0xLjE3NS0uMjQtMS41NDQtLjcyLS4yNy0uMzUzLS40MS0uOTA3LS40MS0xLjY1NXYtMi40NjVjMC0uNzUzLjEyNC0xLjMwMy4zOTUtMS42NTkuMzY4LS40ODIuODc2LS43MjEgMS41MjctLjcyMS42NCAwIDEuMTQ4LjI0IDEuNTA1LjcyMS4yNjcuMzU2LjM5NS45MDYuMzk1IDEuNjU5djEuNDU3eiIgZmlsbD0iIzMzM0Y0OCIvPjxwYXRoIGQ9Ik0xOC41NjkgMTYuMDM2Yy0uNDI3IDAtLjY0LjMyNS0uNjQuOTc2di42NTFoMS4yNzV2LS42NTFjMC0uNjUtLjIxMy0uOTc2LS42MzUtLjk3NnptLTQuNzMzIDBjLS4yMSAwLS40MjMuMDk5LS42MzYuMzF2NC4yOWMuMjEzLjIxMy40MjYuMzE0LjYzNi4zMTQuMzY4IDAgLjU1NS0uMzE0LjU1NS0uOTV2LTMuMDA0YzAtLjYzNS0uMTg3LS45Ni0uNTU1LS45NnptLjcxMi02LjM5NGMuNDcgMCAuOTYtLjI4NSAxLjQ3My0uODczdi43NzZoMS4yODhWMi40MzJoLTEuMjg4djUuNDM2Yy0uMjg2LjQwNC0uNTU3LjYwMy0uODE1LjYwMy0uMTcyIDAtLjI3NC0uMTAyLS4zMDItLjMwMi0uMDE1LS4wNDItLjAxNS0uMTk5LS4wMTUtLjVWMi40MzFoLTEuMjg1djUuNjI0YzAgLjUwMi4wNDMuODQyLjExNCAxLjA1OC4xMy4zNi40MTUuNTI4LjgzLjUyOHpNNS41NzYgNS42OHYzLjg2NmgxLjQyOVY1LjY3OUw4LjcyNSAwSDcuMjc4bC0uOTc1IDMuNzQ4TDUuMjg5IDBIMy43ODVjLjMwMS44ODUuNjE1IDEuNzc0LjkxNiAyLjY2LjQ1OSAxLjMzLjc0NSAyLjMzNC44NzUgMy4wMTl6bTUuMDY0IDMuOTYzYy42NDUgMCAxLjE0Ny0uMjQzIDEuNTAzLS43MjguMjctLjM1Ni40LS45MTcuNC0xLjY3M3YtMi40OWMwLS43Ni0uMTMtMS4zMTctLjQtMS42NzYtLjM1Ni0uNDg2LS44NTctLjczLTEuNTAzLS43My0uNjQzIDAtMS4xNDQuMjQ0LTEuNTAxLjczLS4yNzQuMzYtLjQwMy45MTUtLjQwMyAxLjY3NnYyLjQ5YzAgLjc1Ni4xMyAxLjMxNy40MDMgMS42NzMuMzU3LjQ4NS44NTguNzI4IDEuNS43Mjh6bS0uNjE1LTUuMTVjMC0uNjU4LjItLjk4Ni42MTUtLjk4NnMuNjE0LjMyOC42MTQuOTg2djIuOTkyYzAgLjY1OC0uMTk5Ljk4OC0uNjE0Ljk4OC0uNDE2IDAtLjYxNS0uMzMtLjYxNS0uOTg4VjQuNDkyeiIgZmlsbD0iIzMzM0Y0OCIvPjwvc3ZnPg==)]
              "
            />
            <a
              href="https://www.facebook.com/canifa.fanpage/"
              alt="facebook"
              aria-label="facebook"
              target="_blank"
              className="
                block w-9 h-9
                bg-white border border-slate-200 rounded
                bg-center bg-no-repeat
                bg-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE1LjUyIDMuNTg3QTUuMTM0IDUuMTM0IDAgMDExNC4yNDguMjAzSDEwLjU0djE0Ljg4YTMuMTEgMy4xMSAwIDAxLTMuMTA4IDMgMy4xMyAzLjEzIDAgMDEtMy4xMi0zLjEyYzAtMi4wNjQgMS45OTItMy42MTIgNC4wNDQtMi45NzZWOC4xOTVDNC4yMTYgNy42NDMuNTkyIDEwLjg2LjU5MiAxNC45NjNjMCAzLjk5NiAzLjMxMiA2Ljg0IDYuODI4IDYuODQgMy43NjggMCA2LjgyOC0zLjA2IDYuODI4LTYuODRWNy40MTVhOC44MiA4LjgyIDAgMDA1LjE2IDEuNjU2VjUuMzYzcy0yLjI1Ni4xMDgtMy44ODgtMS43NzZ6IiBmaWxsPSIjMzMzRjQ4Ii8+PC9zdmc+)]
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const reusableStyle = {
  categoryLink:
    'p-2 font-medium text-(color-preset-gray) hover:text-red-500 cursor-pointer min-w-[200px]',
  textColumn: 'flex flex-col gap-2',
  textColumnTitle: 'font-medium text-[#adbccd] text-[16px] mb-2',
  smallText:
    'leading-5 text-[14px] flex flex-col text-white text-decoration-none cursor-pointer ',
  smallTextHover: ' hover:text-red-500 hover:underline',
};
