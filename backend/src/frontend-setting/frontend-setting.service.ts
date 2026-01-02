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
@Injectable()
export class FrontendSettingService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private categoryService: CategoryService,
    @InjectModel(FrontendSetting.name)
    private readonly frontendSettingModel: Model<FrontendSettingDocument>,
  ) {}
  async initFrontendSetting() {
    const p2 = this.updateToplayoutRotatorMessage([]);
    const p3 = this.updateTopLayoutBanner(null);
    const p5 = this.updateHomepageBanner([]);

    await Promise.resolve([p2, p3, p5]);
    //upsert case
    return await this.frontendSettingModel.findOneAndUpdate(
      {},
      {
        homepage_banner: [],
        toplayout_banner: null,
        toplayout_rotator_message: [],
        termAndConditionPage: '',
        customerConditionPage: '',
        contactPage: '',
      },
      { upsert: true },
    );
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

  async getFrontendSetting() {
    return await this.frontendSettingModel.findOne();
  }

  async getTopLayoutBanner() {
    const frontendSetting = await this.getFrontendSetting();
    return frontendSetting?.toplayout_banner;
  }
  async updateTopLayoutBanner(file: Express.Multer.File | null) {
    const preFrontendSetting = await this.getFrontendSetting();
    //destroy previous url
    const preURL = preFrontendSetting?.toplayout_banner;
    if (preURL) {
      const promise = this.cloudinaryService.deleteFileByURL(preURL);
      promise.finally(() => {
        console.log('Delete file by url done( url: ', preURL, ')');
      });
    }
    if (!file) {
      console.log('No file to update');
      return;
    }
    try {
      const response = await this.cloudinaryService.uploadFile(file);
      const newToplayoutBanner = await this.frontendSettingModel.updateOne(
        {},
        { toplayout_banner: response?.secure_url },
      );
    } catch (error) {
      console.log('Error while pushing banner to cloudinary: ', error);
    }
  }
  async getHomepageBanner() {
    const frontendSetting = await this.getFrontendSetting();
    return frontendSetting?.homepage_banner;
  }
  async updateHomepageBanner(files: Express.Multer.File[]) {
    const preFrontendSetting = await this.getFrontendSetting();
    //destroy previous url
    const preURLs = preFrontendSetting?.homepage_banner;
    if (preURLs)
      preURLs.map((url) => this.cloudinaryService.deleteFileByURL(url));

    const urlList: string[] = [];
    const cloudinaryPromieses = files.map(async (file) => {
      // console.log('DB');
      try {
        const response = await this.cloudinaryService.uploadFile(file);
        urlList.push(response?.secure_url);
      } catch (error) {
        console.log('Error while pushing banner to cloudinary: ', error);
      }
    });
    await Promise.all(cloudinaryPromieses);
    const newBanner = await this.frontendSettingModel.updateOne(
      {},
      { homepage_banner: urlList },
    );
    return newBanner;
  }
  async getToplayoutRotatorMessage() {
    const frontendSetting = await this.getFrontendSetting();
    return frontendSetting?.toplayout_rotator_message;
  }
  async updateToplayoutRotatorMessage(messages: string[]) {
    const newRotatorMessages = await this.frontendSettingModel.updateOne(
      {},
      { toplayout_rotator_message: messages },
    );
    return newRotatorMessages;
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
}
