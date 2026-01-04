import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { chatApi } from '@/api/chatApi';
import { productApi } from '@/api/productApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';

export function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào! Tôi là trợ lý Q-Shop. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn mua hàng hoặc giải đáp thắc mắc. Bạn cần hỗ trợ gì?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, products]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setProducts([]); // Clear previous products

    try {
      const response = await chatApi.sendMessage(userMessage, messages);
      setMessages(response.data.conversationHistory);

      // If products were returned, show them
      if (response.data.products && response.data.products.length > 0) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product-detail/${productId}`);
    setIsOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 10MB');
      return;
    }

    // Create preview URL for display
    const previewUrl = URL.createObjectURL(file);

    // Add user message with image
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: '🖼️ Tìm kiếm bằng hình ảnh',
        imageUrl: previewUrl,
      },
    ]);
    setIsLoading(true);
    setProducts([]);

    try {
      const response = await productApi.searchByImage(file);

      if (response.data && response.data.length > 0) {
        // Format products to match chat format
        const formattedProducts = response.data.map((p) => ({
          productId: p.productId,
          name: p.name,
          price: p.displayedPrice,
          thumbnail: p.thumbnailURL,
          colors: p.optionData?.map((o) => o.optionValue) || [],
        }));

        setProducts(formattedProducts);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Tôi tìm thấy ${response.data.length} sản phẩm tương tự với hình ảnh của bạn! Hãy xem các sản phẩm bên dưới nhé.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Xin lỗi, tôi không tìm thấy sản phẩm nào tương tự với hình ảnh này. Bạn có thể thử với hình ảnh khác hoặc mô tả sản phẩm bạn đang tìm kiếm.',
          },
        ]);
      }
    } catch (error) {
      console.error('Image search error:', error);
      toast.error('Không thể tìm kiếm bằng hình ảnh. Vui lòng thử lại.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi khi tìm kiếm bằng hình ảnh. Vui lòng thử lại sau.',
        },
      ]);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-7 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-4 border-violet-500 z-[100]">
          {/* Header */}
          <div className="bg-violet-600 p-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-violet-300">
                <Bot className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Q-Shop</h3>
                <span className="text-violet-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Online Now
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-white/70 hover:text-white">
                <span className="text-lg">•••</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.role === 'assistant' && (
                  <p className="text-[10px] text-gray-400 mb-1 ml-9">Q-Shop</p>
                )}
                <div
                  className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-white border-2 border-violet-400">
                      <Bot className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 text-xs leading-relaxed
                    ${
                      msg.role === 'user'
                        ? 'bg-violet-500 text-white rounded-2xl'
                        : 'bg-gray-100 text-gray-800 rounded-2xl'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div>
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Uploaded"
                            className="w-24 h-24 object-cover rounded-lg mb-2"
                          />
                        )}
                        <span>{msg.content}</span>
                      </div>
                    ) : (
                      <div className="chat-markdown [&_img]:max-w-[100px] [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-1 [&_p]:text-xs [&_li]:text-xs">
                        <MDEditor.Markdown
                          source={msg.content}
                          style={{ background: 'transparent', color: 'inherit', fontSize: '12px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Product Cards */}
            {products.length > 0 && (
              <div className="space-y-2">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin ml-9">
                  {products.map((product) => (
                    <div
                      key={product.productId}
                      className="flex-shrink-0 w-[120px]"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-1.5">
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              'https://via.placeholder.com/140?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                        {product.colors?.length > 0 && (
                          <p className="text-[10px] text-gray-500">
                            {product.colors[0]}
                          </p>
                        )}
                        <p className="text-xs font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                        <button
                          onClick={() => handleProductClick(product.productId)}
                          className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div>
                <p className="text-[10px] text-gray-400 mb-1 ml-9">Q-Shop</p>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-violet-400 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                    <div className="flex gap-1">
                      <span
                        className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-2 bg-white flex-shrink-0">
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                'Tìm áo thun',
                'Sản phẩm mới',
                'Giá rẻ nhất',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="text-xs px-3 py-1.5 bg-white border-2 border-gray-200 rounded-full hover:border-violet-400 hover:text-violet-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-gray-50 border-t flex-shrink-0">
            {/* Hidden file input */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex gap-2 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                className="rounded-full w-9 h-9 p-0 hover:bg-violet-100"
                title="Tìm kiếm bằng hình ảnh"
              >
                <ImageIcon className="w-4 h-4 text-violet-500" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Reply to Q-Shop..."
                disabled={isLoading}
                className="flex-1 rounded-full border-gray-200 bg-white focus:border-violet-400 focus:ring-violet-400 text-xs h-9"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-violet-500 hover:bg-violet-600 rounded-full w-9 h-9 p-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        className="rounded-full w-[60px] h-[60px] bg-violet-500 hover:bg-violet-600 cursor-pointer shadow-lg transition-all duration-300 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-[28px] h-[28px] text-white" />
        ) : (
          <MessageCircle className="w-[28px] h-[28px] text-white" fill="white" />
        )}
      </Button>
    </>
  );
}

