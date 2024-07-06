import * as langTs from './lang_ts.mjs'

import * as changeCase from "change-case";

const Mustache = require('mustache');
const Wax = require('@jvitela/mustache-wax');

Wax(Mustache);
Mustache.Formatters = {
  json_stringify: object => JSON.stringify(object, null, 2),
  camel_case: text => changeCase.camelCase(text), // 	twoWords
  capital_case: text => changeCase.capitalCase(text), // 	Two Words
  constant_case: text => changeCase.constantCase(text), // 	TWO_WORDS
  dot_case: text => changeCase.dotCase(text), // 	two.words
  kebab_case: text => changeCase.kebabCase(text), // 	two-words
  no_case: text => changeCase.noCase(text), // 	two words
  pascal_case: text => changeCase.pascalCase(text), // 	TwoWords
  pascal_snake_case: text => changeCase.pascalSnakeCase(text), // 	Two_Words
  path_case: text => changeCase.pathCase(text), // 	two/words
  sentence_case: text => changeCase.sentenceCase(text), // 	Two words
  snake_case: text => changeCase.snakeCase(text), // 	two_words
  train_case: text => changeCase.trainCase(text), // 	Two-Words
  upper_case: text => text ? text.toUpperCase() : text, // TWO WORDS
  lower_case: text => text ? text.toLowerCase() : text, // two words
};


export async function render(lifecycle, language) {
  switch (language) {
    case 'JS':
    case 'TS':
    case 'JAVASCRIPT':
    case 'TYPESCRIPT': {
      await langTs.render(lifecycle);
    }
  }
}
