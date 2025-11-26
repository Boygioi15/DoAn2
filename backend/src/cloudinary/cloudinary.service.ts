// cloudinary.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary.response';
import streamifier from 'streamifier';
import { InjectModel } from '@nestjs/mongoose';
import {
  CloudinaryFileMap,
  CloudinaryFileMapDocument,
} from 'src/database/schemas/cloudinary_file_map.schema';
import { Model } from 'mongoose';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectModel(CloudinaryFileMap.name)
    private fileMapModel: Model<CloudinaryFileMapDocument>,
  ) {}
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'do-an-2',
        },
        (err: CloudinaryResponse, result: CloudinaryResponse) => {
          if (err) return reject(err);
          this.fileMapModel.create({
            url: result?.secure_url,
            publicId: result?.public_id,
          });
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
  async deleteFileByURL(url: string) {
    const dbEntry = await this.fileMapModel.findOneAndDelete({ url });
    if (!dbEntry) {
      console.log('No matching URL in db');
      return;
    }
    const response = await cloudinary.uploader.destroy(dbEntry.publicId);
    // console.log('RS: ', response);
    return;
  }
}
