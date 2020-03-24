const express = require('express');
const http = require('http');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
var multer = require('multer');

//Parse form data, get data when form is submitted & parse it into json format
app.use(bodyParser.urlencoded({ extended: true }));

//use dateformat to formatting dates

const dateFormat = require('dateformat');

const now = new Date();

//set ejs for this app
app.set('view engine', 'ejs');

//Upload Image set up: 

var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./Images");
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: Storage
}).array("img", 3); //Field name and max count

//import js & css file to use in this app
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

//Connect to mysql
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stock"
});

//Global Variables
const websiteTitle = "Node Js Crud";
const baseUrl = "http://localhost:3000";

//Routes
app.get('/', (req, res) => {

    con.query('SELECT * FROM PRODUCT ORDER BY REFERENCE', (err, result) => {
        if (err) throw err;
        res.render('pages/index', {
            websiteTitle: websiteTitle,
            pageTitle: 'Index',
            products: result
        });
    });
});

app.get('/product/new', (req, res) => {

    let query = "SELECT * FROM CATEGORY";

    con.query(query, (err, result) => {
        if (err) throw err;
        res.render('pages/newProduct', {
            websiteTitle: websiteTitle,
            pageTitle: 'Add New Product',
            categories: result
        })
    })
});

app.post('/product/new', (req, res) => {
    let query = "INSERT INTO PRODUCT (productName, categoryId, unitPrice, quantity) VALUES (";
    query += "'" + req.body.productName + "',";
    query += "'" + req.body.category + "',";
    query += "" + req.body.price + ",";
    query += "" + req.body.qte + ")";


    con.query(query, (err, result) => {
        upload(req, res, function(err) {
            if (err) {
                return res.end("Something went wrong!");
            }
            res.redirect(baseUrl);

        });
    })
});


app.get('/product/delete/:id', (req, res) => {

    con.query(`DELETE FROM PRODUCT WHERE REFERENCE = ${req.params.id} `, (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0) {
            res.redirect(baseUrl);
        }
    });

});

app.get('/product/show/:id', (req, res) => {

    con.query(`SELECT * FROM PRODUCT WHERE REFERENCE = ${req.params.id} `,
        (err, result) => {
            if (err) throw err;
            res.render('pages/showProduct', {
                websiteTitle: websiteTitle,
                pageTitle: 'Product Details',
                product: result
            });
        });
});

app.get('/product/edit/:id', (req, res) => {

    let query = `SELECT P.*, C.* FROM PRODUCT P, CATEGORY C 
                 WHERE P.categoryId= C.id
                 AND P.REFERENCE = ${req.params.id}`;

    let categoriesQuery = "SELECT * FROM CATEGORY";

    var object = {
        product: null,
        categories: null
    };

    con.query(query, (err, product) => {
        object.product = product;
    });

    con.query(categoriesQuery, (err, categories) => {
        object.categories = categories;
        res.render('pages/editProduct', {
            websiteTitle: websiteTitle,
            pageTitle: 'Product Details',
            object: object
        });
    });


});

app.post('/product/edit', (req, res) => {
    let query = `UPDATE PRODUCT SET 
    PRODUCTNAME = '${req.body.productName}',
    CATEGORYID    = IFNULL('${req.body.category}', 0), 
    UNITPRICE       = ${req.body.price}, 
    QUANTITY    = ${req.body.qte}
    WHERE REFERENCE = ${req.body.reference}`;

    con.query(query, (err, result) => {
        if (err) throw err;
        res.redirect(baseUrl);
    });
});
//Create a server & connect
const server = app.listen(3000, () => {
    console.log('Server is running...');
});