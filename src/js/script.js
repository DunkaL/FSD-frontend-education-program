// import $ from 'jquery'; window.jQuery = $; window.$ = $ // import module example (npm i -D jquery)
// require('./vendor/jquery.js') // require Other Script(s) from script/js folder Example

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#hamburger').addEventListener('click', () => {
      document.querySelector('#hamburger').classList.toggle('menu-active');
    });
    
    // custom js
});