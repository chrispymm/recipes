const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const { Recipe } = require('cooklang');
const lodash = require('lodash');


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
    console.log(allCategories);
    categories = [...new Set(allCategories)].map((category) => ({ title: category }));
    console.log(categories)
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

  return {
    dir: {
      inludes: "_includes",
      layouts: "_includes",
    },
  };
};
