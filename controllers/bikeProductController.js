import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import BikeProduct from '../models/bikeProductModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createBikeProduct = async (req, res) => {
  const { bikeName, bikeModel, bikePrice } = req.body;

  if (!bikeName || !bikeModel || !bikePrice) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  if (!req.files || !req.files.bikeImage) {
    return res.status(400).json({ message: 'Please upload an image' });
  }

  const { bikeImage } = req.files;
  const bikeImageName = `${Date.now()}-${bikeImage.name}`;
  const bikeImageUploadPath = path.join(
    __dirname,
    '../public/bikes',
    bikeImageName,
  );

  try {
    await bikeImage.mv(bikeImageUploadPath);

    const newBike = new BikeProduct({
      bikeName,
      bikeModel,
      bikePrice,
      bikeImage: bikeImageName,
    });

    await newBike.save();
    res.status(201).json({
      success: true,
      message: 'Product Created',
      bike: newBike,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getAllBikes = async (req, res) => {
  try {
    const bikes = await BikeProduct.find({});

    res.status(200).json({
      success: true,
      message: 'All Bikes Fetched',
      bikes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getAllBikeModel = async (req, res) => {
  try {
    const bikeModel = await BikeProduct.find().distinct('bikeModel');
    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      categories: bikeModel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

export const getSingleBike = async (req, res) => {
  try {
    const bike = await BikeProduct.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product Fetched',
      bike,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const updateBike = async (req, res) => {
  try {
    if (req.files && req.files.bikeImage) {
      const { bikeImage } = req.files;
      const bikeImageName = `${Date.now()}-${bikeImage.name}`;
      const bikeImageUploadPath = path.join(
        __dirname,
        '../public/bikes',
        bikeImageName,
      );

      await bikeImage.mv(bikeImageUploadPath);
      req.body.bikeImage = bikeImageName;

      const existingBike = await BikeProduct.findById(req.params.id);
      if (existingBike?.bikeImage) {
        const imagePath = path.join(
          __dirname,
          '../public/bikes',
          existingBike.bikeImage,
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    const updatedBike = await BikeProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedBike) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product Updated',
      updateBike: updatedBike,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const deleteBike = async (req, res) => {
  try {
    const deletedBike = await BikeProduct.findByIdAndDelete(req.params.id);

    if (!deletedBike) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product Deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const paginationBike = async (req, res) => {
  try {
    const bikes = await BikeProduct.aggregate([
      {
        $group: {
          _id: '$bikeName',
          data: { $push: '$$ROOT' },
          bikeImage: { $first: '$bikeImage' },
          bikeName: { $first: '$bikeName' },
        },
      },
    ]);

    if (bikes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No product found',
        bikes: [],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product Fetched',
      bikes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const getTotalBike = async (req, res) => {
  try {
    const totalBikes = await BikeProduct.countDocuments({});
    res.status(200).json({
      success: true,
      message: 'Total Bikes',
      count: totalBikes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

export const getBikeByModel = async (req, res) => {
  const bikeName = req.query.bikeName;

  try {
    const bikes = await BikeProduct.find({ bikeName });
    res.status(200).json({
      success: true,
      message: 'Bikes Model fetched successfully',
      bikes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

export default {
  createBikeProduct,
  getAllBikes,
  getSingleBike,
  updateBike,
  deleteBike,
  paginationBike,
  getAllBikeModel,
  getTotalBike,
  getBikeByModel,
};
