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
  console.log("put route")
  try {
    // Set recipe
    const recipe = req.body
    console.log(req.params)
    // Insert recipe
    db.run(`
        UPDATE recipes 
        SET name= COALESCE(?, name),
            ingredients= COALESCE(?, name),
            instructions= COALESCE(?, instructions)
        WHERE id=?
      `, 
      [recipe.name, recipe.ingredients, recipe.instructions, recipe.id],
      function(err) {
        if (err) {
          console.error(err.message)
          return res.status(400).json({err})
      }
      // Post insert code
      console.log(`Row ${this.lastID} updated`);
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

// DESTROY route
router.delete('/:id', async (req, res)=>{
  console.log('destroy route')
  // delete recipe
  try {
    db.run(`
        DELETE FROM recipes 
        WHERE id=?
      `,
      [req.params.id],
      function(err) {
        if (err) {
          console.error(err.message)
          return res.status(400).json({err})
      }
      // Post insert code
      console.log(`Row ${this.lastID} deleted`);
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

module.exports = router;
