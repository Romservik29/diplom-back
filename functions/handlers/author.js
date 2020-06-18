const { db, storage } = require('../util/admin');
const config = require('../util/config');

const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

exports.getAuthor = (req, res) => {
    let authorData = {};
    db
        .collection('authors')
        .doc(req.params.authorId)
        .get()
        .then(doc => {
            if (!doc.exists) res.status(404).json({ message: 'author not found' })
            else {
                authorData = doc.data();
                authorData.id = doc.id;
                return db
                    .collection('audio')
                    .where('authorId', '==', req.params.authorId)
                    .get()
            }
        })
        .then(data => {
            authorData.audio = [];
            data.forEach(doc => {
                authorData.audio.push({ ...doc.data(), id: doc.id })
            })
            return db
                .collection('movies')
                .where('authorId', '==', req.params.authorId)
                .get();
        })
        .then(data => {
            authorData.movies = [];
            data.forEach(doc => {
                authorData.movies.push({ ...doc.data(), id: doc.id })
            });
            return db
                .collection('illustrations')
                .where('authorId', '==', req.params.authorId)
                .get();
        })
        .then(data => {
            authorData.illustrations = [];
            data.forEach(doc => {
                authorData.illustrations.push({ ...doc.data(), id: doc.id })
            });
            return db
                .collection('tests')
                .where('authorId', '==', req.params.authorId)
                .get();
        })
        .then(data => {
            authorData.tests = [];
            data.forEach(doc => {
                authorData.tests.push({ ...doc.data(), id: doc.id })
            });
            return db
                .collection('books')
                .where('authorId', '==', req.params.authorId)
                .get()
        })
        .then(data => {
            authorData.books = [];
            data.forEach(doc => {
                authorData.books.push({ ...doc.data(), id: doc.id })
            })

            res.json(authorData)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}


exports.getAuthors = (req, res) => {
    const limit = parseInt(req.query.limit)
    const page = parseInt(req.query.page)
    const offset = page * limit - (limit)
    db.collection('authors')
        .orderBy('createdAt', 'asc')
        .limit(limit)
        .offset(offset)
        .get()
        .then(data => {
            let authors = []
            data.forEach(doc => {
                authors.push({
                    firstName: doc.data().firstName,
                    lastName: doc.data().lastName,
                    midName: doc.data().midName,
                    authorId: doc.id,
                    createdAt: doc.data().createdAt,
                    yearOfLife: doc.data().yearOfLife,
                    bio: doc.data().bio,
                    portretUrl: doc.data().portretUrl
                })
            })
            return res.json({ authors: authors })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}

exports.addAuthor = (req, res) => {
    const noImg = 'no-img.png';
    const newAuthor = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        midName: req.body.midName,
        yearOfLife: req.body.yearOfLife,
	bio: '',
        portretUrl:`https://firebasestorage.googleapis.com/v0/b/${
            config.storageBucket
          }/o/${noImg}?alt=media`,
        createdAt: new Date().toISOString()
    }
    db.collection('authors')
        .add(newAuthor)
        .then(doc => {
            const id = doc.path.split('/')[1]
            res.json({ message: `Писатель успешно добавлен`, id: id })
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ error: 'Упс что-то пошло не так' })
        })
}

exports.uploadPortret = (req, res) => {
    const busboy = new BusBoy({ headers: req.headers });
    let imageToBeUploaded = {};
    let imageFileName;
    let authorId;
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname, file, filename, encoding, mimetype);
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }
        // my.image.png => ['my', 'image', 'png']
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        // 32756238461724837.png
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('field', (fieldName, value) => {
        if (fieldName === 'authorId') authorId = value;
    });
    busboy.on('finish', () => {
        storage
            .upload(imageToBeUploaded.filepath, {
                destination: `images/${imageFileName}`,
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const portretUrl = `https://firebasestorage.googleapis.com/v0/b/${
                    config.storageBucket
                    }/o/images%2F${imageFileName}?alt=media`;
                return db.collection('authors').doc(authorId).update({ portretUrl });
            })
            .then(() => {
                return res.json({ message: 'image update successfully' });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: 'something went wrong' });
            });
    });
    busboy.end(req.rawBody);
}

exports.changeBio = (req,res) =>{
    db
    .collection('authors')
    .doc(req.params.authorId)
    .update({bio: req.body.bio})
    .then(()=> res.json({message: "Биография обновлена успешно"}))
    .catch(err=>{
        console.error(err);
        return res.status(500).json({ error: err.code });
    })
}
