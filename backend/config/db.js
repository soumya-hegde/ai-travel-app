const mongoose = require('mongoose');

const configureDB = async () => {
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("CONNECTED TO DB");
    }catch(err){
        console.log(err,'Error connecting to DB');
    }
}

module.exports = configureDB;