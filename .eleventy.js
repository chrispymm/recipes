const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const { Recipe } = require('cooklang');
const lodash = require('lodash');


module.exports = function(eleventyConfig) {

  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: "dynamic", // The serverless function name from your permalink object
    functionsDir: "./netlify/functions/",
  });

  eleventyConfig.addWatchTarget("./recipes/");

  // eleventyConfig.addCollection("categories", function(collectionApi) {
  //   let recipeTemplate = collectionApi.getFilteredByTag('recipe')[0];
  //   let recipes =  recipeTemplate.data.recipes;

  //   let allCategories = recipes.map((recipe) => recipe.categories ); 

  //   allCategories = lodash.flattenDeep(allCategories)
  //                         .map((item) => item.toLowerCase().trim());
  //   categories = [...new Set(allCategories)].map((category) => ({ title: category }));

  //   return categories;
  // });

  eleventyConfig.addFilter("include", function(arr, path, value) {
    value = lodash.deburr(value).toLowerCase();
    return arr.filter((item) => {
      let pathValue = lodash.get(item, path);
      pathValue = lodash.deburr(pathValue).toLowerCase();
      return pathValue.includes(value);
    }); 
  });

  return {
    dir: {
      inludes: "_includes",
      layouts: "_includes",
    },
  };
};
