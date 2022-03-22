const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8qcwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db('medicare');
        const doctorsCollection = database.collection('doctors');
        const usersCollection = database.collection('users');
        const departmentCollection = database.collection('departments');
        const serviceCollection = database.collection('services');
        const reviewCollection = database.collection('reviews');
        const appointmentsCollection = database.collection('appointments');
        const ordersCollection = database.collection('orders');
        const specialUsersCollection = database.collection('special-users');

        // get doctors api
        app.get('/doctors', async (req, res) => {
            const cursor = doctorsCollection.find({});
            const doctors = await cursor.toArray();
            console.log('doctors found');
            res.send(doctors);
        });

        // get single doctor api
        app.get('/doctors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const doctor = await doctorsCollection.findOne(query);
            console.log('target doctor found');
            res.json(doctor);
        });

        // get services api
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            console.log('services found');
            res.send(services);
        });

        // get single service api
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            console.log('target service found');
            res.json(service);
        });

        // get departments api
        app.get('/departments', async (req, res) => {
            const cursor = departmentCollection.find({});
            const departments = await cursor.toArray();
            console.log('departments found');
            res.send(departments);
        });

        // add appointments api
        app.post('/appointments', async (req, res) => {
            const newAppointment = req.body;
            const result = await appointmentsCollection.insertOne(
                newAppointment
            );
            console.log('Appointment added');
            res.json(result);
        });

        // get appointments api
        app.get('/appointments', async (req, res) => {
            const cursor = appointmentsCollection.find({});
            const appointments = await cursor.toArray();
            console.log('Appointments found');
            res.send(appointments);
        });

        // change appointment status
        app.put('/appointments', async (req, res) => {
            const user = req.body;
            const filter = { _id: ObjectId(user.id) };
            const updateDoc = { $set: { status: user.status } };
            const result = await appointmentsCollection.updateOne(
                filter,
                updateDoc
            );
            console.log('appointment status successfully changed');
            res.json(result);
        });

        // update appointments api
        app.put('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const updateAppointment = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateAppointment.name,
                    department: updateAppointment.department,
                    date: updateAppointment.date,
                    time: updateAppointment.time,
                    phone: updateAppointment.phone,
                },
            };
            const result = await appointmentsCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            console.log('Appointment updated');
            res.json(result);
        });

        // get orders api
        app.get('/orders', async (req, res) => {
            const email = req?.query?.email;
            if (email) {
                const query = { email };
                const cursor = ordersCollection.find(query);
                const orders = await cursor.toArray();
                console.log('single user order found');
                res.json(orders);
            } else {
                const cursor = ordersCollection.find({});
                const orders = await cursor.toArray();
                console.log('orders found');
                res.json(orders);
            }
        });

        // save order api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log('order done');
            res.json(result);
        });

        // change order status
        app.put('/orders', async (req, res) => {
            const data = req.body;
            const filter = { _id: ObjectId(data.id) };
            const updateDoc = { $set: { status: data.status } };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            console.log('Order status successfully changed');
            res.json(result);
        });

        // delete order api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('Order deleted');
            res.json(result);
        });

        // delete appointments api
        app.delete('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await appointmentsCollection.deleteOne(query);
            console.log('Appointment deleted');
            res.json(result);
        });

        // get user api
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            console.log('Users found');
            res.send(users);
        });

        // get user api
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            console.log('Users found');
            res.send(users);
        });

        // save user api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log('users data saved');
            res.json(result);
        });

        // update user api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            console.log('update user data');
            res.json(result);
        });

        // check admin api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'Admin') {
                isAdmin = true;
            }
            console.log('admin : ', isAdmin);
            res.json({ admin: isAdmin });
        });

        // make admin api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: user.role } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log('admin makes successfully');
            res.json(result);
        });

        // get reviews api
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            console.log('reviews found');
            res.send(reviews);
        });

        // change reviews status
        app.put('/reviews', async (req, res) => {
            const data = req.body;
            const filter = { _id: ObjectId(data.id) };
            const updateDoc = { $set: { status: data.status } };
            const result = await reviewCollection.updateOne(filter, updateDoc);
            console.log('Review status successfully changed');
            res.json(result);
        });

        // save review api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log('review added');
            res.json(result);
        });

        // delete review api
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            console.log('Review deleted');
            res.json(result);
        });

        // save special user api
        app.put('/special-users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await specialUsersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            console.log('update special user data');
            res.json(result);
        });

        // get special user api
        app.get('/special-users', async (req, res) => {
            const cursor = specialUsersCollection.find({});
            const users = await cursor.toArray();
            console.log('Special users found');
            res.send(users);
        });

        // change special-users status
        app.put('/special-users', async (req, res) => {
            const data = req.body;
            const filter = { _id: ObjectId(data.id) };
            const updateDoc = { $set: { specialUser: data.specialUser } };
            const result = await specialUsersCollection.updateOne(
                filter,
                updateDoc
            );
            console.log('Special-users status successfully changed');
            res.json(result);
        });

        console.log('database connection ok');
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to MediCare!');
});

app.listen(port, () => {
    console.log(`Mobile server listening at :${port}`);
});
