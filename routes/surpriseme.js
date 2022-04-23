const express = require("express");
const { getRandomOutfit } = require("../controllers/surpriseme");

const router = express.Router();

router.get("/:gender/:countryCode", getRandomOutfit);

module.exports = router;
