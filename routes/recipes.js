const express = require('express');
const router = express.Router();
const fs = require('fs')


function getRecipes() {
  const recipesFiles = fs.readdirSync('./public/recipes', err=>{
    if (err) throw err;
  })
  const recipes = recipesFiles.map(filename => {
    const file = fs.readFileSync("./public/recipes/" + filename, err=>{
      if (err) throw err;
    })
    const recipe = JSON.parse(file)
    return recipe
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

async function deleteRecipe(filename){
  const filepath = './public/recipes'
  fs.unlink(filepath + filename, err=>{
    if (err) throw err;
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
  res.json({recipes})
});

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

// DESTROY route
router.delete('/recipes/:id', (req, res)=>{
  console.log('destroy', req.params.id)
  // const recipes = getRecipes()
  // const filename = recipes[req.params.id]
  // console.log(filename)
  res.status(204).redirect('/')
})

module.exports = router;
