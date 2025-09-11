import React from 'react';
import { useState } from 'react';
import { Search, Upload, X, Image as ImageIcon, ShoppingBag } from 'lucide-react';

// --- Helper Component: Header ---
const Header = () => (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Visual Product Matcher</h1>
                </div>
            </div>
        </div>
    </header>
);

// --- Helper Component: ImageUploader ---
const ImageUploader = ({ onImageReady, setIsLoading, setError }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError("File is too large. Please upload an image under 4MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadstart = () => setIsLoading(true);
            reader.onloadend = () => {
                onImageReady(reader.result);
                // setIsLoading(false) is called in the main component after API call
            };
            reader.onerror = () => {
                setError("Failed to read the file. Please try again.");
                setIsLoading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 4MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
        </div>
    );
};

// --- Helper Component: Loader ---
const Loader = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-lg h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
    </div>
);

// --- Helper Component: ErrorMessage ---
const ErrorMessage = ({ message, onClear }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex justify-between items-center" role="alert">
        <div><strong className="font-bold">Oops! </strong><span className="block sm:inline">{message}</span></div>
        <button onClick={onClear} className="p-1 rounded-full hover:bg-red-200 transition-colors"><X className="h-5 w-5"/></button>
    </div>
);

// --- Helper Component: ProductCard ---
const ProductCard = ({ product }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 group">
        <div className="relative h-48 flex justify-center items-center p-4 bg-white">
            <img className="max-h-full max-w-full object-contain" src={product.imageUrl} alt={product.name} onError={(e) => e.target.src = 'https://placehold.co/300x300/EEE/31343C?text=Image+Not+Found'} />
        </div>
        <div className="p-4">
            <p className="text-sm text-gray-500">{product.brand}</p>
            <h3 className="text-md font-semibold text-gray-800 truncate h-6" title={product.name}>{product.name}</h3>
            <div className="mt-3 flex justify-between items-center">
                <p className="text-lg font-bold text-indigo-600">{product.price}</p>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View</a>
            </div>
        </div>
    </div>
);

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [uploadedImage, setUploadedImage] = useState(null);
    const [foundProducts, setFoundProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(null);

    /**
     * Main function to identify product category from an image using Gemini
     * and then fetch similar products from the dummyjson API.
     * @param {string} base64Image - The base64 encoded image string.
     */
    const identifyAndFetchProducts = async (base64Image) => {
        setIsLoading(true);
        setError(null);
        setFoundProducts([]);
        
        // The API key will be automatically provided by the environment.
        const apiKey = "AIzaSyCtyftlYJgFzUVwpi_8zw4yG4OB3GqIB9E"; 
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            // --- STEP 1: IDENTIFY THE PRODUCT CATEGORY FROM THE IMAGE ---
            setLoadingMessage('Step 1: Analyzing your image...');
            
            const identifySystemPrompt = `Analyze the product in the image. Respond with ONLY ONE of the following valid categories from dummyjson.com in a JSON format: "smartphones", "laptops", "fragrances", "skincare", "groceries", "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes", "mens-shirts", "mens-shoes", "mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses", "automotive", "motorcycle", "lighting". Example response: { "category": "smartphones" }`;
            
            const identifyPayload = {
                systemInstruction: { parts: [{ text: identifySystemPrompt }] },
                contents: [{ role: "user", parts: [{ inlineData: { mimeType: base64Image.split(';')[0].split(':')[1], data: base64Image.split(',')[1] } }] }],
                generationConfig: { responseMimeType: "application/json" }
            };

            const identifyResponse = await fetch(geminiApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(identifyPayload) });
            if (!identifyResponse.ok) throw new Error(`Gemini API error: ${identifyResponse.status} ${identifyResponse.statusText}`);
            
            const identifyResult = await identifyResponse.json();
            
            if (!identifyResult.candidates || !identifyResult.candidates[0].content.parts[0].text) {
                throw new Error("Invalid response structure from Gemini API.");
            }
            
            const identifiedData = JSON.parse(identifyResult.candidates[0].content.parts[0].text);
            const identifiedCategory = identifiedData.category;

            if (!identifiedCategory) {
                throw new Error("Could not determine a product category from the image.");
            }

            // --- STEP 2: FETCH PRODUCTS FROM THE IDENTIFIED CATEGORY ---
            setLoadingMessage(`Step 2: Searching for '${identifiedCategory}'...`);
            
            const productsApiUrl = `https://dummyjson.com/products/category/${identifiedCategory}`;
            const productsResponse = await fetch(productsApiUrl);
            if (!productsResponse.ok) throw new Error(`Failed to fetch from DummyJSON API: ${productsResponse.status}`);
            
            const productsData = await productsResponse.json();
            const categoryProducts = productsData.products || [];

            if (categoryProducts.length === 0) {
                setError(`No products found in the '${identifiedCategory}' category. Try a different image.`);
            }

            // Map the API data to the format our ProductCard component expects
            const mappedProducts = categoryProducts.map(p => ({
                id: p.id,
                name: p.title,
                brand: p.brand || p.category,
                price: `$${p.price.toFixed(2)}`,
                imageUrl: p.thumbnail
            }));

            setFoundProducts(mappedProducts);

        } catch (err) {
            console.error("Processing Error:", err);
            setError(`An error occurred: ${err.message}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleImageReady = (base64Image) => {
        setUploadedImage(base64Image);
        identifyAndFetchProducts(base64Image);
    };
    
    const resetSearch = () => {
        setUploadedImage(null);
        setFoundProducts([]);
        setError(null);
        setIsLoading(false);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Uploader */}
                    <aside className="lg:col-span-4 xl:col-span-3">
                         <div className="space-y-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-700">Upload an Image</h2>
                            <ImageUploader onImageReady={handleImageReady} setIsLoading={setIsLoading} setError={setError} />
                            {error && !isLoading && <ErrorMessage message={error} onClear={() => setError(null)} />}
                         </div>
                    </aside>

                    {/* Right Column: Content Area */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        {/* Initial State */}
                        {!uploadedImage && !isLoading && (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl shadow-md border-gray-200 h-full">
                                <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700">Find Your Match</h3>
                                <p className="mt-2 text-gray-500 max-w-md">Upload a product image to find similar items from our catalog.</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && <Loader message={loadingMessage} />}
                        
                        {/* Results State */}
                        {uploadedImage && !isLoading && (
                             <div className="space-y-8">
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Results</h2>
                                    <button onClick={resetSearch} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                        <X className="h-4 w-4 mr-1"/> Start Over
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    {/* Uploaded Image Display */}
                                    <div className="md:col-span-4">
                                        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 sticky top-24">
                                             <img src={uploadedImage} alt="Uploaded product" className="rounded-lg w-full object-contain" />
                                             <p className="text-center text-sm text-gray-600 mt-3 font-semibold">Your Uploaded Image</p>
                                        </div>
                                    </div>

                                    {/* Products Grid */}
                                    <div className="md:col-span-8">
                                        {foundProducts.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {foundProducts.map(product => (
                                                    <ProductCard key={product.id} product={product} />
                                                ))}
                                            </div>
                                        ) : (
                                            error && (
                                              <div className="text-center p-12 bg-white rounded-xl shadow-md border border-gray-200 h-full flex flex-col justify-center items-center">
                                                <h3 className="text-xl font-semibold text-gray-700">No Matches Found</h3>
                                                <p className="mt-2 text-gray-500 max-w-sm">{error}</p>
                                              </div>
                                            )
                                        )}
                                    </div>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
