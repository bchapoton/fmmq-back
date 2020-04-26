const {ObjectNotFoundException} = require("../exceptions/ObjectNotFoundException");
const {MissingParametersException} = require("../exceptions/MissingParametersException");
const {User} = require("../models/user.model");

function findUserById(errorHandler, id, success) {
    if (id) {
        User.findById(id).exec((error, userEntity) => {
            if (error) {
                errorHandler(new ObjectNotFoundException("Can't find user with id : " + id));
            }
            success(userEntity);
        });
    } else {
        errorHandler(new MissingParametersException('Missing User id'));
    }
}
async function findCategoryByIdSync(errorHandler, id) {
    if (id) {
        try {
            return await User.findById(id);
        } catch (e) {
            errorHandler(new ObjectNotFoundException("Can't find Category with id : " + id));
        }
    } else {
        errorHandler(new MissingParametersException('Missing Category id'));
    }
}

async function putUserRole(errorHandler, id, payload) {
    if(payload.role) {
        const userEntity = await findCategoryByIdSync(errorHandler, id);
        userEntity.role = payload.role;
        userEntity.save();
    }
}

exports.findUserById = findUserById;
exports.putUserRole = putUserRole;