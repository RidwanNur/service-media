const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const fs = require('fs');

//model
const {Media} = require('../models');

//call value on database using orm 
router.get('/', async(req, res) => {
  const media = await Media.findAll({
    attributes:['id','image']
  });

  //mapping image add url host
  const mapMedia = media.map((mapping) => {
    mapping.image = `${req.get('host')}/${mapping.image}`;
    return mapping;
  });

  //return response API
  return res.json({
    status : 'Success',
    data: mapMedia
  });
});

router.post('/', (req,res) =>{
  const image = req.body.image;
  
  if(!isBase64(image, {mimeRequired:true})){
    return res.status(400).json({
      status:'error',
      message:'Invalid Base64'
    });
  }
    base64Img.img(image, './public/images', Date.now(), async (err, filepath) =>{
      if(err){
        return req.status(400).json({
          status:'error', 
          message:err.message
        });
      }
      const filename = filepath.split("\\").pop().split("/").pop();
      
      const media = await Media.create({
        image: `images/${filename}`
      });

      return res.json({
        status: 'Success',
        data:{
          id:media.id,
          image:`${req.get('host')}/images/${filename}`
        }
      });
    })

});


router.delete('/:id', async (req, res) => {
    //get id nya
    const id = req.params.id;

    //check id exist
    const media = await Media.findByPk(id);
    if(!media){
      return res.status(404).json({status:'error', message:'Media not found'});
    }

    fs.unlink(`./public/${media.image}`, async (err) => {
      if(err){
        return res.status(400).json({status:'error', message:err.message })
      }

      await media.destroy();
      return res.json({
        status:'success',
        messages:'image success deleted'
      });
    });
    

});




module.exports = router;
