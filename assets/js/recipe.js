import { parse }from '/assets/js/tinyduration/index.js';

export class Recipe {
    constructor() {
        this.title = '';
        this.source - '';
        this.categories = [];
        this.times = {};
        this.ingredients = [];
        this.steps = [];
    }

    setProperty(property, value) {
        this[property] = value;
        return this;
    }

    fromJson(data) {
        this.title = data.name || '';
        this.serves = data.recipeYield;
        this.categories = data.recipeCategory.split(',').map( (item) => item.trim() );
        this.times.prep = this.formatDuration(data.prepTime) || 0;
        this.times.cook = this.formatDuration(data.cookTime) || 0;
        this.times.perform = this.formatDuration(data.performTime) || 0;
        this.times.total = this.totalDuration([data.prepTime, data.cookTime, data.performTime]) || 0;

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
categories: ${this.yamlList(this.categories)}
times:
  prep: ${this.times.prep}
  cook: ${this.times.cook}
  perform: ${this.times.perform }
  total: ${this.times.total} 
serves: ${this.serves}
ingredients: ${this.yamlList(this.ingredients)}
steps: ${this.yamlList(this.steps)}
source: ${this.source}
---
`
    }

    yamlList(array){
        return '\r\n' + array.map( (item) => { 
            return `  - ${item}`;
        }).join('\r\n');
    }

    formatDuration(duration) {
        if(!duration) {
            return '';
        }
        const parsed = parse(duration);
        return this.humanDurationString(parsed);
    }

    totalDuration(durations) {
        let total;
        durations.filter( (duration) => duration ).forEach((duration, index) => {
            duration = parse(duration);
            if(index === 0) {
                total = duration;
            } else {
                for(const [key, value] of Object.entries(duration)) {
                    total[key] = ( total[key] || 0 ) + (value || 0)
                }
            }
        })
        return this.humanDurationString(total);
    }
    
    humanDurationString(object) {
        let durationString = '' 
        if(object.hours) {
            durationString += `${object.hours} hr${(object.hours > 1 ? 's' : '')} `;
        }
        if(object.minutes) {
            durationString += `${object.minutes} min${(object.minutes > 1 ? 's' : '')}` ;
        }
        return durationString;
    }

    
}
