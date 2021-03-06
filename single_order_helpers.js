/* global tabris */

var editIssues = require('./editIssues')
var updateStatus = require('./updateStatus')
var priceUpdate = require('./pricePrototype')

var MARGINLEFT = 10

function createEditableGroup (props) {
  var container = tabris.create('Composite', {
    layoutData: {top: ['prev()', 0], left: 0, right: 0},
    highlightOnTouch: true
  }).on('tap', function () {
    switch (props.case) {
      case 'issues':
        editIssues(props.data, editableText)
        break
      case 'status':
        updateStatus(props.data, editableText)
        break
      default:
        break
    }
  }).appendTo(props.parent)

  tabris.create('TextView', {
    text: props.label,
    font: '11px',
    textColor: '#6E7783',
    layoutData: {top: 6, left: MARGINLEFT, right: 0}
  }).appendTo(container)

  var editableText = tabris.create('TextView', {
    text: props.bodyText,
    font: '16px',
    textColor: '#252c41',
    layoutData: {top: ['prev()', 6], left: MARGINLEFT, right: 40}
  }).appendTo(container)

  tabris.create('ImageView', {
    image: {src: 'images/view_more.png', scale: 3},
    layoutData: {right: 20},
    centerY: 0
  }).appendTo(container)

  return null
}

function createLine (props) {
  var alignment
  var margin

  if (props.alignment === 'top') {
    // alignment is require to be specific because is using a fraction
    // and there will be a gap depending on its position.
    alignment = {top: 0, bottom: 0.5, left: 0, right: 0}
    margin = 0
  } else {
    alignment = {top: 0.5, bottom: 0, left: 0, right: 0}
    margin = ['prev()', 6]
  }

  var dividerContainer = tabris.create('Composite', {
    layoutData: {top: margin, left: 0, right: 0},
    height: 1
  }).appendTo(props.parent)

  tabris.create('TextView', {
    background: '#dddfe6',
    layoutData: alignment
  }).appendTo(dividerContainer)

  return null
}

function itemPrice (props) {
  // need to check if the value is an array
  var pricesArray = props.data.repairs
    ? props.data.repairs.concat('Quoted Price-' + props.data.quoted_price)
    : ['Quoted Price-' + props.data.quoted_price]

  var repairs = createArray(pricesArray)

  var container = tabris.create('Composite', {
    layoutData: {top: ['prev()', 0], left: 0, right: 0},
    highlightOnTouch: true
  }).on('tap', function () {
    priceUpdate(repairs, props.data)
  }).appendTo(props.parent)

  tabris.create('TextView', {
    text: props.label,
    font: '11px',
    textColor: '#6E7783',
    layoutData: {top: 6, left: MARGINLEFT, right: 0}
  }).appendTo(container)


  repairs.forEach(function (el, index, array) {
    var content = new tabris.Composite({
      layoutData: {top: ['prev()', 12], left: MARGINLEFT + 15, right: 40}
    }).appendTo(container)

    tabris.create('TextView', {
      text: el[0],
      font: '16px',
      textColor: '#252c41',
      layoutData: {top: 12, left: 0}
    }).appendTo(content)

    tabris.create('TextView', {
      text: '$' + el[1] + '.00',
      font: '16px',
      textColor: '#252c41',
      layoutData: {top: 12, right: 10}
    }).appendTo(content)

    // Check if it is the last item in the array and dont create the las line
    if (index !== array.length - 1) {
      tabris.create('TextView', {
        background: '#dddfe6',
        layoutData: {top: ['prev()', 10], height: 0.5, right: 0, left: 0}
      }).appendTo(content)
    }
  })

  tabris.create('ImageView', {
    image: {src: 'images/view_more.png', scale: 3},
    layoutData: {right: 20},
    centerY: 0
  }).appendTo(container)

  return null
}

function createArray (repairsArray) {
  return repairsArray.map(function (repair) {
    return repair.split('-')
  })
}

module.exports = {
  editableGroup: createEditableGroup,
  line: createLine,
  price: itemPrice
}
