const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require('./util/fbAuth')
const {
    deleteIllustration,
    addIllustration,
    deleteAudio,
    deleteMovie,
    deleteTest,
    deleteBook,
    getAudio,
    addMovie,
    addAudio,
    addBook,
    addTest,
} = require('./handlers/data')
const { login, signup, uploadImage, getAuthenticatedUser } = require('./handlers/users')
const {
    uploadPortret,
    getAuthors,
    addAuthor,
    getAuthor,
    changeBio,
} = require('./handlers/author')

const cors = require('cors');
const fbAuth = require('./util/fbAuth');
app.use(cors());

// Users routes

app.post('/signup', signup);
app.post('/login', login);
app.post('/image', uploadImage);
app.get('/user/',fbAuth, getAuthenticatedUser)
// Authors routes 
app.get('/authors?', getAuthors)//?page&limit
app.post('/author',addAuthor)
app.get('/author/:authorId', getAuthor)
app.post('/author/portret', uploadPortret)
app.post('/author/:authorId/bio', changeBio)
//Data routes
app.get('/audio?', getAudio)//?page&limit
app.post('/audio', addAudio)
app.post('/book', addBook)
app.post('/movie', addMovie)
app.post('/illustration', addIllustration)
//app.post('/author/:authorId/test', addTest)
app.delete('/audio/:audioId',fbAuth, deleteAudio)
app.delete('/movie/:movieId',fbAuth, deleteMovie)
app.delete('/book/:bookId',fbAuth, deleteBook)
app.delete('/author/:authorId/test/:testId', deleteTest)
app.delete('/illustration/:illustrationId', deleteIllustration)

//app.post('/author', addAuthor)

exports.api = functions.region('us-central1').https.onRequest(app)

