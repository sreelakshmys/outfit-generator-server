# Outfit Generator API Guide

## Table of Contents

- [GET a random outfit](http://localhost:8000/surpriseme)

### GET a random outfit

| URL                                                                           | Method |
| ----------------------------------------------------------------------------- | ------ |
| https://outfit-generator-server.herokuapp.com/surpriseme/:gender/:countryCode | `GET`  |

Returns a random outfit for the gender category which gender matches the ${gender} and country matches ${countryCode} provided in the URL.
Required: country and gender values

The random outfit generated  consists of an underwear, outerwear and an accessory. The data is fetched from the NEWYORKER API.

