const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/index');
const port = process.env.PORT || 3300;

const connectDB = require('./src/DB/Db');
connectDB();



app.get('/', (req, res) => {
    res.send(`Hii, Your app is running`);
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})


