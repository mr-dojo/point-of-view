'use strict';

const DATA = ['test string', 'test value']

function handleFormSubmit() { 
  $('.js-searchbar').submit(event => {
    event.preventDefault();
    const input = $('.js-search-input').val().toLowerCase();

    createNews(input);
    renderResults(DATA);
  })
}

function createNews(input) {
  requestNews(createURL(input));
  console.log("requestNews ran & the value is '" + input + "'");
}

function createURL(input) {
  return input + "url-string"
}

function requestNews(url) {
  console.log(url);
}

function renderResults(DATA) {
  console.log("renderResults ran and the result data is '" + DATA + "'");
}

function handleEntitySelect() {
}

function handleSortHistory() {
}

function startApp() {
  handleFormSubmit();
  handleEntitySelect();
  handleSortHistory();
}

$(startApp);