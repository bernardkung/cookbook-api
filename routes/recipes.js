const express = require('express');
const router = express.Router();
const fs = require('fs')

function refreshIndex(){
  // Find index file (as arg?)
  // Refresh the index file with the current list of recipe files
}

function getRecipes() {
  const recipesFiles = fs.readdirSync('./public/recipes', err=>{
    if (err) throw err;
  })
  const recipes = recipesFiles.map(filename => {
    const file = fs.readFileSync("./public/recipes/" + filename, err=>{
      if (err) throw err;
    })
    const recipe = JSON.parse(file)
    return {"recipe": recipe, "filename": filename}
  })
  return recipes
}

async function saveRecipe(recipe){
  const filepath = './public/recipes/'
  const filename =  cleanString(recipe.name) + ".json"
  await fs.promises.writeFile(filepath + filename, JSON.stringify(recipe), { flag: 'wx' }, (err)=>{
    if (err) throw err;
  })
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
router.get('/', (req, res, next)=>{
  const recipes = getRecipes()
  console.log({recipes})
  res.json({recipes})
});

// SHOW route
router.get('/:id', (req, res)=>{
  console.log('SHOW hit', req.params.id)
  res.status(200).send("show")
})

// CREATE route
router.post('/', (req, res)=>{
  const recipe = req.body.recipe
  // Save recipe as a JSON
  saveRecipe(recipe)
    .then(()=>{
      try {
        const recipes = getRecipes()
        return res.status(200).json({recipes})
      } catch(err) {
        console.warn(err)
        return res.status(400).json({status:"failed to refresh recipes"})
      }
    })
    .catch(err=>res.status(406).json({status:err}))
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
