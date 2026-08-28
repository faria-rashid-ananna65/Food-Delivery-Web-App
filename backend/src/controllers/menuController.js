import Menu from "../models/Menu.js";
import { uploadImage, deleteImage } from "../services/imageService.js";

export const getMenus = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, available } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (available !== undefined) {
      query.isAvailable = available === "true";
    }

    const menus = await Menu.find(query)
      .populate("category", "name image")
      .sort({ createdAt: -1 });

    res.json({ success: true, menus });
  } catch (error) {
    next(error);
  }
};

export const createMenu = async (req, res, next) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file, "food-delivery/menus");
    }

    const menu = await Menu.create({
      name: name.trim(),
      description: description || "",
      price: Number(price),
      category,
      image: imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable === "true" : true,
    });

    const populatedMenu = await menu.populate("category", "name image");
    res.status(201).json({ success: true, menu: populatedMenu });
  } catch (error) {
    next(error);
  }
};

export const updateMenu = async (req, res, next) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (name) menu.name = name.trim();
    if (description !== undefined) menu.description = description;
    if (price) menu.price = Number(price);
    if (category) menu.category = category;
    if (isAvailable !== undefined) menu.isAvailable = isAvailable === "true";

    if (req.file) {
      if (menu.image) {
        await deleteImage(menu.image);
      }
      menu.image = await uploadImage(req.file, "food-delivery/menus");
    }

    await menu.save();
    const populatedMenu = await menu.populate("category", "name image");
    res.json({ success: true, menu: populatedMenu });
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (menu.image) {
      await deleteImage(menu.image);
    }

    await Menu.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    next(error);
  }
};
