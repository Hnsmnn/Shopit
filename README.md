# Shopit 🛒

Einkaufslisten-App für Android – mit Gerichten, Standardeinkäufen und automatischer Sortierung nach Kategorien.

## Funktionen

- **Mehrere Einkaufslisten**, automatisch nach Kategorien sortiert (Reihenfolge unter „Mehr“ anpassbar, z. B. passend zu den Gängen im Supermarkt)
- **Gerichte** mit allen Zutaten speichern – inkl. Zubereitungsdauer
- **Standardeinkäufe** (z. B. „Frühstück“, „Grillabend“) – funktionieren wie Gerichte, werden aber getrennt angezeigt
- Zutaten können als **optional** markiert werden: Beim Hinzufügen sind nur die nicht-optionalen vorausgewählt, alles lässt sich vorher an-/abwählen
- Gerichte sortieren: **A–Z**, nach **Dauer** oder danach, was **am längsten nicht mehr** auf der Liste war
- **Abhaken** beim Einkaufen: Artikel verschwinden nach kurzer Zeit, lassen sich unter „Erledigt“ aber wiederherstellen, bis man auf **„Einkauf abschließen“** tippt
- Die App merkt sich, wenn du die Kategorie eines Artikels änderst
- Alle Daten bleiben lokal auf dem Handy (Backup über die Zwischenablage möglich)

## App installieren

1. Am Handy die neueste Version öffnen: **[Shopit.apk herunterladen](https://github.com/Hnsmnn/shopit/releases/latest/download/Shopit.apk)**
2. Die Datei öffnen. Android fragt beim ersten Mal, ob Installationen aus dieser Quelle erlaubt werden sollen → erlauben.
3. Updates werden genauso installiert – deine Daten bleiben erhalten.

## Entwicklung

- Web-App (HTML/CSS/JS ohne Build-Schritt) in `www/`, verpackt mit [Capacitor](https://capacitorjs.com/) als Android-App in `android/`
- Lokal im Browser testen: `cd www && python3 -m http.server`
- Jeder Push baut über GitHub Actions automatisch eine neue APK und veröffentlicht sie unter „Releases“
