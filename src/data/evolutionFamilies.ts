// Evolution family mapping: Pokemon ID -> Base form ID
// This maps each Pokemon to the ID of the first Pokemon in its evolution chain
// Used to group evolution families together on the board

export const EVOLUTION_FAMILIES: Record<number, number> = {
  // Gen 1 (Kanto)
  1: 1, 2: 1, 3: 1,           // Bulbasaur line
  4: 4, 5: 4, 6: 4,           // Charmander line
  7: 7, 8: 7, 9: 7,           // Squirtle line
  10: 10, 11: 10, 12: 10,     // Caterpie line
  13: 13, 14: 13, 15: 13,     // Weedle line
  16: 16, 17: 16, 18: 16,     // Pidgey line
  19: 19, 20: 19,             // Rattata line
  21: 21, 22: 21,             // Spearow line
  23: 23, 24: 23,             // Ekans line
  25: 25, 26: 25,             // Pikachu line (Pichu added in Gen 2)
  27: 27, 28: 27,             // Sandshrew line
  29: 29, 30: 29, 31: 29,     // Nidoran♀ line
  32: 32, 33: 32, 34: 32,     // Nidoran♂ line
  35: 35, 36: 35,             // Clefairy line (Cleffa added in Gen 2)
  37: 37, 38: 37,             // Vulpix line
  39: 39, 40: 39,             // Jigglypuff line (Igglybuff added in Gen 2)
  41: 41, 42: 41,             // Zubat line (Crobat added in Gen 2)
  43: 43, 44: 43, 45: 43,     // Oddish line
  46: 46, 47: 46,             // Paras line
  48: 48, 49: 48,             // Venonat line
  50: 50, 51: 50,             // Diglett line
  52: 52, 53: 52,             // Meowth line
  54: 54, 55: 54,             // Psyduck line
  56: 56, 57: 56,             // Mankey line
  58: 58, 59: 58,             // Growlithe line
  60: 60, 61: 60, 62: 60,     // Poliwag line (Politoed added in Gen 2)
  63: 63, 64: 63, 65: 63,     // Abra line
  66: 66, 67: 66, 68: 66,     // Machop line
  69: 69, 70: 69, 71: 69,     // Bellsprout line
  72: 72, 73: 72,             // Tentacool line
  74: 74, 75: 74, 76: 74,     // Geodude line
  77: 77, 78: 77,             // Ponyta line
  79: 79, 80: 79,             // Slowpoke line (Slowking added in Gen 2)
  81: 81, 82: 81,             // Magnemite line (Magnezone added in Gen 4)
  83: 83,                      // Farfetch'd
  84: 84, 85: 84,             // Doduo line
  86: 86, 87: 86,             // Seel line
  88: 88, 89: 88,             // Grimer line
  90: 90, 91: 90,             // Shellder line
  92: 92, 93: 92, 94: 92,     // Gastly line
  95: 95,                      // Onix (Steelix added in Gen 2)
  96: 96, 97: 96,             // Drowzee line
  98: 98, 99: 98,             // Krabby line
  100: 100, 101: 100,         // Voltorb line
  102: 102, 103: 102,         // Exeggcute line
  104: 104, 105: 104,         // Cubone line
  106: 106, 107: 107,         // Hitmonlee, Hitmonchan (Tyrogue added in Gen 2)
  108: 108,                    // Lickitung (Lickilicky added in Gen 4)
  109: 109, 110: 109,         // Koffing line
  111: 111, 112: 111,         // Rhyhorn line (Rhyperior added in Gen 4)
  113: 113,                    // Chansey (Happiny/Blissey added in Gen 2/4)
  114: 114,                    // Tangela (Tangrowth added in Gen 4)
  115: 115,                    // Kangaskhan
  116: 116, 117: 116,         // Horsea line (Kingdra added in Gen 2)
  118: 118, 119: 118,         // Goldeen line
  120: 120, 121: 120,         // Staryu line
  122: 122,                    // Mr. Mime (Mime Jr. added in Gen 4)
  123: 123,                    // Scyther (Scizor added in Gen 2)
  124: 124,                    // Jynx (Smoochum added in Gen 2)
  125: 125,                    // Electabuzz (Elekid/Electivire added in Gen 2/4)
  126: 126,                    // Magmar (Magby/Magmortar added in Gen 2/4)
  127: 127,                    // Pinsir
  128: 128,                    // Tauros
  129: 129, 130: 129,         // Magikarp line
  131: 131,                    // Lapras
  132: 132,                    // Ditto
  133: 133, 134: 133, 135: 133, 136: 133, // Eevee + Gen 1 evolutions
  137: 137,                    // Porygon (Porygon2/Porygon-Z added in Gen 2/4)
  138: 138, 139: 138,         // Omanyte line
  140: 140, 141: 140,         // Kabuto line
  142: 142,                    // Aerodactyl
  143: 143,                    // Snorlax (Munchlax added in Gen 4)
  144: 144,                    // Articuno
  145: 145,                    // Zapdos
  146: 146,                    // Moltres
  147: 147, 148: 147, 149: 147, // Dratini line
  150: 150,                    // Mewtwo
  151: 151,                    // Mew

  // Gen 2 (Johto) - linking back to Gen 1 families where applicable
  152: 152, 153: 152, 154: 152, // Chikorita line
  155: 155, 156: 155, 157: 155, // Cyndaquil line
  158: 158, 159: 158, 160: 158, // Totodile line
  161: 161, 162: 161,         // Sentret line
  163: 163, 164: 163,         // Hoothoot line
  165: 165, 166: 165,         // Ledyba line
  167: 167, 168: 167,         // Spinarak line
  169: 41,                     // Crobat (Zubat family)
  170: 170, 171: 170,         // Chinchou line
  172: 25,                     // Pichu (Pikachu family)
  173: 35,                     // Cleffa (Clefairy family)
  174: 39,                     // Igglybuff (Jigglypuff family)
  175: 175, 176: 175,         // Togepi line (Togekiss added in Gen 4)
  177: 177, 178: 177,         // Natu line
  179: 179, 180: 179, 181: 179, // Mareep line
  182: 43,                     // Bellossom (Oddish family)
  183: 183, 184: 183,         // Marill line (Azurill added in Gen 3)
  185: 185,                    // Sudowoodo (Bonsly added in Gen 4)
  186: 60,                     // Politoed (Poliwag family)
  187: 187, 188: 187, 189: 187, // Hoppip line
  190: 190,                    // Aipom (Ambipom added in Gen 4)
  191: 191, 192: 191,         // Sunkern line
  193: 193,                    // Yanma (Yanmega added in Gen 4)
  194: 194, 195: 194,         // Wooper line
  196: 133, 197: 133,         // Espeon, Umbreon (Eevee family)
  198: 198,                    // Murkrow (Honchkrow added in Gen 4)
  199: 79,                     // Slowking (Slowpoke family)
  200: 200,                    // Misdreavus (Mismagius added in Gen 4)
  201: 201,                    // Unown
  202: 202,                    // Wobbuffet (Wynaut added in Gen 3)
  203: 203,                    // Girafarig
  204: 204, 205: 204,         // Pineco line
  206: 206,                    // Dunsparce
  207: 207,                    // Gligar (Gliscor added in Gen 4)
  208: 95,                     // Steelix (Onix family)
  209: 209, 210: 209,         // Snubbull line
  211: 211,                    // Qwilfish
  212: 123,                    // Scizor (Scyther family)
  213: 213,                    // Shuckle
  214: 214,                    // Heracross
  215: 215,                    // Sneasel (Weavile added in Gen 4)
  216: 216, 217: 216,         // Teddiursa line
  218: 218, 219: 218,         // Slugma line (Magcargo)
  220: 220, 221: 220,         // Swinub line (Mamoswine added in Gen 4)
  222: 222,                    // Corsola
  223: 223, 224: 223,         // Remoraid line
  225: 225,                    // Delibird
  226: 226,                    // Mantine (Mantyke added in Gen 4)
  227: 227,                    // Skarmory
  228: 228, 229: 228,         // Houndour line
  230: 116,                    // Kingdra (Horsea family)
  231: 231, 232: 231,         // Phanpy line
  233: 137,                    // Porygon2 (Porygon family)
  234: 234,                    // Stantler
  235: 235,                    // Smeargle
  236: 236, 237: 236,         // Tyrogue, Hitmontop (also link Hitmonlee/Hitmonchan)
  238: 124,                    // Smoochum (Jynx family)
  239: 125,                    // Elekid (Electabuzz family)
  240: 126,                    // Magby (Magmar family)
  241: 241,                    // Miltank
  242: 113,                    // Blissey (Chansey family)
  243: 243,                    // Raikou
  244: 244,                    // Entei
  245: 245,                    // Suicune
  246: 246, 247: 246, 248: 246, // Larvitar line
  249: 249,                    // Lugia
  250: 250,                    // Ho-Oh
  251: 251,                    // Celebi

  // Gen 3 (Hoenn)
  252: 252, 253: 252, 254: 252, // Treecko line
  255: 255, 256: 255, 257: 255, // Torchic line
  258: 258, 259: 258, 260: 258, // Mudkip line
  261: 261, 262: 261,         // Poochyena line
  263: 263, 264: 263,         // Zigzagoon line
  265: 265, 266: 265, 267: 265, 268: 265, 269: 265, // Wurmple line (branches)
  270: 270, 271: 270, 272: 270, // Lotad line
  273: 273, 274: 273, 275: 273, // Seedot line
  276: 276, 277: 276,         // Taillow line
  278: 278, 279: 278,         // Wingull line
  280: 280, 281: 280, 282: 280, // Ralts line (Gallade added in Gen 4)
  283: 283, 284: 283,         // Surskit line
  285: 285, 286: 285,         // Shroomish line
  287: 287, 288: 287, 289: 287, // Slakoth line
  290: 290, 291: 290, 292: 290, // Nincada line
  293: 293, 294: 293, 295: 293, // Whismur line
  296: 296, 297: 296,         // Makuhita line
  298: 183,                    // Azurill (Marill family)
  299: 299,                    // Nosepass (Probopass added in Gen 4)
  300: 300, 301: 300,         // Skitty line
  302: 302,                    // Sableye
  303: 303,                    // Mawile
  304: 304, 305: 304, 306: 304, // Aron line
  307: 307, 308: 307,         // Meditite line
  309: 309, 310: 309,         // Electrike line
  311: 311,                    // Plusle
  312: 312,                    // Minun
  313: 313,                    // Volbeat
  314: 314,                    // Illumise
  315: 315,                    // Roselia (Budew/Roserade added in Gen 4)
  316: 316, 317: 316,         // Gulpin line
  318: 318, 319: 318,         // Carvanha line
  320: 320, 321: 320,         // Wailmer line
  322: 322, 323: 322,         // Numel line
  324: 324,                    // Torkoal
  325: 325, 326: 325,         // Spoink line
  327: 327,                    // Spinda
  328: 328, 329: 328, 330: 328, // Trapinch line
  331: 331, 332: 331,         // Cacnea line
  333: 333, 334: 333,         // Swablu line
  335: 335,                    // Zangoose
  336: 336,                    // Seviper
  337: 337,                    // Lunatone
  338: 338,                    // Solrock
  339: 339, 340: 339,         // Barboach line
  341: 341, 342: 341,         // Corphish line
  343: 343, 344: 343,         // Baltoy line
  345: 345, 346: 345,         // Lileep line
  347: 347, 348: 347,         // Anorith line
  349: 349, 350: 349,         // Feebas line
  351: 351,                    // Castform
  352: 352,                    // Kecleon
  353: 353, 354: 353,         // Shuppet line
  355: 355, 356: 355,         // Duskull line (Dusknoir added in Gen 4)
  357: 357,                    // Tropius
  358: 358,                    // Chimecho (Chingling added in Gen 4)
  359: 359,                    // Absol
  360: 202,                    // Wynaut (Wobbuffet family)
  361: 361, 362: 361,         // Snorunt line (Froslass added in Gen 4)
  363: 363, 364: 363, 365: 363, // Spheal line
  366: 366, 367: 366, 368: 366, // Clamperl line
  369: 369,                    // Relicanth
  370: 370,                    // Luvdisc
  371: 371, 372: 371, 373: 371, // Bagon line
  374: 374, 375: 374, 376: 374, // Beldum line
  377: 377,                    // Regirock
  378: 378,                    // Regice
  379: 379,                    // Registeel
  380: 380,                    // Latias
  381: 381,                    // Latios
  382: 382,                    // Kyogre
  383: 383,                    // Groudon
  384: 384,                    // Rayquaza
  385: 385,                    // Jirachi
  386: 386,                    // Deoxys
}

/**
 * Get the evolution family ID for a Pokemon
 * Returns the ID of the base form in the evolution chain
 * Falls back to the Pokemon's own ID if not in the mapping
 */
export function getEvolutionFamily(pokemonId: number): number {
  return EVOLUTION_FAMILIES[pokemonId] ?? pokemonId
}
