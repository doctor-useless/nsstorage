const path = require('path')
const crypto = require('crypto')
const https = require('https')
const fs = require('fs')

const port = 3001
const dest = 'uploads'
const cert = 'cert'
const certOptions = {
    key: fs.readFileSync(path.join(cert, 'privkey.pem')),
    cert: fs.readFileSync(path.join(cert, 'cert.pem'))
};

const express = require('express')
const app = express()
app.use(express.static(dest))

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dest)
    },
    filename: function (req, file, cb) {
        let randomName = crypto.randomBytes(18).toString('hex')
        cb(null, randomName + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage})

app.post('/upload', upload.single('image'), (req, res) => {
    let authKey = req.headers.authorization || null
    if (authKey === process.env.NSSTORAGE_SECRET) {
        console.log(`new upload: ${req.file.filename}`)
        console.log(req.file)
        res.json({msg: 'upload works :)', filename: req.file.filename})
        res.statusCode = 200
    } else {
        console.log('unauthorized')
        res.json({msg: 'unauthorized'})
        res.statusCode = 401
    }
    
});

app.get('/', (req, res) => res.send('nsstorage says Hello World!'))

https.createServer(certOptions, app).listen(port, () => console.log(`nsstorage listening on port ${port}!`));

