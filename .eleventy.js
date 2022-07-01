const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const lodash = require('lodash');
const { parseIngredient } = require('parse-ingredient');
const { formatQuantity } = require('format-quantity');

module.exports = function(eleventyConfig) {

  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: "dynamic", // The serverless function name from your permalink object
    functionsDir: "./netlify/functions/",
    copy: [
      // files/directories that start with a dot
      // are not bundled by default
      { from: ".cache", to: "cache" }
    ],
  });

  eleventyConfig.addWatchTarget("./recipes/");

  eleventyConfig.addPassthroughCopy("assets/");
  eleventyConfig.addCollection("categories", function(collectionApi) {
    let recipes = collectionApi.getFilteredByTag('recipes');
    //console.log(recipes);
    let allCategories = recipes.map((recipe) => recipe.data.categories ); 

    allCategories = lodash.flattenDeep(allCategories)
                          .map((item) => item.toLowerCase().trim());
    categories = [...new Set(allCategories)].map((category) => ({ title: category }));
    return categories;
  });


  eleventyConfig.addFilter("include", function(arr, path, value) {
    value = lodash.deburr(value).toLowerCase();
    return arr.filter((item) => {
      let pathValue = lodash.get(item, path); 
      if(!pathValue) {
        return false;
      }
      pathValue = lodash.deburr(pathValue).toLowerCase();
      return pathValue.includes(value);
    }); 
  });

  eleventyConfig.addFilter("parseIngredient", function(value) {
    return parseIngredient(value)?.shift();
  });

  eleventyConfig.addFilter("fractionize", function(value, vulgar = true) {
    return formatQuantity(value, vulgar);
  })

  return {
    dir: {
      inludes: "_includes",
      layouts: "_includes",
    },
  };
};
