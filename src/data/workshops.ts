import type { Workshop } from "@/types/domain";

/**
 * Perfiles SIMULADOS: personas e historias ficticias, inspiradas en técnicas y
 * comunidades reales, para mostrar cómo se verá la sección. Reemplazar por los
 * datos y fotos reales de cada taller antes de publicar.
 *
 * Fotos: retratos de stock de Pexels (ver public/images/artisans/README.md),
 * usados solo para validar el prototipo. Si falta un archivo se muestran las iniciales.
 */
export const workshops: Workshop[] = [
  {
    id: "taller-puno",
    artisanName: { es: "Rosa Mamani Quispe", en: "Rosa Mamani Quispe" },
    regionName: "Puno",
    community: { es: "Chucuito, orillas del lago Titicaca", en: "Chucuito, on the shores of Lake Titicaca" },
    yearsOfCraft: 38,
    color: "#c2185b",
    productIds: ["manta-telar-cintura"],
    title: { es: "Taller de tejidos de telar de cintura", en: "Backstrap-loom weaving workshop" },
    technique: { es: "Telar de cintura", en: "Backstrap loom" },
    materials: { es: "Lana de alpaca y oveja", en: "Alpaca and sheep wool" },
    cover: {
      src: "/images/artisans/taller-puno.jpg",
      alt: { es: "Rosa sonriendo mientras teje en su telar de cintura", en: "Rosa smiling as she weaves on her backstrap loom" },
      position: "center 60%",
    },
    quote: {
      es: "Cada hilo que cruzo es un día de mi vida. Por eso no hay dos mantas iguales.",
      en: "Every thread I cross is a day of my life. That's why no two blankets are the same.",
    },
    bio: {
      es: "Aprendió a tejer a los 8 años, sentada junto a su abuela frente al lago. Hoy enseña a sus dos hijas para que el oficio no se pierda.",
      en: "She learned to weave at 8, sitting beside her grandmother facing the lake. Today she teaches her two daughters so the craft is not lost.",
    },
    story: {
      es: [
        "Rosa todavía recuerda el sonido del viento del Titicaca mientras su abuela le sujetaba las manos para enseñarle a pasar la trama. «Si te apuras, el tejido se enoja», le decía. Tenía ocho años y aquella primera faja le tomó un mes entero.",
        "Una manta suya tarda tres semanas en nacer. Primero esquila, lava y hila la lana con su pushka; luego la tiñe con cochinilla y plantas del cerro. En los rombos que teje están el lago, las chacras y la chakana que su abuela dibujaba en la tierra.",
        "Durante años vendió sus mantas a intermediarios por casi nada. Ahora, cuando alguien compra una pieza suya, Rosa sabe que ese dinero llega entero a su casa y que sus hijas no tendrán que irse a la ciudad para salir adelante.",
      ],
      en: [
        "Rosa still remembers the sound of the wind off Lake Titicaca while her grandmother held her hands to teach her how to pass the weft. \"If you rush, the weaving gets angry,\" she would say. Rosa was eight, and that first sash took her a whole month.",
        "One of her blankets takes three weeks to be born. First she shears, washes and spins the wool on her drop spindle; then she dyes it with cochineal and hillside plants. The diamonds she weaves hold the lake, the fields and the chakana her grandmother used to draw in the dirt.",
        "For years she sold her blankets to middlemen for almost nothing. Now, when someone buys one of her pieces, Rosa knows the money reaches her home in full, and that her daughters won't have to leave for the city to get ahead.",
      ],
    },
  },
  {
    id: "taller-ayacucho",
    artisanName: { es: "Teodoro Ccahuana y su hija Yesenia", en: "Teodoro Ccahuana and his daughter Yesenia" },
    regionName: "Ayacucho",
    community: { es: "Quinua y barrio de Santa Ana", en: "Quinua and the Santa Ana neighborhood" },
    yearsOfCraft: 34,
    color: "#0a7c82",
    productIds: ["jarron-pintado-quinua", "retablo-ayacuchano"],
    title: { es: "Taller de cerámica y retablos", en: "Ceramics and retablo workshop" },
    technique: { es: "Pintado a mano y modelado", en: "Hand painting and modeling" },
    materials: { es: "Arcilla, yeso y madera", en: "Clay, plaster and wood" },
    cover: {
      src: "/images/artisans/taller-ayacucho.jpg",
      alt: { es: "Don Teodoro pintando a mano una vasija de arcilla en su taller", en: "Don Teodoro hand-painting a clay vessel in his workshop" },
      position: "center 40%",
    },
    quote: {
      es: "En cada retablo guardo lo que no quiero que olvidemos: la fiesta, la cosecha y también el dolor.",
      en: "In every retablo I keep what I don't want us to forget: the feast, the harvest and the pain too.",
    },
    bio: {
      es: "Don Teodoro modela las figuras de los retablos; Yesenia, su hija, pinta los jarrones de Quinua. Padre e hija comparten la misma mesa de trabajo desde hace quince años.",
      en: "Don Teodoro models the retablo figures; his daughter Yesenia paints the Quinua vases. Father and daughter have shared the same workbench for fifteen years.",
    },
    story: {
      es: [
        "Teodoro hizo su primer retablo a los diecisiete años, con una caja de madera de fruta y figuras de pasta de papa y yeso. En los años difíciles de Ayacucho, cuando muchos callaban, sus retablos empezaron a contar lo que pasaba en los pueblos. «El retablo también es memoria», dice.",
        "Yesenia creció entre olor a cola y pintura. A los doce ya pintaba los ojitos de los santos más pequeños; hoy viaja cada semana a Quinua para trabajar la arcilla y decorar jarrones con las grecas que su padre le enseñó a trazar sin regla.",
        "Un retablo de tres pisos les toma hasta diez días. Cada figura, del músico a la vaquita, se modela una por una. Cuando un retablo suyo llega a otra casa, Teodoro siente que una parte de su pueblo viaja con él.",
      ],
      en: [
        "Teodoro made his first retablo at seventeen, using a wooden fruit crate and figures of potato paste and plaster. During Ayacucho's hard years, when many stayed silent, his retablos began telling what was happening in the villages. \"A retablo is also memory,\" he says.",
        "Yesenia grew up surrounded by the smell of glue and paint. At twelve she was already painting the eyes of the smallest saints; today she travels to Quinua every week to work the clay and decorate vases with the fretwork her father taught her to draw freehand.",
        "A three-tier retablo takes them up to ten days. Every figure, from the musician to the little cow, is modeled one by one. When one of their retablos arrives in a new home, Teodoro feels a piece of his village travels with it.",
      ],
    },
  },
  {
    id: "taller-cusco",
    artisanName: { es: "Lucía Condori Huamán", en: "Lucía Condori Huamán" },
    regionName: "Cusco",
    community: { es: "Comunidad cerca de Chinchero, Valle Sagrado", en: "Community near Chinchero, Sacred Valley" },
    yearsOfCraft: 18,
    color: "#6a3d8f",
    productIds: ["chullo-alpaca", "set-tazas-artesanales"],
    title: { es: "Taller de tejidos y cerámica", en: "Weaving and ceramics workshop" },
    technique: { es: "Tejido y esmaltado", en: "Weaving and glazing" },
    materials: { es: "Fibra de alpaca y arcilla", en: "Alpaca fiber and clay" },
    cover: {
      src: "/images/artisans/taller-cusco.jpg",
      alt: { es: "Lucía con su montera tradicional tejiendo en el telar", en: "Lucía in her traditional montera hat weaving at the loom" },
      position: "center 85%",
    },
    quote: {
      es: "Solas no podíamos. Juntas, hasta el frío de la puna se vuelve más llevadero.",
      en: "Alone we couldn't. Together, even the cold of the high plains feels bearable.",
    },
    bio: {
      es: "Madre de tres, fundó un colectivo con doce mujeres de su comunidad. Ellas tejen los chullos; su esposo Wilber hornea las tazas en el horno de leña del patio.",
      en: "A mother of three, she founded a collective with twelve women from her community. They knit the chullos; her husband Wilber fires the cups in the wood kiln in their yard.",
    },
    story: {
      es: [
        "Cuando Lucía tenía dieciséis años, las tejedoras de su comunidad bajaban al mercado con sus chullos y regresaban con casi todo sin vender. Una tarde de lluvia reunió a sus vecinas en su cocina y les propuso algo simple: tejer juntas, fijar un precio justo y no rebajarse nunca.",
        "Hoy son trece. Se juntan los martes y jueves, hilan mientras conversan en quechua y tiñen la fibra de alpaca con cochinilla, chillca y q'olle. Cada chullo lleva un dibujo que cuenta algo: el río, la flor de papa, el ojo del cóndor.",
        "Con lo que ganan, dos de las mujeres ya pagaron la universidad de sus hijos. Lucía sueña con un pequeño local en el pueblo donde los viajeros puedan verlas tejer, y con que algún día una de sus hijas quiera seguir el camino.",
      ],
      en: [
        "When Lucía was sixteen, the weavers in her community would go down to the market with their chullos and come back with almost all of them unsold. One rainy afternoon she gathered her neighbors in her kitchen and proposed something simple: weave together, set a fair price and never undersell.",
        "Today there are thirteen of them. They meet on Tuesdays and Thursdays, spinning while they talk in Quechua, and dye the alpaca fiber with cochineal, chillca and q'olle. Every chullo carries a design that tells something: the river, the potato flower, the eye of the condor.",
        "With what they earn, two of the women have already paid for their children's university. Lucía dreams of a small shop in town where travelers can watch them weave, and that one day one of her daughters will want to follow the path.",
      ],
    },
  },
  {
    id: "taller-junin",
    artisanName: { es: "Julián Ricse Poma", en: "Julián Ricse Poma" },
    regionName: "Junín",
    community: { es: "Cochas Chico, Huancayo", en: "Cochas Chico, Huancayo" },
    yearsOfCraft: 40,
    color: "#2f8f4e",
    productIds: ["mate-burilado"],
    title: { es: "Taller de mates burilados", en: "Carved-gourd workshop" },
    technique: { es: "Burilado a mano", en: "Hand carving" },
    materials: { es: "Calabaza", en: "Gourd" },
    cover: {
      src: "/images/artisans/taller-junin.jpg",
      alt: { es: "Don Julián concentrado grabando sus dibujos con el buril", en: "Don Julián focused on engraving his designs with the burin" },
      position: "center 60%",
    },
    quote: {
      es: "El mate es mi cuaderno. Ahí escribo la vida de mi pueblo, aunque nunca aprendí bien las letras.",
      en: "The gourd is my notebook. There I write the life of my village, even though I never learned my letters well.",
    },
    bio: {
      es: "A sus 55 años, sigue burilando cada mañana con la luz que entra por la ventana. Su nieto Kevin, de 12, ya talla sus primeras escenas a su lado.",
      en: "At 55, he still carves every morning by the light coming through the window. His grandson Kevin, 12, is already carving his first scenes beside him.",
    },
    story: {
      es: [
        "Julián dejó la escuela a los quince para ayudar en la chacra, pero las noches eran suyas: con un buril hecho de un clavo afilado, copiaba en calabazas lo que veía durante el día. Las vacas, la cosecha, la fiesta del pueblo.",
        "Un mate grande le toma hasta tres semanas. Dibuja sin boceto, directamente sobre la cáscara, y luego quema algunas zonas con un palito de quinual encendido para darles ese color tostado. Si se equivoca, no hay borrador: el error se convierte en parte de la historia.",
        "Su vista ya no es la de antes, por eso enseña a su nieto Kevin con paciencia, como le enseñaron a él. «Mientras alguien en la familia agarre el buril, Cochas va a seguir contando su historia», dice sonriendo.",
      ],
      en: [
        "Julián left school at fifteen to help in the fields, but the nights were his: with a burin made from a sharpened nail, he copied onto gourds what he saw during the day. The cows, the harvest, the village feast.",
        "A large gourd takes him up to three weeks. He draws without a sketch, straight onto the shell, then scorches some areas with a glowing quinual twig to give them that toasted color. If he makes a mistake there is no eraser: the error becomes part of the story.",
        "His eyesight isn't what it was, so he teaches his grandson Kevin patiently, the way he was taught. \"As long as someone in the family picks up the burin, Cochas will keep telling its story,\" he says with a smile.",
      ],
    },
  },
];
