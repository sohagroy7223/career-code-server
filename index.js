const express = require("express");
require("dotenv").config();
// import { MongoClient } from "mongodb";
const { MongoClient } = require("mongodb");
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

    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
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
