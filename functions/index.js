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
    getIllustrations
} = require('./handlers/data')
const { login, signup, getAuthenticatedUser,changeProfileImage,addUserDetails } = require('./handlers/users')
const {
    uploadPortret,
    getAuthors,
    addAuthor,
    getAuthor,
    changeBio,
} = require('./handlers/author')
const {getTest, getResult} = require('./handlers/test')
const cors = require('cors');
const fbAuth = require('./util/fbAuth');
app.use(cors());

// Users routes

app.post('/signup', signup);
app.post('/login', login);
app.get('/user/',fbAuth, getAuthenticatedUser)
app.post('/user/details',fbAuth,addUserDetails)
app.post('/user/image',fbAuth, changeProfileImage)
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
app.get('/illustration?', getIllustrations)
//app.post('/test', addTest)
app.delete('/audio/:audioId',fbAuth, deleteAudio)
app.delete('/movie/:movieId',fbAuth, deleteMovie)
app.delete('/book/:bookId',fbAuth, deleteBook)
app.delete('/test/:testId',fbAuth, deleteTest)
app.delete('/illustration/:illustrationId',fbAuth, deleteIllustration)
//Tests Routes
app.get('/test/:testId',getTest)
app.post('/test/:testId',fbAuth,getResult)


exports.api = functions.region('us-central1').https.onRequest(app)

