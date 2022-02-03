const express = require('express');
const router = express.Router();
const fs = require('fs')
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: String,
  instructions: String,
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
  console.log(recipes)
  res.status(200).json({recipes})
});

// SHOW route
router.get('/:id', (req, res)=>{
  console.log('SHOW hit', req.params.id)
  res.status(200).send("show")
})

// CREATE route
router.post('/', (req, res)=>{
  const recipe = req.body.recipe
  console.log(recipe)
  // Save recipe as a JSON
  Recipe.create({recipe}, err=>{
    if (err) {
      console.warn(err)
      return res.status(400).json({status:"failed to refresh recipes"})
    }
    try {
      const recipes = Recipe.find({})
      return res.status(200).json({recipes})
    } catch {
      console.log("error")
    }
  })
})

// UPDATE route
router.put('/:id', (req, res)=>{
  const recipe = req.body.recipe
  updateRecipe(recipe, req.params.id)
    .then(()=>{
      try {
        const recipes = getRecipes()
        return res.status(200).json({recipes})
      } catch(err) {
        console.warn(err)
        return res.status(400).json({status:"failed to refresh recipes"})
      }
    })
    .catch(err=>res.status(406).send(err))
})

// DESTROY route
router.delete('/:id', (req, res)=>{
  try {
    const recipes = getRecipes()
    const recipeId = req.params.id
    const recipeFilename = recipes[recipeId].filename
    console.log("Deleting recipe " + recipeId + ":", recipeFilename)
    deleteRecipe(recipeFilename)
      .then(()=>{
        // Update the recipes array, and return
        recipes.splice(recipeId, 1)
        console.log({recipes})
        res.status(200).json({recipes})
      })
      .catch(err => {
        console.warn(err)
        res.status(406).send(err)
      })
  } catch(err) {
    console.warn(err)
    res.status(400).send(err)
  }
  // const recipes = getRecipes()
  // const filename = recipes[req.params.id]
  // console.log(filename)
})

module.exports = router;
