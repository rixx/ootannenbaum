var canvas = document.querySelector("canvas")
var schnee = null;
var wald = [];

function zufallszahl(min, max) {
  // Minimum ist inklusive, maximum ist exklusive
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateLandschaft () {
  var isTiny = paper.view.size.height < 700
  schnee = new Path(
    new Point(0, paper.view.size.height),
    new Point(0, paper.view.size.height * (isTiny ? 0.5 : 0.55)),
  );
  schnee.arcTo(
    new Point(paper.view.size.width * 0.7, paper.view.size.height * (isTiny ? 0.55 : 0.65)),
    new Point(paper.view.size.width, paper.view.size.height * (isTiny ? 0.60 : 0.75)),
  );
  schnee.add(new Point(paper.view.size.width, paper.view.size.height))
  schnee.add(new Point(0, paper.view.size.height))
  schnee.closePath();
  schnee.fillColor = "white"
}

function findBaumLocation(breit, hoch) {
  // muss den Mittelpunkt zurückgeben
  if (paper.view.size.width < 700) {
    var sidebarHeight = document.querySelector("#sidebar").getBoundingClientRect().height
    return new Point(paper.view.size.width / 2, paper.view.size.height - sidebarHeight - 30 - hoch / 2)
  }
  var nutzbarBreit = paper.view.size.width - 300 - breit
  var nutzbarHoch = paper.view.size.height - hoch
  var point = null;
  while (true) {
    point = new Point(
      zufallszahl(0, nutzbarBreit) + (breit / 2),
      zufallszahl(0, nutzbarHoch) + hoch
    )
    if (schnee.contains(point)) {
      return new Point(point.x, point.y - (hoch / 2))
    }
  }
}

function pflanzeBaum () {
  var baum = new Group()
  var featureFarbe = document.querySelector("#featureFarbe").checked;
  var featureRotation = document.querySelector("#featureRotation").checked;
  var featureTransparent = document.querySelector("#featureTransparent").checked;

  var hochverlauf = zufallszahl(0, 2)
  var breitverlauf = zufallszahl(0, 2)
  var hoch = 50 + zufallszahl(30, 80)
  var breit = 70 + zufallszahl(0, 120)
  var ebenen = zufallszahl(
    Number.parseInt(document.querySelector("#minLayers").value) || 1,
    Number.parseInt(document.querySelector("#maxLayers").value) + 1 || 10
  )
      unten = unten + 50
      breit = breit + 30 * (breitverlauf * 0.25 + 1)
      hoch = hoch + 10 * (hochverlauf * 0.5 + 1)
  while ((hoch + 10 * (hochverlauf * 0.5 + 1)) * ebenen > paper.view.size.height) {
    ebenen -= 1;
  }
  while (breit + (30 * (breitverlauf * 0.25 + 1)) * ebenen > paper.view.size.height) {
    breit -= 10;
  }

  var mitte = 0
  var unten = 0
  var links = 0
  var rechts = 0
  var startOben = unten - hoch

  var rot = zufallszahl(0, 100) / 255
  var gruen = zufallszahl(115, 255) / 255
  var blau = zufallszahl(40, 130) /255

  var istGebogen = zufallszahl(0, 3)
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
      baum.addChild(star)
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
      baum.addChild(dreieck)
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
  baum.addChild(stamm)
  stamm.sendToBack()
  baum.addTo(paper.project)
  baum.onclick = pflanzeBaum;
  baum.onMouseEnter = function (event) { canvas.style.cursor = "pointer"; }
  baum.onMouseLeave = function (event) { canvas.style.cursor = "default"; }
  baum.position = findBaumLocation(breit, unten - startOben)
  wald.push(baum)
  document.title = "∞ Tannenbaum " + "🎄".repeat(wald.length)
  waldSortieren()
}

function waldRoden () {
  wald.forEach(baum => baum.remove())
  wald = []
  pflanzeBaum()
}

function waldSortieren () {
  wald.sort((baum1, baum2) => {
    return baum2.bounds.y + baum2.bounds.height - baum1.bounds.y - baum1.bounds.height
  })
  for (position = 0; position < wald.length; position++) {
    var baum1 = wald[position]
    for (innerPosition=position; innerPosition < wald.length; innerPosition++) {
      var baum2 = wald[innerPosition]
      baum1.insertAbove(baum2)
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
