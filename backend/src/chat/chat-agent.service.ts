import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { z } from 'zod';
import { ProductQueryService } from '../product/services/product-query.service';

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
- Khi khách hàng muốn lọc theo màu hoặc size cụ thể, hãy sử dụng colorList và sizeList
- Nếu khách hàng không hài lòng với kết quả, hãy thử tìm với các filter khác nhau
- Sản phẩm trả về phải phù hợp với câu hỏi của khách hàng.
- Nếu khách hàng kêu SỦA MAU, hãy trả lời GÂU GÂU!.`;

@Injectable()
export class ChatAgentService {
  private model: ChatOpenAI;
  private agent: any;
  private tools: DynamicStructuredTool[];

  constructor(private readonly productQueryService: ProductQueryService) {
    this.initializeAgent();
  }

  private initializeAgent() {
    // Initialize ChatOpenAI model
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Define tools
    this.tools = [
      new DynamicStructuredTool({
        name: 'search_products',
        description:
          'Tìm kiếm sản phẩm trong cửa hàng. Sử dụng khi khách hàng muốn tìm sản phẩm, hỏi về giá, hoặc muốn xem các sản phẩm có sẵn. Có thể lọc theo màu sắc, kích thước, và giá.',
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
        func: async (args) => {
          return JSON.stringify(await this.searchProducts(args));
        },
      }),

      new DynamicStructuredTool({
        name: 'get_product_detail',
        description:
          'Lấy thông tin chi tiết của một sản phẩm cụ thể bao gồm các variants, sizes, colors có sẵn. Sử dụng khi khách hàng muốn biết thêm chi tiết về một sản phẩm.',
        schema: z.object({
          productId: z.string().describe('ID của sản phẩm cần xem chi tiết'),
        }),
        func: async (args) => {
          return JSON.stringify(await this.getProductDetail(args.productId));
        },
      }),
    ];

    // Create ReAct agent
    this.agent = createReactAgent({
      llm: this.model,
      tools: this.tools,
    });
  }

  async chat(
    message: string,
    conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<{
    reply: string;
    products: any[];
    conversationHistory: Array<{ role: string; content: string }>;
  }> {
    // Build messages array
    const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
      new SystemMessage(SYSTEM_PROMPT),
    ];

    // Add conversation history
    for (const msg of conversationHistory || []) {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        messages.push(new AIMessage(msg.content));
      }
    }

    // Add current message
    messages.push(new HumanMessage(message));

    let productsFromTools: any[] = [];
    let finalResponse = '';

    try {
      // Invoke the agent
      const result = await this.agent.invoke({
        messages,
      });

      // Extract the final response and any products from tool calls
      const agentMessages = result.messages;

      for (const msg of agentMessages) {
        // Check for tool messages that contain product data
        if (msg.constructor.name === 'ToolMessage') {
          try {
            const toolResult = JSON.parse(msg.content);
            if (toolResult.products && toolResult.products.length > 0) {
              productsFromTools = toolResult.products;
            }
          } catch (e) {
            // Not JSON or no products
          }
        }

        // Get the final AI response
        if (
          msg.constructor.name === 'AIMessage' &&
          typeof msg.content === 'string' &&
          msg.content.length > 0
        ) {
          finalResponse = msg.content;
        }
      }
    } catch (error) {
      console.error('Agent error:', error);
      finalResponse =
        'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại.';
    }

    if (!finalResponse) {
      finalResponse =
        'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.';
    }

    return {
      reply: finalResponse,
      products: productsFromTools,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: 'user', content: message },
        { role: 'assistant', content: finalResponse },
      ],
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
          size: 6,
        },
        sortBy: args.sortBy || 'newest',
      });

      const productList = result.productList || [];
      const metadata = result.metadata;

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
