import { Model } from "mongoose";
import { ObjectNotFoundException } from "../../exceptions/ObjectNotFoundException";
import { MissingParametersException } from "../../exceptions/MissingParametersException";
import { ServerErrorException } from "../../exceptions/ServerErrorException";

export class BaseService<SchemaType> {
  model: Model<SchemaType>;

  constructor(model: Model<SchemaType>) {
    this.model = model;
  }

  async findById(id: string) {
    if (id) {
      return this.model
        .findById(id)
        .exec()
        .then((value) => {
          if (!value)
            return Promise.reject(
              new ObjectNotFoundException("Can't find object with id : " + id),
            );
          else return value;
        })
        .catch((reason) => {
          return Promise.reject(new ServerErrorException(reason));
        });
    } else {
      return Promise.reject(
        new MissingParametersException("Missing parameter id"),
      );
    }
  }

  async delete(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
