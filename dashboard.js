/* global tabris*/
var orderForm = require('./order_form')
var h = require('./helpers')
var Syncano = require('./syncano')
var collectionList = require('./collectionList')
var login = require('./login')
var db = require('./localStorage')
var realTime = require('./realtime')
var API_KEY = ''

tabris.app.on('pause', function () {
  if (realTime.getPoll() !== null) {
    realTime.getPoll().stop()
  }

  if (realTime.Channel() !== null) {
    var Channel = realTime.Channel()
    var message = {'content': 'hello!'}

    Channel.please().publish(null, message).then(function () {})

    setTimeout(function () { console.log('timeout::') }, 2000)
  }
}).on('resume', function () {
  if (db('userInfo').first() !== undefined) {
    collectionList()
    realTime.initPoll()
    realTime.getPoll().start()
  }
})

var connection = Syncano({apiKey: API_KEY})

function initDashboard (tab) {
  authenticate().then(function (response) {
    if (response === true) {
      showUserInfo()
      realTime.initPoll()
      realTime.getPoll().start()
    } else {
      showLoginButton()
    }
  })

  var page = new tabris.ScrollView({
    id: '#dashboardContainer',
    left: 0, right: 0, top: 0, bottom: 0
  }).appendTo(tab)

  new tabris.ImageView({
    id: 'tech',
    image: {src: 'images/tech_profile.png', scale: 3},
    layoutData: {top: 8, left: 8},
    width: 93
  }).on('tap', function () {
    db('repairOrders').remove()
    console.log('cleaned')
  }).appendTo(page)

  var userContainer = new tabris.Composite({
    id: 'user-info',
    opacity: 0,
    layoutData: {left: 109, right: 0, top: 8},
    height: 93
  }).appendTo(page)

  var userName = new tabris.TextView({
    id: 'user-name',
    text: '',
    alignment: 'center',
    layoutData: {top: 8, left: 25, right: 25},
    font: '16px'
  }).appendTo(userContainer)

  var userLocation = new tabris.TextView({
    id: 'user-location',
    text: '',
    alignment: 'center',
    layoutData: {top: ['prev()', 8], left: 25, right: 25},
    font: '16px'
  }).appendTo(userContainer)

  new tabris.Button({
    text: 'LOGOUT',
    font: '12px',
    layoutData: {top: ['prev()', 8], bottom: 0, left: 25, right: 25}
  }).on('select', function () {
    // Make sure Realtime is initialized
    if (realTime.getPoll() !== null && realTime.Channel() !== null) {
      realTime.getPoll().stop()

      var Channel = realTime.Channel()
      var message = {'content': 'hello!'}

      // Need to send a message so its the last one, to stop the channel
      Channel.please().publish(null, message).then(function () {})
    }

    // Remove the event handlers
    tabris.app.off('pause').off('resume')

    // Reset collection list view
    var collectionView = tabris.ui.find('#edisonlist')[0]
    collectionView.set('items', [])

    showLoginButton()
    this.parent().animate({
      opacity: 0
    }, {
      duration: 100,
      easing: 'ease-out'
    })
  }).appendTo(userContainer)

  var headerContainer = new tabris.Composite({
    id: 'Login',
    layoutData: {left: 109, right: 0, top: 8},
    height: 93,
    opacity: 0
  })

  new tabris.TextView({
    text: 'LOGIN',
    textColor: '#fff',
    background: '#282C37',
    layoutData: {left: '10%', right: '10%', top: 20, bottom: 20},
    alignment: 'center'
  }).on('tap', function () {
    login()
  }).appendTo(headerContainer)

  var orderContainer = new tabris.Composite({
    id: 'orderContainer',
    layoutData: {top: ['prev()', 30], left: 0, right: 0}
  }).appendTo(page)

  var orderContainerItemFirst = new tabris.Composite({
    layoutData: {top: 21, left: '5%', right: '53%'},
    background: '#03A6FF',
    height: 150,
    cornerRadius: 3
  }).on('tap', function () {
    if (db('userInfo').find()) {
      orderForm()
    } else {
      console.log('need to be logged')
    }
  }).appendTo(orderContainer)

  new tabris.ImageView({
    image: {src: 'images/new_order.png', scale: 3},
    centerY: -10,
    centerX: 0
  }).appendTo(orderContainerItemFirst)

  new tabris.TextView({
    text: 'New Order',
    bottom: 6,
    centerX: 0,
    font: '17px',
    textColor: '#fff'
  }).appendTo(orderContainerItemFirst)

  var orderContainerItemSecond = new tabris.Composite({
    layoutData: {top: 21, left: '53%', right: '5%'},
    background: '#3AC569',
    height: 150,
    cornerRadius: 3
  }).appendTo(orderContainer)

  new tabris.TextView({
    text: '4',
    textColor: '#fff',
    backgroundImage: {
      src: 'images/badge.png',
      scale: 3
    },
    top: 0,
    right: '20%',
    width: 43,
    height: 43,
    alignment: 'center',
    visible: true
  }).appendTo(orderContainer)

  new tabris.ImageView({
    image: {src: 'images/ready.png', scale: 3},
    centerY: -10,
    centerX: 0
  }).appendTo(orderContainerItemSecond)

  new tabris.TextView({
    text: 'Pick up Ready',
    bottom: 6,
    centerX: 0,
    font: '17px',
    textColor: '#fff'
  }).appendTo(orderContainerItemSecond)

  var deliveryContainer = new tabris.Composite({
    layoutData: {top: ['prev()', 30], left: 0, right: 0}
  }).appendTo(page)

  var deliveryContainerItemFirst = new tabris.Composite({
    layoutData: {top: 21, left: '5%', right: '53%'},
    background: '#DDDFE6',
    height: 150,
    cornerRadius: 3
  }).appendTo(deliveryContainer)

  new tabris.ImageView({
    image: {src: 'images/received.png', scale: 3},
    centerY: -10,
    centerX: 0
  }).appendTo(deliveryContainerItemFirst)

  new tabris.TextView({
    text: 'Received',
    bottom: 6,
    centerX: 0,
    font: '17px',
    textColor: '#000'
  }).appendTo(deliveryContainerItemFirst)

  var deliveryContainerItemSecond = new tabris.Composite({
    layoutData: {top: 21, left: '53%', right: '5%'},
    background: '#252C41',
    height: 150,
    cornerRadius: 3
  }).appendTo(deliveryContainer)

  new tabris.TextView({
    text: '1',
    textColor: '#fff',
    backgroundImage: {src: 'images/badge.png', scale: 3},
    top: 0,
    right: '20%',
    width: 43,
    height: 43,
    alignment: 'center',
    visible: true
  }).appendTo(deliveryContainer)

  new tabris.ImageView({
    image: {src: 'images/shipping.png', scale: 3},
    centerY: 0,
    centerX: 0
  }).appendTo(deliveryContainerItemSecond)

  new tabris.TextView({
    text: 'Shipping',
    bottom: 6,
    centerX: 0,
    font: '17px',
    textColor: '#fff'
  }).appendTo(deliveryContainerItemSecond)

  function showLoginButton () {
    db('userInfo').remove()
    var hasParent = headerContainer.parent()
    if (hasParent) {
      headerContainer.animate({
        opacity: 1
      }, {
        duration: 200,
        easing: 'ease-out'
      })
    } else {
      headerContainer.appendTo(page)
      headerContainer.animate({
        opacity: 1
      }, {
        duration: 200,
        easing: 'ease-out'
      })
    }
  }

  function showUserInfo () {
    var user = db('userInfo').first()
    var name = h.capitalize(user.username)
    var group = user.groups[0].label
    var location = h.capitalize(group)
    userName.set('text', 'Tech: ' + name)
    userLocation.set('text', 'Location: ' + location)
    userContainer.animate({
      opacity: 1
    }, {
      duration: 200,
      easing: 'ease-out'
    })
  }
}

function authenticate () {
  if (db('userInfo').find()) {
    return login()
  } else {
    // the caller is expecting a promise
    return Promise.resolve(false)
  }

  function login () {
    var input = db('userInfo').first()
    return connection.User.please()
      .login({instanceName: 'laptopbsr'}, {username: input.username, password: input.password})
      .then(function (response) {
        return true
      })
      .catch(function () { // If error
        db('userInfo').remove()
        return false
      })
  }
}

module.exports = initDashboard
