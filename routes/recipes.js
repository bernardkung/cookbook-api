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

function cleanString(inStr){
  const resChars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*', '.']
  const outStr = inStr.replace(/[<>:"/\\|?*.]/g, '');
  return outStr.toLowerCase()
}

/* GET users listing. */
router.get('/', (req, res, next)=>{
  const recipes = getRecipes()
  res.json({recipes})
});

router.post('/', (req, res)=>{
  console.log("Receiving:", req.body.recipe)
  const recipe = req.body.recipe
  // Save recipe as a JSON
  saveRecipe(recipe)
    .then(()=>{
      try {
        console.log("getting recipes")
        const recipes = getRecipes()
        console.log(recipes)
        return res.status(200).json({recipes})
      } catch(err) {
        console.warn(err)
        return res.status(400).json({status:"failed to refresh recipes"})
      }
    })
    .catch(err=>res.status(406).json({status:err}))
    
})

module.exports = router;
