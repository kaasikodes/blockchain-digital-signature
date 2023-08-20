const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const utils = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "02c2bffd4d5248862e72cde4b10111bcb71dff945de08150ec822f2eb6f293cb56": 100,
  "0365184934e6e71418a4426b2a4d7f2b8a3a06c2a8074817005372a5741a1f0754": 50,
  "02b47c4f61006af00dd99d3c38377a9dc653ca3fcc7523fd89c8221da6b0ba05d8": 75,
  "02ec2f2f9f28c1232d6ba88d48a2f210b6c4f0018c115d475a13d5e3be77637ff8": 25,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, msgHash } = req.body;
  if (
    secp.secp256k1.verify(unSerializeSignature(signature), msgHash, sender) ===
    false
  ) {
    return res.status(400).send({ message: "Invalid Signature" });
  }
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);

  // Generate private and public key array for testing
  const keys = Array(4)
    .fill(0)
    .map(() => ({
      privateKey: utils.toHex(secp.secp256k1.utils.randomPrivateKey()),
    }))
    .map((item) => ({
      ...item,
      publicKey: utils.toHex(
        secp.secp256k1.getPublicKey(item.privateKey, true)
      ),
    }));
  keys.forEach((item) => {
    // Print out values : private & public key pair
    console.log(item);
  });
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

const unSerializeSignature = (serializedSignature) => {
  return {
    r: BigInt(JSON.parse(serializedSignature).r),
    s: BigInt(JSON.parse(serializedSignature).s),
    recovery: JSON.parse(serializedSignature).recovery,
  };
};
