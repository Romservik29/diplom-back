const { db, storage, bucket } = require('../util/admin');
const config = require('../util/config');

const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
//Audio
exports.getAudio = (req, res) => {
    const limit = parseInt(req.query.limit)
    const page = parseInt(req.query.page)
    const offset = page * limit - (limit)
    db.collection('audio')
        .limit(limit)
        .offset(offset)
        .get()
        .then(data => {
            let audio = []
            data.forEach(doc => {
                audio.push({
                    audioUrl: doc.data().audioUrl,
                    name: doc.data().name,
                    singer: doc.data().singer,
                    id: doc.id
                })
            })
            return res.json({ audio: audio })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}
exports.addAudio = (req, res) => {

    const newAudio = {}
    const busboy = new BusBoy({ headers: req.headers });
    let audioToBeUploaded = {};
    let audioFileName;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'audio/mpeg' && mimetype !== 'audio/ogg') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }

        // my.image.png => ['my', 'image', 'png']
        const audioExtension = filename.split('.')[filename.split('.').length - 1];
        // 32756238461724837.png
        audioFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${audioExtension}`;
        const filepath = path.join(os.tmpdir(), audioFileName);

        audioToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));


    });

    busboy.on('field', (fieldName, value) => {
        if (fieldName == 'authorId')
            newAudio.authorId = value
        if (fieldName == 'name')
            newAudio.name = value
        if (fieldName === 'singer')
            newAudio.singer = value
    })
    busboy.on('finish', () => {
        storage
            .upload(audioToBeUploaded.filepath, {
                destination: `audio/${audioFileName}`,
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: audioToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const audioUrl = `https://firebasestorage.googleapis.com/v0/b/${
                    config.storageBucket
                    }/o/audio%2F${audioFileName}?alt=media`;
                newAudio.audioUrl = audioUrl;
            })
            .then(() => {
                const file = storage.file(`audio%2F${audioFileName}`);
                return file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                })
            })
            .then(signedUrls => {
                newAudio.downloadUrl = signedUrls[0];
                return db.collection('audio').add(newAudio);
            })
            .then(() => {
                res.json({ audio: newAudio });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: 'something went wrong' });
            });
    });
    busboy.end(req.rawBody);
}
exports.deleteAudio = (req, res) => {
    const document = db.collection('audio').doc(`${req.params.audioId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Audio not found' });
            }
      //Проверка
      /*if (req.user.role !== 'admin' ) {
        return res.status(403).json({ error: 'Unauthorized' });
      }*/else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Audio deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}
//Books
exports.getBooks = (req, res) => {
    const limit = parseInt(req.query.limit)
    const page = parseInt(req.query.page)
    const offset = page * limit - (limit)
    db.collection('books')
        .limit(limit)
        .offset(offset)
        .get()
        .then(data => {
            let books = []
            data.forEach(doc => {
                books.push({
                    bookUrl: doc.data().bookUrl,
                    name: doc.data().name,
                    id: doc.id
                })
            })
            return res.json({ books: books })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}
exports.addBook = (req, res) => {

    const newBook = {}
    const busboy = new BusBoy({ headers: req.headers });
    let bookToBeUploaded = {};
    let bookFileName;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        /*if (mimetype !== 'audio/mpeg' && mimetype !== 'audio/ogg') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }*/

        // my.image.png => ['my', 'image', 'png']
        const audioExtension = filename.split('.')[filename.split('.').length - 1];
        // 32756238461724837.png
        bookFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${audioExtension}`;
        const filepath = path.join(os.tmpdir(), bookFileName);

        bookToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));


    });

    busboy.on('field', (fieldName, value) => {
        if (fieldName == 'authorId')
            newBook.authorId = value
        if (fieldName == 'name')
            newBook.name = value
        if (fieldName == 'writer')
            newBook.writer = value
    })
    busboy.on('finish', () => {
        storage
            .upload(bookToBeUploaded.filepath, {
                destination: `books/${bookFileName}`,
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: bookToBeUploaded.mimetype
                    }
                }
            })
            .then((data) => {
                const bookUrl = `https://firebasestorage.googleapis.com/v0/b/${
                    config.storageBucket
                    }/o/books%2F${bookFileName}?alt=media`;
                newBook.bookUrl = bookUrl;
                let file = data[0];

                return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + config.storageBucket + "/o/" + encodeURIComponent(file.name) + "?alt=media")

            })
            .then((downloadUrl) => {
                newBook.downloadUrl = downloadUrl;
                db.collection('books').add(newBook);
                res.json({ book: newBook });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: 'something went wrong' });
            });
    });
    busboy.end(req.rawBody);
}
exports.deleteBook = (req, res) => {
    const document = db.collection('books').doc(`${req.params.bookId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Book not found' });
            }

            if (req.user.role !== 'admin')
                return res.status(403).json({ error: 'Unauthorized' });
            else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Book deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}
//Illustrations
exports.getIllustrations = (req, res) => {
    const limit = parseInt(req.query.limit)
    const page = parseInt(req.query.page)
    const offset = page * limit - (limit)
    db.collection('illustrations')
        .limit(limit)
        .offset(offset)
        .get()
        .then(data => {
            let illustrations = []
            data.forEach(doc => {
                illustrations.push({
                    illustrationUrl: doc.data().illustrationUrl,
                    name: doc.data().name,
                    id: doc.id
                })
            })
            return res.json({ illustrations: illustrations })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}
exports.addIllustration = (req, res) => {
    const newIllustration = {}
    const busboy = new BusBoy({ headers: req.headers });
    let imageToBeUploaded = {};
    let imageFileName;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' + mimetype });
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
        if (fieldName == 'name')
            newIllustration.name = value
        if (fieldName == 'authorId')
            newIllustration.authorId = value
    })
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
                const illustrationUrl = `https://firebasestorage.googleapis.com/v0/b/${
                    config.storageBucket
                    }/o/images%2F${imageFileName}?alt=media`;
                newIllustration.illustrationUrl = illustrationUrl;
                return db.collection('illustrations').add(newIllustration);
            })
            .then(() => {
                res.json({ illustration: newIllustration });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: 'something went wrong' });
            });
    });
    busboy.end(req.rawBody);
}

exports.deleteIllustration = (req, res) => {
    const document = db.collection('illustrations').doc(`${req.params.illustrationId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Illustration not found' });
            }
      //Проверка
      /*if (req.user.role !== 'admin' ) {
        return res.status(403).json({ error: 'Unauthorized' });
      }*/else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'illustration deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}
//Movies
exports.getMovies = (req, res) => {
    const limit = parseInt(req.query.limit)
    const page = parseInt(req.query.page)
    const offset = page * limit - (limit)
    db.collection('movies')
        .limit(limit)
        .offset(offset)
        .get()
        .then(data => {
            let movies = []
            data.forEach(doc => {
                movies.push({
                    movieId: doc.data().movieId,
                    name: doc.data().name,
                    id: doc.id
                })
            })
            return res.json({ books: movies })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}
exports.addMovie = (req, res) => {
    const newMovie = {
        name: req.body.name,
        movieId: req.body.movieId,
        authorId: req.body.authorId,
        createdAt: new Date().toISOString()
    }
    db.collection('movies')
        .add(newMovie)
        .then(doc => {
            res.json({ message: `Movie created successfully` })
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ error: 'something went wrong' })
        })
}
exports.deleteMovie = (req, res) => {
    const document = db.collection('movies').doc(`${req.params.movieId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Movie not found' });
            }
      //Проверка
      /*if (req.user.role !== 'admin' ) {
        return res.status(403).json({ error: 'Unauthorized' });
      }*/else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Movie deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}
//Tests
exports.deleteTest = (req, res) => {
    const document = db.collection('tests').doc(`${req.params.testId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Test not found' });
            }
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Test deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
}