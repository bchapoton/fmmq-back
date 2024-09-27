import { BadRequestException } from "../exceptions/BadRequestException";
import { Category, ICategory } from "../models/category.model";
import { BaseService } from "./base/BaseService";
import { TypesHelper } from "../helpers/TypesHelper";

export class CategoryService extends BaseService<ICategory> {
  constructor() {
    super(Category);
  }

  async updateCategory(id: string, payload: ICategory) {
    return this.findById(id).then((category) => {
      if (this.validatePayload(category)) {
        category.label = payload.label;
        category.description = payload.description;
        category.order = payload.order;
        category.allMusicsOnServer = payload.allMusicsOnServer;
        return category.save();
      } else {
        return Promise.reject(
          new BadRequestException("Missing information in payload"),
        );
      }
    });
  }

  async createCategory(payload: ICategory) {
    if (this.validatePayload(payload)) {
      const category = new Category({
        label: payload.label,
        description: payload.description,
        order: payload.order,
        allMusicsOnServer: payload.allMusicsOnServer,
      });
      return category.save();
    } else {
      return Promise.reject(
        new BadRequestException("Missing information in payload"),
      );
    }
  }

  validatePayload(category: ICategory) {
    return (
      TypesHelper.isNotEmptyStr(category.label) &&
      TypesHelper.isNotEmptyStr(category.description) &&
      TypesHelper.isNotEmptyNumber(category.order)
    );
  }
}

export const categoryService = new CategoryService();
