const express = require('express');
const router = express.Router();
const fs = require('fs')
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: String,
  instructions: String,
},
{
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

async function getRecipes() {
  const recipes = await Recipe.find({}, function (err, recipes){
    if (err) {
      console.log(err);
    }
  })
  return recipes
}

async function saveRecipe(recipe){
  console.log(recipe)
  // const newRecipe = new Recipe({recipe})
    // saved!
  // Recipe.create(recipe, err=>{
  //   if (err) {console.log(err)}
  // })
}

async function updateRecipe(recipe, recipeId){
  try {
    const recipes = getRecipes()
    const filepath = './public/recipes/'
    const old_filename = recipes[recipeId] + ".json"
    const new_filename = cleanString(recipe.name) + ".json"

    // Delete old recipe
    fs.unlink(filepath + old_filename, err=>{
      if (err) {throw err}
    })
    // Add new recipe
    await fs.promises.writeFile(filepath + new_filename, JSON.stringify(recipe), { flag: 'wx' }, (err)=>{
      if (err) throw err;
    })
  } catch(err) {
    throw err
  }
}

async function deleteRecipe(filename){
  const filepath = './public/recipes/'
  fs.unlink(filepath + filename, err=>{
    if (err) {
      throw err
    }
  })
}

function cleanString(inStr){
  const resChars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*', '.']
  const outStr = inStr.replace(/[<>:"/\\|?*.]/g, '');
  return outStr.toLowerCase()
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
