const express = require('express');

const router = express.Router();

const multer = require('multer');

const cloudinary =
  require('../config/cloudinary');

const {
  CloudinaryStorage
} = require(
  'multer-storage-cloudinary'
);

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: async (req, file) => {

      return {

        folder:
          'me-siento-bien',

        format: 'jpg',

        public_id:
          Date.now() + '-producto'

      };
    }

  });

const upload =
  multer({ storage });

router.post(
  '/',
  upload.single('imagen'),

  async (req, res) => {

    try {

      res.json({

        imageUrl:
          req.file.path

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          'Error subiendo imagen'
      });

    }

  }
);

module.exports = router;