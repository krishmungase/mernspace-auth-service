import express from "express"

const app = express();

app.get('/',(req,res) => {
  res.send("Welcome to this course");
})

export default app