const { parse } = require('recipe-ingredient-parser-v2');
const slugify = require('slugify');

class Recipe {
    constructor(data, source) {
        this.categories = [];
        this.times = {};
        this.ingredients = [];
        this.steps = [];

        if(source == 'file') {
            this.fromFile(data);
        }

        if(source == 'json') {
            this.fromJson(data);
        }
    }

    fromFile(data) {
        this.title = data.metadata.title || '';
        this.slug = this.strToSlug(this.title);
        this.servings = data.metadata.servings || 0;
        this.categories = data.metadata.categories ? data.metadata.categories.split(',') : [];
        
        if( Array.isArray(data.steps)) {
            this.steps = data.steps.map( (step) => { 
                let formattedStep = {
                  ingredients: [],
                  times: [],
                };
                

                formattedStep.text = step.reduce( (str, entry) => {
                    if(entry.type == 'text') {
                         return str + entry.value
                    } else {
                        return str + entry.name
                    }
                }, '');
                
                formattedStep.ingredients = step.filter( (entry) => entry.type == 'ingredient')
                                                .map( (entry) => {
                                                    return {
                                                        quantity: entry.quantity,
                                                        unit: entry.units,
                                                        ingredient: entry.name,
                                                    };
                                                });

                formattedStep.times = step.filter( (entry) => entry.type == 'timer')
                                          .map( (entry) => {
                                              return `${entry.quantity} ${entry.units}`;
                                          });
                // TODO - the key should probably be formattedStep.time, and the
                // above be a reduce() doing the maths to add up all timers
                // within the step

                formattedStep.ingredients.forEach((ingredient) => {
                    this.ingredients.push(ingredient);
                });

                //console.log(formattedStep);
                return formattedStep;
            });
        }
        
        this.steps.forEach((step) => {
            // total up the time for all step and set it on the Recipe
            //this.times.cook = DO CALCULATION HERE
        })


    }

    fromJson(data) {
        this.title = data.name || '';
        this.slug = this.strToSlug(this.title);
        this.servings = data.recipeYield;
        this.categories = data.recipeCategory.split(',');
        this.times.prep = data.prepTime || 0;
        this.times.cook = data.cookTime || 0;
        this.times.perform = data.performTime || 0;
        this.times.total = data.totalTime || 0;

        if(Array.isArray( data.recipeIngredient)) {
            for( const ingredient of data.recipeIngredient) {
                if(ingredient) {
                    this.ingredients.push( parse(ingredient) );
                }
            }
        }

        if(Array.isArray( data.recipeInstructions )) {
            for(const step of data.recipeInstructions ){
                this.steps.push( { text: step.text });
            }
        }
    }

    strToSlug(string) {
        return slugify(string, {
            replacement: "-",
            remove: /[&,+()$~%.'":*?<>{}]/g,
            lower: true,
        });
    }

}
module.exports = Recipe;
