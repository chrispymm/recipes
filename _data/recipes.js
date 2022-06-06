const fetch = require('node-fetch');
const EleventyFetch = require("@11ty/eleventy-fetch");
const parse = require('node-html-parser').parse;
//const CookLangRecipe = require('cooklang').Recipe;
const CookLangRecipe = require('@cooklang/cooklang-ts').Recipe;
const fs = require('fs');
const fastglob = require('fast-glob'); 
const Recipe = require('./../utils/Recipe');
const slugify = require('slugify');
const lodash = require('lodash');



let urls = [
  //'https://alittlebityummy.com/recipe/en-gb/low-fodmap-yummy-paprika-chicken-traybake-2/',
  'https://www.bbcgoodfood.com/recipes/easy-butter-chicken',
  'https://www.asaucykitchen.com/low-fodmap-thai-green-curry/',
  'https://www.asaucykitchen.com/sweet-and-sour-chicken-paleo-low-fodmap/',
  'https://alittlebityummy.com/recipe/en-gb/low-fodmap-sweet-sticky-salmon-skewers-2/',
];

let recipes =[];

const getRecipesFromFiles = async () => {
  // Create a "glob" of all feed json files
  const recipeFiles = await fastglob("./recipes/*.cook", {
    caseSensitiveMatch: false,
  });

  //console.log(recipeFiles);

  // Loop through those files and add their content to our `feeds` Set
  for (let recipeFile of recipeFiles) {
    const recipeText = fs.readFileSync(recipeFile).toString();
    const recipeObj = new CookLangRecipe(recipeText);
    //console.log({ 'parsedRecipe': recipeObj });
    const recipeData = new Recipe(recipeObj, 'file');
    
    recipes.push(recipeData);
  }
};

const parseRecipe = async (url) => {
  let options = {
    duration: "*",
      type: "text", 
      removeUrlQueryParams: true,

  };

  if(process.env.ELEVENTY_SERVERLESS) {
    // Infinite duration (until the next build)
    options.duration = "*";
    // Instead of ".cache" default because files/directories
    // that start with a dot are not bundled by default
    options.directory = "cache";
  }

  return await new Promise( (resolve) => {
    EleventyFetch(url, options).then((responseHtml) => {
  
        const document = parse(responseHtml);
        const structuredData = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        const structuredDataJson = structuredData.map((node) => JSON.parse(node.innerHTML)).flat();
       // Look for a Recipe schema and return its ingredients if it exists     
        const recipeData = structuredDataJson.find((schema) => schema["@type"] == "Recipe")
        // console.log(recipeData);
        resolve( recipeData );
      })
  }).catch(() => {
    return Promise.resolve([]);
  });
}

const extractCategories = (recipes) => {
  let allCategories = recipes.map((recipe) => recipe.categories ); 

    allCategories = lodash.flattenDeep(allCategories)
                          .map((item) => item.toLowerCase().trim());
    categories = [...new Set(allCategories)].map((category) => ({ 
      title: category,
      slug: strToSlug(category),  
  }));

    return categories;
}

strToSlug = (string) => {
    return slugify(string, {
        replacement: "-",
        remove: /[&,+()$~%.'":*?<>{}]/g,
        lower: true,
    });
}



module.exports = async () => {

  await getRecipesFromFiles();

  for( const url of urls ) {
    recipeJson = await parseRecipe(url);
    recipeData = new Recipe(recipeJson, 'json');
    recipes.push(recipeData);
  }

  categories = extractCategories(recipes);
  return {
    recipes: recipes,
    categories: categories,
  }
}
