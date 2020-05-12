
var Utils = require('./utils')

function Swiper (el, options) {
  options = $.extend({
    navigation: {}
  }, options)

  this.$swiper = $(el)
  if (this.$swiper.length < 1) {
    return
  }

  this.$swiperWrapper = this.$swiper.find(options.wrapperClass || '.swiper-wrapper')
  this.$swiperItem = this.$swiperWrapper.find(options.slideClass || '.swiper-slide')
  this.$prevBtn = $(options.navigation.prevEl)
  this.$nextBtn = $(options.navigation.nextEl)
  this.$indexInput = $('.index-input')
  this.swiperCount = this.$swiperItem.length
  this.activeIndex = 0
  this.swiperHeight = this.$swiper.height()
  this.animating = false
  this.translate = -this.activeIndex * this.swiperHeight
  this.velocityThreshold = 0.3
  this.distanceThreshold = this.swiperHeight / 2
  this.panDistanceInTransitionEnd = 0
  this.defaultSpeed = 0.3

  this.bindEvents()
}

Swiper.prototype = {
  bindEvents: function () {
    var _this = this
    var drag = false
    var y0 = 0
    var deltaY = 0
    var time0 = 0

    this.$swiperWrapper.on('transitionend webkitTransitionEnd', this.transitionEndHandle.bind(this))

    this.$swiper.on(Utils.isMobile ? 'touchstart' : 'mousedown', function (ev) {
      // 开发中发现：transitionend 在某些情况下未被触发，导致 animating 一直为 true，从而拒绝用户响应
      // 因此，需要获取当前 translateY 的值，判断其是否处于 activeIndex 的初始位置，若是则代表过渡完毕
      var translate = Utils.getTranslate(_this.$swiperWrapper[0], 'y')
      if (translate === -_this.activeIndex * _this.swiperHeight) {
        drag = _this.$swiper
        y0 = _this.getFirstFingerY(ev)
        time0 = new Date()
        _this.animating = false
      } else {
        drag = false
      }
    })
    this.$swiper.on(Utils.isMobile ? 'touchend' : 'mouseup', function (ev) {
      drag = false
      var interval = new Date() - time0
      _this.panEnd(deltaY, deltaY / interval)
    })
    this.$swiper.on(Utils.isMobile ? 'touchmove' : 'mousemove', function (ev) {
      if (drag) {
        deltaY = _this.getFirstFingerY(ev) - y0
        _this.pan(deltaY)
      }
    })

    this.$prevBtn.on('click', function () {
      _this.slidePrev()
    })
    this.$nextBtn.on('click', function () {
      _this.slideNext()
    })
    this.$indexInput.on('input', function (ev) {
      var inputVal = $(ev.currentTarget).val()

      if (inputVal >= 0 && inputVal <= _this.swiperCount - 1) {
        _this.slideTo(inputVal)
      }
    })
  },
  getFirstFingerY (ev) {
    return Utils.isMobile ? ev.touches[0].pageY : event.pageY
  },
  pan: function (deltaY) {
    if (this.animating) {
      // 过渡未完成时，就产生拖拽的距离
      // 处理首屏频繁多次往下拖拽或最后一屏往上拖拽的问题
      this.panDistanceInTransitionEnd = ev.deltaY

      return
    }
    this.panSwiper(deltaY)
  },
  panSwiper: function (deltaY) {
    // 当前活跃块的位移 + 拖拽距离 - 过渡未完成时就产生拖拽的距离
    var curOffset = -this.activeIndex * this.swiperHeight
    var finalOffset = curOffset + deltaY - this.panDistanceInTransitionEnd

    this.$swiperWrapper.css({
      '-webkit-transform': 'translate3d(0, '+ finalOffset + 'px, 0)',
      'transform': 'translate3d(0, '+ finalOffset + 'px, 0)',
      '-webkit-transition': 'none',
      'transition': 'none'
    })
  },
  panEnd: function (deltaY, velocity) {
    if (this.animating) return

    this.panDistanceInTransitionEnd = 0
    var deltaY = deltaY
    var absDeltaY = Math.abs(deltaY)
    var absVelocity = Math.abs(velocity)

    if (deltaY > 0 && this.activeIndex > 0) {
      // 判断滑动距离和滑动速度是否满足指定条件
      if (absDeltaY >= this.distanceThreshold
          || absVelocity >= this.velocityThreshold) {
        // 满足则 prev
        this.slidePrev()
      } else {
        // 不满足则回弹到原来位置
        this.slideTo(this.activeIndex)
      }
    } else if (deltaY < 0 && this.activeIndex < this.swiperCount - 1) {
      if (absDeltaY >= this.distanceThreshold
          || absVelocity >= this.velocityThreshold) {
        this.slideNext()
      } else {
        this.slideTo(this.activeIndex)
      }
    } else {
      this.slideTo(this.activeIndex)
    }
  },
  transitionEndHandle: function (ev) {
    if (['transform', 'webkitTransform'].indexOf(ev.propertyName) !== -1) {
      this.animating = false
    }
  },
  slideTo: function (index, speed) {
    var offset = -(index || this.activeIndex) * this.swiperHeight
    var speed = typeof speed === 'undefined' ? this.defaultSpeed : speed
    this.activeIndex = index || this.activeIndex

    if (speed > 0) {
      this.animating = true
    }
    this.translate = offset
    this.$swiperWrapper.css({
      '-webkit-transform': 'translate3d(0, '+ offset +'px, 0)',
      'transform': 'translate3d(0, '+ offset +'px, 0)',
      '-webkit-transition': 'transform '+ speed +'s',
      'transition': 'transform '+ speed +'s'
    })
  },
  slidePrev: function (speed) {
    if (this.animating || this.activeIndex <= 0) return

    this.activeIndex--
    if (this.activeIndex < 0) {
      this.activeIndex = 0
    }
    this.slideTo(this.activeIndex, speed)
  },
  slideNext: function (speed) {
    if (this.animating || this.activeIndex >= this.swiperCount - 1) return

    this.activeIndex++
    if(this.activeIndex >= this.swiperCount -1) {
      this.activeIndex = this.swiperCount -1
    }
    this.slideTo(this.activeIndex, speed)
  }
}


module.exports = Swiper
