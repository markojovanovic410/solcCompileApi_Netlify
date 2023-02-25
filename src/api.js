"use strict";
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const solc = require("solc");

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

function solcCompile(data) {
  if (!data.code || data.code == "") {
    return { result: -1, error: "Need contract code!" };
  }
  let eo = true;
  let oa = 200;
  if (data.eo && data.eo == "false") eo = false;
  if (data.oa) oa = parseInt(data.oa);
  const input = {
    language: "Solidity",
    sources: {
      a: {
        content: data.code,
      },
    },
    settings: {
      optimizer: {
        enabled: eo,
        runs: oa,
      },
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.contracts) {
    return {
      result: 1,
      abi: output.contracts.a.SimpleStorage.abi,
      bytecode: output.contracts.a.SimpleStorage.evm.bytecode.object,
    };
  } else {
    return { result: 0, error: output.errors };
  }
  return result;
}

// Define a route that responds with a JSON object when a GET request is made to the root path
router.get("/", (req, res) => {
  res.json({
    hello: "hi!"
  });
});

router.post("/solc-compile", (req, res) => {
  const result = solcCompile(req.body);
  res.json(result);
});

app.use(`/.netlify/functions/api`, router);

// Export the app and the serverless function
module.exports = app;
module.exports.handler = serverless(app);