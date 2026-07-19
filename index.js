const express = require("express");
require("dotenv").config();
// import { MongoClient } from "mongodb";
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@crud-practice-cluster.l3ixzxm.mongodb.net/?appName=crud-practice-cluster`,
);

async function connectToMongoDB() {
  try {
    await client.connect();
    const careerDB = client.db("careerCodeDB");
    const jobsCollection = careerDB.collection("jobs");
    const usersCollection = careerDB.collection("users");
    const favoriteJobCollection = careerDB.collection("favoriteJob");

    // user related APIS
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return console.log({ message: "this user already exist" });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    // Jobs Related APIS
    app.get("/jobs", async (req, res) => {
      const { limit = 0, skip = 0, search = "" } = req.query;
      // console.log(limit, skip, search);

      const query = {};

      if (search) {
        query.title = {
          $regex: search,
          $options: "i",
        };
      }

      const cursor = jobsCollection
        .find(query)
        .project({
          company_log: 1,
          title: 1,
          company: 1,
          jobType: 1,
          workplace: 1,
          location: 1,
        })
        .limit(Number(limit))
        .skip(Number(skip));
      const Jobs = await cursor.toArray();
      const count = await jobsCollection.countDocuments(query);
      res.send({ Jobs, total: count });
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.get("/all-company", async (req, res) => {
      const cursor = jobsCollection.find().project({ company_log: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/popular-jobs", async (req, res) => {
      const result = await jobsCollection
        .find({ popular: true })
        .sort({ experience: -1 })
        .limit(5)
        .project({ title: -1, company: -1, category: -1, image: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/featured-jobs", async (req, res) => {
      const result = await jobsCollection
        .find({ featured: true })
        .sort({ experience: 1 })
        .limit(4)
        .project({
          title: -1,
          company: -1,
          // category: -1,
          location: -1,
          company_log: -1,
          workplace: -1,
          jobType: -1,
        })
        .toArray();
      res.send(result);
    });

    // favorite job related apis
    app.post("/favoriteJob", async (req, res) => {
      const favJob = req.body;
      const exist = await favoriteJobCollection.findOne({
        email: favJob.email,
        jobId: favJob._id,
      });
      if (exist) {
        return res.send({ message: "this job already exist" });
      }
      const result = await favoriteJobCollection.insertOne(favJob);
      res.send(result);
    });

    // 404 page
    app.all(/.*/, (req, res) => {
      res.status(404).json({
        status: 404,
        error: "API not found",
      });
    });

    console.log("You successfully connected to MongoDB!");
    return client;
  } finally {
  }
}
connectToMongoDB().catch((err) => {
  console.dir("error h", err);
});

// Call this only when your application terminates
// export async function disconnectFromMongoDB() {
//   await client.close();
// }

app.get("/", (req, res) => {
  res.send("career code run on this port");
});

app.listen(port, () => {
  console.log(`career server run this port: ${port}`);
});
