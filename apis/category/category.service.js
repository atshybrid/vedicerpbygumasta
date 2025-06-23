const { Category } = require("./../../../models");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");

const TAG = "category.service.js";

module.exports = {
  createCategory: async ({ body }) => {
    try {
      // Validate body
      if (!body.category_name) {
        return sendServiceMessage(
          "messages.apis.app.category.create.invalid_body"
        );
      }

      // Ensure the combination of category_name and parent_id is unique
      const existingCategory = await Category.findOne({
        where: {
          category_name: body.category_name,
          parent_id: body.parent_id || null,
        },
      });
      if (existingCategory) {
        return sendServiceMessage(
          "messages.apis.app.category.create.duplicate_category"
        );
      }

      // Create category
      const category = await Category.create({
        category_name: body.category_name,
        parent_id: body.parent_id || null, // Set as NULL for top-level categories
      });

      return sendServiceData(category);
    } catch (error) {
      console.error(`${TAG} - createCategory: `, error);
      return sendServiceMessage("messages.apis.app.category.create.error");
    }
  },

  getCategories: async () => {
    try {
      // Retrieve all categories
      const categories = await Category.findAll({
        attributes: [
          "category_id",
          "category_name",
          "parent_id",
          "created_at",
          "updated_at",
        ],
      });

      return sendServiceData(categories);
    } catch (error) {
      console.error(`${TAG} - getCategories: `, error);
      return sendServiceMessage("messages.apis.app.category.read.error");
    }
  },

  getCategory: async ({ params }) => {
    try {
      // Retrieve a single category by ID
      const category = await Category.findByPk(params.category_id, {
        attributes: [
          "category_id",
          "category_name",
          "parent_id",
          "created_at",
          "updated_at",
        ],
      });

      if (!category) {
        return sendServiceMessage("messages.apis.app.category.read.not_found");
      }

      return sendServiceData(category);
    } catch (error) {
      console.error(`${TAG} - getCategory: `, error);
      return sendServiceMessage("messages.apis.app.category.read.error");
    }
  },

  updateCategory: async ({ params, body }) => {
    try {
      // Validate body
      if (!body) {
        return sendServiceMessage(
          "messages.apis.app.category.update.invalid_body"
        );
      }

      // Find the category
      const category = await Category.findByPk(params.category_id);
      if (!category) {
        return sendServiceMessage(
          "messages.apis.app.category.update.not_found"
        );
      }

      // Check for duplicate category_name under the same parent_id
      if (body.category_name && body.category_name !== category.category_name) {
        const existingCategory = await Category.findOne({
          where: {
            category_name: body.category_name,
            parent_id: body.parent_id || category.parent_id,
          },
        });
        if (existingCategory) {
          return sendServiceMessage(
            "messages.apis.app.category.update.duplicate_category"
          );
        }
      }

      // Update the category
      const updatedCategory = await category.update({
        category_name: body.category_name || category.category_name,
        parent_id:
          body.parent_id !== undefined ? body.parent_id : category.parent_id,
      });

      return sendServiceData(updatedCategory);
    } catch (error) {
      console.error(`${TAG} - updateCategory: `, error);
      return sendServiceMessage("messages.apis.app.category.update.error");
    }
  },

  deleteCategory: async ({ params }) => {
    try {
      // Find the category
      const category = await Category.findByPk(params.category_id);
      if (!category) {
        return sendServiceMessage(
          "messages.apis.app.category.delete.not_found"
        );
      }

      // Ensure there are no child categories
      const childCategories = await Category.findOne({
        where: { parent_id: params.category_id },
      });
      if (childCategories) {
        return sendServiceMessage(
          "messages.apis.app.category.delete.has_children"
        );
      }

      // Delete the category
      await category.destroy();

      return sendServiceMessage("messages.apis.app.category.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteCategory: `, error);
      return sendServiceMessage("messages.apis.app.category.delete.error");
    }
  },

  getRecursiveCategories: async () => {
    try {
      const categories = await Category.findAll({
        attributes: ["category_id", "category_name", "parent_id"],
        order: [["parent_id", "ASC"]],
      });

      const buildTree = (parentId, items) =>
        items
          .filter((item) => item.parent_id === parentId)
          .map((item) => ({
            ...item.dataValues,
            subcategories: buildTree(item.category_id, items),
          }));

      const tree = buildTree(null, categories);

      return sendServiceData(tree);
    } catch (error) {
      console.error(`${TAG} - getRecursiveCategories: `, error);
      return sendServiceMessage(
        "messages.apis.app.category.recursive_read.error"
      );
    }
  },

  getItemCountByCategory: async () => {
    try {
      const result = await sequelize.query(`
      SELECT c.category_name, COUNT(i.item_id) AS item_count
      FROM categories c
      LEFT JOIN items i ON c.category_id = i.category_id
      GROUP BY c.category_name
    `);

      return sendServiceData(result[0]);
    } catch (error) {
      console.error(`${TAG} - getItemCountByCategory: `, error);
      return sendServiceMessage("messages.apis.app.category.item_count.error");
    }
  },

  reorderCategories: async ({ body }) => {
    try {
      const { order } = body;

      if (!Array.isArray(order)) {
        return sendServiceMessage(
          "messages.apis.app.category.reorder.invalid_body"
        );
      }

      const updatePromises = order.map(({ category_id, display_order }) =>
        Category.update({ display_order }, { where: { category_id } })
      );

      await Promise.all(updatePromises);

      return sendServiceMessage("messages.apis.app.category.reorder.success");
    } catch (error) {
      console.error(`${TAG} - reorderCategories: `, error);
      return sendServiceMessage("messages.apis.app.category.reorder.error");
    }
  },
};
