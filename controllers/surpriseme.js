const fetch = require("node-fetch");
require("dotenv").config();

const getRandomOutfit = async (req, res) => {
  const { gender, countryCode } = req.params;
  if (gender !== "FEMALE" && gender !== "MALE")
    return res.status(500).send("Invalid category");

  try {
    const response = await fetch(
      `https://api.newyorker.de/csp/products/public/query?filters[country]=${countryCode}&filters[gender]=${gender}`
    );
    const jsonData = await response.json();

    // Check if data is present before performing other operations
    if (jsonData?.items.length === 0) {
      res.status(404).json(jsonData);
      return;
    }

    const groupedArray = await groupByMaintenanceGroup(
      jsonData?.items,
      "maintenance_group"
    );

    const outfitArray = [];
    while (outfitArray.length < 1) {
      let productObject = { outerWear: [], underWear: [], accessories: [] };
      await getRandomOuterWearOutfits(groupedArray, productObject);
      getRandomUnderWearOutfits(groupedArray, productObject);
      await getRandomAccessories(gender, productObject);
      outfitArray.push(productObject);
    }

    await res.status(200).json(outfitArray);
  } catch (error) {
    console.log(error);
  }
};

// This method groups the data by maintenance_group which will make it easier for further operations
const groupByMaintenanceGroup = (inputArray, key) => {
  return inputArray.reduce((accumulator, currentValue) => {
    let maintenanceGroup = [currentValue[key]][0].toLowerCase();
    if (
      !maintenanceGroup.includes("underwear") &&
      (maintenanceGroup.includes("top") || maintenanceGroup.includes("shirt"))
    ) {
      accumulator["TopWear"] = [
        ...(accumulator["TopWear"] || []),
        currentValue,
      ];
    } else if (
      !maintenanceGroup.includes("swim") &&
      (maintenanceGroup.includes("pant") ||
        maintenanceGroup.includes("short") ||
        maintenanceGroup.includes("skirt") ||
        maintenanceGroup.includes("jean"))
    ) {
      accumulator["BottomWear"] = [
        ...(accumulator["BottomWear"] || []),
        currentValue,
      ];
    } else if (maintenanceGroup.includes("underwear")) {
      if (
        maintenanceGroup.includes("bra") ||
        maintenanceGroup.includes("top")
      ) {
        accumulator["UnderWearTopWear"] = [
          ...(accumulator["UnderWearTopWear"] || []),
          currentValue,
        ];
      } else {
        accumulator["UnderWearBottomWear"] = [
          ...(accumulator["UnderWearBottomWear"] || []),
          currentValue,
        ];
      }
    } else if (maintenanceGroup.includes("swimwear")) {
      if (maintenanceGroup.includes("bra")) {
        accumulator["SwimWearTopWear"] = [
          ...(accumulator["SwimWearTopWear"] || []),
          currentValue,
        ];
      } else {
        accumulator["SwimWearBottomWear"] = [
          ...(accumulator["SwimWearBottomWear"] || []),
          currentValue,
        ];
      }
    } else {
      accumulator[currentValue[key]] = [
        ...(accumulator[currentValue[key]] || []),
        currentValue,
      ];
    }
    return accumulator;
  }, []);
};

// Method to generate a random value
const randomValueGenerator = (array) => {
  return Math.floor(Math.random() * array.length);
};

// Method to generate random outer wear outfits
const getRandomOuterWearOutfits = (groupedArray, productObject) => {
  try {
    const keyValues = Object.keys(groupedArray).filter(
      (keyItem) =>
        keyItem !== "UnderWearTopWear" &&
        keyItem !== "UnderWearBottomWear" &&
        keyItem != "Accessoires Shoe" &&
        keyItem != "Accessoires Bags"
    );
    const randomOutfitCategory = keyValues[randomValueGenerator(keyValues)];

    if (
      randomOutfitCategory === "TopWear" ||
      (randomOutfitCategory === "BottomWear" &&
        groupedArray?.TopWear &&
        groupedArray?.BottomWear)
    ) {
      const randomTopWear =
        groupedArray?.TopWear[randomValueGenerator(groupedArray?.TopWear)];
      const randomBottomWear =
        groupedArray?.BottomWear[
          randomValueGenerator(groupedArray?.BottomWear)
        ];
      productObject.outerWear.push(randomTopWear);
      productObject.outerWear.push(randomBottomWear);
    } else if (
      (groupedArray?.SwimWearTopWear &&
        groupedArray?.SwimWearBottomWear &&
        randomOutfitCategory === "SwimWearTopWear") ||
      randomOutfitCategory === "SwimWearBottomWear"
    ) {
      // no topwear for men, so check if the obj property exists
      if (groupedArray?.SwimWearTopWear !== undefined) {
        const randomSwimTopWear =
          groupedArray?.SwimWearTopWear[
            randomValueGenerator(groupedArray?.SwimWearTopWear)
          ];
        productObject.outerWear.push(randomSwimTopWear);
      }
      const randomSwimBottomWear =
        groupedArray?.SwimWearBottomWear[
          randomValueGenerator(groupedArray?.SwimWearBottomWear)
        ];
      productObject.outerWear.push(randomSwimBottomWear);
    } else {
      if (randomOutfitCategory != undefined) {
        const randomOutfit =
          groupedArray[randomOutfitCategory][
            randomValueGenerator(groupedArray[randomOutfitCategory])
          ];
        productObject.outerWear.push(randomOutfit);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// Method to get random under wear outfits
const getRandomUnderWearOutfits = (groupedArray, productObject) => {
  if (groupedArray?.UnderWearTopWear) {
    const randomUnderWearTopWear =
      groupedArray?.UnderWearTopWear[
        randomValueGenerator(groupedArray?.UnderWearTopWear)
      ];
    const randomUnderWearBottomWear =
      groupedArray?.UnderWearBottomWear[
        randomValueGenerator(groupedArray?.UnderWearBottomWear)
      ];
    productObject.underWear.push(randomUnderWearTopWear);
    productObject.underWear.push(randomUnderWearBottomWear);
  }
};

// Method to get random accessories
const getRandomAccessories = async (gender, productObject) => {
  try {
    const URL =
      gender === "FEMALE"
        ? process.env.URL_WOMEN_ACCESSORIES
        : process.env.URL_MEN_ACCESSORIES;
    const response = await fetch(URL);
    const accessoriesForWomen = await response.json();

    if (accessoriesForWomen) {
      const randomAccessory =
        accessoriesForWomen?.items[
          randomValueGenerator(accessoriesForWomen?.items)
        ];
      productObject.accessories.push(randomAccessory);
    }
  } catch (error) {
    console.log(`Error while fetching accessories for ${gender}`);
    console.log(error);
  }
};
module.exports = { getRandomOutfit };
