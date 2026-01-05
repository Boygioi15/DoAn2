import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryService } from 'src/category/category.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import {
  FrontendSetting,
  FrontendSettingDocument,
} from 'src/database/schemas/frontend-setting.schema';

const FRONTEND_PAGE_FIELD_MAP = {
  'loyal-customer-condition': 'loyalCustomerConditionPage',
  'loyal-customer-policy': 'loyalCustomerPolicyPage',
  'customer-security-policy': 'customerSecurityPolicyPage',
  'delivery-policy': 'deliveryPolicyPage',
  'general-size-guidance': 'generalSizeGuidancePage',
  contact: 'contactPage',
  about: 'aboutPage',
};
const FRONTEND_SETTING_FIELD_MAP = {
  'announcement-bar': 'announcementBar',
  'announcement-carousel': 'announcementCarousel',
  'hero-carousel': 'heroCarousel',
  'category-page-setting': 'categoryPageSetting',
};
@Injectable()
export class FrontendSettingService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private categoryService: CategoryService,
    @InjectModel(FrontendSetting.name)
    private readonly frontendSettingModel: Model<FrontendSettingDocument>,
  ) {}
  async resetFrontendSetting() {
    return await this.frontendSettingModel.findOneAndReplace(
      {},
      {
        loyalCustomerConditionPage: '',
        loyalCustomerPolicyPage: '',
        customerSecurityPolicyPage: '',
        deliveryPolicyPage: '',
        contactPage: '',
        generalSizeGuidancePage: '',
        categoryPageSetting: {},
      },
      { upsert: true },
    );
  }
  async getAllSetting() {
    const categoryIdNameMap = await this.checkAndUpdateCategoryPageSetting();
    const frontendSetting = await this.frontendSettingModel.findOne({}).lean();
    return {
      ...frontendSetting,
      categoryIdNameMap: Object.fromEntries(categoryIdNameMap),
    };
  }
  async checkAndUpdateCategoryPageSetting() {
    const allLevel1Category =
      await this.categoryService.getAllLevel1Categories();
    const allLevel1CategoryId = allLevel1Category.map((cat) => cat.categoryId);
    const frontendSetting = await this.frontendSettingModel.findOne({}).lean();
    if (!frontendSetting) {
      throw new InternalServerErrorException('No frontend setting');
    }
    let categorySetting = frontendSetting.categoryPageSetting || {};
    for (const categoryId of allLevel1CategoryId) {
      if (!categorySetting[categoryId]) {
        categorySetting[categoryId] = '';
      }
    }
    const newFrontendSetting = await this.frontendSettingModel.findOneAndUpdate(
      {},
      { categoryPageSetting: categorySetting },
    );
    //return categoryId-Name map
    const categoryIdNameMap: Map<string, string> = new Map<string, string>();
    for (const category of allLevel1Category) {
      console.log('CID: ', category);
      categoryIdNameMap.set(category.categoryId, category.categoryName);
    }
    console.log('map: ', categoryIdNameMap);
    return categoryIdNameMap;
  }
  async getLayoutSetting() {
    const frontendSetting = await this.frontendSettingModel.findOne({}).lean();
    const categoryData = await this.getTopCategoryTree();
    return {
      announcementBar: frontendSetting?.announcementBar,
      announcementCarousel: frontendSetting?.announcementCarousel,
      categoryData: categoryData,
    };
  }
  async getHomepageSetting() {
    const frontendSetting = await this.frontendSettingModel.findOne({}).lean();
    const categoryData = await this.getTopCategoryTree();
    return {
      heroCarousel: frontendSetting?.heroCarousel,
      categoryData: categoryData,
    };
  }
  async getCategoryPageSetting(categoryId: string) {
    const frontendSetting = await this.frontendSettingModel.findOne({}).lean();
    if (!frontendSetting) {
      throw new InternalServerErrorException('No frontend setting');
    }
    return frontendSetting.categoryPageSetting[categoryId];
  }
  async getFrontendSetting(setting: string) {
    const associatedField = FRONTEND_SETTING_FIELD_MAP[setting];
    if (!associatedField) {
      throw new BadRequestException('No field associated!');
    }
    const result = await this.frontendSettingModel
      .findOne({})
      .select(associatedField)
      .lean();
    if (!result) {
      throw new InternalServerErrorException('No result found');
    }
    return result[associatedField];
  }
  async updateFrontendSetting(setting: string, content: string) {
    const associatedField = FRONTEND_SETTING_FIELD_MAP[setting];
    if (!associatedField) {
      throw new BadRequestException('No field associated!');
    }
    const result = await this.frontendSettingModel.findOneAndUpdate(
      {},
      { [associatedField]: content },
      { new: true },
    );
    if (!result) {
      throw new InternalServerErrorException('No result found');
    }
    return result[associatedField];
  }
  async getFrontendPage(frontendPage: string) {
    const associatedField = FRONTEND_PAGE_FIELD_MAP[frontendPage];
    if (!associatedField) {
      throw new BadRequestException('No field associated!');
    }
    const result = await this.frontendSettingModel
      .findOne({})
      .select(associatedField)
      .lean();
    if (!result) {
      throw new InternalServerErrorException('No result found');
    }
    return result[associatedField];
  }
  async updateFrontendPage(frontendPage: string, content: string) {
    const associatedField = FRONTEND_PAGE_FIELD_MAP[frontendPage];
    if (!associatedField) {
      throw new BadRequestException('No field associated!');
    }
    const result = await this.frontendSettingModel.findOneAndUpdate(
      {},
      { [associatedField]: content },
      { new: true },
    );
    if (!result) {
      throw new InternalServerErrorException('No result found');
    }
    return result[associatedField];
  }

  async getTopCategoryTree() {
    const allT1Cats =
      await this.categoryService.getAllDirectChildrenOfCategory();

    const t1List = allT1Cats
      .filter((cat) => cat.categoryName !== 'Không xác định')
      .map((cat) => ({
        name: cat.categoryName,
        categoryId: cat.categoryId,
      }));

    const t2Promises = t1List.map(async (t1Cat) => {
      const t2Cat = await this.categoryService.getAllDirectChildrenOfCategory(
        t1Cat.categoryId,
      );

      const subCats = t2Cat.map((cat) => ({
        name: cat.categoryName,
        categoryId: cat.categoryId,
      }));

      return {
        ...t1Cat,
        subCategory: subCats,
      };
    });

    const result = await Promise.all(t2Promises);

    return result;
  }
}
