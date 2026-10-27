import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load production environment from correct path
dotenv.config({ path: join(__dirname, '../../.env.production') });

// Force production environment
process.env.NODE_ENV = 'production';

// Create a separate pool for production seeding
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Production products - different from development
const products = [
  {
    name: "Fourth Wing",
    author: "Rebecca Yarros",
    description: "Violet Sorrengail enters a dangerous war college where aspiring dragon riders must fight for survival. In a world of secrets and rivalries, trust can be deadly.",
    price: 85.00,
    image: "https://covers.openlibrary.org/b/isbn/9781649374042-L.jpg",
    category: "Fantasy",
    stock_quantity: 45
  },
  {
    name: "Lessons in Chemistry",
    author: "Bonnie Garmus",
    description: "Chemist Elizabeth Zott challenges the expectations of 1960s society when an unexpected television career gives her a platform to inspire women through science and cooking.",
    price: 72.00,
    image: "https://covers.openlibrary.org/b/isbn/9780385547345-L.jpg",
    category: "Fiction",
    stock_quantity: 65
  },
  {
    name: "The Housemaid",
    author: "Freida McFadden",
    description: "A woman takes a job as a housemaid for a wealthy family, hoping for a fresh start. But behind the beautiful home and perfect appearances lie unsettling secrets.",
    price: 68.00,
    image: "https://covers.openlibrary.org/b/isbn/9781538742570-L.jpg",
    category: "Thriller",
    stock_quantity: 55
  },
  {
    name: "The Thursday Murder Club",
    author: "Richard Osman",
    description: "Four retirement-home residents meet to investigate unsolved crimes. Their hobby takes an unexpected turn when a real murder lands close to home.",
    price: 74.00,
    image: "https://covers.openlibrary.org/b/isbn/9781984880963-L.jpg",
    category: "Mystery",
    stock_quantity: 40
  },
  {
    name: "Remarkably Bright Creatures",
    author: "Shelby Van Pelt",
    description: "A lonely widow working at an aquarium forms an unlikely connection with an intelligent giant Pacific octopus, leading to unexpected discoveries about family and belonging.",
    price: 78.00,
    image: "https://covers.openlibrary.org/b/isbn/9780063204157-L.jpg",
    category: "Fiction",
    stock_quantity: 50
  },
  {
    name: "The House in the Cerulean Sea",
    author: "TJ Klune",
    description: "A quiet caseworker visits an unusual orphanage filled with magical children and discovers that compassion, acceptance, and love can change everything.",
    price: 76.00,
    image: "https://covers.openlibrary.org/b/isbn/9781250217288-L.jpg",
    category: "Fantasy",
    stock_quantity: 35
  },
  {
    name: "The Midnight Feast",
    author: "Lucy Foley",
    description: "A luxurious countryside hotel opening brings together guests with hidden histories. As celebrations turn sinister, old secrets threaten to surface.",
    price: 70.00,
    image: "https://covers.openlibrary.org/b/isbn/9780063003057-L.jpg",
    category: "Thriller",
    stock_quantity: 40
  },
  {
    name: "Yellowface",
    author: "R. F. Kuang",
    description: "After a fellow author dies unexpectedly, June Hayward takes credit for an unpublished manuscript. Her growing success comes at a dangerous moral cost.",
    price: 73.00,
    image: "https://covers.openlibrary.org/b/isbn/9780063250833-L.jpg",
    category: "Fiction",
    stock_quantity: 45
  },
  {
    name: "The 5 AM Club",
    author: "Robin Sharma",
    description: "A personal development guide that explores how an intentional morning routine can improve focus, productivity, creativity, and personal growth.",
    price: 64.00,
    image: "https://covers.openlibrary.org/b/isbn/9781443456623-L.jpg",
    category: "Self-Help",
    stock_quantity: 80
  },
  {
    name: "Essentialism",
    author: "Greg McKeown",
    description: "Learn to distinguish what truly matters from what distracts you, eliminate unnecessary commitments, and focus your energy on meaningful work.",
    price: 69.00,
    image: "https://covers.openlibrary.org/b/isbn/9780804137386-L.jpg",
    category: "Self-Help",
    stock_quantity: 60
  },
  {
    name: "The Courage to Be Disliked",
    author: "Ichiro Kishimi and Fumitake Koga",
    description: "A philosopher and a young man explore how individual freedom, personal responsibility, and changing your perspective can lead to a more fulfilling life.",
    price: 67.00,
    image: "https://covers.openlibrary.org/b/isbn/9781501197277-L.jpg",
    category: "Psychology",
    stock_quantity: 75
  },
  {
    name: "Thinking in Bets",
    author: "Annie Duke",
    description: "Former professional poker player Annie Duke explains how to make better decisions by separating the quality of a decision from the outcome and learning to work with uncertainty.",
    price: 79.00,
    image: "https://covers.openlibrary.org/b/isbn/9780735216358-L.jpg",
    category: "Business",
    stock_quantity: 40
  },
  {
    name: "Start with Why",
    author: "Simon Sinek",
    description: "Discover how inspiring leaders and organizations communicate their purpose, build trust, and motivate people to take meaningful action.",
    price: 75.00,
    image: "https://covers.openlibrary.org/b/isbn/9781591846444-L.jpg",
    category: "Business",
    stock_quantity: 65
  },
  {
    name: "Never Split the Difference",
    author: "Chris Voss and Tahl Raz",
    description: "A former FBI hostage negotiator shares practical techniques for listening, asking better questions, building rapport, and negotiating effectively.",
    price: 82.00,
    image: "https://covers.openlibrary.org/b/isbn/9780062407801-L.jpg",
    category: "Business",
    stock_quantity: 55
  },
  {
    name: "Build",
    author: "Tony Fadell",
    description: "Drawing on decades of experience creating influential products, Tony Fadell shares lessons on careers, leadership, product development, and building successful teams.",
    price: 95.00,
    image: "https://covers.openlibrary.org/b/isbn/9780063046061-L.jpg",
    category: "Technology",
    stock_quantity: 30
  },
  {
    name: "You Don't Know JS Yet",
    author: "Kyle Simpson",
    description: "Explore the deeper mechanics of JavaScript through a practical series designed to strengthen your understanding of scope, closures, objects, and the language itself.",
    price: 105.00,
    image: "https://covers.openlibrary.org/b/isbn/9781091196515-L.jpg",
    category: "Technology",
    stock_quantity: 35
  },
  {
    name: "Refactoring UI",
    author: "Adam Wathan and Steve Schoger",
    description: "Learn practical visual design techniques for building more polished interfaces, including better spacing, typography, color choices, hierarchy, and component layouts.",
    price: 145.00,
    image: "https://refactoringui.com/book-cover.jpg",
    category: "Technology",
    stock_quantity: 20
  },
  {
    name: "The Staff Engineer's Path",
    author: "Tanya Reilly",
    description: "A guide for experienced software engineers who want to increase their technical influence, navigate complex systems, mentor others, and lead without becoming managers.",
    price: 120.00,
    image: "https://covers.openlibrary.org/b/isbn/9781098118730-L.jpg",
    category: "Technology",
    stock_quantity: 25
  },
  {
    name: "The Creative Act",
    author: "Rick Rubin",
    description: "Music producer Rick Rubin explores creativity as a way of engaging with the world, offering reflections on attention, inspiration, experimentation, and artistic growth.",
    price: 110.00,
    image: "https://covers.openlibrary.org/b/isbn/9780593652886-L.jpg",
    category: "Art",
    stock_quantity: 35
  },
  {
    name: "Steal Like an Artist",
    author: "Austin Kleon",
    description: "A short, illustrated guide to creativity that encourages readers to study their influences, experiment with ideas, and develop an authentic creative practice.",
    price: 55.00,
    image: "https://covers.openlibrary.org/b/isbn/9780761169253-L.jpg",
    category: "Art",
    stock_quantity: 70
  },
  {
    name: "The Wager",
    author: "David Grann",
    description: "A gripping historical account of a British naval shipwreck, the desperate struggle for survival, and the conflicting stories that emerge after the survivors return.",
    price: 88.00,
    image: "https://covers.openlibrary.org/b/isbn/9780385534260-L.jpg",
    category: "History",
    stock_quantity: 30
  },
  {
    name: "The Splendid and the Vile",
    author: "Erik Larson",
    description: "An immersive account of Winston Churchill and Britain's struggle during the Blitz, revealing the personal and political pressures of wartime leadership.",
    price: 92.00,
    image: "https://covers.openlibrary.org/b/isbn/9780385348713-L.jpg",
    category: "History",
    stock_quantity: 25
  },
  {
    name: "Crying in H Mart",
    author: "Michelle Zauner",
    description: "Musician Michelle Zauner reflects on grief, family, identity, and Korean food in a moving memoir about the complicated bond between a mother and daughter.",
    price: 70.00,
    image: "https://covers.openlibrary.org/b/isbn/9780525657743-L.jpg",
    category: "Biography",
    stock_quantity: 45
  },
  {
    name: "I'm Glad My Mom Died",
    author: "Jennette McCurdy",
    description: "The former child actor recounts her experiences growing up in the entertainment industry and confronting the difficult relationship that shaped much of her early life.",
    price: 72.00,
    image: "https://covers.openlibrary.org/b/isbn/9781982185824-L.jpg",
    category: "Biography",
    stock_quantity: 50
  },
  {
    name: "The Body",
    author: "Bill Bryson",
    description: "Bill Bryson takes readers on an accessible journey through the human body, exploring its remarkable systems, surprising quirks, and scientific mysteries.",
    price: 84.00,
    image: "https://covers.openlibrary.org/b/isbn/9780385539302-L.jpg",
    category: "Science",
    stock_quantity: 35
  },
  {
    name: "A Brief History of Everyone Who Ever Lived",
    author: "Adam Rutherford",
    description: "An engaging introduction to human genetics that examines ancestry, evolution, and what DNA can and cannot tell us about who we are.",
    price: 78.00,
    image: "https://covers.openlibrary.org/b/isbn/9781610395843-L.jpg",
    category: "Science",
    stock_quantity: 30
  },
  {
    name: "The Thursday Murder Club: The Man Who Died Twice",
    author: "Richard Osman",
    description: "The retirement-home sleuths reunite when an old friend arrives with a dangerous secret involving stolen diamonds, a mysterious visitor, and a ruthless enemy.",
    price: 76.00,
    image: "https://covers.openlibrary.org/b/isbn/9781984880987-L.jpg",
    category: "Mystery",
    stock_quantity: 40
  },
  {
    name: "The Ballad of Songbirds and Snakes",
    author: "Suzanne Collins",
    description: "Years before becoming Panem's tyrannical president, Coriolanus Snow mentors a tribute in the tenth Hunger Games, where ambition and survival collide.",
    price: 81.00,
    image: "https://covers.openlibrary.org/b/isbn/9781338635171-L.jpg",
    category: "Science Fiction",
    stock_quantity: 45
  },
  {
    name: "Sea of Tranquility",
    author: "Emily St. John Mandel",
    description: "Across centuries and distant worlds, seemingly disconnected lives become linked by a mysterious anomaly that challenges ideas about time and reality.",
    price: 73.00,
    image: "https://covers.openlibrary.org/b/isbn/9780593321447-L.jpg",
    category: "Science Fiction",
    stock_quantity: 35
  },
  {
    name: "The Very Secret Society of Irregular Witches",
    author: "Sangu Mandanna",
    description: "A solitary witch takes a position teaching three young witches and discovers that an unconventional household may be exactly where she belongs.",
    price: 74.00,
    image: "https://covers.openlibrary.org/b/isbn/9780593439352-L.jpg",
    category: "Fantasy",
    stock_quantity: 40
  },
  {
    name: "The Art of Thinking Clearly",
    author: "Rolf Dobelli",
    description: "A practical exploration of common thinking errors and cognitive biases that influence everyday decisions, relationships, and professional judgment.",
    price: 62.00,
    image: "https://covers.openlibrary.org/b/isbn/9780062219695-L.jpg",
    category: "Psychology",
    stock_quantity: 60
  },
  {
    name: "The Design of Everyday Things",
    author: "Don Norman",
    description: "A foundational design book explaining how thoughtful design, clear feedback, and intuitive controls make everyday products easier to understand and use.",
    price: 98.00,
    image: "https://covers.openlibrary.org/b/isbn/9780465050659-L.jpg",
    category: "Technology",
    stock_quantity: 30
  }
];

async function seedProductionProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting PRODUCTION database seeding...');
    console.log('📊 Database:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'unknown');
    console.log('🔗 Full connection:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    await client.query('BEGIN');

    // Check if products already exist
    const existingProducts = await client.query('SELECT COUNT(*) FROM products');
    const count = parseInt(existingProducts.rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Database already has ${count} products. Skipping seeding.`);
      console.log('💡 Run: npm run clear:prod first, then seed again');
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
      process.exit(0);
    }

    console.log('📝 Inserting products...');
    
    // Insert products within transaction
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      await client.query(
        'INSERT INTO products (name, price, category, image, stock_quantity, description) VALUES ($1, $2, $3, $4, $5, $6)',
        [product.name, product.price, product.category, product.image, product.stock_quantity, product.description]
      );
      
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ Inserted ${i + 1}/${products.length} products...`);
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log(`✅ Transaction committed!`);
    
    // Verify products were inserted
    const finalCount = await client.query('SELECT COUNT(*) FROM products');
    console.log(`✅ Verified: ${finalCount.rows[0].count} products in database`);
    
    console.log('📚 Production products are now available!');
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    try {
      await client.query('ROLLBACK');
      console.log('↩️  Transaction rolled back');
    } catch (rollbackError) {
      console.error('❌ Rollback error:', rollbackError);
    }
    client.release();
    await pool.end();
    process.exit(1);
  }
}

seedProductionProducts();
