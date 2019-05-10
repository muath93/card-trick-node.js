const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');

const app = express();
const MongoClient = mongodb.MongoClient;
const URI = process.env.MONGODB_URI || 'mongodb://localhost/database';
const PORT = process.env.PORT || 3000;
const DB_NAME = process.env.DB_NAME;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.get('/secret', (req, res) => {
    res.sendFile(path.join(__dirname, 'secret.html'))
})

app.post('/secret', (req, res) => {
    const { name, number, suit } = req.body;
    MongoClient.connect(URI, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
        } else {
            const db = client.db(DB_NAME);
            const collection = db.collection('names')
            const entry = {
                name: name.toLowerCase(),
                card: `${number}_of_${suit}`
            };
            collection.insertOne(entry, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.send('Inserted into database');
                }
            })
            client.close();
        }
    })
})

app.get('/:param*', (req, res) => {
    // to get the name from url (param)
    const name = req.url.slice(1).toLowerCase();
    MongoClient.connect(URI, { useNewUrlParser: true }, (err, client) => {
        if (err) {
            console.log(err);
        } else {
            const db = client.db(DB_NAME);
            const collection = db.collection('names')

            if (name === 'deleteall') {
                collection.remove({});
                res.send('database reset')
            } else {
                collection.find({ name: name }).toArray((err, result) => {
                    if (err) {
                        console.log(err);
                    } else if (result.length) {
                        const card = result[result.length - 1].card + '.png';
                        res.sendFile(path.join(__dirname + '/cards/' + card))
                    } else {
                        res.sendStatus(404);
                    }
                    client.close()
                })
            }
        }
    })
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))