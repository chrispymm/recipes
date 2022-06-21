
export class Recipe {
    constructor() {
        this.categories = [];
        this.times = {};
        this.ingredients = [];
        this.steps = [];
    }

    fromJson(data) {
        this.title = data.name || '';
        this.serves = data.recipeYield;
        this.categories = data.recipeCategory.split(',').map( (item) => item.trim() );
        this.times.prep = data.prepTime || 0;
        this.times.cook = data.cookTime || 0;
        this.times.perform = data.performTime || 0;
        this.times.total = data.totalTime || 0;

        if(Array.isArray( data.recipeIngredient)) {
            for( const ingredient of data.recipeIngredient) {
                if(ingredient) {
                    this.ingredients.push( ingredient );
                }
            }
        }

        if(Array.isArray( data.recipeInstructions )) {
            for(const step of data.recipeInstructions ){
                this.steps.push( step.text );
            }
        }
        return this;
    }

    toYaml() {
        return `---
title: ${this.title}
source: 
categories: ${this.yamlList(this.categories)}
times:
  prep: ${this.times.prep}
  cook: ${this.times.cook}
  perform: ${this.times.perform }
  total: 
serves: ${this.serves}
ingredients: ${this.yamlList(this.ingredients)}
steps: ${this.yamlList(this.steps)}
---
`
    }

    yamlList(array){
        return '\r\n' + array.map( (item) => { 
            return `  - ${item}`;
        }).join('\r\n');
    }

    
}
