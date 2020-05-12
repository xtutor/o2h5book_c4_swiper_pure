require('../index.html')
require('../css/package.scss')

var Swiper = require('./Swiper')

new Swiper('.swiper-container', {
  navigation: {
    prevEl: '.prev-btn',
    nextEl: '.next-btn'
  }
})

// 禁止微信下拉
$(document.body).on('touchmove', function (event) {
  event.preventDefault()
})
