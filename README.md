# Visual Product Matcher

Visual Product Matcher is a React-based web application that allows users to upload a product image and find similar items from a catalog. It uses Google's Gemini API to analyze the uploaded image and identify its product category, then fetches matching products from the [DummyJSON](https://dummyjson.com/) API.

## Features

- **Image Upload:** Upload PNG, JPG, or WEBP images (max 4MB).
- **AI-Powered Category Detection:** Uses Gemini API to analyze the image and determine the product category.
- **Product Search:** Fetches and displays similar products from DummyJSON based on the identified category.
- **Responsive UI:** Modern, clean interface with loading and error states.

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/visual-product-matcher.git
   cd visual-product-matcher
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the App

```bash
npm start
# or
yarn start
```

The app will run locally at `http://localhost:3000`.

## Usage

1. Upload a product image using the uploader on the left.
2. The app will analyze the image and display similar products from the catalog.
3. View product details or start over to upload a new image.

## Technologies Used

- React
- Tailwind CSS
- [lucide-react](https://lucide.dev/) icons
- Google Gemini API
- DummyJSON API

## Notes

- The Gemini API key is hardcoded for demonstration purposes. For production, use environment variables and secure storage.
- Only supported image formats (PNG, JPG, WEBP) under 4MB are accepted.


