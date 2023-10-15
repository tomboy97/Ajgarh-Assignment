const express = require('express');
const app = express();
const {router} = require('./src/controller/routes')

const port = 7898;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
})