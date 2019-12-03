/*****************************************************************
 * Du kannst besser deutsch? -> tannenbaum.js!                   *
 *                                                               *
 * Welcome to ∞ Tannenbaum!                                      *
 * This is the code generating the trees at                      *
 *                                                               *
 *    https://ootannenbaum.rixx.de                               *
 *                                                               *
 *  There is a lot of commentary to explain what's going on.     *
 *  Combined with the blog post at                               *
 *  https://rixx.de/blog/tannenbaum you can hopefully follow the *
 *  code and understand what it does.                            *
 *  If you have questions, I'll try to help: r@rixx.de           *
 *                                                               *
 *****************************************************************/

// The canvas is the part of the website we're using for drawing.
var canvas = document.querySelector("canvas")
// The snow is the white part in the background.
// We have to keep track of where it is to make sure that all trees stand on the ground instead of hovering in the air.
var snow = null;
// The forest is a list of all trees, starting out empty.
var forest = [];

function randomNumber(min, max) {
  // This function produces a random number between min and max.
  // Min is inclusive, max is exclusive.
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateLandscape () {
  // Generates the background
  var lowerleft = new Point(0, paper.view.size.height)
  var isTiny = paper.view.size.height < 700  // We use a different arc on mobile screens
  if (isTiny) {
    snow = new Path(lowerleft, new Point(0, paper.view.size.height) * 0.5)
    snow.arcTo(new Point(paper.view.size.width * 0.7, paper.view.size.height * 0.6))
  } else {
    snow = new Path(lowerleft, new Point(0, paper.view.size.height) * 0.55)
    snow.arcTo(new Point(paper.view.size.width * 0.7, paper.view.size.height * 0.75))
  }
  snow.add(new Point(paper.view.size.width, paper.view.size.height))
  snow.add(new Point(0, paper.view.size.height))
  snow.closePath();
  snow.fillColor = "white"
}

function findTreePosition(width, height) {
  // Finds a place for a tree, returns the center.

  if (paper.view.size.width < 700) {  // Always center the tree on mobile screens
    var sidebarHeight = document.querySelector("#sidebar").getBoundingClientRect().height
    return new Point(paper.view.size.width / 2, paper.view.size.height - sidebarHeight - 30 - height / 2)
  }

  var usableWidth = paper.view.size.width - 300 - width  // 300 ist the sidebar width.
  var usableHeight = paper.view.size.height - height
  var point = null;
  while (true) {  // We choose a random point until we find one that's on the snow.
    point = new Point(
      randomNumber(0, usableWidth) + (width / 2),
      randomNumber(0, usableHeight) + height
    )
    if (snow.contains(point)) {
      // We return the center, so we have to add half the tree's height.
      return new Point(point.x, point.y - (height / 2))
    }
  }
}

function plantTree () {
  // Generates a new tree and puts it in the forest
  var tree = new Group()

  // We check which features are switched on/off via the checkboxes
  var featureColour = document.querySelector("#featureFarbe").checked;
  var featureRotation = document.querySelector("#featureRotation").checked;
  var featureTransparent = document.querySelector("#featureTransparent").checked;

  // Now we set a list of random variables
  var height = 50 + randomNumber(30, 80)  // The height of the first layer
  var width = 70 + randomNumber(0, 120)  // The width of the first layer
  var heightChange = randomNumber(0, 2)  // How much the height changes
  var widthChange = randomNumber(0, 2)  // How much the width changes
  var distance = randomNumber(30, 70)  // The distance of each layer from the next
  var layers = randomNumber(
    Number.parseInt(document.querySelector("#minLayers").value) || 1,
    Number.parseInt(document.querySelector("#maxLayers").value) + 1 || 10
  )

  var center = 0
  var bottom = 0
  var left = 0
  var right = 0
  var startTop = bottom - height  // The (0, 0) point is in the bottom left corner.

  var red = randomNumber(0, 100) / 255
  var green = randomNumber(115, 255) / 255
  var blue = randomNumber(40, 130) / 255

  var isArced = randomNumber(0, 5)
  var colorChange = randomNumber(2, 7)
  var strokeWidth = randomNumber(featureColour ? 0 : 1, 6)
  var strokeBrightness = Math.random() * 0.25
  var transparency = 1  // 0 is completely transparent, 1 is completely opaque
  if (featureTransparent) {
      transparency = randomNumber(70, 100) / 100
  }
  var rotation = 0
  var rotationDirection = 0
  if (featureRotation) {
      rotation = randomNumber(50, 70) / 100
      rotationDirection = randomNumber(-1, 1)
  }

  // Now we're choosing the height of the trunk and the star (if any), so that we
  // know the complete height of the tree. Then we reduce the total height until
  // the tree fits on the screen.
  var trunkOffset = rotationDirection ? 10 : 0
  var trunkHeight = randomNumber(10, 60) + trunkOffset

  var starHeight = 0;
  if (randomNumber(0, 2)) {  // The chance for getting a star is 50:50.
      starHeight = randomNumber(20, 30) * 2
      startTop -= starHeight / 2
      var star = new Path.Star(
          new Point(center, bottom - height),  // Center
          randomNumber(5, 8),  // Number of points: 5, 6, oder 7
          randomNumber(5, 15),  // Inner radius
          starHeight / 2,  // Outer radius
      )
      var starRed = randomNumber(230, 255) / 255
      var starGreen = (randomNumber(0, 2) ? randomNumber(0, 50) : randomNumber(200, 255))/ 255
      var starBlue = randomNumber(0, 60) / 255

      star.fillColor = new Color(starRed, starGreen, starBlue)
      star.strokeWidth = strokeWidth || 1
      star.strokeColor = new Color(starRed, starGreen, starBlue)
      star.strokeColor.brightness = 0.9

      star.rotate(180)  // We're rotating the star so that the single point is at the top.

      star.shadowColor = new Color(starRed, starGreen, starBlue)  // Let it glooooow.
      star.shadowBlur = 30

      tree.addChild(star)
  }

  // We only want as many layers as can fit on our screen.
  var maxHeight = paper.view.size.height
  var maxWidth = paper.view.size.width - 300  // Remove sidebar width
  var isTiny = paper.view.size.height < 700  // On mobile screens, the "side"bar is at the bottom
  if (isTiny) {
    maxWidth += 300
    maxHeight -= document.querySelector("#sidebar").getBoundingClientRect().height
  }
  while (layers * distance + height + trunkHeight + starHeight > maxHeight) {  // We remove layers until the tree fits
    layers -= 1;
  }
  width = Math.min(width, maxWidth)  // The first layer can't be wider than the screen.
  while (width + (layers * (30 * (widthChange * 0.25 + 1))) > maxWidth) {  // We remove layers until the tree fits
    layers -= 1;
  }

  // The tree consists of several triangles
  for (var loop = 0; loop < layers; loop++) {
      // Every loop draws another triangle
      left = center - (width / 2)
      right = center + (width / 2)
      var leftPoint = new Point(left, bottom)
      var rightPoint = new Point(right, bottom)
      var centerPoint = new Point(center, bottom - height)

      // First we generate the line from the lower left to the lower right.
      // The value in the middle specifies the arc.
      var triangle = new Path.Arc(
          leftPoint,
          new Point(center, bottom + (5 + loop) * isArced),
          rightPoint
      )

      // Then we draw the line up to the top.
      try {
          triangle.arcTo(
              isArced ? new Point(
                  center + width * 0.35, bottom - height * 0.2
              ) : centerPoint,
              centerPoint
          )
      } catch (e) {  // If we can't draw an arc, we draw a straight line instead.
          triangle.add(centerPoint)
      }

      // Last, we draw the line from the top back to the bottom left corner.
      try {
          triangle.arcTo(
              isArced ? new Point(
                  center - width * 0.35,
                  bottom - height * 0.2
              ) : leftPoint,
              leftPoint
          )
      } catch (e) {  // If we can't draw an arc, we draw a straight line instead.
          triangle.add(leftPoint)
      }
      triangle.closePath()  // Now the triangle is done.

      triangle.fillColor = featureColour ? new Color(red, green, blue) : new Color(1, 1, 1)
      var saturation = (layers + colorChange - loop) / (layers + colorChange)
      triangle.fillColor.saturation = saturation  // The saturation increases the strength/darkness of a color
      triangle.fillColor.alpha = transparency
      triangle.strokeColor = new Color(red, green, blue)
      triangle.strokeColor.saturation = saturation
      triangle.strokeColor.brightness -= strokeBrightness
      triangle.strokeWidth = strokeWidth
      triangle.alpha = transparency
      triangle.rotate(rotationDirection * rotation * loop)

      // We add the triangle to our tree, and put it behind the previous triangles
      tree.addChild(triangle)
      triangle.sendToBack()

      // Before starting the next loop, we change the starting point, width, and height.
      bottom = bottom + distance
      width = width + 30 * (widthChange * 0.25 + 1)
      height = height + 10 * (heightChange * 0.5 + 1)
  }

  // Now we paint the trunk
  var trunkWidth = Math.min(randomNumber(20, 80), width - 40)
  var trunk = new Path.Rectangle(
      new Point(center - (trunkWidth / 2), bottom - distance - trunkOffset),
      new Size(trunkWidth, trunkHeight)
  )

  var trunkRed = randomNumber(65, 125) / 255
  var trunkGreen = randomNumber(45, 90) / 255
  var trunkBlue = randomNumber(0, 50) / 255
  trunk.fillColor = featureColour ? new Color(trunkRed, trunkGreen, trunkBlue) : new Color(1,1,1)
  trunk.strokeColor = new Color(trunkRed, trunkGreen, trunkBlue)
  trunk.strokeWidth = strokeWidth
  trunk.strokeColor.brightness -= strokeBrightness
  tree.addChild(trunk)
  trunk.sendToBack()

  // We add the tree to the global project. This allows us to export images with all trees!
  tree.addTo(paper.project)

  // The cursor should indicate that trees can be clicked directly.
  tree.onMouseEnter = function (event) { canvas.style.cursor = "pointer"; }
  tree.onMouseLeave = function (event) { canvas.style.cursor = "default"; }

  // When clicking a tree, a new one will be planted.
  // On mobile screens, all other trees will be removed first, becaus only one will fit on the screen anyways.
  tree.onClick = isTiny ? deforestation : plantTree;

  // Now we only need to choose a good position, so that the tree is in the snow and doesn't appear outside the browser window.
  // On mobile screens, the tree is always centered.
  tree.position = findTreePosition(width, (bottom - distance - trunkOffset + trunkHeight) - startTop)

  // We put the tree in our forest list, and sort it.
  // The sorting makes sure that trees at the front appear on top of the trees in the back.
  forest.push(tree)
  sortForest()

  // Finally, we put the current number of trees in the page title.
  document.title = "∞ Tannenbaum " + "🎄".repeat(forest.length)
}

function deforestation () {
  // We remove all trees and plant a single new one.
  forest.forEach(tree => tree.remove())
  forest = []
  plantTree()
}

function sortForest () {
  // We sort the forest by the lower end of the tree, to make things seem right in terms of perspective.
  forest.sort((tree1, tree2) => {
    return tree2.bounds.y + tree2.bounds.height - tree1.bounds.y - tree1.bounds.height
  })
  // Now we take every pair of trees, and put the correct one on top.
  for (position = 0; position < forest.length - 1; position++) {
    var tree1 = forest[position]

    for (innerPosition=position; innerPosition < forest.length; innerPosition++) {
      var tree2 = forest[innerPosition]
      tree1.insertAbove(tree2)
    }
  }
}

function downloadSVG(){
    // via bleeptrack, https://cccamp19.bleeptrack.de/
    var svg = project.exportSVG({ asString: true });
    var svgBlob = new Blob([svg], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "tannenbaum.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function downloadPNG(){
    // via bleeptrack, https://cccamp19.bleeptrack.de/
    var canvas = document.getElementById("tannenbaum");
    var downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png;base64");
    downloadLink.download = "tannenbaum.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
