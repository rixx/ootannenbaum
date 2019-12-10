/*****************************************************************
 * English speakers: use tannenbaum.en.js!                       *
 *                                                               *
 * Willkommen zu ∞ Tannenbaum!                                   *
 * Das ist der Code, der die Tannenbäume auf                     *
 *                                                               *
 *    https://ootannenbaum.rixx.de                               *
 *                                                               *
 *  generiert. Der Code ist ausgiebig kommentiert. Zusammen mit  *
 *  dem Blogpost unter https://rixx.de/de/blog/tannenbaum sollte *
 *  verständlich sein, wie er funktioniert.                      *
 *  Sonst frag gerne nach: r@rixx.de ist meine Mailadresse.      *
 *                                                               *
 *****************************************************************/

// Das "canvas" ("Leinwand") ist, worauf wir malen.
var canvas = document.querySelector("canvas")
// Der Schnee ist das weiße Gebiet im Hintergrund.
// Wir müssen uns merken, wo das ist, damit alle Bäume wirklich auf dem Boden stehen und nicht schweben.
var schnee = null;
// Der Wald ist eine Liste aller Bäume. Anfangs: leer.
var wald = [];

function zufallszahl(min, max) {
  // Diese Funktion gibt eine zufällige Zahl zwischen min und max zurück.
  // Minimum ist inklusive, maximum ist exklusive.
  return Math.floor(Math.random() * (max - min)) + min;
}
function generateLandschaft () {
  // Generiert den Hintergrund
  var isTiny = paper.view.size.height < 700  // Anderer Hintergrund für Handys
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
  // Findet den Ort, an den ein Baum plaziert wird. Muss den Mittelpunkt zurückgeben.

  if (paper.view.size.width < 700) {  // Auf Handys ist der Baum immer mittig
    var sidebarHeight = document.querySelector("#sidebar").getBoundingClientRect().height
    return new Point(paper.view.size.width / 2, paper.view.size.height - sidebarHeight - 30 - hoch / 2)
  }

  var nutzbarBreit = paper.view.size.width - 300 - breit  // 300 ist die Breite der Sidebar
  var nutzbarHoch = paper.view.size.height - hoch
  var point = null;
  while (true) {  // Wir nehmen uns so lange einen Punkt, bis wir einen finden, der im Schnee liegt
    point = new Point(
      zufallszahl(0, nutzbarBreit) + (breit / 2),
      zufallszahl(0, nutzbarHoch) + hoch
    )
    if (schnee.contains(point)) {
      // Weil wir den Mittelpunkt zurückgeben, müssen wir noch die Hälfte der Höhe des Baums hinzufügen.
      return new Point(point.x, point.y - (hoch / 2))
    }
  }
}

function pflanzeBaum () {
  // Generiert einen neuen Baum, und sortiert ihn im Wald ein.
  var baum = new Group()

  // Wir gucken, welche Checkboxen markiert sind, und welche Features wir deshalb benutzen
  var featureFarbe = document.querySelector("#featureFarbe").checked;
  var featureRotation = document.querySelector("#featureRotation").checked;
  var featureTransparent = document.querySelector("#featureTransparent").checked;

  // Jetzt legen wir eine ganze Reihe von Zufallsvariablen fest
  var hoch = 50 + zufallszahl(30, 80)  // Wie hoch ist die erste Ebene
  var breit = 70 + zufallszahl(0, 120)  // Wie breit ist die erste Ebene
  var hochverlauf = zufallszahl(0, 2)  // Wie sehr wird der Baum höher
  var breitverlauf = zufallszahl(0, 2)  // Wie sehr wird der Baum breiter
  var abstand = zufallszahl(30, 70)  // Wie weit sind die Ebenen auseinander
  var ebenen = zufallszahl(
    Number.parseInt(document.querySelector("#minLayers").value) || 1,
    Number.parseInt(document.querySelector("#maxLayers").value) + 1 || 10
  )

  var mitte = 0
  var unten = 0
  var links = 0
  var rechts = 0
  var startOben = unten - hoch

  var rot = zufallszahl(0, 100) / 255
  var gruen = zufallszahl(115, 255) / 255
  var blau = zufallszahl(40, 130) / 255

  var istGebogen = zufallszahl(0, 5)
  var farbverlauf = zufallszahl(2, 7)
  var strichbreite = zufallszahl(featureFarbe ? 0 : 1, 6)
  var strichhelle = Math.random() * 0.25
  var transparenz = 1  // 0 ist komplett durchsichtig, 1 ist komplett undurchsichtig
  if (featureTransparent) {
      transparenz = zufallszahl(70, 100) / 100
  }
  var rotation = 0
  var rotationsRichtung = 0
  if (featureRotation) {
      rotation = zufallszahl(50, 70) / 100
      rotationsRichtung = zufallszahl(-1, 1)
  }

  // Jetzt legen wir Höhe von Stamm und Stern fest, um die gesamte Höhe des Baums
  // zu kennen. Die schrumpfen wir dann so lange, bis der Baum ins Bild passt.
  var stammOffset = rotationsRichtung ? 10 : 0
  var stammHoch = zufallszahl(10, 60) + stammOffset

  var sternHoch = 0;
  if (zufallszahl(0, 2)) {  // Die Chance auf einen Stern ist 50:50
      sternHoch = zufallszahl(20, 30) * 2
      startOben -= sternHoch / 2
      var star = new Path.Star(
          new Point(mitte, unten - hoch),  // Mittelpunkt
          zufallszahl(5, 8),  // Anzahl der Zacken: 5, 6, oder 7
          zufallszahl(5, 15),  // Radius zum inneren Ende einer Zacke
          sternHoch / 2,  // Radius zum äußeren Ende einer Zacke
      )
      var sternRot = zufallszahl(230, 255) / 255
      var sternGruen = (zufallszahl(0, 2) ? zufallszahl(0, 50) : zufallszahl(200, 255))/ 255
      var sternBlau = zufallszahl(0, 60) / 255

      star.fillColor = new Color(sternRot, sternGruen, sternBlau)
      star.strokeWidth = strichbreite || 1  // Jeder Stern hat eine Umrisslinie, sieht sonst nicht aus
      star.strokeColor = new Color(sternRot, sternGruen, sternBlau)
      star.strokeColor.brightness = 0.9

      star.rotate(180)  // Wir drehen ihn einmal um, damit die einzelne Zacke nach oben zeigt

      star.shadowColor = new Color(sternRot, sternGruen, sternBlau)  // Und wir lassen ihn leuchten!
      star.shadowBlur = 30

      baum.addChild(star)
  }

  // Nur so viele Ebenen, wie aufs Bild passen
  var maxHeight = paper.view.size.height
  var maxWidth = paper.view.size.width - 300  // Wir müssen die Sidebar abziehen
  var isTiny = paper.view.size.height < 700  // Auf Telefonen wandert die Sidebar von der Seite nach unten
  if (isTiny) {
    maxWidth += 300
    maxHeight -= document.querySelector("#sidebar").getBoundingClientRect().height
  }
  while (ebenen * abstand + hoch + stammHoch + sternHoch > maxHeight) {  // Wir nehmen Ebenen weg, bis der Baum ins Bild passt
    ebenen -= 1;
  }
  breit = Math.min(breit, maxWidth)  // Die erste Ebene darf höchstens so breit sein wie das Bild
  while (breit + (ebenen * (30 * (breitverlauf * 0.25 + 1))) > maxWidth) {  // Wir nehmen Ebenen weg, bis der Baum ins Bild passt
    ebenen -= 1;
  }

  // Der Baum selber besteht aus mehreren Dreiecken
  for (var schleife = 0; schleife < ebenen; schleife++) {
      // Jeder Schleifendurchgang generiert ein Dreieck im Baum
      links = mitte - (breit / 2)
      rechts = mitte + (breit / 2)
      var linksPunkt = new Point(links, unten)
      var rechtsPunkt = new Point(rechts, unten)
      var mittelPunkt = new Point(mitte, unten - hoch)

      // Zuerst generieren wir die Linie von linksunten nach rechtsunten.
      // Der Wert in der Mitte legt fest, ob der Baum gebogen ist.
      var dreieck = new Path.Arc(
          linksPunkt,
          new Point(mitte, unten + (5 + schleife) * istGebogen),
          rechtsPunkt
      )

      // Dann malen wir die Linie von rechts unten nach oben.
      try {
          dreieck.arcTo(
              istGebogen ? new Point(
                  mitte + breit * 0.35, unten - hoch * 0.2
              ) : mittelPunkt,
              mittelPunkt
          )
      } catch (e) {  // Wenn wir den Bogen nicht malen können, nehmen wir eine gerade Linie
          dreieck.add(mittelPunkt)
      }

      // Zum Schluss malen wir die Linie von oben nach links unten.
      try {
          dreieck.arcTo(
              istGebogen ? new Point(
                  mitte - breit * 0.35,
                  unten - hoch * 0.2
              ) : linksPunkt,
              linksPunkt
          )
      } catch (e) {  // Wenn wir den Bogen nicht malen können, nehmen wir eine gerade Linie
          dreieck.add(linksPunkt)
      }
      dreieck.closePath()  // Jetzt ist das Dreieck fertig

      dreieck.fillColor = featureFarbe ? new Color(rot, gruen, blau) : new Color(1, 1, 1)
      var saturation = (ebenen + farbverlauf - schleife) / (ebenen + farbverlauf)
      dreieck.fillColor.saturation = saturation  // Die Sättigung macht eine Farbe kräftiger/dunkler
      dreieck.fillColor.alpha = transparenz
      dreieck.strokeColor = new Color(rot, gruen, blau)
      dreieck.strokeColor.saturation = saturation
      dreieck.strokeColor.brightness -= strichhelle
      dreieck.strokeWidth = strichbreite
      dreieck.alpha = transparenz
      dreieck.rotate(rotationsRichtung * rotation * schleife)

      // Wir fügen das Dreieck zum Baum hinzu, und setzen es hinter die bisherigen Dreiecke
      baum.addChild(dreieck)
      dreieck.sendToBack()

      // Für den nächsten Schleifendurchgang verändern wir Ausgangspunkt, Breite und Höhe.
      unten = unten + abstand
      breit = breit + 30 * (breitverlauf * 0.25 + 1)
      hoch = hoch + 10 * (hochverlauf * 0.5 + 1)
  }

  // Hier zeichnen wir den Stamm
  var stammBreit = Math.min(zufallszahl(20, 80), breit - 40)
  var stamm = new Path.Rectangle(
      new Point(mitte - (stammBreit / 2), unten - abstand - stammOffset),
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

  // Der Baum wird zum Projekt hinzugefügt. Das macht, dass er mit auf den exportierten Bildern ist.
  baum.addTo(paper.project)

  // Der Cursor soll zeigen, dass der Baum anklickbar ist
  baum.onMouseEnter = function (event) { canvas.style.cursor = "pointer"; }
  baum.onMouseLeave = function (event) { canvas.style.cursor = "default"; }

  // Wenn man auf den Baum klickt, wird noch einer gepflanzt.
  // Im mobilen Modus löschen wir davor den alten, weil eh nur einer aufs Bild passt.
  baum.onClick = isTiny ? waldRoden : pflanzeBaum;

  // Hier finden wir einen guten Ort: So, dass nichts aus dem Browser ragt.
  // Für Handys ist der Baum immer mittig.
  baum.position = findBaumLocation(breit, (unten - abstand - stammOffset + stammHoch) - startOben)

  // Wir legen den Baum mit in unsere Wald-Liste, die wir dann sortieren
  // Das Sortieren macht, dass Bäume, die weiter vorne sind, über denen liegen, die weiter hinten sind.
  wald.push(baum)
  waldSortieren()

  // Wir setzen die Anzahl der Bäume in den Seitentitel, weil wir es können.
  document.title = "∞ Tannenbaum " + "🎄".repeat(wald.length)
}

function waldRoden () {
  // Hier löschen wir alle Bäume und legen einen neuen an.
  wald.forEach(baum => baum.remove())
  wald = []
  pflanzeBaum()
}

function waldSortieren () {
  // Wir sortieren den Wald danach, wo der Stamm des Baums unten endet, damit es perspektivisch richtig aussieht.
  wald.sort((baum1, baum2) => {
    return baum2.bounds.y + baum2.bounds.height - baum1.bounds.y - baum1.bounds.height
  })
  // Jetzt nehmen wir uns alle Paare von Bäumen, und legen jeweils den richtigen nach oben.
  for (position = 0; position < wald.length - 1; position++) {
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
