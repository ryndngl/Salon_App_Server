// scripts/seedServices.js - Run this once to populate your database
const mongoose = require('mongoose');
const Service = require('../models/Service');

// Your existing services data (modified for MongoDB)
const servicesData = [
  {
    id: 1,
    name: "Hair Cut",
    description: "Professional hair cutting services for all ages",
    styles: [
      // Men
      {
        id: 1,
        name: "Buzz Cut",
        category: "Men",
        price: 100,
        description: "A low-maintenance, clean and even haircut perfect for a fresh look.",
        image: "/images/haircut/men/buzz-cut.webp",
      },
      {
        id: 2,
        name: "High Fade",
        category: "Men",
        price: 100,
        description: "A sharp fade from the sides up to the top for a sleek and modern style.",
        image: "/images/haircut/men/high-fade.webp",
      },
      {
        id: 3,
        name: "Crew Cut",
        category: "Men",
        price: 100,
        description:
          "A classic short cut with a neat finish, great for any occasion.",
        image: "/images/haircut/men/crew-cut.webp",
      },
      {
        id: 4,
        name: "Fohawk",
        category: "Men",
        price: 100,
        description:
          "A bold style with short sides and a strip of longer hair down the middle.",
        image: "/images/haircut/men/fohawk.webp",
      },
      {
        id: 5,
        name: "French Crop",
        category: "Men",
        price: 100,
        description:
          "A short, textured cut with a neat fringe for a stylish finish.",
        image:"/images/haircut/men/french-crop.webp" ,
      },
      {
        id: 6,
        name: "Side Part",
        category: "Men",
        price: 100,
        description:
          "A timeless cut with a defined side part for a polished look.",
        image: "/images/haircut/men/side-part.webp",
      },
      {
        id: 7,
        name: "Taper Fade Mohawk",
        category: "Men",
        price: 100,
        description:
          "A mohawk with a smooth taper fade for a clean yet edgy style.",
        image: "/images/haircut/men/taper-fade-mohawk.webp",
      },
      {
        id: 8,
        name: "Textured Comb Over",
        category: "Men",
        price: 100,
        description:
          "A voluminous comb-over with added texture for a modern vibe.",
        image:"/imagess/haircut/men/textured-comb-over.webp",
      },
       {
        id: 9,
        name: "Two Block",
        category: "Men",
        price: 100,
        description:
          "A trendy cut with short sides and longer top layers for contrast.",
        image: "/images/haircut/men/two-block.webp",
      },
      {
        id: 10,
        name: "Burst Fade",
        category: "Men",
        price: 100,
        description:
          "A rounded fade that curves around the ear for a unique look.",
        image: "/images/haircut/men/burst-fade.webp",
      },
      {
        id: 11,
        name: "Curtain Fringe",
        category: "Men",
        price: 100,
        description:
          "A parted fringe style for a relaxed, youthful appearance.",
        image: "/images/haircut/men/curtain-fringe.webp",
      },
      {
        id: 12,
        name: "Army Cut",
        category: "Men",
        price: 100,
        description:
          "A very short, military-inspired haircut for a sharp and clean style.",
        image: "/imagess/haircut/men/army-cut.webp",
      },
      
      // Women
      {
        id: 1,
        name: "Boy Cut",
        category: "Women",
        price: 100,
        description: "A short, androgynous style that's bold and easy to maintain.",
        image: "/images/haircut/women/boy-cut.webp",
      },
       {
        id: 2,
        name: "Butterfly Cut",
        category: "Women",
        price: 100,
        description: "Layered waves with volume, giving a light and airy look.",
        image: "/images/haircut/women/butterfly-cut.webp",
      },
      {
        id: 3,
        name: "Fluffy Waves Bob",
        category: "Women",
        price: 100,
        description:
          "A soft bob with gentle waves for a fresh, chic appearance.",
        image: "/images/haircut/women/fluffy-waves-bob.webp" ,
      },  
      {
        id: 4,
        name: "Layered Curls",
        category: "Women",
        price: 100,
        description:
          "Bouncy curls with layered volume for a lively, stylish look.",
        image: "/images/haircut/women/layered-curls-with-bangs.webp",
      },
      {
        id: 5,
        name: "Layered",
        category: "Women",
        price: 100,
        description: "A versatile layered cut for movement and shape.",
        image: "/images/haircut/women/layered.webp",
      },
      {
        id: 6,
        name: "Long Layered",
        category: "Women",
        price: 100,
        description: "Long layers that add dimension and flow to your hair.",
        image: "/imagess/haircut/women/long-layered.webp",
      },
      {
        id: 7,
        name: "Middy",
        category: "Women",
        price: 100,
        description: "A mid-length cut with soft edges for a feminine style.",
        image: "/images/haircut/women/middy.webp",
      },
      {
        id: 8,
        name: "Short",
        category: "Women",
        price: 100,
        description: "A simple, short haircut that's fresh and easy to style.",
        image: "/images/haircut/women/short.webp",
      },
      {
        id: 9,
        name: "Soft and Pixie Cut",
        category: "Women",
        price: 100,
        description:
          "A pixie cut with soft texture for a playful, modern look.",
        image: "/images/haircut/women/soft-and-pixie-cut.webp",
      },
      {
        id: 10,
        name: "Textured Bob",
        category: "Women",
        price: 100,
        description:
          "A bob with added texture and bangs for a chic, trendy vibe.",
        image: "/images/haircut/women/textured-bob-and-wispy-bangs.webp",
      },
      {
        id: 11,
        name: "V Cut",
        category: "Women",
        price: 100,
        description: "Long layers cut in a V-shape for a sleek finish.",
        image: "/images/haircut/women/v-cut.webp",
      },
       {
        id: 12,
        name: "Wolf Cut Mallet",
        category: "Women",
        price: 100,
        description: "A bold, edgy cut mixing mullet and shag styles.",
        image: "/images/haircut/women/wolf-cut-mullet.webp",
      },
      {
        id: 13,
        name: "Wolf Cut",
        category: "Women",
        price: 100,
        description: "A trendy shaggy cut with layers and volume.",
        image: "/images/haircut/women/wolf-cut.webp",
      },
      {
        id: 14,
        name: "Bangs",
        category: "Women",
        price: 100,
        description:
          "Frontal fringe that frames the face for a youthful touch.",
        image: "/images/haircut/women/bangs.webp",
      },
      {
        id: 15,
        name: "Side swept",
        category: "Women",
        price: 100,
        description: "Side-swept fringe for a soft, romantic look.",
        image: "/images/haircut/women/side-swept.webp",
      },
      {
        id: 16,
        name: "Balayage",
        category: "Women",
        price: 100,
        description:
          "A highlighting technique for a natural sun-kissed effect.",
        image: "/images/haircut/women/balayage.webp",
      },
      
      
      // Kids
      {
        id: 1,
        name: "Army Cut",
        category: "Kids",
        price: 100,
        description: "A neat, short haircut perfect for active kids.",
        image: "/images/haircut/kids/army-cut.webp",
      },
       {
        id: 2,
        name: "Bowl Cut",
        category: "Kids",
        price: 100,
        description:
          "A rounded cut with even length for a cute, classic style.",
        image: "/images/haircut/kids/bowl-cut.webp",
      },
       {
        id: 3,
        name: "Little Buzz",
        category: "Kids",
        price: 100,
        description: "Very short and even, easy to maintain for kids.",
        image: "/images/haircut/kids/buzz-cut.webp",
      },
      {
        id: 4,
        name: "Comb Over Cut",
        category: "Kids",
        price: 100,
        description: "Short sides with a neat combed top for a polished look.",
        image: "/images/haircut/kids/comb-over-cut.webp",
      },
      {
        id: 5,
        name: "Pompadour",
        category: "Kids",
        price: 100,
        description:
          "A stylish top with volume, perfect for special occasions.",
        image: "/images/haircut/kids/pompadour.webp",
      },
      {
        id: 6,
        name: "Fade",
        category: "Kids",
        price: 100,
        description:
          "Short sides fading into longer top hair for a fresh look.",
        image: "/images/haircut/kids/fade.webp",
      },
      {
        id: 7,
        name: "Fringe Fade",
        category: "Kids",
        price: 100,
        description: "A fade with front fringe for a modern, playful vibe.",
        image: "/images/haircut/kids/fringe-fade.webp",
      },
      {
        id: 8,
        name: "Little Fade",
        category: "Kids",
        price: 100,
        description: "High contrast fade for a sharp and trendy style.",
        image: "/images/haircut/kids/high-fade.webp",
      },
      {
        id: 9,
        name: "Mid Fade",
        category: "Kids",
        price: 100,
        description: "Balanced fade starting mid-way up the head.",
        image: "/images/haircut/kids/mid-fade.webp",
      },
      {
        id: 10,
        name: "Mohawk",
        category: "Kids",
        price: 100,
        description: "Bold style with shaved sides and a strip of long hair.",
        image: "/images/haircut/kids/mohawk.webp",
      },
      {
        id: 11,
        name: "Side Part Cut",
        category: "Kids",
        price: 100,
        description: "Classic side part style for a clean, smart look.",
        image: "/images/haircut/kids/side-part-cut.webp",
      },
     
    ],
  },
  {
    id: 2,
    name: "Hair Color",
    description: "Professional hair coloring services",
    styles: [
      // Root Touch Up
      {
        id: 1,
        name: "Medium Brown",
        category: "Root Touch Up",
        price: 499,
        description: "Ideal for covering roots on medium brown hair.",
        image: "/images/haircolor/medium-brown.webp",
      },
       {
        id: 2,
        name: "Light Blonde",
        category: "Root Touch Up",
        price: 499,
        description:
          "Used to seamlessly blend darker roots into light blonde hair.",
        image: "/images/haircolor/light-blonde.webp",
      },
      {
        id: 3,
        name: "Black",
        category: "Root Touch Up",
        price: 499,
        description:
          " Perfect for concealing regrowth on natural or dyed black hair.",
        image: "/images/hair-color/black.webp",
      },
      {
        id: 4,
        name: "Auburn Tones",
        category: "Root Touch Up",
        price: 499,
        description:
          "Designed to match and blend with reddish-brown auburn hair colors.",
        image: "/images/haircolor/auburn-tones.webp",
      },
      {
        id: 5,
        name: "Dark Brown",
        category: "Root Touch Up",
        price: 499,
        description: "For quick and easy root coverage on dark brown hair.",
        image: "/images/haircolor/dark-brown.webp",
      },

      // FULL HAIR CATEGORY
      {
        id: 1,
        name: "Inky Grey",
        category: "Full Hair",
        price: 699,
        description: "A deep grey shade with a sleek and mysterious allure.",
        image: "/images/haircolor/inky-grey.webp",
      },
      {
        id: 2,
        name: "Blonde",
        category: "Full Hair",
        price: 699,
        description:
          "A bright, golden tone that adds warmth and radiance to your look.",
        image: "/images/haircolor/blonde.webp",
      },
      {
        id: 3,
        name: "Purple",
        category: "Full Hair",
        price: 699,
        description: "Bold and playful purple for a unique and creative style.",
        image: "/images/haircolor/purple.webp",
      },
      {
        id: 4,
        name: "Chestnut Brown",
        category: "Full Hair",
        price: 699,
        description: "A warm brown shade with subtle reddish undertones.",
        image: "/images/haircolor/chestnut-brown.webp",
      },
      {
        id: 5,
        name: "Plum",
        category: "Full Hair",
        price: 699,
        description:
          "A rich, deep purple shade that can have either reddish or bluish undertones for a bold and dramatic look.",
        image: "/assets/haircolor/plum.webp",
      },
      {
        id: 6,
        name: "Light Golden Brown",
        category: "Full Hair",
        price: 699,
        description:
          "A warm, light brown shade infused with subtle golden tones for a soft and luminous finish.",
        image: "/images/haircolor/light-golden-brown.webp",
      },
      {
        id: 7,
        name: "Ember",
        category: "Full Hair",
        price: 699,
        description:
          "A fiery, reddish-orange color with warm undertones, giving your hair a vibrant, glowing effect.",
        image: "/images/haircolor/ember.webp",
      },
      // HIGHLIGHT CATEGORY
      {
        id: 1,
        name: "Money Piece",
        category: "Highlight",
        price: 499,
        description:
          "Face-framing highlights that brighten and enhance your look.",
        image: "/images/haircolor/money-piece.webp",
      },
      {
        id: 2,
        name: "Copper",
        category: "Highlight",
        price: 499,
        description: "Vibrant copper streaks that add warmth and dimension.",
        image: "/images/haircolor/copper.webp",
      },
      {
        id: 3,
        name: "Blue",
        category: "Highlight",
        price: 499,
        description:
          "Bold and vibrant blue for a standout, creative statement.",
        image: "/images/haircolor/blue.webp",
      },
      {
        id: 4,
        name: "Cherry Red",
        category: "Highlight",
        price: 499,
        description:
          "Bright, eye-catching red with a playful and daring appeal.",
        image: "/images/haircolor/cherry-red.webp",
      },
      {
        id: 5,
        name: "Honey Blonde",
        category: "Highlight",
        price: 499,
        description:
          "This highlight provides a warm, golden blonde color that brightens up the hair.",
        image: ("../assets/Hair Color/Honey Blonde.webp"),
      },
      {
        id: 6,
        name: "Ombre",
        category: "Highlight",
        price: 499,
        description: " A gradual transition from dark roots to lighter ends.",
        image: "/images/haircolor/ombre.webp",
      },
      {
        id: 7,
        name: "Caramel",
        category: "Highlight",
        price: 499,
        description: "Warm brown with golden undertones.",
        image: "/images/haircolor/caramel-highlight.webp",
      },
      {
        id: 8,
        name: "Chunky",
        category: "Highlight",
        price: 499,
        description: "Thick and distinct strands of color.",
        image: "/images/haircolor/chunky.webp",
      },
            
    // BALAYAGE CATEGORY
{
  id: 1,
  name: "Ash Blonde",
  category: "Balayage",
  price: 1499,
  description:
    "A cool, muted blonde shade for a sophisticated and modern vibe.",
  image: "/images/haircolor/ash-blonde.webp",
},
{
  id: 2,
  name: "Burgundy",
  category: "Balayage",
  price: 1499,
  description: "A deep red wine shade for a rich, elegant finish.",
  image: "/images/haircolor/burgundy-hair.webp",
},
{
  id: 3,
  name: "Auburn",
  category: "Balayage",
  price: 1499,
  description:
    "It provides a warm, vibrant hue that makes your hair stand out, especially when it catches the light.",
  image: "/images/haircolor/auburn.webp",
},
{
  id: 4,
  name: "Bronde",
  category: "Balayage",
  price: 1499,
  description:
    "This is the perfect blend of blonde and brown tones, creating a sun-kissed and natural look. ",
  image: "/images/haircolor/bronde.webp",
},
{
  id: 5,
  name: "Chocolate Brown",
  category: "Balayage",
  price: 1499,
  description:
    "It gives your hair a deep and sophisticated look with beautiful, natural-looking dimension.",
  image: "/images/haircolor/chocolate-brown.webp",
},
{
  id: 6,
  name: "Silver",
  category: "Balayage",
  price: 1499,
  description:
    "For a bold, modern, and edgy look, This is a great choice if you want to make a statement with your hair",
  image: "/images/haircolor/silver.webp",
},
{
  id: 7,
  name: "Caramel",
  category: "Balayage",
  price: 1499,
  description:
    "This hair color uses rich, warm golden brown and buttery tones that look like a delicious drizzle of caramel. ",
  image: "/images/haircolor/caramel.webp",
      },
  
    ],
  },

  // HAIR TREATMENT SERVICES
{
  id: 3,
  name: "Hair Treatment",
  styles: [
    {
      id: 1,
      name: "Bleaching",
      price: 200,
      description: "Lightens hair to prepare for vibrant or pastel colors.",
      image: "/images/hairtreatment/bleaching.webp",
    },
    {
      id: 2,
      name: "Brazillian",
      price: 700,
      description: "A smoothing treatment that tames frizz and adds shine.",
      image: "/images/hairtreatment/brazillian.webp",
    },
    {
      id: 3,
      name: "Cellophane",
      price: 500,
      description:
        "A semi-permanent gloss that boosts shine and color vibrancy.",
      image: "/images/hairtreatment/cellophane.webp",
    },
    {
      id: 4,
      name: "Conditioning",
      price: 150,
      description: "Deep conditioning to restore softness and hydration.",
      image: "/images/hairtreatment/conditioning.webp",
    },
    {
      id: 5,
      name: "Cystiene",
      price: 1500,
      description:
        "A formaldehyde-free straightening treatment for smooth, silky hair.",
      image: "/images/hairtreatment/cystiene.webp",
    },
    {
      id: 6,
      name: "Hair Botox",
      price: 1000,
      description:
        "Restores damaged hair fibers for a healthier, youthful look.",
      image: "/images/hairtreatment/hair-botox.webp",
    },
    {
      id: 7,
      name: "Hair Spa",
      price: 300,
      description:
        "A relaxing treatment that nourishes and revitalizes hair.",
      image: "/images/hairtreatment/hair-spa.webp",
    },
    {
      id: 8,
      name: "Keratin",
      price: 500,
      description:
        "Infuses hair with keratin for smoothness and frizz control.",
      image: "/images/hairtreatment/keratin.webp",
    },
  ],
},

// REBOND AND FORMS SERVICES
{
  id: 4,
  name: "Rebond & Forms",
  styles: [
    {
      id: 1,
      name: "Rebond with Botox",
      price: 2000,
      description:
        "Straightens hair while restoring strength and smoothness with botox treatment.",
      image: "/images/rebond/rebond-with-botox.webp",
    },
    {
      id: 2,
      name: "Rebond with Brazillian",
      price: 1500,
      description:
        "Combines rebonding with Brazilian treatment for sleek, frizz-free hair.",
      image: "/images/rebond/rebond-with-brazillian.webp",
    },
    {
      id: 3,
      name: "Rebond with Cellophane",
      price: 1300,
      description:
        "Smooth, straight hair with an added glossy cellophane finish.",
      image: "/images/rebond/rebond-with-cellophane.webp",
    },
    {
      id: 4,
      name: "Rebond with Color",
      price: 2500,
      description:
        "Straightens and colors your hair for a vibrant, polished look.",
      image: "/images/rebond/rebond-with-color.webp",
    },
    {
      id: 5,
      name: "Rebond with Keratin",
      price: 1000,
      description:
        "Straightens hair while infusing keratin for lasting smoothness.",
      image: "/images/rebond/rebond-with-keratin.webp",
    },
  ],
},

// NAIL CARE SERVICES
{
  id: 5,
  name: "Nail Care",
  styles: [
    {
      id: 1,
      name: "Gel Polish",
      price: 500,
      description: "Long-lasting, glossy nail color that resists chipping.",
      image: "/images/nails/gel-polish.webp",
    },
    {
      id: 2,
      name: "Removing Gel",
      price: 150,
      description:
        "Gentle and safe removal of gel polish without damaging nails.",
      image: "/images/nails/removing-gel.webp",
    },
    {
      id: 3,
      name: "Soft Gel",
      price: 800,
      description:
        "Flexible and lightweight nail extensions for a natural feel",
      image: "/images/nails/soft-gel.webp",
    },
  ],
},

// FOOT SPA SERVICES
  {
    id: 6,
    name: "Foot Spa",
    description: "Relaxing foot spa and care services",
    styles: [
      {
        id: 1,
        name: "Foot Spa Package",
        price: 300,
        description: "A complete foot spa with manicure and pedicure for full relaxation.",
        images: [
          "/images/footspa/foot-spa.webp",
          "/images/footspa/manicure.webp",
          "/images/footspa/pedicure.webp",
        ],
      },
      {
        id: 2,
        name: "Manicure",
        price: 100,
        description: "Professional nail cleaning and shaping for a neat look.",
        image: "/images/footspa/manicure.webp",
      },
      {
        id: 3,
        name: "Pedicure",
        price: 100,
        description: "Thorough foot cleaning and nail care for healthy feet.",
        image: "/images/footspa/pedicure.webp",
      },
    ],
  },
];

const seedServices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_booking');
    
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