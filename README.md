# 🐾 BULLDOG: DARK CITY

![Bulldog: Dark City – erstes Projektcover](img/cover/BulldogDarkCityCoverREADME.png)

> **A cinematic 2D Action Platformer about survival, mutation and hope.**

## 🎮 Spielidee

**BULLDOG: DARK CITY** ist ein düsteres 2D-Jump-and-Run-Actionspiel, das in
einer heruntergekommenen Cyberpunk-Metropole spielt.

Der Spieler übernimmt die Kontrolle über eine französische Bulldogge, die
nach einem geheimen Experiment aus einem Forschungslabor entkommt.

Zwischen zerstörten Straßenzügen, Neonlichtern und verlassenen
Industrieanlagen kämpft sie sich durch eine feindliche Welt.

Doch ihr Ziel ist nicht Rache.

Sie sucht den Menschen, der ihr eines Tages ein Zuhause schenken wird – eine
Person, die sie noch nie getroffen hat.

## 🐶 Die Geschichte

Nach einem fehlgeschlagenen genetischen Experiment gelingt einer
französischen Bulldogge die Flucht aus einem geheimen Labor.

Die Stadt außerhalb ist längst verloren:

- mutierte Tiere
- Hundefänger
- verseuchte Nahrung
- mechanische Kreaturen

Überall lauern Gefahren.

Während ihrer Reise stößt die Bulldogge immer wieder auf Hinweise einer
geheimnisvollen Frau. Sie weiß nicht, wer diese Person ist. Sie weiß nur, dass
sie ihr folgen muss.

Am Ende ihrer Reise werden sich beide zum ersten Mal begegnen – nicht als
Besitzerin und Hund, sondern als zwei Überlebende.

Die Geschichte wird nahezu vollständig **ohne gesprochene Dialoge** erzählt.
Emotionen, Animationen, Musik, Umgebung und Zwischensequenzen übernehmen das
Storytelling.

## 🦴 Mutation

Die Bulldogge besitzt zwei verschiedene Zustände.

### Normaler Modus

- Fortbewegung auf vier Pfoten
- Rennen
- Springen
- Beißen
- Kratzen
- Gegner anspringen
- schneller und beweglicher

### Mutierter Modus

Durch radioaktive Spezialnahrung verwandelt sich die Bulldogge für kurze Zeit.

Beispiele:

- Gamma-Knochen
- Mutantenfutter
- experimentelle Leckerlis

Während der Mutation läuft die Bulldogge auf zwei Beinen. Sie wird extrem
muskulös und erhält neue Fähigkeiten:

- Supersprung
- Doppelsprung
- Super-Schüttelbiss
- Knochen-Pumpgun
- gewaltiger Prankenhieb
- höherer Schaden

Nach wenigen Sekunden endet die Mutation automatisch.

## ⚔️ Gegner

Geplant sind unter anderem:

- Hundefänger
- Elite-Hundefänger
- Sicherheitsdrohnen
- mutierte Katzen
- Roboter-Katzen
- Roboter-Ratten
- vergiftete Futterautomaten
- weitere mutierte Kreaturen

## 👑 Endgegner

Eine scheinbar harmlose Babykatze steuert einen gigantischen Kampfroboter.

Der Boss besitzt **7 Leben**, die sich über mehrere Kampfphasen verteilen.

Angriffe:

- Kratzwellen
- riesiger Fellknäuel
- mechanische Angriffe
- Katzen-Drohnen
- Kombinationen verschiedener Attacken

## 🌆 Spielwelt

Die Welt besteht aus einer düsteren Cyberpunk-Stadt.

Geplante Gebiete:

- Forschungslabor
- Käfiggassen
- verlassene Industriegebiete
- Neon-Straßen
- Kanalisation
- Tiergefängnisse
- Cyber-Fabriken
- Hochhäuser
- Dächer
- Untergrund
- Endboss-Arena

Typische Hindernisse:

- Hundekäfige
- Elektrozäune
- Laser
- Förderbänder
- giftiges Wasser
- Müllpressen
- einstürzende Plattformen
- Lüftungsschächte

## 🎯 Gameplay

Der Fokus liegt auf einer Mischung aus:

- klassischem Jump-and-Run
- Action
- Erkundung
- Plattform-Passagen
- Bosskämpfen
- kleinen Rätseln
- Timing
- Transformationen

## 🚀 Geplante Features

- 2D-Sidescroller
- flüssige Animationen
- dynamische Bosskämpfe
- Mutationssystem
- Sammelobjekte
- Upgrade-System
- Checkpoints
- Speicherstände
- verschiedene Gegnertypen
- Zwischensequenzen
- mehrere Level
- Geheimräume
- alternative Enden

## 💻 Technik

Das Projekt wird mit modernen Webtechnologien entwickelt.

- **Phaser 3 und HTML5 Canvas:** Darstellung, Spielschleife und Physik
- **Objektorientiertes JavaScript:** Player, Gegner, Boss, Projektile,
  Plattformen, Level, UI und Animationen
- **JSON:** Leveldaten, Gegnerpositionen, Upgrades, Assets und Balancing
- **HTML und CSS:** Hauptmenü, Einstellungen, Pause, Ladebildschirm und
  responsive Benutzeroberfläche
- **LocalStorage:** Einstellungen, Lautstärke, Tastaturbelegung, Rekorde,
  freigeschaltete Inhalte und Spielstand
- **Vite:** lokaler Entwicklungsserver und Produktions-Build

## 📂 Projektstruktur

```text
bulldog-dark-city/
├── classes/
│   ├── base/
│   ├── core/scenes/
│   ├── entities/
│   ├── environment/
│   ├── input/
│   ├── systems/
│   └── ui/
├── js/
│   ├── config/
│   ├── levels/
│   ├── ui/
│   └── utils/
├── data/
│   └── levels/
├── img/
│   ├── backgrounds/
│   ├── concepts/
│   ├── cover/
│   ├── fonts/
│   ├── images/
│   ├── sprites/
│   ├── tilesets/
│   └── ui/
├── audio/
├── styles/
├── docs/
├── templates/
├── index.html
├── style.css
├── script.js
└── package.json
```

Weitere Architekturregeln stehen in
[`docs/project-structure.md`](docs/project-structure.md).

## 🤖 Assetdaten

### Bilder

Ein Großteil der Grafiken, Illustrationen, Konzeptbilder und visuellen Assets
wird mithilfe KI-generierter Bildmodelle erstellt und anschließend bei Bedarf
weiter angepasst oder überarbeitet.

### Audio

Musik, Soundeffekte und Sprachaufnahmen werden mithilfe von
Wondershare-Produkten erstellt, aufgenommen oder nachbearbeitet.

## 📈 Projektstatus

### Aktuelle Phase

**Vorproduktion (Pre-Production)**

Derzeit befinden wir uns in der Konzeptions- und Planungsphase.

Aktueller Fortschritt:

- ✅ Grundidee entwickelt
- ✅ Spielgenre definiert
- ✅ Storykonzept erstellt
- ✅ Hauptcharakter entwickelt
- ✅ Mutationssystem geplant
- ✅ Gegnerkonzept erstellt
- ✅ Endboss entworfen
- ✅ erste Cover-Art erstellt
- ✅ Technologiestack festgelegt
- ⏳ Game Design Document
- ⏳ Gameplay-Prototyp
- ⏳ erstes Level
- ⏳ Animationen
- ⏳ Sounddesign
- ⏳ Bosskampf
- ⏳ weitere Level
- ⏳ vollständige Spielkampagne

## Installation und Start

Voraussetzung ist eine aktuelle Node.js-Version.

```bash
npm install
npm run dev
```

Für einen Produktions-Build:

```bash
npm run build
```

## 🎯 Langfristiges Ziel

**BULLDOG: DARK CITY** soll ein atmosphärisches 2D-Action-Adventure werden,
das klassische Jump-and-Run-Mechaniken mit moderner Präsentation, emotionalem
Storytelling und einem einzigartigen Mutationssystem verbindet.

Unser Ziel ist es, ein Spiel zu entwickeln, das durch seinen Stil, seine
Charaktere und seine Welt langfristig im Gedächtnis bleibt.

## © Hinweis

Dieses Projekt befindet sich aktuell in Entwicklung.

Alle Konzepte, Designs und Spielmechaniken können sich während der Entwicklung
verändern oder erweitert werden.
