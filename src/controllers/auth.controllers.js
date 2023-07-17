import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { db } from "../database/database.connection.js";

export async function signUp(req, res) {
  const { name, email, password } = req.body;

  password = bcrypt.hashSync(password, 10);

  try {
    const validUser = await db.collection("users").findOne({ email: email });
    if (validUser) return res.status(409).send("E-mail address is already used!");

    await db.collection("users").insertOne({ name: name, email: email, password: password });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function signIn(req, res) {
  const { email, password } = req.body;

  try {
    const user = await db.collection("users").findOne({ email: email });
    if (!user) return res.status(404).send("User not found");

    const passwordValidation = bcrypt.compareSync(password, user.password);
    if (!passwordValidation) return res.status(401).send("Wrong password");

    await db.collection("sessions").deleteOne({ id: user._id });
    const token = uuid();
    await db.collection("sessions").insertOne({ id: user._id, token });

    res.status(200).send({ name: user.name, token });
  } catch (err) {
    res.status(500).send(err.message);
  }
}
