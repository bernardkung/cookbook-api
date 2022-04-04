const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const db = require("../db");

function runQueries() {
  db.all(`SELECT * FROM recipes`)
}

function errorHandler(err) {
  console.error(err)
  throw(err)
  return err
}

async function getRecipes() {
  var sql = "select * from recipes"
  var params = []
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    res.json({
      "message":"success",
      "data":rows
    })
  })
}


// INDEX route
router.get('/', (req, res, next)=>{
  console.log('index')
  const query = 'select * from recipes'
  const params = []
  db.all(query, params, (err, rows)=>{
    if (err) {
      console.error(err)
      res.status(400).json({"error":err.message});
      return;
    }
    res.status(200).json({
      "message":"success",
      "data":rows
    })
  })
})

// SHOW route
router.get('/:id', (req, res)=>{
  console.log('SHOW hit', req.params.id)
  res.status(200).send("show")
})

// CREATE route
router.post('/', async (req, res)=>{
  console.log("post route")
  try {
    // Set recipe
    const recipe = req.body
    // Insert recipe
    db.run(
      `INSERT INTO recipes (name, ingredients, instructions) VALUES (?,?,?);`, 
      [...Object.values(recipe)],
      function(err) {
        if (err) {
          return console.error(err.message);
      }
      // Post insert code
      console.log(`${recipe} inserted into a new row with rowid ${this.lastID}`);
    })


    // Refresh recipes
    let sql = `SELECT * FROM recipes`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      // Return refreshed recipe list
      res.status(200).json({
        "message":"success",
        "data":rows
      })
    })
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
