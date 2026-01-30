import { Injectable, BadRequestException } from '@nestjs/common';
import { ChatMessageDto, ChatResponseDto } from './chat.dto';
import { ProductQueryService } from '../product/services/product-query.service';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';

const SYSTEM_PROMPT = `Bạn là trợ lý mua sắm thông minh của SilkShop - một cửa hàng thời trang trực tuyến.

Nhiệm vụ của bạn:
- Giúp khách hàng tìm kiếm và tư vấn sản phẩm phù hợp
- Trả lời các câu hỏi về sản phẩm, giá cả, kích thước, màu sắc
- Hướng dẫn khách hàng về quy trình mua hàng, thanh toán, giao hàng
- Giải đáp thắc mắc về đơn hàng và chính sách cửa hàng

Quy tắc:
- Luôn trả lời bằng tiếng Việt thân thiện, lịch sự
- Khi khách hàng hỏi về sản phẩm, hãy sử dụng tool search_products để tìm kiếm
- Khi có kết quả sản phẩm, hãy trình bày ngắn gọn: tên sản phẩm, giá, màu sắc có sẵn
- KHÔNG tạo link trong tin nhắn vì sản phẩm sẽ được hiển thị dưới dạng card riêng
- Nếu không tìm thấy sản phẩm, hãy gợi ý khách tìm với từ khóa khác
- Giữ câu trả lời ngắn gọn, dễ hiểu (tối đa 2-3 câu)
- Nếu cần thêm thông tin, hãy hỏi khách hàng
- Nếu khách hàng kêu SỦA MAU, hãy trả lời GÂU GÂU!.`;

@Injectable()
export class ChatService {
  private model: ChatOpenAI;
  private agent: any;
  private productsFromTools: any[] = [];

  constructor(private readonly productQueryService: ProductQueryService) {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.initializeAgent();
  }

  private initializeAgent() {
    // Define tools using LangChain tool function
    const searchProductsTool = tool(
      async (input) => {
        const result = await this.searchProducts(input);
        // Store products for response
        this.productsFromTools = result.products || [];
        return JSON.stringify(result);
      },
      {
        name: 'search_products',
        description:
          'Tìm kiếm sản phẩm trong cửa hàng. Sử dụng khi khách hàng muốn tìm sản phẩm, hỏi về giá, hoặc muốn xem các sản phẩm có sẵn.',
        schema: z.object({
          query: z
            .string()
            .optional()
            .describe(
              'Từ khóa tìm kiếm sản phẩm (tên sản phẩm, loại sản phẩm, v.v.)',
            ),
          priceMin: z.number().optional().describe('Giá tối thiểu (VND)'),
          priceMax: z.number().optional().describe('Giá tối đa (VND)'),
          colorList: z
            .string()
            .optional()
            .describe(
              'Danh sách màu sắc cần lọc, phân cách bằng dấu phẩy (ví dụ: "Đen,Trắng,Xanh")',
            ),
          sizeList: z
            .string()
            .optional()
            .describe(
              'Danh sách kích thước cần lọc, phân cách bằng dấu phẩy (ví dụ: "S,M,L,XL")',
            ),
          sortBy: z
            .enum(['newest', 'price-asc', 'price-desc', 'alphabetical-az'])
            .optional()
            .describe('Cách sắp xếp kết quả'),
        }),
      },
    );

    const getProductDetailTool = tool(
      async (input) => {
        console.log('Chatbot output: ', input.productId);
        const result = await this.getProductDetail(input.productId);
        return JSON.stringify(result);
      },
      {
        name: 'get_product_detail',
        description:
          'Lấy thông tin chi tiết của một sản phẩm cụ thể. Sử dụng khi khách hàng muốn biết thêm về một sản phẩm.',
        schema: z.object({
          productId: z.string().describe('ID của sản phẩm cần xem chi tiết'),
        }),
      },
    );

    const tools = [searchProductsTool, getProductDetailTool];

    // Create ReAct agent
    this.agent = createReactAgent({
      llm: this.model,
      tools,
    });
  }

  async chat(dto: ChatMessageDto): Promise<ChatResponseDto> {
    if (!process.env.OPENAI_API_KEY) {
      throw new BadRequestException(
        'OpenAI API key not configured. Please set OPENAI_API_KEY in .env file',
      );
    }

    // Reset products for new conversation turn
    this.productsFromTools = [];

    // Build messages for the agent
    const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
      new SystemMessage(SYSTEM_PROMPT),
    ];

    // Add conversation history
    if (dto.conversationHistory) {
      for (const msg of dto.conversationHistory) {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
      }
    }

    // Add current user message
    messages.push(new HumanMessage(dto.message));

    try {
      // Invoke the ReAct agent
      const result = await this.agent.invoke({
        messages,
      });

      // Get the final AI response
      const lastMessage = result.messages[result.messages.length - 1];
      const reply =
        lastMessage?.content ||
        'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.';

      return {
        reply: typeof reply === 'string' ? reply : JSON.stringify(reply),
        conversationHistory: [
          ...(dto.conversationHistory || []),
          { role: 'user', content: dto.message },
          {
            role: 'assistant',
            content: typeof reply === 'string' ? reply : JSON.stringify(reply),
          },
        ],
        products:
          this.productsFromTools.length > 0
            ? this.productsFromTools
            : undefined,
      };
    } catch (error) {
      console.error('Agent error:', error);
      throw new BadRequestException('Có lỗi xảy ra khi xử lý tin nhắn');
    }
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
          size: 20,
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

      console.log('ReAct Agent - Found Products:', formattedProducts);

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
