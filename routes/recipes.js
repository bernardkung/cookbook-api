const express = require('express');
const router = express.Router();
const fs = require('fs')
const mongoose = require('mongoose');

const Recipe = require('../models/recipe')

// const Recipe = mongoose.model('Recipe', recipeSchema);

function errorHandler(err) {
  console.warn(err)
  throw(err)
}

async function getRecipes() {
  try {
    const recipes = await Recipe.find({})
    return recipes
  } catch(err) {
    errorHandler(err)
  }
}


// INDEX route
router.get('/', async (req, res, next)=>{
  const recipes = await Recipe.find({})
  return res.status(200).json({recipes})
});

// SHOW route
router.get('/:id', (req, res)=>{
  console.log('SHOW hit', req.params.id)
  res.status(200).send("show")
})

// CREATE route
router.post('/', async (req, res)=>{
  try {
    const recipe = req.body
    console.log("post", recipe)
    const recipeDoc = new Recipe(recipe)
    await recipeDoc.save()
  
    // Reload recipes
    const recipes = await Recipe.find({})
    return res.status(200).json({recipes})
  } catch(err) {
    console.warn(err)
    return res.status(400).json({err})
  }
})

// UPDATE route
router.put('/:id', async (req, res)=>{
  try {
    // Update the recipe
    const recipe = req.body
    const recipeDoc = await Recipe.findOne({_id:recipe._id})
      recipeDoc.name = recipe.name
      recipeDoc.ingredients = recipe.ingredients
      recipeDoc.instructions = recipe.instructions
    await recipeDoc.save()

    // Reload recipes
    const recipes = await Recipe.find({})
    return res.status(200).json({recipes})
  } catch(err) {
    console.warn(err)
    return res.status(400).json({err})
  }
})  

// DESTROY route
router.delete('/:id', async (req, res)=>{
  Recipe.findByIdAndDelete(req.params.id, async (err)=>{
    if (err) {
      return res.status(400).json({err})
    }
    // Reload recipes
    const recipes = await Recipe.find({})
    return res.status(200).json({recipes})
  })
})

module.exports = router;
