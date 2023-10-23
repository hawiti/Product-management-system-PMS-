const express=require("express");
const bodyParser=require("body-parser");
const mysql = require('mysql2'); 
require('dotenv').config();
const app=express();
app.use(bodyParser.urlencoded({extended: true}));

// Connect to database
const hostname = process.env.hostName
const connection = mysql.createConnection({
  host: hostname,
  user: process.env.user, 
  password: process.env.password,
  database: process.env.database
});
app.get("/", function(req,res){
  res.sendFile(__dirname+"/index.html");
});
app.get("/index.html", function(req,res){
  res.sendFile(__dirname+"/index.html");
});
         /********************Signup*************************/
app.get("/signup", function(req,res){
res.sendFile(__dirname+"/signUp.html");
});
app.get('/signUp.html', (req, res) => {
  res.sendFile(__dirname + '/signUp.html');
});

// Input validation

const bcrypt = require('bcrypt');
const validator = require('validator');

app.post('/signup', (req, res) => {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Input validation
  const errors = {};

  if (!validator.isEmail(email)) {
    errors.email = 'Invalid email address';
  }

  if (!validator.isLength(password, { min: 6 })) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;

    const sql = 'INSERT INTO manager_info (First_name, Last_name, email, password) VALUES (?, ?, ?, ?)';

    connection.query(sql, [fname, lname, email, hash], (err, result) => {
      if (err) throw err;

    res.redirect('/');
  });
});
});
         /******************Signin***************************/
app.get("/signIn.html", function(req, res) {
res.sendFile(__dirname + "/signIn.html");
});
app.get("/signin", function(req, res) {
  res.sendFile(__dirname + "/signIn.html");
});

app.post('/signin', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  connection.query('SELECT * FROM manager_info WHERE email = ?', email, (error, results) => {

    if(error) throw error;

    const user = results[0];

    // Check if user was found
  if(!user) {
    return res.status(401).json({message: 'Invalid email'}); 
  }

  // Compare password  
  bcrypt.compare(password.trim(), user.password, (err, match) => {

    if(err) throw err;

    if(!match) {
      return res.status(401).json({message: 'Invalid password'});
    }

    // Password matched 
    // Create JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({id: user.id}, process.env.jwtSecret);
    // Return to the service page
    res.redirect('/function');
  });

});
});
         /******************creating product*****************/
app.get("/function.html", function(req, res) {
res.sendFile(__dirname + "/function.html");
});
try{
app.get("/function", function(req,res){
  res.sendFile(__dirname+"/function.html");
});

// Form submission handler
app.get("/create", function(req,res){
    res.sendFile(__dirname+"/function.html");
});
app.get('/create.html', (req, res) => {
  res.sendFile(__dirname + '/create.html');
}); 
app.post('/create', (req, res) => {

    // Get form data
    const name=req.body.name;
    const description=req.body.description;
    const price=req.body.price;
    const quantity=req.body.quantity;
  
    // Insert product query
    connection.query(
      'INSERT INTO products VALUES (?, ?,?,?)', 
      [name, description, price, quantity],
      (err, results) => {
        if(err) throw err;
  
        res.redirect('/create');
      }
    );
  
  });
} catch (err) {

  if(err.code === 'ER_DUP_ENTRY') {
  console.log("duplicate entry, do not insert");
  }

}

 /****************** list information*****************/

  app.get('/retrieve', (req, res) => {
    res.sendFile(__dirname + '/function.html');
  });
  
  app.get('/list.html', (req, res) => {
    res.sendFile(__dirname + '/list.html');
  });

  app.get('/products', (req, res) => {
  
    let query = 'SELECT product_name, product_description, price, Quantity_in_stock FROM products';
  
    if(req.query.Quantity_in_stock) {
      query += ' WHERE Quantity_in_stock = ?'; 
    }
  
    connection.query(query, [req.query.Quantity_in_stock], (err, results) => {
      res.json(results); 
    });
  
  });

  /******************updating product*****************/

  app.get('/update.html', (req, res) => {
    res.sendFile(__dirname + '/update.html');
  });
  app.get("/update", function(req,res){
    res.sendFile(__dirname+"/update.html");
  });
  app.post('/update', (req, res) => {

    let sql = `
      UPDATE products
      SET 
        product_name=?, 
        product_description=?,
        price=?,
        Quantity_in_stock=?,
        available=? 
      WHERE 
      product_name=? 
    `;
  
    connection.query(sql, [
      req.body.name,
      req.body.description,
      req.body.price,
      req.body.quantity,
      req.body.available,

      req.body.originalName
    ], (error) => {
      if (error) {
        console.error('Error updating product:', error);
        res.send('Error updating product');
      } else {
        res.send('Product updated');
      }
  });
  });

   /******************deleting product information*****************/
  app.get("/delete", function(req,res){
    res.sendFile(__dirname+"function.html");
  });
  app.post('/delete', (req, res) => {

    let sql = `
      DELETE FROM products
      WHERE 
      product_name=? 
    `;
  
    connection.query(sql, [ req.body.name
    ], (error) => {
      if (error) {
        console.error('Error deleting product:', error);
        res.send('Error deleting product');
      }  
        if (result.affectedRows === 0) {
          res.send('Product does not exist');
        } else {
          res.send('Product deleted successfully');
        }
  });
  });
  app.listen(3000, function(){
    console.log("server is running on port 3000");
    
  })

