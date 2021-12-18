const express = require('express');
const router = express.Router();
const fs = require('fs')

/* GET users listing. */
router.get('/', (req, res, next)=>{
  const recipesFiles = fs.readdirSync('./public/recipes')
  const recipes = recipesFiles.map(filename => {
    const file = fs.readFileSync("./public/recipes/" + filename)
    const recipe = JSON.parse(file)
    return recipe
  })

  res.json({"recipes":recipes});
});

router.post('/', (req, res)=>{
  console.log("api receive:", req.body)
  res.sendStatus(200)
})

module.exports = router;
