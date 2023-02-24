"use strict";
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");

function solcCompile(data) {
  if (!data.code || data.code == "") {
    res.json({ result: -1, error: "Need contract code!" });
    return;
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
    res.json({
      result: 1,
      abi: output.contracts.a.SimpleStorage.abi,
      bytecode: output.contracts.a.SimpleStorage.evm.bytecode.object,
    });
  } else {
    res.json({ result: 0, error: output.errors });
  }
  return result;
}

app.use(bodyParser);
app.post("/solc-compile", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  const result = solcCompile(req.body);
  res.json(result);
});

module.exports.handler = serverless(app);
