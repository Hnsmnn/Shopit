'use strict';

// Rezeptsammlung "Vegane Lieblingsrezepte" – wird einmalig in die App importiert.
// Zutaten: [Name, Menge, optional]. Alternativen ("– oder –") und Dinge, die man
// meist zu Hause hat (Salz, Pfeffer, Öl …), sind als optional markiert.
// Die Zubereitungsdauer ist aus den Arbeitsschritten geschätzt.
const RECIPE_PACKS = [{
  id: 'vegan-lieblingsrezepte',
  // Kategorien für Zutaten, die die automatische Erkennung falsch einordnen würde
  learned: {
    'geröstete paprika (glas)': 'canned',
    'getrocknete tomaten': 'canned',
    'sylter salatsoße (vegan)': 'dairy',
    'veganer vanille-skyr': 'dairy',
    'vegane beef patties (tk)': 'frozen',
    'blubbspinat (tk)': 'frozen',
    'zitronensaft': 'canned',
    'limettensaft': 'canned',
    'seidentofu': 'dairy',
    'koriander (gemahlen)': 'baking',
  },
  recipes: [
    { name: 'Mapo Tofu Udon', duration: 20, ingredients: [
      ['Seidentofu', '300 g'], ['Fester Tofu', '200 g'], ['Udon-Nudeln (vorgekocht)', '1 Packung'],
      ['Sambal Oelek', '1 EL'], ['Sojasoße', '4 EL'], ['Balsamicoessig', '4 EL'],
      ['Pflanzenöl', '1 EL', true], ['Salz', '1 Prise', true],
      ['Petersilie', '', true], ['Frühlingszwiebeln', '', true],
    ] },
    { name: 'Sojaschnitzel mit Kartoffeln & Spinat', duration: 30, ingredients: [
      ['Sojaschnitzel', '2'], ['Kartoffeln', '400 g'], ['Blubbspinat (TK)', '1 Packung'],
      ['Sonnenblumenöl', '1 EL', true], ['Salz', '', true], ['Pfeffer', '', true], ['Muskatnuss', '', true],
    ] },
    { name: 'Rotes Linsendal', duration: 35, ingredients: [
      ['Rote Linsen', '300 g'], ['Zwiebeln', '2'], ['Knoblauch', '4 Zehen'], ['Ingwer', '2 TL gerieben'],
      ['Kurkuma', '1 TL'], ['Koriander (gemahlen)', '1 TL'], ['Kreuzkümmel', '1 TL'],
      ['Paprikapulver', '1 TL'], ['Garam Masala', '1 TL'], ['Gemüsebrühe', '780 ml'],
      ['Kokosmilch', '250 ml'], ['Gehackte Tomaten', '250 ml'], ['Limettensaft', '2–3 EL'],
      ['Olivenöl', '1–2 EL', true], ['Salz', '', true], ['Pfeffer', '', true],
      ['Veganer Joghurt', '', true], ['Petersilie', '', true], ['Reis', '', true], ['Fladenbrot', '', true],
    ] },
    { name: 'Spaghetti Bolognese', duration: 45, ingredients: [
      ['Linsen (rot oder braun)', '200 g'], ['Sojahack (Kühlregal)', '200 g', true],
      ['Spaghetti', '250 g'], ['Zwiebel', '1'], ['Knoblauch', '2 Zehen'], ['Möhren', '2'],
      ['Sellerie', '100 g', true], ['Gehackte Tomaten', '400 g'], ['Gemüsebrühe', '150–250 ml'],
      ['Tomatenmark', '1 EL'], ['Italienische Kräuter', '2 TL'], ['Olivenöl', '2 EL', true],
      ['Zucker', '1 TL', true], ['Salz', '', true], ['Pfeffer', '', true],
      ['Hefeflocken', '', true], ['Basilikum', '', true],
    ] },
    { name: 'Linsensalat mit veganem Feta', duration: 15, ingredients: [
      ['Linsen (Dose)', '250 g'], ['Belugalinsen (trocken)', '100 g', true], ['Kirschtomaten', '250 g'],
      ['Veganer Feta', '180 g'], ['Frühlingszwiebeln', ''], ['Petersilie', ''],
      ['Zitronensaft', '1 EL'], ['Ahornsirup', '1 TL'], ['Balsamicoessig', '1 TL'], ['Sojasoße', '1 TL'],
      ['Knoblauch', '1 Zehe'], ['Olivenöl', '2 EL', true], ['Salz', '', true], ['Pfeffer', '', true],
    ] },
    { name: 'Cremige Thai Udon', duration: 20, ingredients: [
      ['Udon-Nudeln (vorgekocht)', '200 g'], ['Brokkoli', '1'], ['Möhre', '1'], ['Edamame (TK)', '100 g'],
      ['Rote Currypaste', '1 EL'], ['Erdnussmus', '2 EL'], ['Sojasoße', '2 EL'], ['Ahornsirup', '1 EL'],
      ['Limette', '½'], ['Kokosmilch', '250 ml'], ['Frühlingszwiebeln', ''], ['Sesam', '', true],
    ] },
    { name: 'Spaghetti Carbonara', duration: 25, ingredients: [
      ['Fester Tofu', '200 g'], ['Vegane Schinkenwürfel', '150 g', true], ['Spaghetti', '250 g'],
      ['Seidentofu', '300 g'], ['Hefeflocken', '3 EL'], ['Helle Misopaste', '1 TL'],
      ['Sojamilch (ungesüßt)', '100 ml'], ['Sojasoße', '2 EL'], ['Zitronensaft', '1 EL'],
      ['Knoblauch', '2 Zehen'], ['Knoblauchpulver', '1 TL'], ['Paprikapulver (geräuchert)', '1 TL'],
      ['Schnittlauch', '', true], ['Olivenöl', '1 EL', true], ['Salz', '', true], ['Pfeffer', '', true],
      ['Muskatnuss', '', true],
    ] },
    { name: 'Mie Goreng', duration: 35, ingredients: [
      ['Tempeh', '200 g'], ['Karotten', '2'], ['Frühlingszwiebeln', '4'], ['Rote Zwiebel', '1'],
      ['Knoblauch', '4 Zehen'], ['Chinakohl', '450 g'], ['Mie-Nudeln', '250 g'], ['Ahornsirup', '4 EL'],
      ['Sojasoße', '4 TL'], ['Tomatenketchup', '2 EL'], ['Sambal Oelek', '1–2 TL'],
      ['Rapsöl', '4 EL', true], ['Chili', '', true],
    ] },
    { name: 'Bunter Salat mit Croutons', duration: 20, ingredients: [
      ['Eisbergsalat', '½'], ['Paprika', '½'], ['Gurke', '½'], ['Kirschtomaten', ''],
      ['Toastbrot', '2 Scheiben'], ['Knoblauchpulver', '', true], ['Olivenöl', '1 EL', true],
      ['Salz', '', true], ['Pfeffer', '', true],
      ['Veganes Gyros', '150 g', true], ['Vegane Maultaschen', '150 g', true],
      ['Sylter Salatsoße (vegan)', '', true], ['Senf', '', true], ['Essig', '', true],
    ] },
    { name: 'Tomaten-Aubergine-Gnocchi', duration: 30, ingredients: [
      ['Gnocchi (Kühlregal)', '200 g'], ['Tomaten', '2 große'], ['Aubergine', '1'], ['Knoblauch', '5 Zehen'],
      ['Hafersahne', '200 ml'], ['Hefeflocken', '2 EL'], ['Basilikum', ''],
      ['Oregano', '', true], ['Chiliflocken', '', true], ['Olivenöl', '2 EL', true],
      ['Salz', '', true], ['Pfeffer', '', true],
    ] },
    { name: 'Veganer Burger mit Pommes', duration: 30, ingredients: [
      ['Vegane Crispy Chicken Patties', '2–4'], ['Vegane Beef Patties (TK)', '2–4', true],
      ['Vegane Burgerbrötchen', '2–4'], ['Veganer Scheibenkäse', ''], ['Tomate', '1'],
      ['Eisbergsalat', ''], ['Zwiebel', '1'], ['Gitterpommes (TK)', ''],
      ['Ketchup', '', true], ['Vegane Mayonnaise', '', true], ['Avocado', '1', true],
    ] },
    { name: 'Falafel-Wraps', duration: 25, ingredients: [
      ['Falafel-Fertigmischung', '1 Packung'], ['Falafel (Kühlregal)', '1 Packung', true],
      ['Weizentortillas', '6'], ['Karotten', '2'], ['Landgurke', '1'], ['Kirschtomaten', ''],
      ['Salat', ''], ['Veganer Feta', ''], ['Hummus', ''], ['Veganer Skyr', ''],
      ['Peperoni', '', true],
    ] },
    { name: 'Chili sin Carne Wraps oder Dürüm', duration: 30, ingredients: [
      ['Weizentortillas', '6'], ['Dürüm-Fladenbrote', '8', true], ['Sojageschnetzeltes', '150 g'],
      ['Zwiebel', '1'], ['Gehackte Tomaten', '1 Dose'], ['Chilibohnen', '1 Dose'],
      ['Kirschtomaten', ''], ['Salat', ''], ['Mais (Dose)', '', true], ['Veganer Feta', '', true],
    ] },
    { name: 'Cremige Paprika-Cashew-Pasta', duration: 20, ingredients: [
      ['Fester Tofu', '200 g'], ['Seidentofu', '200 g', true], ['Nudeln', '500 g'],
      ['Geröstete Paprika (Glas)', '200 g'], ['Kirschtomaten', '6'], ['Cashews', '70 g'],
      ['Knoblauch', '2 Zehen'], ['Paprikapulver (geräuchert)', '1 TL'], ['Salz', '', true],
    ] },
    { name: 'Toskanische Spinat Pasta', duration: 25, ingredients: [
      ['Pasta (Penne oder Rigatoni)', '200 g'], ['Vegane Tortellini', '200 g', true],
      ['Limabohnen', '1 Dose', true], ['Seidentofu', '400 g'], ['Sojamilch (ungesüßt)', '100 ml'],
      ['Cashews', '25 g', true], ['Knoblauch', '4 Zehen'], ['Getrocknete Tomaten', '100 g'],
      ['Tomatenmark', '2 TL'], ['Spinat (frisch)', '200 g'], ['Hefeflocken', '2 TL'],
      ['Italienische Kräuter', '2 TL'], ['Zitronensaft', '2 TL'], ['Olivenöl', '2 TL', true],
      ['Salz', '', true], ['Pfeffer', '', true], ['Basilikum', '', true], ['Chiliflocken', '', true],
    ] },
    { name: 'Reisbowl & Reisnudelsalat', duration: 35, ingredients: [
      ['Reis (Jasmin oder Basmati)', '160 g'], ['Reisnudeln', '150 g', true],
      ['Edamame (TK)', '100 g'], ['Karotten', '2'], ['Avocado', '1'], ['Paprika', '1'],
      ['Frühlingszwiebeln', '2'], ['Koriander', '', true], ['Sesam', '', true],
      ['Erdnussmus', '3 EL'], ['Sojasoße', '2 EL'], ['Reisessig', '1 EL'], ['Ahornsirup', '1 EL'],
      ['Sesamöl', '1 TL'], ['Sriracha', '1 TL'], ['Knoblauch', '1 Zehe'], ['Limette', '½'],
      ['Asia-Gewürzmischung', '½ TL'], ['Naturtofu', '150 g'], ['Speisestärke', '', true],
      ['Kichererbsen', '1 Dose', true], ['Tempeh', '100 g', true], ['Sambal Oelek', '', true],
    ] },
    { name: 'Flammkuchen Elsässer Art', duration: 25, ingredients: [
      ['Flammkuchenteig (Kühlregal)', '1 Packung'], ['Vegane Crème fraîche', '150 g'],
      ['Vegane Schinkenwürfel', '100 g'], ['Rote Zwiebel', '1'], ['Muskatnuss', '', true],
      ['Salz', '', true], ['Pfeffer', '', true], ['Petersilie', '', true],
    ] },
    { name: 'Kichererbsen-Curry', duration: 35, ingredients: [
      ['Süßkartoffeln', '400 g'], ['Kichererbsen', '1 Dose'], ['Paprika', '1'],
      ['Prinzessinnenbohnen', '150 g'], ['Ingwer', '1 Stück (3 cm)'], ['Rote Currypaste', '2 EL'],
      ['Kokosmilch', '1 Dose'], ['Gemüsebrühe', '250 ml'], ['Limettensaft', '1 EL'],
      ['Pflanzenöl', '1 EL', true], ['Thai-Basilikum', '', true], ['Reis', '200 g', true],
    ] },
    { name: 'Miso-Ramen', duration: 45, ingredients: [
      ['Fester Tofu', '400 g'], ['Tempeh', '300 g', true], ['Sojasoße', '6 EL'], ['Tomatenmark', '1 EL'],
      ['Paprikapulver (geräuchert)', '1 TL'], ['Knoblauch', '3 Zehen'], ['Ingwer', '1 Stück (3 cm)'],
      ['Chili', '1'], ['Gemüsebrühe', '1 l'], ['Helle Misopaste', '4 EL'], ['Sesamöl', '1 EL + 1 TL'],
      ['Limettensaft', '1 TL'], ['Pilze (Shiitake oder Champignons)', '300 g'], ['Karotten', '2'],
      ['Pak Choi', '2'], ['Mie-Nudeln (ohne Ei)', '300 g'], ['Pflanzenöl', '1 EL', true],
      ['Frühlingszwiebeln', '', true], ['Sesam', '', true], ['Chiliöl', '', true],
    ] },
    { name: 'Veganer Käsekuchen', duration: 120, ingredients: [
      ['Vegane Vollkornkekse', '150 g'], ['Margarine', '175 g'], ['Veganer Vanille-Skyr', '600 g'],
      ['Speisestärke', '60 g'], ['Zucker', '90 g'], ['Vanillepaste', '½ TL'],
      ['Salz', '1 Prise', true], ['Zitronensaft', '1 TL', true],
    ] },
    { name: 'Protein-Bananenbrot', duration: 80, ingredients: [
      ['Bananen', '3'], ['Ahornsirup', '60 g'], ['Kokosöl', '60 g'], ['Pflanzenmilch', '50 ml'],
      ['Leinsamen (geschrotet)', '2 EL'], ['Mehl', '200 g'], ['Veganes Proteinpulver', '30 g'],
      ['Natron', '1 TL'], ['Zimt', '1 TL'], ['Salz', '1 Prise', true],
      ['Vegane Schokodrops', '', true], ['Kokoschips', '', true],
    ] },
    { name: 'Bananen-Pancakes', duration: 25, ingredients: [
      ['Weizenmehl', '200 g'], ['Haferflocken', '200 g', true], ['Bananen', '2'],
      ['Pflanzenmilch', '200 ml'], ['Backpulver', '1 TL'], ['Salz', '1 Prise', true],
      ['TK-Beeren', '', true], ['Ahornsirup', '', true],
    ] },
  ],
}];


// Zubereitungsschritte und Tipps aus dem Kochbuch, nach Rezeptname.
// Werden in vorhandene Rezepte übernommen, solange diese noch keine Schritte haben.
const RECIPE_STEPS = {
  id: 'vegan-lieblingsrezepte-schritte',
  recipes: {
    "Mapo Tofu Udon": {
      "steps": [
        {
          "title": "Seidentofu pürieren",
          "text": "Den Seidentofu mit einer Prise Salz in einen Mixer oder eine hohe Rührschüssel geben und glatt pürieren, bis eine samtige, cremige Masse entsteht. Beiseitestellen."
        },
        {
          "title": "Udon kochen",
          "text": "Die Udonnudeln nach Packungsanweisung kochen."
        },
        {
          "title": "Tofu anbraten",
          "text": "Den Naturtofu in eine Pfanne bröseln und bei mittlerer bis hoher Hitze den Tofu von allen Seiten goldbraun anbraten. Zum Tofu Sambal Oelek, Sojasoße und Balsamicoessig hinzugeben und alles kurz anbraten."
        },
        {
          "title": "Anrichten",
          "text": "Die Udon in eine Schüssel geben, die Seidentofu-Sauce darüber verteilen und den gebräunten Tofu obenauf geben. Nach Belieben mit frisch gehackter Petersilie und Frühlingszwiebeln bestreuen und sofort servieren."
        }
      ],
      "tip": "Wer es weniger scharf mag, nimmt nur einen halben Esslöffel Sambal Oelek. Für extra Umami lässt sich ein Schuss Sesamöl zum Schluss unterrühren."
    },
    "Sojaschnitzel mit Kartoffeln & Spinat": {
      "steps": [
        {
          "title": "Kartoffeln kochen",
          "text": "Die Kartoffeln schälen und in gleichmäßige Stücke schneiden. In einem Topf mit gesalzenem Wasser zum Kochen bringen und bei mittlerer Hitze etwa 20 Minuten garen."
        },
        {
          "title": "Spinat auftauen",
          "text": "Den Blubbspinat in einem kleinen Topf bei niedriger Hitze oder in der Mikrowelle langsam auftauen und erwärmen. Mit Salz, Pfeffer und einer Prise Muskatnuss nach Belieben abschmecken."
        },
        {
          "title": "Sojaschnitzel anbraten",
          "text": "Das Sonnenblumenöl in einer Pfanne bei mittlerer bis hoher Hitze erhitzen. Die Sojaschnitzel darin von beiden Seiten je etwa drei bis vier Minuten goldbraun und knusprig anbraten."
        },
        {
          "title": "Anrichten",
          "text": "Kartoffeln, Spinat und Sojaschnitzel auf dem Teller anrichten."
        }
      ],
      "tip": "Die Kartoffeln können auch als Stampf serviert werden – einfach mit einem Schuss Pflanzendrink und etwas Margarine zu Püree verarbeiten."
    },
    "Rotes Linsendal": {
      "steps": [
        {
          "title": "Zwiebeln anschwitzen",
          "text": "Das Öl in einer Pfanne oder einem Topf erhitzen. Die gewürfelten Zwiebeln dazugeben und 2–3 Minuten glasig dünsten."
        },
        {
          "title": "Knoblauch, Ingwer & Gewürze",
          "text": "Den Knoblauch und Ingwer hinzugeben und eine weitere Minute anbraten, bis es gut duftet. Zuletzt alle Gewürze hinzugeben und einige Sekunden anschwitzen, damit sich die Aromen entfalten."
        },
        {
          "title": "Linsen hinzufügen",
          "text": "Die Linsen in ein feines Sieb geben und unter fließendem kaltem Wasser abspülen. Zur Zwiebelmischung in die Pfanne geben, mit der Gemüsebrühe aufgießen, umrühren und zum Kochen bringen."
        },
        {
          "title": "Fladenbrot/Reis vorbereiten",
          "text": "Fladenbrot oder Reis nach Packungsbeilage aufbacken/kochen."
        },
        {
          "title": "Köcheln lassen",
          "text": "Zugedeckt 10–15 Minuten köcheln lassen, bis die Linsen den größten Teil der Flüssigkeit aufgenommen haben. Dann Kokosmilch und gehackte Tomaten hinzufügen und weitere 5–10 Minuten köcheln lassen, bis die Linsen gar sind. Bei Bedarf etwas mehr Brühe oder Kokosmilch hinzufügen."
        },
        {
          "title": "Abschmecken",
          "text": "Mit Salz, Pfeffer und Limettensaft abschmecken."
        },
        {
          "title": "Anrichten & servieren",
          "text": "Das Dal mit einem Swirl veganem Joghurt, frisch gehackter Petersilie oder Koriander garnieren. Mit Reis oder Fladenbrot servieren."
        }
      ],
      "tip": "Das Dal schmeckt auch als Füllung für herzhafte Pfannkuchen, Crêpes oder Tortillas. Übrig gebliebenes Dal hält sich im Kühlschrank 3–4 Tage und lässt sich gut einfrieren."
    },
    "Spaghetti Bolognese": {
      "steps": [
        {
          "title": "Gemüse vorbereiten",
          "text": "Zwiebel, Knoblauch, Möhren und Sellerie schälen und in feine Würfel schneiden."
        },
        {
          "title": "Proteinbasis vorbereiten",
          "text": "Bei Linsen: Die Linsen in einem Sieb abspülen und in Gemüsebrühe oder Wasser ca. 15–20 Minuten vorkochen, bis sie weich sind, dann abgießen. Bei Sojahack aus der Kühlung: direkt ohne Vorbereitung verwenden."
        },
        {
          "title": "Anbraten",
          "text": "Das Olivenöl in einer beschichteten Pfanne erhitzen. Linsen oder Sojahack scharf anbraten, bis sie leicht gebräunt sind. Dann Zwiebeln, Möhren und Sellerie hinzugeben und braten, bis die Zwiebeln glasig sind. Zuletzt den Knoblauch ca. 30 Sekunden mitbraten."
        },
        {
          "title": "Sauce zubereiten",
          "text": "Tomatenmark, gehackte Tomaten hinzugeben und alles gut verrühren. Die Gemüsebrühe eingießen und die Sauce mit Salz, Pfeffer, italienischen Kräutern und Zucker abschmecken."
        },
        {
          "title": "Köcheln lassen",
          "text": "Bei mittlerer Hitze 15–20 Minuten köcheln lassen, bis die Sauce schön eingedickt ist."
        },
        {
          "title": "Nudeln kochen",
          "text": "In der Zwischenzeit die Spaghetti in gesalzenem Wasser bissfest kochen und anschließend abgießen."
        },
        {
          "title": "Anrichten",
          "text": "Die Spaghetti mit der Sauce servieren und nach Belieben mit Hefeflocken und frischem Basilikum garnieren."
        }
      ],
      "tip": "Die Sauce lässt sich gut einfrieren und hält sich im Kühlschrank 3–4 Tage. Optional kann die Sauce auch komplett aus ca. 1 kg frischen Tomaten zubereitet werden."
    },
    "Linsensalat mit veganem Feta": {
      "steps": [
        {
          "title": "Linsen vorbereiten",
          "text": "Die Dosenlinsen abgießen, unter fließendem Wasser abspülen und gut abtropfen lassen oder die trockenen Linsen nach Packungsanweisung kochen."
        },
        {
          "title": "Zutaten schneiden",
          "text": "Die Kirschtomaten in kleine Stücke schneiden. Den veganen Feta ebenfalls in kleine Würfel schneiden. Petersilie und Frühlingszwiebeln waschen und fein hacken."
        },
        {
          "title": "Salat zusammenstellen",
          "text": "Alle Salatzutaten in eine große Schüssel geben und vorsichtig vermengen."
        },
        {
          "title": "Dressing anrühren",
          "text": "Olivenöl, Zitronensaft, Ahornsirup, Balsamico-Essig, und Sojasoße in ein kleines Gefäß geben. Die Knoblauchzehe hineinpressen und kräftig mit Salz und Pfeffer würzen. Alles zu einem glatten Dressing verrühren."
        },
        {
          "title": "Anrichten & ziehen lassen",
          "text": "Das Dressing über den Salat gießen und alles gut vermengen. Noch einmal abschmecken und vor dem Servieren etwas durchziehen lassen."
        }
      ],
      "tip": "Den veganen Feta erst hinzufügen, wenn die Linsen abgekühlt sind, damit er nicht schmilzt."
    },
    "Cremige Thai Udon": {
      "steps": [
        {
          "title": "Gemüse vorbereiten",
          "text": "Den Brokkoli in mundgerechte Röschen teilen. Die Möhre schälen und in dünne Streifen schneiden."
        },
        {
          "title": "Alles in die Pfanne",
          "text": "Udon-Nudeln, Brokkoli, Möhre und Edamame direkt in eine große Pfanne geben."
        },
        {
          "title": "Sauce hinzufügen",
          "text": "Currypaste, Erdnussmus, Sojasoße, Ahornsirup, Limettensaft und Kokosmilch dazugeben und alles gut vermengen."
        },
        {
          "title": "Köcheln lassen",
          "text": "Bei hoher Hitze aufkochen, dann auf mittlere Hitze reduzieren und 10 Minuten köcheln lassen. Dabei regelmäßig umrühren, bis das Gemüse gar und die Sauce schön cremig ist."
        },
        {
          "title": "Anrichten",
          "text": "Die Frühlingszwiebeln fein hacken und zusammen mit Sesam als Topping über die Udon streuen."
        }
      ],
      "tip": "Für mehr Crunch einfach gehackte Erdnüsse als zusätzliches Topping darüberstreuen"
    },
    "Spaghetti Carbonara": {
      "steps": [
        {
          "title": "Nudeln kochen",
          "text": "Die Spaghetti in reichlich gesalzenem Wasser bissfest kochen. Vor dem Abgießen eine Tasse Nudelwasser aufbewahren – es hilft später, die Sauce auf die richtige Konsistenz zu bringen."
        },
        {
          "title": "Sauce mixen",
          "text": "Währenddessen Seidentofu, Hefeflocken, Misopaste, Sojamilch, Sojasoße, Zitronensaft und Knoblauchpulver in einen Mixer geben und glatt pürieren. Mit Salz, Pfeffer und einer Prise Muskatnuss abschmecken und beiseitestellen."
        },
        {
          "title": "In der Pfanne anbraten",
          "text": "Das Olivenöl in einer großen Pfanne bei mittlerer bis hoher Hitze erhitzen. Tofuwürfel oder Schinkenwürfel hineingeben und von allen Seiten knusprig anbraten. Das geräucherte Paprikapulver und den Knoblauch hinzugeben, kurz anschwitzen."
        },
        {
          "title": "Sauce erwärmen",
          "text": "Die gemixte Sauce in die Pfanne zu Tofu und Knoblauch geben und bei niedriger Hitze sanft erwärmen. Nicht kochen lassen, da die Sauce sonst ausflockt. Nach Bedarf etwas Nudelwasser einrühren, bis die gewünschte Cremigkeit erreicht ist."
        },
        {
          "title": "Alles vermengen",
          "text": "Die abgegossenen Spaghetti direkt in die Pfanne geben und gut mit der Sauce vermengen. Die angebratene Einlage unterheben und alles nochmals abschmecken."
        },
        {
          "title": "Anrichten",
          "text": "Auf zwei Teller verteilen und mit frischem Schnittlauch oder Petersilie, Hefeflocken und frisch gemahlenem Pfeffer garnieren."
        }
      ],
      "tip": "Die Sauce darf beim Erwärmen auf keinen Fall kochen – niedrige Hitze ist hier der Schlüssel zu einer seidigen, klumpenfreien Carbonara. Das aufgefangene Nudelwasser macht die Sauce besonders geschmeidig."
    },
    "Mie Goreng": {
      "steps": [
        {
          "title": "Gemüse vorbereiten",
          "text": "Karotten schälen und in dünne Streifen schneiden. Frühlingszwiebeln in Stücke schneiden. Rote Zwiebel halbieren und in Streifen schneiden. Knoblauch fein hacken. Kohl in feine Streifen schneiden."
        },
        {
          "title": "Nudeln vorkochen",
          "text": "Die Mie-Nudeln nach Packungsanweisung kochen. Sie dürfen noch etwas fest sein, da sie später noch weiter angebraten werden. Abgießen und beiseitestellen."
        },
        {
          "title": "Tempeh anbraten",
          "text": "Zwei Esslöffel Rapsöl in einer großen Pfanne oder einem Wok bei hoher Hitze erhitzen. Den Tempeh scharf anbraten, bis er von allen Seiten goldbraun ist – ca. 8–10 Minuten. Einen Esslöffel Ahornsirup, Sojasoße und einen Teelöffel Sambal Oelek hinzufügen, kurz schwenken und den Tempeh beiseitestellen."
        },
        {
          "title": "Gemüse anbraten",
          "text": "Die restlichen zwei Esslöffel Rapsöl in derselben Pfanne erhitzen. Die Karotten zwei Minuten andünsten. Dann rote Zwiebeln, Frühlingszwiebeln und Knoblauch hinzugeben und weitere zwei Minuten anbraten. Den Kohl hinzugeben und alles nochmals zwei Minuten unter Rühren anbraten, bis der Kohl leicht zusammengefallen ist."
        },
        {
          "title": "Nudeln & Sauce hinzufügen",
          "text": "Die vorgekochten Nudeln und die vorbereitete Sauce in die Pfanne geben. Alles gut vermengen und bei hoher Hitze zwei bis drei Minuten unter ständigem Rühren braten, bis die Nudeln die Sauce aufgenommen haben und leicht karamellisiert sind."
        },
        {
          "title": "Tempeh unterrühren",
          "text": "Den angebratenen Tempeh zurück in die Pfanne geben und alles nochmals gut vermengen. Abschmecken und bei Bedarf mit etwas mehr Sojasoße oder Sambal Oelek nachwürzen."
        },
        {
          "title": "Anrichten",
          "text": "Das Mie Goreng auf vier Schüsseln oder Teller verteilen und nach Belieben mit frischen Chiliringen garnieren."
        }
      ],
      "tip": "Für den typischen Wok-Geschmack (\"Wok Hei\") alles bei möglichst hoher Hitze und unter ständigem Rühren braten. Je nach gewünschter Schärfe einfach mehr oder weniger Sambal Oelek verwenden."
    },
    "Bunter Salat mit Croutons": {
      "steps": [
        {
          "title": "Croutons anbraten",
          "text": "Das Toastbrot in kleine Würfel schneiden. In einer Pfanne das Olivenöl bei mittlerer Hitze erhitzen, die Brotwürfel hinzugeben und mit Salz, Pfeffer, Paprikapulver und etwas Knoblauchpulver würzen. Unter gelegentlichem Wenden goldbraun und knusprig rösten – das dauert ca. 5 Minuten. Beiseitestellen."
        },
        {
          "title": "Topping anbraten",
          "text": "Das Olivenöl in einer Pfanne bei mittlerer bis hoher Hitze erhitzen. Veganes Gyros oder in Scheiben geschnittene Maultaschen darin von allen Seiten knusprig anbraten – ca. 3–5 Minuten. Beiseitestellen."
        },
        {
          "title": "Dressing anrühren",
          "text": "Für das Öl-Essig-Senf-Dressing alle Zutaten in ein kleines Schraubglas geben und kräftig schütteln oder mit einer Gabel verrühren. Abschmecken. Alternativ die Sylter Salatsoße bereitstellen."
        },
        {
          "title": "Salat zusammenstellen",
          "text": "Eisbergsalat, Paprika und Gurke in eine große Schüssel oder auf zwei Teller geben. Das Dressing darüber geben und alles vorsichtig vermengen."
        },
        {
          "title": "Anrichten",
          "text": "Das angebratene Topping und die Croutons über den Salat geben und sofort servieren – sonst werden die Croutons weich."
        }
      ],
      "tip": "Der Salat lässt sich beliebig anpassen. Das Dressing immer erst kurz vor dem Servieren darübergeben, damit der Salat knackig bleibt."
    },
    "Tomaten-Aubergine-Gnocchi": {
      "steps": [
        {
          "title": "Gnocchi anbraten",
          "text": "Etwas Olivenöl in einer Pfanne bei mittlerer bis hoher Hitze erhitzen. Die Gnocchi hinzugeben und von allen Seiten goldbraun und knusprig anbraten – ca. 5 Minuten. Beiseitestellen."
        },
        {
          "title": "Gemüse rösten",
          "text": "Das restliche Olivenöl in einer großen Pfanne bei mittlerer Hitze erhitzen. Die Aubergine längs halbieren und mit der Schnittfläche nach unten in die Pfanne legen. Die Tomaten ebenfalls halbieren und mit der Schnittfläche nach unten dazulegen. Die Knoblauchzehen ganz dazugeben. Alles ca. 12 Minuten garen, bis das Gemüse sehr weich ist und die Schnittflächen leicht gebräunt sind."
        },
        {
          "title": "Häute abziehen",
          "text": "Das Gemüse etwas abkühlen lassen. Anschließend die Haut von den Tomaten und der Aubergine abziehen – sie lässt sich nach dem Garen ganz leicht lösen."
        },
        {
          "title": "Sauce zerdrücken",
          "text": "Das Tomaten- und Auberginenfleisch sowie den Knoblauch direkt in der Pfanne mit einer Gabel grob zerdrücken. Die Hafersahne einrühren und Oregano, Hefeflocken, Salz, Pfeffer und Chiliflocken hinzugeben. Alles gut vermengen und bei niedriger Hitze 2–3 Minuten sanft erwärmen. Abschmecken."
        },
        {
          "title": "Anrichten",
          "text": "Die Soße über die angebratenen Gnocchi geben und großzügig mit frischem Basilikum garnieren."
        }
      ],
      "tip": "Je reifer die Tomaten, desto süßer und aromatischer wird die Sauce. Wer es intensiver mag, kann das Gemüse statt in der Pfanne auch bei 200 °C im Ofen für 20 Minuten rösten."
    },
    "Veganer Burger mit Pommes": {
      "steps": [
        {
          "title": "Pommes in den Ofen",
          "text": "Die Gitterpommes nach Packungsanweisung in den Airfryer oder in den vorgeheizten Backofen geben. In der Zwischenzeit alles andere vorbereiten."
        },
        {
          "title": "Gemüse schneiden",
          "text": "Tomate und Avocado in Scheiben schneiden. Salatblätter waschen und trocken schütteln. Die Zwiebel in Ringe schneiden."
        },
        {
          "title": "Zwiebelringe anbraten",
          "text": "Etwas Öl in einer Pfanne bei mittlerer Hitze erhitzen. Die Zwiebelringe darin unter gelegentlichem Wenden 5–7 Minuten goldbraun und weich anbraten. Beiseitestellen."
        },
        {
          "title": "Patties anbraten & Käse schmelzen",
          "text": "Die Patties anbraten und nach dem Wenden eine Scheibe veganen Käse auflegen, damit er in der Resthitze schmilzt."
        },
        {
          "title": "Brötchen toasten",
          "text": "Die Burgerbrötchen auf dem Toaster oder im Ofen goldbraun rösten."
        },
        {
          "title": "Pommes salzen & Burger schichten",
          "text": "Die Pommes salzen. Die Brötchen mit Salat, Tomate, Patty mit Käse, Zwiebelringen und nach Belieben Avocado, Ketchup oder Mayonnaise belegen."
        }
      ],
      "tip": "Den Käse direkt nach dem Wenden auflegen und die Pfanne kurz mit einem Deckel abdecken – so schmilzt er besonders gut."
    },
    "Falafel-Wraps": {
      "steps": [
        {
          "title": "Falafel zubereiten",
          "text": "Bei Fertigmischung: die Masse nach Packungsanweisung anrühren und zu kleinen Bällchen oder Talern formen. Etwas Öl in einer Pfanne bei mittlerer bis hoher Hitze erhitzen und die Falafel von allen Seiten ca. 3–4 Minuten goldbraun und knusprig anbraten. Beiseitestellen."
        },
        {
          "title": "Gemüse vorbereiten",
          "text": "Karotten und Gurke mit einer groben Reibe raspeln. Kirschtomaten halbieren. Salatblätter in Streifen schneiden. Veganen Feta in kleine Würfel schneiden."
        },
        {
          "title": "Wraps erwärmen",
          "text": "Die Tortillas einzeln für ca. 20–30 Sekunden in der Mikrowelle erwärmen."
        },
        {
          "title": "Wraps belegen",
          "text": "Jeden Wrap großzügig mit Hummus und Skyr bestreichen. Die geraspelten Karotten und Gurken, Salatstreifen, Kirschtomaten, Pepperonis und Feta-Würfel darauflegen. Zum Schluss die Falafel draufgeben."
        },
        {
          "title": "Zusammenrollen & servieren",
          "text": "Die Seiten des Wraps leicht einfalten und dann von unten nach oben fest einrollen."
        }
      ],
      "tip": "Nicht zu viel Füllung verwenden, sonst lässt sich der Wrap nicht mehr sauber rollen. Der vegane Skyr gibt eine schöne Frische und wirkt als Pendant zur klassischen Joghurtsauce. Wer mehr Schärfe möchte, gibt etwas Harissa oder Sriracha auf den Hummus."
    },
    "Chili sin Carne Wraps oder Dürüm": {
      "steps": [
        {
          "title": "Sojageschnetzeltes einweichen",
          "text": "Das Sojageschnetzelte nach Packungsanweisung in heißem Wasser oder Gemüsebrühe einweichen – in der Regel 10–15 Minuten. Anschließend gut ausdrücken."
        },
        {
          "title": "Zwiebel und Sojageschnetzeltes anbraten",
          "text": "Etwas Öl in einer Pfanne erhitzen. Die gewürfelte Zwiebel darin 3–4 Minuten glasig dünsten. Das Sojageschnetzelte hinzugeben und 4–5 Minuten scharf anbraten, bis es leicht gebräunt ist."
        },
        {
          "title": "Sauce aufgießen",
          "text": "Die gehackten Tomaten, die Chilibohnen und nach Belieben den Mais hinzugeben. Alles gut vermengen und bei mittlerer Hitze 5–8 Minuten köcheln lassen, bis die Sauce etwas eingedickt ist. Würzen und abschmecken."
        },
        {
          "title": "Fladen erwärmen",
          "text": "Die Tortillas oder Dürüm in der Mikrowelle erwärmen."
        },
        {
          "title": "Belegen & einrollen",
          "text": "Die warmen Fladen mit der Chili-sin-Carne-Mischung belegen. Kirschtomaten, Salatstreifen und nach Belieben veganen Feta daraufgeben. Die Seiten einfalten und fest einrollen."
        }
      ],
      "tip": "Dürüm lassen sich besser falten als Weizentortillas – ideal wenn man die Wraps gut eingerollt servieren möchte. Die Chili-sin-Carne-Mischung schmeckt am nächsten Tag noch besser und lässt sich prima einfrieren."
    },
    "Cremige Paprika-Cashew-Pasta": {
      "steps": [
        {
          "title": "Nudeln kochen",
          "text": "Die Nudeln in reichlich gesalzenem Wasser nach Packungsanweisung bissfest kochen. Vor dem Abgießen eine Tasse Nudelwasser aufbewahren – es hilft die Sauce bei Bedarf zu verdünnen. Abgießen und beiseitestellen."
        },
        {
          "title": "Sauce mixen",
          "text": "Geröstete Paprika, Kirschtomaten, Tofu, Cashews, Knoblauchzehen, Paprikapulver und Salz in einen Mixer geben und alles glatt pürieren, bis eine cremige, gleichmäßige Sauce entsteht. Bei Bedarf etwas mehr Wasser oder Nudelwasser hinzugeben."
        },
        {
          "title": "Anrichten",
          "text": "Die Sauce über die abgegossenen Nudeln geben und gut vermengen."
        }
      ],
      "tip": "Seidentofu macht die Sauce deutlich samtiger und glatter als fester Tofu – wer eine besonders cremige Konsistenz möchte, greift zur Seidentofu-Variante. Die Cashews vorab 2–3 Stunden in Wasser einzuweichen macht die Sauce noch geschmeidiger, ist aber bei einem guten Hochleistungsmixer nicht notwendig."
    },
    "Toskanische Spinat Pasta": {
      "steps": [
        {
          "title": "Basis vorbereiten",
          "text": "Pasta oder Tortellini nach Packungsanweisung in gesalzenem Wasser kochen und abgießen. Bei Bohnen: Dose abgießen und abspülen. Bei TK-Spinat: vorab auftauen und gut ausdrücken."
        },
        {
          "title": "Sauce mixen",
          "text": "Seidentofu, Sojamilch, Cashews (falls verwendet), Hefeflocken, italienische Kräuter, Zitronensaft, Salz und Pfeffer in einen Mixer geben und glatt pürieren, bis eine cremige Sauce entsteht."
        },
        {
          "title": "Knoblauch & Tomaten anschwitzen",
          "text": "Das Olivenöl in einer großen Pfanne bei mittlerer Hitze erhitzen. Den Knoblauch ca. 1 Minute sanft anschwitzen, bis er duftet. Die getrockneten Tomaten und das Tomatenmark hinzugeben und weitere 2 Minuten mitbraten."
        },
        {
          "title": "Sauce & Spinat einrühren",
          "text": "Die gemixte Sauce in die Pfanne geben und gut vermengen. Den Spinat hinzufügen und bei mittlerer Hitze 2–3 Minuten köcheln lassen, bis er zusammengefallen ist. Bohnen (falls verwendet) jetzt ebenfalls hinzugeben und kurz erwärmen."
        },
        {
          "title": "Anrichten & servieren",
          "text": "Die Sauce über Pasta oder Tortellini geben und gut vermengen. Mit frischem Basilikum und Chiliflocken servieren."
        }
      ],
      "tip": "Mit optionaler Proteinbeilage (1 Dose Kichererbsen oder 100g Räuchertofu) jeweils ca. +80–100 kcal und +6–8 g Protein pro Portion. Einfach Proteinbeilage der Wahl zusammen mit den getrockneten Tomaten anbraten."
    },
    "Reisbowl & Reisnudelsalat": {
      "steps": [
        {
          "title": "Basis zubereiten",
          "text": "Reis oder Reisnudeln nach Packungsanweisung kochen."
        },
        {
          "title": "Proteinbeilage marinieren",
          "text": "Die gewählte Proteinbeilage in Sambal Oelek, Sojasoße und einem Spritzer Sesamöl wenden und mindestens 10 Minuten marinieren. Tofu vorab in Würfel schneiden, gut ausdrücken und in Speisestärke wenden."
        },
        {
          "title": "Proteinbeilage anbraten",
          "text": "Etwas Öl in einer Pfanne bei hoher Hitze erhitzen und Tempeh, Kichererbsen oder Tofu 7–10 Minuten goldbraun anbraten."
        },
        {
          "title": "Erdnusssauce anrühren",
          "text": "Alle Zutaten für die Sauce in einer kleinen Schüssel glatt verrühren. Mit Wasser auf die gewünschte Konsistenz verdünnen – für die Bowl etwas dicker, für den Nudelsalat etwas flüssiger."
        },
        {
          "title": "Gemüse vorbereiten",
          "text": "Karotten fein reiben. Paprika in dünne Streifen schneiden. Avocado aufschneiden und in Scheiben schneiden. Frühlingszwiebeln in feine Ringe schneiden."
        },
        {
          "title": "Anrichten",
          "text": "Für die Bowl: Reis in tiefe Schüsseln geben und Gemüse, Edamame und Proteinbeilage ordentlich daneben anrichten. Für den Nudelsalat: Reisnudeln mit Gemüse, Edamame und Kichererbsen vermengen. Erdnusssauce darübergeben und mit Koriander oder Petersilie, Frühlingszwiebeln und Sesam garnieren."
        }
      ],
      "tip": "Der Reisnudelsalat schmeckt auch kalt und eignet sich gut zum Mitnehmen – Sauce dann separat aufbewahren. Den Tofu unbedingt gut ausdrücken und trockentupfen bevor er in die Stärke gewendet wird, sonst wird er nicht knusprig."
    },
    "Flammkuchen Elsässer Art": {
      "steps": [
        {
          "title": "Teig bestreichen & würzen",
          "text": "Den Flammkuchenteig auf einem mit Backpapier belegten Backblech ausrollen und leicht andrücken. Die vegane Crème fraîche gleichmäßig auf dem Teig verstreichen. Mit Salz, Pfeffer und einer Prise Muskatnuss würzen."
        },
        {
          "title": "Belag verteilen",
          "text": "Die Zwiebelringe und veganen Schinkenwürfel gleichmäßig auf der Crème fraîche verteilen."
        },
        {
          "title": "Backen",
          "text": "Den Flammkuchen im vorgeheizten Ofen nach Packungsanweisung backen – in der Regel 10–15 Minuten, bis der Rand goldbraun und knusprig ist."
        }
      ],
      "tip": "Den Flammkuchen unbedingt auf der untersten Schiene backen – so wird der Boden besonders knusprig. Für eine herbstliche Variante empfehlen wir zusätzlich Kürbis als Belag."
    },
    "Kichererbsen-Curry": {
      "steps": [
        {
          "title": "Gemüse vorbereiten",
          "text": "Paprika waschen und in Streifen schneiden. Bei den Prinzessinnenbohnen die Enden entfernen. Süßkartoffeln oder Kartoffeln schälen und in ca. 2 cm große Würfel schneiden. Den Ingwer schälen und fein würfeln."
        },
        {
          "title": "Ingwer und Currypaste anbraten",
          "text": "Das Öl in einem großen Topf bei mittlerer Hitze erhitzen. Den Ingwer darin ca. 5 Minuten sanft anbraten, bis er duftet. Die rote Currypaste hinzufügen und unter Rühren 1–2 Minuten mitbraten, damit sich die Aromen entfalten."
        },
        {
          "title": "Flüssigkeit hinzufügen",
          "text": "Kokosmilch und Gemüsebrühe angießen und alles gut verrühren."
        },
        {
          "title": "Gemüse garen",
          "text": "Paprika, Kartoffelwürfel, Bohnen und Kichererbsen in den Topf geben. Bei mittlerer Hitze 15 Minuten köcheln lassen, bis das Gemüse weich ist."
        },
        {
          "title": "Abschmecken & servieren",
          "text": "Das Curry mit Salz und Limettensaft abschmecken. Nach Belieben mit Thai-Basilikum oder Koriander garnieren. Pur oder über gekochtem Reis servieren."
        }
      ],
      "tip": "Das Curry schmeckt am nächsten Tag noch besser und lässt sich gut einfrieren. Wer es schärfer mag, gibt etwas mehr Currypaste oder frische Chili dazu."
    },
    "Miso-Ramen": {
      "steps": [
        {
          "title": "Protein marinieren",
          "text": "Tofu gut ausdrücken und in Würfel schneiden, Tempeh in Scheiben schneiden. Sojasoße, Tomatenmark und Paprikapulver verrühren und den Tofu oder Tempeh darin mindestens 15 Minuten marinieren. Im Airfryer bei 200 °C ca. 15 Minuten knusprig garen, nach der Hälfte wenden."
        },
        {
          "title": "Brühe ansetzen",
          "text": "Öl in einem großen Topf bei mittlerer Hitze erhitzen. Knoblauch, Ingwer und Chili darin 2–3 Minuten anbraten, bis alles duftet. Mit Sojasoße ablöschen und kurz einkochen lassen. Die Gemüsebrühe angießen und bei niedriger bis mittlerer Hitze 10–15 Minuten köcheln lassen."
        },
        {
          "title": "Gemüse anbraten",
          "text": "Gleichzeitig das Sesamöl in einer Pfanne erhitzen. Pilze, Karottenringe und den weißen Teil des Pak Choi darin bei mittlerer Hitze ca. 5 Minuten anbraten. Die grünen Pak-Choi-Blätter hinzugeben und weitere 2 Minuten mitbraten. Beiseitestellen."
        },
        {
          "title": "Nudeln kochen",
          "text": "Für sofortigen Verzehr: Mie-Nudeln direkt in der Brühe nach Packungsanweisung kochen. Für Meal Prep: Nudeln separat in Salzwasser kochen – so saugen sie die Brühe nicht auf und bleiben al dente."
        },
        {
          "title": "Misopaste einrühren",
          "text": "Die Hitze auf niedrigste Stufe reduzieren. Die Misopaste in den Topf geben und unterrühren. Nicht mehr kochen lassen, da die Misopaste sonst ihre Aromen verliert. Mit einem Spritzer Sesamöl, Salz und Limettensaft abschmecken."
        },
        {
          "title": "Anrichten",
          "text": "Nudeln in tiefe Schüsseln geben, die heiße Miso-Brühe darübergießen. Angebratenes Gemüse und den knusprigen Tofu oder Tempeh darauflegen. Nach Belieben mit Frühlingszwiebeln, Sesam und Chiliöl garnieren."
        }
      ],
      "tip": "Die Misopaste niemals kochen lassen – sie verliert dabei ihre probiotischen Eigenschaften und ihr feines Aroma. Für Meal Prep immer Nudeln, Brühe und Gemüse separat aufbewahren und erst beim Servieren zusammenführen."
    },
    "Veganer Käsekuchen": {
      "steps": [
        {
          "title": "Form vorbereiten",
          "text": "Eine 20–22 cm Springform mit Backpapier auslegen und den Rand einfetten. Die Außenseite der Form anschließend mit Alufolie einwickeln, damit später kein Wasser eindringt."
        },
        {
          "title": "Keksboden herstellen",
          "text": "Die Kekse in einem Mixer fein mahlen oder in einem Gefrierbeutel mit einem Rollholz fein zerbröseln. Mit der zerlassenen Margarine gut vermischen und die Masse gleichmäßig auf dem Boden der Springform verteilen und fest andrücken. Beiseitestellen."
        },
        {
          "title": "Creme anrühren",
          "text": "Zucker und Speisestärke (oder Puddingpulver) in einer Schüssel vermischen. Den veganen Vanille-Skyr hinzugeben und glatt rühren. Anschließend die weiche Margarine, Vanillepaste, Salz und den Zitronensaft hinzufügen und alles zu einer glatten Creme verrühren."
        },
        {
          "title": "Backofen & Wasserbad vorbereiten",
          "text": "Den Backofen auf 170 °C Ober-/Unterhitze vorheizen. Ein tiefes Backblech, eine Auflaufform oder einen Bräter mit heißem Wasser befüllen und auf die unterste Schiene des Ofens stellen."
        },
        {
          "title": "Backen",
          "text": "Die Creme auf dem Keksboden verteilen und glattstreichen. Die Springform in das Wasserbad stellen und den Kuchen 50 Minuten backen. Falls der Kuchen nach 40 Minuten zu dunkel wird, locker mit Alufolie abdecken."
        },
        {
          "title": "Im Ofen ruhen lassen",
          "text": "Den Ofen ausschalten und die Tür einen Spaltbreit öffnen. Den Kuchen nochmals 30 Minuten im Ofen stehen lassen – so sinkt er nicht ein und bekommt keine Risse."
        },
        {
          "title": "Kühlstellen & servieren",
          "text": "Den Kuchen vollständig abkühlen lassen und dann mindestens einige Stunden, am besten über Nacht, im Kühlschrank kaltstellen. Erst dann anschneiden."
        }
      ],
      "tip": "Das Wasserbad ist der Schlüssel für eine cremige, gleichmäßige Textur ohne Risse."
    },
    "Protein-Bananenbrot": {
      "steps": [
        {
          "title": "Ofen vorheizen",
          "text": "Den Backofen auf 180 °C Umluft vorheizen. Eine 25 cm Kastenform einfetten."
        },
        {
          "title": "Leinsamen-Ei ansetzen",
          "text": "Die geschroteten Leinsamen mit 5 Esslöffeln heißem Wasser vermischen und 10 Minuten quellen lassen, bis eine gelartige Masse entsteht."
        },
        {
          "title": "Feuchte Zutaten vermengen",
          "text": "Die Bananen in einer großen Schüssel mit einer Gabel gründlich zerdrücken. Ahornsirup, geschmolzenes Kokosöl, Pflanzenmilch und das gequollene Leinsamen-Ei hinzugeben und alles gut verrühren."
        },
        {
          "title": "Trockene Zutaten unterrühren",
          "text": "Mehl, Proteinpulver, Natron, Zimt und Salz zur Bananenmasse geben und alles zu einem Teig verrühren."
        },
        {
          "title": "Backen",
          "text": "Den Teig in die gefettete Kastenform füllen und glattstreichen. Das gewünschte Topping gleichmäßig auf dem Teig verteilen. Auf mittlerer Schiene ca. 60 Minuten backen. Stäbchentest!"
        },
        {
          "title": "Abkühlen lassen",
          "text": "Das Bananenbrot 10 Minuten in der Form abkühlen lassen, dann auf einem Gitter vollständig auskühlen lassen. Erst dann aufschneiden."
        }
      ],
      "tip": "Je reifer und fleckiger die Bananen, desto süßer und aromatischer wird das Bananenbrot – überreife Bananen sind hier ideal. Das Brot hält sich in einer Dose bei Raumtemperatur 3–4 Tage und lässt sich gut in Scheiben einfrieren."
    },
    "Bananen-Pancakes": {
      "steps": [
        {
          "title": "Bananen zerdrücken",
          "text": "Die Bananen in einer großen Schüssel mit einer Gabel gründlich zerdrücken, bis eine glatte Masse entsteht."
        },
        {
          "title": "Teig anrühren",
          "text": "Pflanzenmilch zur Bananenmasse geben und verrühren. Mehl (oder gemahlene Haferflocken), Backpulver und Salz hinzugeben und alles zu einem glatten, leicht dickflüssigen Teig verrühren."
        },
        {
          "title": "Pancakes ausbacken",
          "text": "Eine Pfanne bei mittlerer Hitze erhitzen und leicht einfetten. Je einen großen Klecks Teig pro Pancake in die Pfanne geben – nicht zu dünn ausstreichen, die Pancakes dürfen etwas dicker sein. Sobald sich an der Oberfläche Bläschen bilden und die Ränder leicht fest werden, ist es Zeit zum Wenden."
        },
        {
          "title": "TK-Früchte eindrücken",
          "text": "Falls TK-Früchte verwendet werden: Direkt vor dem Wenden einzelne Früchte sanft in die noch weiche Oberseite des Pancakes drücken, dann wenden und die zweite Seite fertig backen."
        },
        {
          "title": "Servieren",
          "text": "Die fertigen Pancakes nach Belieben mit Ahornsirup oder Bionella servieren."
        }
      ],
      "tip": "Je reifer die Bananen, desto süßer der Teig – überreife Bananen mit brauner Schale sind ideal. Die Haferflocken-Variante macht die Pancakes etwas herzhafter und sättigender."
    }
  },
};
