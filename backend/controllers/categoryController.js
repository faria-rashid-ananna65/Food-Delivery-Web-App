import Category from "../models/Category.js";
import Menu from "../models/Menu.js";
import { uploadImage, deleteImage } from "../services/imageService.js";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file, "food-delivery/categories");
    }

    const category = await Category.create({ name: name.trim(), image: imageUrl });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name.trim();

    if (req.file) {
      if (category.image) {
        await deleteImage(category.image);
      }
      category.image = await uploadImage(req.file, "food-delivery/categories");
    }

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const menuItems = await Menu.find({ category: category._id });
    if (menuItems.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category with existing menu items. Remove menu items first.",
      });
    }

    if (category.image) {
      await deleteImage(category.image);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};
