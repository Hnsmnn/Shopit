# Shopit 🛒

Einkaufslisten-App fürs Handy (iPhone & Android) – mit Gerichten, Standardeinkäufen und automatischer Sortierung nach Kategorien.

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

Shopit ist eine Web-App (PWA) und läuft auf iPhone und Android – ohne App Store.

1. Am Handy öffnen: **https://hnsmnn.github.io/Shopit/**
2. **iPhone (Safari):** „Teilen“ → „Zum Home-Bildschirm“
   **Android (Chrome):** Menü ⋮ → „App installieren“
3. Shopit startet dann wie eine normale App und funktioniert auch offline. Updates kommen automatisch.

## Entwicklung

- Reine Web-App ohne Build-Schritt: `index.html`, `style.css`, `app.js`, `categories.js` (Kategorie-Erkennung), `recipes-vegan.js` (Rezeptsammlung)
- `sw.js` sorgt für Offline-Betrieb, `manifest.webmanifest` für die Installation
- Lokal testen: `python3 -m http.server` im Repo-Ordner, dann http://localhost:8000
- Veröffentlicht wird über GitHub Pages (Einstellungen → Pages → Branch)
