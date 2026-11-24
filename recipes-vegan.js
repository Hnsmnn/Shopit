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
