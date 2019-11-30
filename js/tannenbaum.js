function zufallszahl(min, max) {
  // Minimum ist inklusive, maximum ist exklusive
  return Math.floor(Math.random() * (max - min)) + min;
}

wald = []

function generateBaum () {

  var featureRotation = 0;
  var featureTransparent = 0;
  var featureFarbe = 1;

  var mitte = 400
  var unten = 200
  var hoch = 50 + zufallszahl(30, 80)
  var breit = 70 + zufallszahl(0, 120)
  var links = 0
  var rechts = 0
  var ebenen = zufallszahl(1, 10)
  var hochverlauf = zufallszahl(0, 2)
  var breitverlauf = zufallszahl(0, 2)
  var istGebogen = zufallszahl(0, 3)

  var rot = zufallszahl(0, 100) / 255
  var gruen = zufallszahl(115, 255) / 255
  var blau = zufallszahl(40, 130) /255

  var farbverlauf = zufallszahl(2, 7)
  var strichbreite = zufallszahl(featureFarbe ? 0 : 1, 6)
  var strichhelle = Math.random() * 0.25
  var transparenz = 1
  if (featureTransparent) {
      transparenz = zufallszahl(70, 100) / 100
  }
  var rotation = 0
  var rotationsRichtung = 0
  if (featureRotation) {
      rotation = zufallszahl(50, 70) / 100
      rotationsRichtung = zufallszahl(-1, 1)
  }

  if (zufallszahl(0, 2)) {
      var star = new Path.Star(
          new Point(mitte, unten - hoch),
          zufallszahl(5, 8),
          zufallszahl(5, 15),
          zufallszahl(20, 30)
      )
      var sternRot = zufallszahl(230, 255) / 255
      var sternGruen = (zufallszahl(0, 2) ? zufallszahl(0, 50) : zufallszahl(200, 255))/ 255
      var sternBlau = zufallszahl(0, 60) / 255

      star.fillColor = new Color(sternRot, sternGruen, sternBlau)
      star.strokeWidth = strichbreite || 1
      star.strokeColor = new Color(sternRot, sternGruen, sternBlau)
      star.strokeColor.brightness = 0.9
      star.rotate(180)
      star.shadowColor = new Color(sternRot, sternGruen, sternBlau)
      star.shadowBlur = 30

  }

  for (var schleife = 0; schleife < ebenen; schleife++) {
      links = mitte - (breit / 2)
      rechts = mitte + (breit / 2)
      var linksPunkt = new Point(links, unten)
      var rechtsPunkt = new Point(rechts, unten)
      var mittelPunkt = new Point(mitte, unten - hoch)
      var dreieck = new Path.Arc(
          linksPunkt,
          new Point(mitte, unten + (5 + schleife) * istGebogen),
          rechtsPunkt
      )

      try {
          dreieck.arcTo(
              istGebogen ? new Point(
                  mitte + breit * 0.35, unten - hoch * 0.2
              ) : mittelPunkt,
              mittelPunkt
          )
      } catch (e) {
          dreieck.add(mittelPunkt)
      }
      try {
          dreieck.arcTo(
              istGebogen ? new Point(
                  mitte - breit * 0.35,
                  unten - hoch * 0.2
              ) : linksPunkt,
              linksPunkt
          )
      } catch (e) {
          dreieck.add(linksPunkt)
      }
      dreieck.closePath()

      dreieck.fillColor = featureFarbe ? new Color(rot, gruen, blau) : new Color(1, 1, 1)
      var saturation = (ebenen + farbverlauf - schleife) / (ebenen + farbverlauf)
      dreieck.fillColor.saturation = saturation
      dreieck.fillColor.alpha = transparenz
      dreieck.strokeColor = new Color(rot, gruen, blau)
      dreieck.strokeColor.saturation = saturation
      dreieck.strokeColor.brightness -= strichhelle
      dreieck.strokeWidth = strichbreite
      dreieck.alpha = transparenz
      dreieck.rotate(rotationsRichtung * rotation * schleife)
      dreieck.sendToBack()

      unten = unten + 50
      breit = breit + 30 * (breitverlauf * 0.25 + 1)
      hoch = hoch + 10 * (hochverlauf * 0.5 + 1)
  }

  var stammOffset = rotationsRichtung ? 10 : 0
  var stammHoch = zufallszahl(10, 60) + stammOffset
  var stammBreit = Math.min(zufallszahl(20, 80), breit - 40)
  var stamm = new Path.Rectangle(
      new Point(mitte - (stammBreit / 2), unten - 50 - stammOffset),
      new Size(stammBreit, stammHoch)
  )

  var stammRot = zufallszahl(65, 125) / 255
  var stammGruen = zufallszahl(45, 90) / 255
  var stammBlau = zufallszahl(0, 50) / 255
  stamm.fillColor = featureFarbe ? new Color(stammRot, stammGruen, stammBlau) : new Color(1,1,1)
  stamm.strokeColor = new Color(stammRot, stammGruen, stammBlau)
  stamm.strokeWidth = strichbreite
  stamm.strokeColor.brightness -= strichhelle
  stamm.sendToBack()
}
