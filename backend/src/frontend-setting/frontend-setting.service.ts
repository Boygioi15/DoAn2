import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryService } from 'src/category/category.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CategoryDocument } from 'src/database/schemas/category.schema';
import {
  FrontendSetting,
  FrontendSettingDocument,
} from 'src/database/schemas/frontend-setting.schema';

@Injectable()
export class FrontendSettingService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private categoryService: CategoryService,
    @InjectModel(FrontendSetting.name)
    private readonly frontendSettingModel: Model<FrontendSettingDocument>,
  ) {}
  async initFrontendSetting() {
    return await this.frontendSettingModel.findOneAndUpdate(
      {},
      {
        homepage_banner: [],
        toplayout_rotator_message: [],
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
  async getHomepageBanner() {
    const frontendSetting = await this.getFrontendSetting();
    return frontendSetting?.homepage_banner;
  }
  async getToplayoutRotatorMessage() {
    const frontendSetting = await this.getFrontendSetting();
    return frontendSetting?.toplayout_rotator_message;
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
  async updateToplayoutRotatorMessage(messages: string[]) {
    const newRotatorMessages = await this.frontendSettingModel.updateOne(
      {},
      { toplayout_rotator_message: messages },
    );
    return newRotatorMessages;
  }
}
