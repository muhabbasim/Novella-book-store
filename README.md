# Novelle - Online Bookstore

A sophisticated, modern online bookstore built with React, featuring a curated collection of 32 books across multiple genres. This project showcases a premium reading destination with elegant design, intuitive discovery, and seamless shopping experience.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Book Catalog](#book-catalog)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Customization](#customization)
- [Deployment](#deployment)

---

## 🎯 Overview

Novelle Books is a production-ready e-commerce bookstore featuring:

- **32 carefully curated books** spanning Fiction, Nonfiction, Technology, Science, and more
- **14 distinct categories** including Mystery, Fantasy, Business, Psychology, and History
- **Premium minimalist design** with green brand identity and warm ivory backgrounds
- **Advanced search and filtering** by title, author, and category
- **Responsive layouts** optimized for mobile, tablet, and desktop
- **Shopping cart functionality** with persistent state and quantity management
- **Real book metadata** including authors, formats, page counts, and accurate descriptions

### Design Philosophy

- **Premium & Editorial**: Inspired by independent bookstores and literary magazines
- **Green Color Palette**: Forest green primary with sage and lime accents
- **Warm Backgrounds**: Ivory and off-white tones create a welcoming atmosphere
- **Elegant Typography**: Inter font with careful tracking and spacing
- **Book-First Design**: Portrait aspect ratios (2:3) and cover-focused layouts
- **Refined Interactions**: Subtle animations, gentle shadows, and thoughtful hover states

---

## ✨ Features

### Book Discovery
- 🔍 **Advanced Search**: Search by title, author, or topic with live suggestions
- 🏷️ **Category Filtering**: Browse 14 literary genres (Fiction, Mystery, Science Fiction, Fantasy, Business, Technology, Psychology, History, etc.)
- 📊 **Smart Sorting**: View all books or filter by specific categories
- 🎯 **Search Suggestions**: Dropdown with book cover thumbnails, titles, authors, and prices

### Book Presentation
- 📚 **Portrait Book Covers**: Authentic covers in 2:3 aspect ratio
- ✍️ **Author Attribution**: Author names displayed prominently on every card
- 🏆 **Badges**: Bestseller (lime), New Arrival (sage), and Sale (primary green) indicators
- 📖 **Detailed Pages**: Format, page count, and comprehensive book descriptions
- 💰 **Pricing**: Clear price display with sale indicators and savings percentage

### Shopping Experience
- 🛒 **Shopping Cart**: Full cart management with add, update, remove operations
- 💾 **Persistent Cart**: Automatic localStorage synchronization across sessions
- 🎚️ **Quantity Control**: Custom stepper component with increment/decrement
- 📢 **Toast Notifications**: User feedback for all cart operations
- 📱 **Responsive Design**: Mobile-first approach optimized for all devices

### User Interface
- 🎨 **Literary Hero Section**: Editorial-style hero with "Find Your Next Favorite Book"
- 🎭 **Loading States**: Smooth UX with async operation handling
- 🚫 **404 Handling**: Custom Not Found page with navigation
- ♿ **Accessibility**: Semantic HTML and ARIA labels throughout
- 🌓 **Hover Effects**: Subtle scale and shadow transitions

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library with hooks and concurrent features |
| **Vite** | 5.4.10 | Lightning-fast build tool and dev server |
| **Tailwind CSS** | 4.3.3 | Utility-first CSS framework |
| **React Router** | 6.27.0 | Declarative client-side routing |
| **Context API** | - | State management for shopping cart |

**Why These Technologies?**
- **Vite**: 10-20x faster than traditional bundlers with instant HMR
- **Tailwind 4**: Rapid UI development with consistent design system
- **React 18**: Concurrent rendering and automatic batching
- **Context API + Custom Hooks**: Professional state management pattern

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm 7+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:5173` (or next available port).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run unit and component tests |
| `npm run test:ui` | Interactive test UI |

### Testing

This project includes a comprehensive testing suite covering critical customer scenarios:

- **Unit Tests**: Cart logic, calculations, and utilities
- **Component Tests**: Authentication, checkout, product browsing

For detailed testing documentation:
- **[TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md)** - Quick reference
- **[TEST_GUIDE.md](./TEST_GUIDE.md)** - Complete testing guide
- **[TEST_RESULTS.md](./TEST_RESULTS.md)** - Test coverage report

```bash
# Run all tests
npm test

# Watch mode during development
npm test -- --watch
```   

---

## 📚 Book Catalog

### Fiction (15 books)
**Contemporary Fiction**
- *The Midnight Library* by Matt Haig
- *Normal People* by Sally Rooney
- *Tomorrow, and Tomorrow, and Tomorrow* by Gabrielle Zevin

**Mystery & Thriller**
- *The Silent Patient* by Alex Michaelides
- *Gone Girl* by Gillian Flynn

**Science Fiction**
- *Dune* by Frank Herbert
- *Project Hail Mary* by Andy Weir

**Fantasy**
- *The Name of the Wind* by Patrick Rothfuss
- *The Way of Kings* by Brandon Sanderson
- *The Hobbit* by J.R.R. Tolkien

**Historical Fiction**
- *All the Light We Cannot See* by Anthony Doerr
- *The Seven Husbands of Evelyn Hugo* by Taylor Jenkins Reid

**Classics**
- *1984* by George Orwell
- *The Great Gatsby* by F. Scott Fitzgerald
- *The Alchemist* by Paulo Coelho

### Nonfiction (17 books)
**Business & Productivity**
- *Atomic Habits* by James Clear
- *Deep Work* by Cal Newport
- *The Psychology of Money* by Morgan Housel
- *The Lean Startup* by Eric Ries

**Technology & Programming**
- *Clean Code* by Robert C. Martin
- *The Pragmatic Programmer* by David Thomas & Andrew Hunt
- *Designing Data-Intensive Applications* by Martin Kleppmann

**Science & History**
- *Sapiens* by Yuval Noah Harari
- *The Gene* by Siddhartha Mukherjee
- *Cosmos* by Carl Sagan

**Psychology & Philosophy**
- *Thinking, Fast and Slow* by Daniel Kahneman
- *Man's Search for Meaning* by Viktor E. Frankl
- *Meditations* by Marcus Aurelius

**Biography & Self-Help**
- *Educated* by Tara Westover
- *When Breath Becomes Air* by Paul Kalanithi
- *Range* by David Epstein

---

## 🎨 Design System

### Color Palette
```css
Primary Green:  #183D32  /* Forest green for headers and CTAs */
Sage Green:     #A8B5A0  /* Muted accents for secondary elements */
Lime Green:     #C5E86C  /* Vibrant accent for badges */
Warm Ivory:     #F8F8F3  /* Main background */
Warm Ivory Alt: #EFEFE6  /* Secondary background */

Text Primary:   #20231F  /* Main text */
Text Secondary: #5A5D58  /* Supporting text */
Text Tertiary:  #898C87  /* Labels and hints */
```

### Typography
- **Font Family**: Inter with careful letter-spacing
- **Headings**: Semibold weight (600) with tight tracking (-0.01em)
- **Body Text**: Regular to medium weights with relaxed line-height
- **Labels**: Uppercase with wide letter-spacing (0.15-0.2em) for editorial feel

### Responsive Grid
- **Mobile** (<640px): 2 columns
- **Tablet** (640-1024px): 3 columns
- **Desktop** (>1024px): 4 columns
- **Large Desktop**: 4-5 columns with generous whitespace

---

## 📁 Project Structure

```
assignment/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Navigation with Novelle branding
│   │   ├── Footer.jsx              # Site footer
│   │   ├── SearchBar.jsx           # Book search with author matching
│   │   ├── Slider.jsx              # Hero section with featured book
│   │   ├── QuantityStepper.jsx     # Quantity selector
│   │   ├── Toast.jsx               # Notification system
│   │   └── product_card/
│   │       └── ProductCard.jsx     # Book card with portrait cover
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Homepage with catalog and filters
│   │   ├── Product.jsx             # Book detail page
│   │   ├── CartPage.jsx            # Shopping cart
│   │   ├── Login.jsx               # Login form
│   │   ├── Register.jsx            # Registration form
│   │   └── Notfound.jsx            # 404 page
│   │
│   ├── context/
│   │   └── CartContext.jsx         # Shopping cart state provider
│   │
│   ├── hooks/
│   │   └── useCart.js              # Cart operations logic
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx          # Main layout with routing
│   │
│   ├── data/
│   │   └── products.js             # 32 books catalog
│   │
│   ├── App.jsx                     # Root component with providers
│   ├── main.jsx                    # React DOM entry point
│   └── index.css                   # Theme colors and global styles
│
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🏗️ Architecture

### State Management Pattern

```
App
└── BrowserRouter
    └── CartProvider (Context + Custom Hook)
        └── MainLayout
            ├── Header (Cart Badge)
            ├── Routes
            │   ├── Home (Book Grid + Filters)
            │   ├── Product (Detail Page)
            │   ├── CartPage (Checkout)
            │   └── ... other routes
            └── Footer
```

### Key Components

**useCart Hook** (`src/hooks/useCart.js`)
- Manages cart state with lazy initialization
- Handles localStorage synchronization
- Provides CRUD operations: add, update, remove, checkout
- Calculates total price and item count

**CartContext** (`src/context/CartContext.jsx`)
- Wraps app with cart state
- Eliminates props drilling
- Exports `useCartContext` hook for components

**Book Data Structure** (`src/data/products.js`)
```javascript
{
  id: Number,              // Unique identifier
  title: String,           // Book title
  author: String,          // Author name
  description: String,     // Book description
  price: Number,           // Price in SAR
  salePrice: Number,       // Original price if on sale
  image: String,           // Book cover URL
  category: String,        // Genre/category
  format: String,          // Paperback, Hardcover, etc.
  pageCount: Number,       // Number of pages
  bestseller: Boolean,     // Bestseller flag
  newArrival: Boolean,     // New arrival flag
  featured: Boolean        // Featured book flag
}
```

---

## 🎨 Customization

### Adding New Books

Edit `src/data/products.js`:

```javascript
{
  id: 33,
  title: "Your Book Title",
  author: "Author Name",
  description: "Compelling book description...",
  price: 75.00,
  image: "https://book-cover-url.jpg",
  category: "Fiction",
  format: "Paperback",
  pageCount: 320,
  bestseller: false,
  newArrival: true,
}
```

### Adding New Categories

Update the `categories` array in `src/data/products.js`:

```javascript
export const categories = [
  "All",
  "Fiction",
  "Your New Category",
  // ...
];
```

### Updating Brand Colors

Modify theme variables in `src/index.css`:

```css
@theme {
  --color-primary: #183D32;      /* Main green */
  --color-sage: #A8B5A0;         /* Sage accent */
  --color-lime: #C5E86C;         /* Lime highlight */
  --color-warm: #F8F8F3;         /* Background */
}
```

### Changing Store Name

Update `src/components/Header.jsx`:

```jsx
<span className="text-base font-semibold">
  Your Store Name
</span>
<span className="text-xs text-text-tertiary">
  Your Tagline
</span>
```

---

## 🚢 Deployment

The project is deployment-ready for:

**Vercel** (Recommended)
```bash
npm install -g vercel
vercel
```

**Netlify**
- Build command: `npm run build`
- Publish directory: `dist`

**Other Static Hosts**
```bash
npm run build
# Upload contents of dist/ folder
```

The build creates an optimized production bundle in the `dist/` folder.

---

## 📊 Performance

- **Fast Initial Load**: Vite's optimized bundling
- **Lazy Loading**: Images load on demand
- **Code Splitting**: Route-based splitting via React Router
- **Optimized Assets**: CDN-hosted book covers
- **Smooth Animations**: GPU-accelerated transforms
- **Persistent Cart**: localStorage with efficient state management

---

## 🎯 Key Features Summary

| Feature | Description |
|---------|-------------|
| **Catalog** | 32 authentic books across 14 categories |
| **Search** | Title, author, and topic search with live suggestions |
| **Filtering** | 14 literary genre categories |
| **Book Cards** | Portrait covers (2:3), author names, badges |
| **Detail Pages** | Format, page count, full descriptions |
| **Shopping Cart** | Persistent state, quantity management |
| **Notifications** | Toast messages for cart actions |
| **Responsive** | Mobile (2 col), tablet (3 col), desktop (4-5 col) |
| **Design** | Premium minimalist with green brand identity |

---

## 🙏 Acknowledgments

- Book cover images sourced from Goodreads
- Hero images from Unsplash
- Book metadata represents real published works
- Design inspired by independent bookstores and literary culture
- Built with React, Vite, and Tailwind CSS

---

## 📄 License

This project is part of an assignment showcasing modern e-commerce development with React.

---

**Novelle** - Where every page is a new adventure 📚

For detailed technical architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)