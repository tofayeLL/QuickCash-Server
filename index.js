const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const bcrypt = require('bcryptjs');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8mgufzz.mongodb.net/?appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    // user collection
    const userCollection = client.db("QuickCash").collection("users");





    // Post from signin users
    app.post('/users', async (req, res) => {
      // for hashing pin or password use bcrypt.js
      const salt = bcrypt.genSaltSync(10);
      const secPassword = bcrypt.hashSync(req.body.password, salt);
      req.body.password = secPassword;

      const user = req.body;

      const query = { email: user.email }
      const alreadyExist = await userCollection.findOne(query);
      if (alreadyExist) {
        return res.send({ message: 'User Already Exist', insertedId: null })
      }

      const result = await userCollection.insertOne(user);
      res.send(result);

    })


    // POST method using for login page
    app.post('/loginUser', async (req, res) => {
      const userInfo = req.body;
      const emailOrPhone = userInfo.userEmailOrPhone;


      // find specific user from user collection
      const matchUser = await userCollection.findOne({ email: emailOrPhone })
      const matchUser2 = await userCollection.findOne({ phone: emailOrPhone })

      const getSpecificUser = matchUser || matchUser2;
      console.log(getSpecificUser);

      if(getSpecificUser){
        const pin = userInfo.password;

        bcrypt.compare(pin, getSpecificUser.password, function(err, response) {
          // res === true
          if(err){
            res.send({message: "Error ! something wrong"})
          }
          else if(response ){
            res.send({message: "Pin is correct"})
          }
          else {
            res.send({message: "Pin is incorrect"})
          }
      });
      }

      else{
        console.log("user does not exist");
        res.send({message: "user does not exist"})
      }

    })











    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('QuickCash server is running...');
})


app.listen(port, () => {
  console.log(`QuickCash server is running at port:${port}`);
})