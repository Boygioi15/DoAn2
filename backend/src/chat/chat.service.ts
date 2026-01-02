import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatMessageDto, ChatResponseDto } from './chat.dto';
import { ProductQueryService } from '../product/services/product-query.service';

// Define the tools for OpenAI function calling
const CHAT_TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description:
        'Tìm kiếm sản phẩm trong cửa hàng. Sử dụng khi khách hàng muốn tìm sản phẩm, hỏi về giá, hoặc muốn xem các sản phẩm có sẵn.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Từ khóa tìm kiếm sản phẩm (tên sản phẩm, loại sản phẩm, v.v.)',
          },
          priceMin: {
            type: 'number',
            description: 'Giá tối thiểu (VND)',
          },
          priceMax: {
            type: 'number',
            description: 'Giá tối đa (VND)',
          },
          colorList: {
            type: 'string',
            description: 'Danh sách màu sắc cần lọc, phân cách bằng dấu phẩy (ví dụ: "Đen,Trắng,Xanh")',
          },
          sizeList: {
            type: 'string',
            description: 'Danh sách kích thước cần lọc, phân cách bằng dấu phẩy (ví dụ: "S,M,L,XL")',
          },
          sortBy: {
            type: 'string',
            enum: ['newest', 'price-asc', 'price-desc', 'alphabetical-az'],
            description: 'Cách sắp xếp kết quả',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_detail',
      description:
        'Lấy thông tin chi tiết của một sản phẩm cụ thể. Sử dụng khi khách hàng muốn biết thêm về một sản phẩm.',
      parameters: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'ID của sản phẩm cần xem chi tiết',
          },
        },
        required: ['productId'],
      },
    },
  },
];

const SYSTEM_PROMPT = `Bạn là trợ lý mua sắm thông minh của Q-Shop - một cửa hàng thời trang trực tuyến.

Nhiệm vụ của bạn:
- Giúp khách hàng tìm kiếm và tư vấn sản phẩm phù hợp
- Trả lời các câu hỏi về sản phẩm, giá cả, kích thước, màu sắc
- Hướng dẫn khách hàng về quy trình mua hàng, thanh toán, giao hàng
- Giải đáp thắc mắc về đơn hàng và chính sách cửa hàng

Quy tắc:
- Luôn trả lời bằng tiếng Việt thân thiện, lịch sự
- Khi khách hàng hỏi về sản phẩm, hãy sử dụng tool search_products để tìm kiếm
- Khi có kết quả sản phẩm, hãy trình bày rõ ràng: tên, giá, và gợi ý khách xem chi tiết
- Nếu không tìm thấy sản phẩm, hãy gợi ý khách tìm với từ khóa khác
- Giữ câu trả lời ngắn gọn, dễ hiểu
- Nếu cần thêm thông tin, hãy hỏi khách hàng`;

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(private readonly productQueryService: ProductQueryService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(dto: ChatMessageDto): Promise<ChatResponseDto> {
    if (!process.env.OPENAI_API_KEY) {
      throw new BadRequestException(
        'OpenAI API key not configured. Please set OPENAI_API_KEY in .env file',
      );
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(dto.conversationHistory || []).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: dto.message },
    ];

    let productsFromTools: any[] = [];

    // First API call - may return tool calls
    let completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: CHAT_TOOLS,
      tool_choice: 'auto',
      max_tokens: 1000,
    });

    let assistantMessage = completion.choices[0]?.message;

    // Handle tool calls if any
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Add assistant message with tool calls to messages
      messages.push(assistantMessage);

      // Process each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        // Type guard for function tool calls
        if (toolCall.type !== 'function') continue;

        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        let toolResult: any;

        try {
          if (functionName === 'search_products') {
            toolResult = await this.searchProducts(functionArgs);
            productsFromTools = toolResult.products || [];
          } else if (functionName === 'get_product_detail') {
            toolResult = await this.getProductDetail(functionArgs.productId);
          }
        } catch (error) {
          toolResult = { error: (error as Error).message };
        }

        // Add tool result to messages
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Second API call with tool results
      completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
      });

      assistantMessage = completion.choices[0]?.message;
    }

    const reply =
      assistantMessage?.content ||
      'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.';

    return {
      reply,
      conversationHistory: [
        ...(dto.conversationHistory || []),
        { role: 'user', content: dto.message },
        { role: 'assistant', content: reply },
      ],
      products: productsFromTools.length > 0 ? productsFromTools : undefined,
    };
  }

  private async searchProducts(args: {
    query?: string;
    priceMin?: number;
    priceMax?: number;
    colorList?: string;
    sizeList?: string;
    sortBy?: string;
  }) {
    try {
      const result = await this.productQueryService.getAllProductWrapper({
        role: 'CLIENT',
        filters: {
          search: args.query,
          priceMin: args.priceMin,
          priceMax: args.priceMax,
          colorList: args.colorList,
          sizeList: args.sizeList,
        },
        pagination: {
          from: 1,
          size: 6, // Limit to 6 products for chat context
        },
        sortBy: args.sortBy || 'newest',
      });

      const productList = result.productList || [];
      const metadata = result.metadata;

      // Format products for the AI to understand
      const formattedProducts = productList.map((p: any) => ({
        productId: p.productId,
        name: p.name,
        price: p.displayedPrice,
        priceFormatted: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(p.displayedPrice),
        category: p.categoryName,
        thumbnail: p.thumbnailURL,
        colors: p.optionData?.map((o: any) => o.optionValue) || [],
      }));

      console.log('Formatted Products: ', formattedProducts);
      return {
        success: true,
        totalFound: metadata?.totalItem2 || productList.length,
        products: formattedProducts,
        message:
          formattedProducts.length > 0
            ? `Tìm thấy ${metadata?.totalItem2 || formattedProducts.length} sản phẩm`
            : 'Không tìm thấy sản phẩm nào',
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        success: false,
        error: 'Không thể tìm kiếm sản phẩm lúc này',
        products: [],
      };
    }
  }

  private async getProductDetail(productId: string) {
    try {
      const product =
        await this.productQueryService.getProductDetail_Client(productId);

      return {
        success: true,
        product: {
          name: product.name,
          category: product.categoryName,
          sku: product.sku,
          thumbnail: product.thumbnailURL,
          isOutOfStock: product.isOutOfStock,
          variants: product.allProductVariants?.map((v: any) => ({
            price: v.price,
            priceFormatted: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(v.price),
            stock: v.stock,
            color: v.optionValue1,
            size: v.optionValue2,
          })),
          options: product.optionData,
        },
      };
    } catch (error) {
      console.error('Error getting product detail:', error);
      return {
        success: false,
        error: 'Không tìm thấy sản phẩm',
      };
    }
  }
}

