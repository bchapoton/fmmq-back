const {BadRequestException} = require("../exceptions/BadRequestException");
const {ObjectNotFoundException} = require("../exceptions/ObjectNotFoundException");
const {MissingParametersException} = require("../exceptions/MissingParametersException");
const {Category} = require("../models/category.model");

function findCategoryById(errorHandler, id, success) {
    if (id) {
        Category.findById(id).exec((error, category) => {
            if (error) {
                errorHandler(new ObjectNotFoundException("Can't find category with id : " + id));
            }
            success(category);
        });
    } else {
        errorHandler(new MissingParametersException('Missing Category id'));
    }
}

async function findCategoryByIdSync(errorHandler, id) {
    if (id) {
        try {
            return await Category.findById(id);
        } catch (e) {
            errorHandler(new ObjectNotFoundException("Can't find Category with id : " + id));
        }
    } else {
        errorHandler(new MissingParametersException('Missing Category id'));
    }
}

async function updateCategory(errorHandler, id, payload) {
    const category = await findCategoryByIdSync(errorHandler, id);
    if (payload.label && payload.description && payload.order) {
        category.label = payload.label;
        category.description = payload.description;
        category.order = payload.order;
        category.save();
    } else {
        errorHandler(new BadRequestException("Missing information in payload"));
    }
}

async function createCategory(errorHandler, payload) {
    if (payload && payload.label && payload.description) {
        const categoryCount = await Category.countDocuments();
        const category = new Category({
            label: payload.label,
            description: payload.description,
            order: (categoryCount * 5)
        });
        await category.save();
    } else {
        errorHandler(new BadRequestException("Missing information in payload"));
    }
}

exports.findCategoryById = findCategoryById;
exports.findCategoryByIdSync = findCategoryByIdSync;
exports.updateCategory = updateCategory;
exports.createCategory = createCategory;