const express = require('express')

const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_KEY)
const port = process.env.PORT || 9000;


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.clvmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();
        const usersCollection = client.db('estatesDb').collection('users');
        const pendingCollection = client.db('estatesDb').collection('pendingProperty');
        const verifyCollection = client.db('estatesDb').collection('verifyProperty');
        const wishesCollection = client.db('estatesDb').collection('wishProperty');
        const offerCollection = client.db('estatesDb').collection('offeredProperty');
        const reviewCollection = client.db('estatesDb').collection('reviewProperty');
        const advertiseCollection = client.db('estatesDb').collection('advertiseProperty');

        //create User
        app.post('/users/:email', async (req, res) => {
            const user = req.body
            const email = req.params.email
            const query = { email }
            const isExist = await usersCollection.findOne(query)
            if (isExist) {
                return res.send(isExist)
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        //get user role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        //get all user role
        app.get('/allUsers/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: { $ne: email } }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        //get user role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })

        //make admin/agent
        app.patch('/change/role/:id', async (req, res) => {
            const data = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const UpdateInfo = {
                $set: {
                    role: data?.userRole
                }
            }
            const result = await usersCollection.updateOne(filter, UpdateInfo)
            res.send(result)
        })

        //fraud update user
        app.patch('/fraud/user/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const upDateData = {
                $set: {
                    role: 'user',
                    report: 'fraud'
                }
            }
            const result = await usersCollection.updateOne(query, upDateData)
            res.send(result)

        })

        //fraud agent all data delete
        app.delete('/fraud/user/allData/:email', async (req, res) => {
            const email = req.params.email
            const query = { bayerEmail: email }
            const result = await verifyCollection.deleteMany(query)
            res.send(result)
        })

        //add pending property
        app.post('/pendingProperty', async (req, res) => {
            const data = req.body
            const result = await pendingCollection.insertOne(data)
            res.send(result)
        })

        //get pending property
        app.get('/pendingProperty', async (req, res) => {
            const result = await pendingCollection.find().toArray()
            res.send(result)
        })

        app.get('/pendingProperty/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await pendingCollection.findOne(query)
            res.send(result)
        })
        app.get('/rejectProperty/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await pendingCollection.findOne(query)
            res.send(result)
        })

        //update verify property
        app.patch('/pendingProperty/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateData = {
                $set: {
                    status: 'verified'
                }
            }
            const result = await pendingCollection.updateOne(filter, updateData)
            res.send(result)
        })

        //reject verify property
        app.patch('/rejectProperty/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const updateData = {
                $set: {
                    status: 'rejected'
                }
            }
            const result = await pendingCollection.updateOne(query, updateData)
            res.send(result)
        })

        //post verify data
        app.post('/verifyProperty', async (req, res) => {
            const data = req.body
            const result = await verifyCollection.insertOne(data)
            res.send(result)
        })

        //get verify data
        app.get('/verifyProperty', async (req, res) => {
            const search = req.query.search
            const sort = req.query.sort
            let query = {}
            let sortQuery = {}
            if (search) query.location = search
            if (sort == 'true') {
                sortQuery = { 'minPrice': 1 }
            }
            const result = await verifyCollection.find(query).sort(sortQuery).toArray()
            res.send(result)
        })

        //get verify data single
        app.get('/verifyProperty/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: id }
            const result = await verifyCollection.findOne(query)
            res.send(result)
        })

        //single agent get her all posted property
        app.get('/pendingProperty/pen/:email', async (req, res) => {
            const email = req.params.email
            const query = { bayerEmail: email }
            const result = await pendingCollection.find(query).toArray()
            res.send(result)
        })

        // delete property in my add property
        app.delete('/pendingProperty/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await pendingCollection.deleteOne(query)
            res.send(result)
        })

        //updated full property
        app.put('/pendingProperty/:id', async (req, res) => {
            const data = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const UpdateInfo = {
                $set: {
                    bayerName: data?.bayerName,
                    bayerEmail: data?.bayerEmail,
                    title: data?.title,
                    location: data?.location,
                    minPrice: data?.minPrice,
                    maxPrice: data?.maxPrice,
                    Image: data?.Image,
                    status: data.status,
                    bayerImg: data?.bayerImg

                }
            }
            const result = await pendingCollection.updateOne(filter, UpdateInfo)
            res.send(result)
        })
        app.put('/verifyProperty/:id', async (req, res) => {
            const data = req.body
            const id = req.params.id
            const filter = { _id: id }
            const UpdateInfo = {
                $set: {
                    bayerName: data?.bayerName,
                    bayerEmail: data?.bayerEmail,
                    title: data?.title,
                    location: data?.location,
                    minPrice: data?.minPrice,
                    maxPrice: data?.maxPrice,
                    Image: data?.Image,
                    status: data.status,
                    bayerImg: data?.bayerImg

                }
            }
            const result = await verifyCollection.updateOne(filter, UpdateInfo)
            res.send(result)
        })

        //added property wishlist
        app.post('/wishlist', async (req, res) => {
            const data = req.body
            const result = await wishesCollection.insertOne(data)
            res.send(result)
        })

        //get property data in wishlist
        app.get('/wishlist', async (req, res) => {
            const result = await wishesCollection.find().toArray()
            res.send(result)
        })
        app.get('/wishlist/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await wishesCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/wishlist/wish/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await wishesCollection.findOne(query)
            res.send(result)
        })

        //delete data wishlist 
        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await wishesCollection.deleteOne(query)
            res.send(result)
        })

        //offered property
        app.post('/offered', async (req, res) => {
            const data = req.body
            const result = await offerCollection.insertOne(data)
            res.send(result)
        })

        //get offer data
        app.get('/offered', async (req, res) => {
            const result = await offerCollection.find().toArray()
            res.send(result)
        })
        app.get('/requested/offer/agent/:email', async (req, res) => {
            const email = req.params.email
            const query = { agentEmail: email }
            const result = await offerCollection.find(query).toArray()

            res.send(result)
        })
        app.get('/offered/:email', async (req, res) => {
            const email = req.params.email
            const query = { bayerEmail: email }
            const result = await offerCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/offered/single/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await offerCollection.findOne(query)
            res.send(result)
        })

        //update requested property status
        app.patch('/rejected/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateData = {
                $set: {
                    status: 'rejected'
                }
            }
            const result = await offerCollection.updateOne(filter, updateData)
            res.send(result)
        })
        app.patch('/accepted/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateData = {
                $set: {
                    status: 'accepted'
                }
            }
            const result = await offerCollection.updateOne(filter, updateData)
            res.send(result)
        })

        app.delete('/rejectedProperty/delete/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await offerCollection.deleteOne(query)
            res.send(result)
        })

        //post review
        app.post('/reviews', async (req, res) => {
            const data = req.body
            const result = await reviewCollection.insertOne(data)
            res.send(result)
        })
        //get review
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray()
            res.send(result)
        })
        app.get('/review/:email', async (req, res) => {
            const email = req.params.email
            const query = { reviewerEmail: email }
            const result = await reviewCollection.find(query).toArray()
            res.send(result)
        })
        //delete review
        app.delete('/review/delete/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

        //Advertisement Post
        app.post('/advertise', async (req, res) => {
            const data = req.body
            const result = await advertiseCollection.insertOne(data)
            res.send(result)
        })
        //get advertise
        app.get('/advertise', async (req, res) => {
            const result = await advertiseCollection.find().toArray()
            res.send(result)
        })
      

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('final project running')
})

app.listen(port, () => {
    console.log(`final project running ${port}`)
})