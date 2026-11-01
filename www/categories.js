'use strict';

// Standard-Kategorien in typischer Supermarkt-Reihenfolge.
// Die Reihenfolge kann in der App unter "Mehr" angepasst werden.
const DEFAULT_CATEGORIES = [
  { id: 'produce', name: 'Obst & Gemüse' },
  { id: 'bakery', name: 'Brot & Backwaren' },
  { id: 'dairy', name: 'Kühlregal & Käse' },
  { id: 'meat', name: 'Fleisch & Fisch' },
  { id: 'pasta', name: 'Nudeln, Reis & Getreide' },
  { id: 'canned', name: 'Konserven, Öl & Saucen' },
  { id: 'baking', name: 'Gewürze & Backzutaten' },
  { id: 'breakfast', name: 'Frühstück & Süßes' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'frozen', name: 'Tiefkühl' },
  { id: 'drinks', name: 'Getränke' },
  { id: 'household', name: 'Drogerie & Haushalt' },
  { id: 'other', name: 'Sonstiges' },
];

// Stichwörter für die automatische Zuordnung.
// Längere Stichwörter gewinnen (z. B. "tomatenmark" vor "tomate").
// Stichwörter mit max. 3 Buchstaben müssen als ganzes Wort vorkommen.
const CATEGORY_KEYWORDS = {
  produce: [
    'apfel', 'äpfel', 'banane', 'birne', 'orange', 'mandarine', 'clementine', 'zitrone', 'limette',
    'traube', 'erdbeer', 'himbeer', 'heidelbeer', 'blaubeer', 'beeren', 'kirsche', 'pfirsich',
    'nektarine', 'pflaume', 'mango', 'ananas', 'kiwi', 'melone', 'avocado', 'granatapfel',
    'tomate', 'gurke', 'paprika', 'zwiebel', 'knoblauch', 'kartoffel', 'süßkartoffel', 'karotte',
    'möhre', 'salat', 'rucola', 'spinat', 'zucchini', 'aubergine', 'brokkoli', 'blumenkohl',
    'kohl', 'kohlrabi', 'lauch', 'porree', 'sellerie', 'fenchel', 'champignon', 'pilze', 'pilz',
    'ingwer', 'petersilie', 'basilikum', 'schnittlauch', 'koriander', 'minze', 'dill',
    'thymian', 'rosmarin', 'frühlingszwiebel', 'lauchzwiebel', 'radieschen', 'rote bete',
    'kürbis', 'spargel', 'mais kolben', 'bohnen grün', 'grüne bohnen', 'zuckerschoten',
    'chilischote', 'peperoni', 'schalotte', 'feldsalat', 'eisbergsalat', 'pak choi', 'gemüse', 'obst',
  ],
  bakery: [
    'brot', 'brötchen', 'toast', 'baguette', 'ciabatta', 'croissant', 'brezel', 'laugen',
    'wraps', 'tortilla', 'fladenbrot', 'pita', 'naan', 'burger buns', 'buns', 'semmel', 'kuchen',
  ],
  dairy: [
    'milch', 'butter', 'käse', 'joghurt', 'jogurt', 'quark', 'sahne', 'schmand', 'saure sahne',
    'crème fraîche', 'creme fraiche', 'crème', 'mozzarella', 'parmesan', 'feta', 'frischkäse',
    'gouda', 'emmentaler', 'ricotta', 'mascarpone', 'halloumi', 'burrata', 'skyr', 'kefir',
    'buttermilch', 'eier', 'ei', 'margarine', 'tofu', 'hafermilch', 'sojamilch', 'pudding',
    'hefe', 'gnocchi', 'blätterteig', 'pizzateig', 'tortellini', 'maultaschen',
  ],
  meat: [
    'hähnchen', 'huhn', 'hühnchen', 'hühner', 'geflügel', 'pute', 'puten', 'rind', 'schwein',
    'hack', 'hackfleisch', 'speck', 'schinken', 'salami', 'wurst', 'würstchen', 'bratwurst',
    'lachs', 'garnele', 'shrimps', 'fisch', 'steak', 'bacon', 'chorizo', 'lamm', 'kalb',
    'filet', 'gulasch', 'schnitzel', 'aufschnitt', 'pancetta', 'mett', 'forelle', 'kabeljau',
  ],
  pasta: [
    'nudel', 'spaghetti', 'penne', 'pasta', 'fusilli', 'tagliatelle', 'lasagne', 'farfalle',
    'rigatoni', 'makkaroni', 'reis', 'risotto', 'basmati', 'couscous', 'bulgur', 'quinoa',
    'linsen', 'polenta', 'glasnudeln', 'mie nudeln', 'reisnudeln', 'spätzle',
  ],
  canned: [
    'dose', 'tomatenmark', 'passierte tomaten', 'gehackte tomaten', 'dosentomaten',
    'kokosmilch', 'brühe', 'fond', 'ketchup', 'senf', 'mayo', 'mayonnaise', 'sojasauce',
    'sojasoße', 'essig', 'balsamico', 'öl', 'olivenöl', 'sonnenblumenöl', 'rapsöl', 'sesamöl',
    'pesto', 'kidneybohnen', 'weiße bohnen', 'kichererbsen', 'mais', 'thunfisch', 'oliven',
    'kapern', 'gewürzgurken', 'sauce', 'soße', 'currypaste', 'erdnussbutter', 'tahini',
    'gemüsebrühe', 'hühnerbrühe', 'rinderbrühe', 'tomatensauce', 'tomatensoße', 'fischsauce',
    'apfelessig', 'sambal', 'sriracha', 'tabasco',
  ],
  baking: [
    'salz', 'pfeffer', 'paprikapulver', 'curry', 'currypulver', 'zimt', 'oregano', 'kreuzkümmel',
    'kümmel', 'muskat', 'mehl', 'zucker', 'puderzucker', 'backpulver', 'natron', 'vanille',
    'vanillezucker', 'speisestärke', 'stärke', 'kakao', 'gewürz', 'lorbeer', 'chiliflocken',
    'kurkuma', 'knoblauchpulver', 'zwiebelpulver', 'trockenhefe', 'gelatine', 'schokotropfen', 'mandeln gemahlen',
  ],
  breakfast: [
    'müsli', 'haferflocken', 'cornflakes', 'marmelade', 'konfitüre', 'honig', 'nutella',
    'nuss-nougat', 'aufstrich', 'schokolade', 'kekse', 'zwieback', 'sirup', 'ahornsirup',
  ],
  snacks: [
    'chips', 'nüsse', 'erdnüsse', 'cashew', 'mandeln', 'walnüsse', 'salzstangen', 'gummibär',
    'cracker', 'popcorn', 'studentenfutter', 'riegel', 'süßigkeiten', 'kartoffelchips',
  ],
  frozen: [
    'tiefkühl', 'tk', 'pommes', 'eis', 'eiscreme', 'fischstäbchen', 'tiefkühlpizza', 'erbsen tk',
    'tk-erbsen', 'tk-spinat', 'tk-gemüse', 'kräuter tk',
  ],
  drinks: [
    'wasser', 'mineralwasser', 'sprudel', 'saft', 'cola', 'limo', 'limonade', 'bier', 'wein',
    'sekt', 'kaffee', 'tee', 'mate', 'schorle', 'eistee', 'energy', 'smoothie',
    'orangensaft', 'apfelsaft', 'multivitaminsaft', 'traubensaft', 'kirschsaft', 'apfelschorle',
  ],
  household: [
    'shampoo', 'duschgel', 'zahnpasta', 'zahncreme', 'zahnbürste', 'seife', 'klopapier',
    'toilettenpapier', 'küchenrolle', 'spülmittel', 'waschmittel', 'weichspüler', 'müllbeutel',
    'taschentücher', 'deo', 'alufolie', 'backpapier', 'frischhaltefolie', 'schwamm', 'batterien',
    'spülmaschinentabs', 'tabs', 'reiniger', 'rasierer', 'windeln', 'wattepads', 'gefrierbeutel',
  ],
};

const KEYWORD_INDEX = Object.entries(CATEGORY_KEYWORDS)
  .flatMap(([cat, words]) => words.map((k) => ({ k, cat })))
  .sort((a, b) => b.k.length - a.k.length);

function guessCategory(name) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return 'other';
  const tokens = n.split(/[^a-zäöüß]+/).filter(Boolean);
  for (const { k, cat } of KEYWORD_INDEX) {
    if (k.length <= 3 ? tokens.includes(k) : n.includes(k)) return cat;
  }
  return 'other';
}
