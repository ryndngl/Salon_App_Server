// scripts/seedServices.js - Run this once to populate your database
const mongoose = require('mongoose');
const Service = require('../src/models/Service').default;;

// Your existing services data (modified for MongoDB)
const servicesData = [
  {
  id: 1,
  name: "Hair Cut",
  description: "Stylish cuts tailored to your look.",
  styles: [
    // Men (100 series)
    {
      id: 101,
      name: "Buzz Cut",
      category: "Men",
      price: 100,
      description: "A low-maintenance, clean and even haircut perfect for a fresh look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139273/Buzz_Cut_mh7hpq.webp",
    },
    {
      id: 102,
      name: "High Fade",
      category: "Men",
      price: 100,
      description: "A sharp fade from the sides up to the top for a sleek and modern style.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139268/High_fade_cgimmz.webp",
    },
    {
      id: 103,
      name: "Crew Cut",
      category: "Men",
      price: 100,
      description: "A classic short cut with a neat finish, great for any occasion.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139273/Crewcut_x5kcr9.webp",
    },
    {
      id: 104,
      name: "Fohawk",
      category: "Men",
      price: 100,
      description: "A bold style with short sides and a strip of longer hair down the middle.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139275/Fohawk_iqowdy.webp",
    },
    {
      id: 105,
      name: "French Crop",
      category: "Men",
      price: 100,
      description: "A short, textured cut with a neat fringe for a stylish finish.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139276/French_Crop_lfz51t.webp",
    },
    {
      id: 106,
      name: "Side Part",
      category: "Men",
      price: 100,
      description: "A timeless cut with a defined side part for a polished look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139268/Side_Part_ddqgc3.webp",
    },
    {
      id: 107,
      name: "Taper Fade Mohawk",
      category: "Men",
      price: 100,
      description: "A mohawk with a smooth taper fade for a clean yet edgy style.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139269/Taper_Fade_Mohawk_oeikwr.webp",
    },
    {
      id: 108,
      name: "Textured Comb Over",
      category: "Men",
      price: 100,
      description: "A voluminous comb-over with added texture for a modern vibe.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139270/Textured-Comb-Over_hcugdd.webp",
    },
    {
      id: 109,
      name: "Two Block",
      category: "Men",
      price: 100,
      description: "A trendy cut with short sides and longer top layers for contrast.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139270/Two_Block_bt0jki.webp",
    },
    {
      id: 110,
      name: "Burst Fade",
      category: "Men",
      price: 100,
      description: "A rounded fade that curves around the ear for a unique look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139272/Burst_Fade_sjpzhf.webp",
    },
    {
      id: 111,
      name: "Curtain Fringe",
      category: "Men",
      price: 100,
      description: "A parted fringe style for a relaxed, youthful appearance.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139274/Curtain_Fringe_igcvvq.webp",
    },
    {
      id: 112,
      name: "Army Cut",
      category: "Men",
      price: 100,
      description: "A very short, military-inspired haircut for a sharp and clean style.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139271/Army_Cut_mndebh.webp",
    },

    // Women (200 series)
    {
      id: 201,
      name: "Boy Cut",
      category: "Women",
      price: 100,
      description: "A short, androgynous style that's bold and easy to maintain.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139397/Boy_Cut_y5fqzb.webp",
    },
    {
      id: 202,
      name: "Butterfly Cut",
      category: "Women",
      price: 100,
      description: "Layered waves with volume, giving a light and airy look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139399/Butterfly_Cut_zzfiit.webp",
    },
    {
      id: 203,
      name: "Fluffy Waves Bob",
      category: "Women",
      price: 100,
      description: "A soft bob with gentle waves for a fresh, chic appearance.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139400/Fluffy_Waves_Bob_yicjsd.webp",
    },
    {
      id: 204,
      name: "Layered Curls",
      category: "Women",
      price: 100,
      description: "Bouncy curls with layered volume for a lively, stylish look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139401/Layered_Curls_with_Bangs_zte0oa.webp",
    },
    {
      id: 205,
      name: "Layered",
      category: "Women",
      price: 100,
      description: "A versatile layered cut for movement and shape.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139402/Layered_qbqmnw.webp",
    },
    {
      id: 206,
      name: "Long Layered",
      category: "Women",
      price: 100,
      description: "Long layers that add dimension and flow to your hair.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139386/Long_Layered_yz5scl.webp",
    },
    {
      id: 207,
      name: "Middy",
      category: "Women",
      price: 100,
      description: "A mid-length cut with soft edges for a feminine style.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139387/Middy_hmp68f.webp",
    },
    {
      id: 208,
      name: "Short",
      category: "Women",
      price: 100,
      description: "A simple, short haircut that's fresh and easy to style.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139388/Short_q5yrln.webp",
    },
    {
      id: 209,
      name: "Soft and Pixie Cut",
      category: "Women",
      price: 100,
      description: "A pixie cut with soft texture for a playful, modern look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139390/Soft_and_Pixie_Cut_nruxzw.webp",
    },
    {
      id: 210,
      name: "Textured Bob",
      category: "Women",
      price: 100,
      description: "A bob with added texture and bangs for a chic, trendy vibe.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139391/Textured_Bob_and_Wispy_Bangs_tdsnrn.webp",
    },
    {
      id: 211,
      name: "V Cut",
      category: "Women",
      price: 100,
      description: "Long layers cut in a V-shape for a sleek finish.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139392/V_Cut_tjzhtf.webp",
    },
    {
      id: 212,
      name: "Wolf Cut Mallet",
      category: "Women",
      price: 100,
      description: "A bold, edgy cut mixing mullet and shag styles.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139393/Wolf_Cut_Mullet_brngxe.webp",
    },
    {
      id: 213,
      name: "Wolf Cut",
      category: "Women",
      price: 100,
      description: "A trendy shaggy cut with layers and volume.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139394/Wolf_Cut_qayoib.webp",
    },
    {
      id: 214,
      name: "Bangs",
      category: "Women",
      price: 100,
      description: "Frontal fringe that frames the face for a youthful touch.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139396/Bangs_yw2kxi.webp",
    },
    {
      id: 215,
      name: "Side swept",
      category: "Women",
      price: 100,
      description: "Side-swept fringe for a soft, romantic look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139389/Side_swept_bslkje.webp",
    },
    {
      id: 216,
      name: "Balayage",
      category: "Women",
      price: 100,
      description: "A highlighting technique for a natural sun-kissed effect.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139395/Balayage_y0hphf.webp",
    },

    // Kids (300 series)
    {
      id: 301,
      name: "Litte Army Cut",
      category: "Kids",
      price: 100,
      description: "A neat, short haircut perfect for active kids.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139346/Army_Cut_kcn3in.webp",
    },
    {
      id: 302,
      name: "Bowl Cut",
      category: "Kids",
      price: 100,
      description: "A rounded cut with even length for a cute, classic style.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139348/Bowl_Cut_rvlzxk.webp",
    },
    {
      id: 303,
      name: "Little Buzz",
      category: "Kids",
      price: 100,
      description: "Very short and even, easy to maintain for kids.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139349/Buzz_Cut_lypxay.webp",
    },
    {
      id: 304,
      name: "Comb Over Cut",
      category: "Kids",
      price: 100,
      description: "Short sides with a neat combed top for a polished look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139347/Comb_Over_Cut_mueaxd.webp",
    },
    {
      id: 305,
      name: "Pompadour",
      category: "Kids",
      price: 100,
      description: "A stylish top with volume, perfect for special occasions.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139344/Pompadour_t0wbyx.webp",
    },
    {
      id: 306,
      name: "High Fade",
      category: "Kids",
      price: 100,
      description: "Short sides fading into longer top hair for a fresh look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139352/High_Fade_fxhyqz.webp",
    },
    {
      id: 307,
      name: "Fringe Fade",
      category: "Kids",
      price: 100,
      description: "A fade with front fringe for a modern, playful vibe.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139351/Fringe_Fade_uj0emi.webp",
    },
    {
      id: 308,
      name: "Little Fade",
      category: "Kids",
      price: 100,
      description: "High contrast fade for a sharp and trendy style.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139350/Fade_tqbrax.webp",
    },
    {
      id: 309,
      name: "Mid Fade",
      category: "Kids",
      price: 100,
      description: "Balanced fade starting mid-way up the head.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139342/Mid_Fade_hlloly.webp",
    },
    {
      id: 310,
      name: "Mohawk",
      category: "Kids",
      price: 100,
      description: "Bold style with shaved sides and a strip of long hair.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139343/Mohawk_d8khde.webp",
    },
    {
      id: 311,
      name: "Side Part Cut",
      category: "Kids",
      price: 100,
      description: "Classic side part style for a clean, smart look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756139345/Side_Part_Cut_cwyeju.webp",
    },
  ],
},

  {
    id: 2,
    name: "Hair Color",
    description: "Transform your hair with vibrant, lasting colors.",
    styles: [
      // Root Touch Up (400 series)
      {
        id: 401,
        name: "Medium Brown",
        category: "Root Touch Up",
        price: 499,
        description: "Ideal for covering roots on medium brown hair.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145563/Medium_Brown_yhgczj.webp",
      },
       {
        id: 402,
        name: "Light Blonde",
        category: "Root Touch Up",
        price: 499,
        description:
          "Used to seamlessly blend darker roots into light blonde hair.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145560/Light_Blonde_i2kv5l.webp",
      },
      {
        id: 403,
        name: "Black",
        category: "Root Touch Up",
        price: 499,
        description:
          " Perfect for concealing regrowth on natural or dyed black hair.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145562/Black_jdkjgg.webp",
      },
      {
        id: 404,
        name: "Auburn Tones",
        category: "Root Touch Up",
        price: 499,
        description:
          "Designed to match and blend with reddish-brown auburn hair colors.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145559/Auburn_tones_vqb1ni.webp",
      },
      {
        id: 405,
        name: "Dark Brown",
        category: "Root Touch Up",
        price: 499,
        description: "For quick and easy root coverage on dark brown hair.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145561/Dark_Brown_g6djp0.webp",
      },

      // Full Hair (500 series)
      {
        id: 501,
        name: "Inky Grey",
        category: "Full Hair",
        price: 699,
        description: "A deep grey shade with a sleek and mysterious allure.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145579/Ink_Grey_kdbfc3.webp",
      },
      {
        id: 502,
        name: "Blonde",
        category: "Full Hair",
        price: 699,
        description:
          "A bright, golden tone that adds warmth and radiance to your look.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145580/Blonde_raisqo.webp",
      },
      {
        id: 503,
        name: "Purple",
        category: "Full Hair",
        price: 699,
        description: "Bold and playful purple for a unique and creative style.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145579/Purple_bbllym.webp",
      },
      {
        id: 504,
        name: "Chestnut Brown",
        category: "Full Hair",
        price: 699,
        description: "A warm brown shade with subtle reddish undertones.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145581/Chestnut_Brown_pziqoi.webp",
      },
      {
        id: 505,
        name: "Plum",
        category: "Full Hair",
        price: 699,
        description:
          "A rich, deep purple shade that can have either reddish or bluish undertones for a bold and dramatic look.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145578/Plum_kctix1.webp",
      },
      {
        id: 506,
        name: "Light Golden Brown",
        category: "Full Hair",
        price: 699,
        description:
          "A warm, light brown shade infused with subtle golden tones for a soft and luminous finish.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145612/Light_Golden_Brown_ltndjw.webp",
      },
      {
        id: 507,
        name: "Ember",
        category: "Full Hair",
        price: 699,
        description:
          "A fiery, reddish-orange color with warm undertones, giving your hair a vibrant, glowing effect.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145577/Ember_rbd2bc.webp",
      },
      // Hightlight (600 series)
      {
        id: 601,
        name: "Money Piece",
        category: "Highlight",
        price: 499,
        description:
          "Face-framing highlights that brighten and enhance your look.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145569/Money_Piece_mykohp.webp",
      },
      {
        id: 602,
        name: "Copper",
        category: "Highlight",
        price: 499,
        description: "Vibrant copper streaks that add warmth and dimension.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145665/Copper_Highlights_lzov3i.webp",
      },
      {
        id: 603,
        name: "Blue",
        category: "Highlight",
        price: 499,
        description:
          "Bold and vibrant blue for a standout, creative statement.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145574/Blue_Hair_c4wdec.webp",
      },
      {
        id: 604,
        name: "Cherry Red",
        category: "Highlight",
        price: 499,
        description:
          "Bright, eye-catching red with a playful and daring appeal.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145571/Cherry_Red_k8moqt.webp",
      },
      {
        id: 605,
        name: "Honey Blonde",
        category: "Highlight",
        price: 499,
        description:
          "This highlight provides a warm, golden blonde color that brightens up the hair.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145572/Honey_Blonde_qu1kvq.webp",
      },
      {
        id: 606,
        name: "Ombre",
        category: "Highlight",
        price: 499,
        description: " A gradual transition from dark roots to lighter ends.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145570/Ombre_cixwxn.webp",
      },
      {
        id: 607,
        name: "Toasted Caramel",
        category: "Highlight",
        price: 499,
        description: "Warm brown with golden undertones.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145573/Caramel_Highlight_z2ngui.webp",
      },
      {
        id: 608,
        name: "Chunky",
        category: "Highlight",
        price: 499,
        description: "Thick and distinct strands of color.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145568/Chunky_swcybk.webp",
      },
            
    // Balayage (700 series)
{
  id: 701,
  name: "Ash Blonde",
  category: "Balayage",
  price: 1499,
  description:
    "A cool, muted blonde shade for a sophisticated and modern vibe.",
  image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145553/Ash_Blonde_c3wl7f.webp",
},
{
  id: 702,
  name: "Burgundy",
  category: "Balayage",
  price: 1499,
  description: "A deep red wine shade for a rich, elegant finish.",
  image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145552/Burgundy_Hair_daz7pu.webp",
},
{
  id: 703,
  name: "Auburn",
  category: "Balayage",
  price: 1499,
  description:
    "It provides a warm, vibrant hue that makes your hair stand out, especially when it catches the light.",
  image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145549/Auburn_imx5ju.webp",
},
{
  id: 704,
  name: "Bronde",
  category: "Balayage",
  price: 1499,
  description:
    "This is the perfect blend of blonde and brown tones, creating a sun-kissed and natural look. ",
  image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145554/Bronde_tblhvl.webp",
},
{
  id: 705,
  name: "Chocolate Brown",
  category: "Balayage",
  price: 1499,
  description:  "It gives your hair a deep and sophisticated look with beautiful, natural-looking dimension.",
  image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145551/Chocolate_Brown_vr5pkw.webp",
},
{
  id: 706,
  name: "Silver",
  category: "Balayage",
  price: 1499,
  description: "For a bold, modern, and edgy look, This is a great choice if you want to make a statement with your hair",
  image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145548/Silver_l58fjz.webp",
},
{
  id: 707,
  name: "Golden Caramel",
  category: "Balayage",
  price: 1499,
  description: "This hair color uses rich, warm golden brown and buttery tones that look like a delicious drizzle of caramel. ",
  image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145550/Caramel_aignsx.webp",
      },
  
    ],
  },

  // HAIR TREATMENT SERVICES (800 series)
{
  id: 3,
  name: "Hair Treatment",
  description: "Revitalize and strengthen your hair for a healthy, shiny look.",
  styles: [
    {
      id: 801,
      name: "Bleaching",
      price: 200,
      description: "Lightens hair to prepare for vibrant or pastel colors.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145463/Bleaching_nghkji.webp",
    },
    {
      id: 802,
      name: "Brazillian",
      price: 700,
      description: "A smoothing treatment that tames frizz and adds shine.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145464/Brazillian_xdxnsx.webp",
    },
    {
      id: 803,
      name: "Cellophane",
      price: 500,
      description:
      "A semi-permanent gloss that boosts shine and color vibrancy.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145461/Cellophane_wgpz13.webp",
    },
    {
      id: 804,
      name: "Conditioning",
      price: 150,
      description: "Deep conditioning to restore softness and hydration.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145462/Conditioning_paf32i.webp",
    },
    {
      id:805,
      name: "Cystiene",
      price: 1500,
      description:
        "A formaldehyde-free straightening treatment for smooth, silky hair.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145464/Cystiene_ypqumi.webp",
    },
    {
      id: 806,
      name: "Hair Botox",
      price: 1000,
      description:
        "Restores damaged hair fibers for a healthier, youthful look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145462/Hair_Botox_yh1zqf.webp",
    },
    {
      id: 807,
      name: "Hair Spa",
      price: 300,
      description:
        "A relaxing treatment that nourishes and revitalizes hair.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145466/Hair_Spa_ksbm7w.webp",
    },
    {
      id: 808,
      name: "Keratin",
      price: 500,
      description:
        "Infuses hair with keratin for smoothness and frizz control.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145465/Keratin_gg7ryw.webp",
    },
  ],
},

// REBOND AND FORMS SERVICES (900 series)
{
  id: 4,
  name: "Rebond & Forms",
  description: "Get sleek, straight, and perfectly styled hair.",
  styles: [
    {
      id: 901,
      name: "Rebond with Botox",
      price: 2000,
      description:
        "Straightens hair while restoring strength and smoothness with botox treatment.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145429/Rebond_with_Botox_e6gotz.webp",
    },
    {
      id: 902,
      name: "Rebond with Brazillian",
      price: 1500,
      description:
        "Combines rebonding with Brazilian treatment for sleek, frizz-free hair.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145429/Rebond_with_Brazillian_v0gm0j.webp",
    },
    {
      id: 903,
      name: "Rebond with Cellophane",
      price: 1300,
      description:
        "Smooth, straight hair with an added glossy cellophane finish.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145428/Rebond_with_Cellophane_rthhmu.webp",
    },
    {
      id: 904,
      name: "Rebond with Color",
      price: 2500,
      description:
        "Straightens and colors your hair for a vibrant, polished look.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145429/Rebond_with_Color_bc3laj.webp",
    },
    {
      id: 905,
      name: "Rebond with Keratin",
      price: 1000,
      description:
        "Straightens hair while infusing keratin for lasting smoothness.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145428/Rebond_with_Keratin_sb1qv1.webp",
    },
  ],
},

// NAIL CARE SERVICES (1000 series)
{
  id: 5,
  name: "Nail Care",
description: "Keep your nails healthy, polished, and beautifully designed.",
  styles: [
    {
      id: 1001,
      name: "Gel Polish",
      price: 500,
      description: "Long-lasting, glossy nail color that resists chipping.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145412/Gel_Polish_xzvreu.webp",
    },
    {
      id: 1002,
      name: "Removing Gel",
      price: 150,
      description:
        "Gentle and safe removal of gel polish without damaging nails.",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145412/Removing_Gel_ki333p.webp",
    },
    {
      id: 1003,
      name: "Soft Gel",
      price: 800,
      description:
        "Flexible and lightweight nail extensions for a natural feel",
      image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145412/Soft_Gel_kkcqyu.webp",
    },
  ],
},

// FOOT SPA SERVICES (1100 series)
  {
    id: 6,
    name: "Foot Spa",
    description: "Relax and rejuvenate your feet with soothing care.",
    styles: [
      {
        id: 1101,
        name: "Foot Spa Package",
        price: 300,
        description: "A complete foot spa with manicure and pedicure for full relaxation.",
        images: [
          "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145444/Foot_Spa_lxbf90.webp",
          "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145443/Manicure_yauxtn.webp",
          "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145443/Pedicure_ynltfu.webp",
        ],
      },
      {
        id: 1102,
        name: "Manicure",
        price: 100,
        description: "Professional nail cleaning and shaping for a neat look.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145443/Manicure_yauxtn.webp",
      },
      {
        id: 1103,
        name: "Pedicure",
        price: 100,
        description: "Thorough foot cleaning and nail care for healthy feet.",
        image: "https://res.cloudinary.com/dyw0qxjzn/image/upload/v1756145443/Pedicure_ynltfu.webp",
      },
    ],
  },
];

const seedServices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Salon_DB');
    
    console.log('Connected to MongoDB');
    
    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');
    
    // Insert new services
    const createdServices = await Service.insertMany(servicesData);
    console.log(`Successfully seeded ${createdServices.length} services`);
    
    // Display created services
    createdServices.forEach(service => {
      console.log(`- ${service.name}: ${service.styles.length} styles`);
    });
    
  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeding function
if (require.main === module) {
  seedServices();
}

module.exports = seedServices;