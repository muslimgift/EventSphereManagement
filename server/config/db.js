const { default: mongoose } = require("mongoose");

const ConnectDB = async ()=>{

    await mongoose.connect(process.env.DBURI)
    .then(() => console.log('Connected!'))
    .catch(()=> console.log("Connection Failed"))

}


module.exports = ConnectDB