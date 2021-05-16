const bodyParser = require('body-parser');

const mysql = require('mysql'); require('express');

const express = require('express')
const path = require('path');
const app = express();
const sharp = require("sharp");
app.use(bodyParser.json())

var urlencodedParser = bodyParser.urlencoded({ extended: false })



const multer = require('multer')
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'poc_db'
})



app.use(express.static(__dirname + '/views'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

mysqlConnection.connect((err) => {
    if (!err) console.log('connected');
    else console.log('error while connetion', err);
})
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) { cb(null, 'uploads/') },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '.jpg' || '.jpeg') //Appending jis
//     }
// })


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


var upload = multer({ storage: storage });

app.listen(4000, () => {
    console.log('running on port 4000')
})

app.get('/employee', (req, res) => {
    mysqlConnection.query('select * from code WHERE count=0', (err, rows, fields) => {
        if (!err) console.log(rows);
        else console.log(err)
    })
})





app.post('/employees', urlencodedParser, upload.single('image'), (req, res) => {
    console.log(upload.single('image'), " upload.single('image')")
    var code_check = "select * from code WHERE count=0";

    mysqlConnection.query(code_check, (err, result) => {

        var sql_qry = "INSERT INTO `employee` (`name`, `email`, `mobile`, `address`, `unique_code`, `image`) VALUES ('" + req.body.name + "', '" + req.body.email + "','" + req.body.mobile + "','" + req.body.address + "','" + req.body.unique_code + "','" + req.body.image + "')";

        var f = result.map((b) => { return b.code })

        var z = f.includes(req.body.unique_code)
        console.log(z, '---')

        if (z) {

            mysqlConnection.query(sql_qry, (err, result) => {
                console.log('z true');

                try {
                    sharp(req.file.path).resize(300, 300).toFile
                        ('uploads/' + Date.now() + req.file.originalname, (err, resizeImage) => {
                            console.log(resizeImage, 'resizeImage')
                            if (!req.file) {
                                console.log('(!req.file)')
                                console.log("No file received");
                                res.send(`<p style='color:red; text-align:center; margin-top:20px;'>please select image</p>`);
                                res.send({ message: 'select image' })

                                message = "Error! in image upload. "
                                // res.sendFile('index', { message: message, status: 'danger' }, { root: __dirname + '/views' });
                            }
                            else if (err) {

                                if (err.code === ' ER DUP ENTRY') {
                                    console.log('(!err.code)')
                                    res.send(`<p style='color:red; text-align:center; margin-top:20px;'>duplicate entry for unique code</p>`);
                                    res.send({ message: 'duplicate entry for unique code' })
                                    console.log('Error: duplicate entry for unique_code')
                                    console.log(err)
                                }
                            }
                            else {

                                console.log('inserted data');

                                res.sendFile('ty.html', { root: __dirname + '/views' });
                                var update_q = "UPDATE code SET count=1 WHERE code='" + req.body.unique_code + "'"

                                mysqlConnection.query(update_q, (err, result) => {
                                    console.log(err);
                                    console.log(result);
                                })
                            }







                        })
                }
                catch (error) {

                    console.log(err, '----error')

                }





            })

        }
        if (!z) {



            res.send(`<p style='color:red; text-align:center; margin-top:20px;'>please enter valid unique code</p>`);

            // res.send({ message: 'please enter valid unique code' })
            console.log('please enter valid unique code')
        }



    })


})





