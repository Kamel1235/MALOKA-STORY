import { Handler, HandlerEvent, HandlerContext } from '@types/aws-lambda';
import { connectToDatabase } from './utils/mongodb';
import { Collection, ObjectId } from 'mongodb';

// Duplicated types from src/types.ts for simplicity in this Netlify function environment.
// Ideally, these would be shared from a common types package or via relative paths if project setup allows.
export enum ProductCategory {
  Earrings = "حلق",
  Rings = "خاتم",
  Necklaces = "قلادة",
}

export interface Product {
  id: string; // Comes from MongoDB's _id
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
}
// End of duplicated types

// Helper to map MongoDB _id to id and vice-versa if needed for the response
const mapMongoIdToApplicationId = (doc: any): Product => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id.toHexString(), ...rest } as Product;
};

const getProductsCollection = async (): Promise<Collection<Omit<Product, 'id'>>> => {
  const { db } = await connectToDatabase();
  return db.collection<Omit<Product, 'id'>>('products');
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const pathParts = event.path.split('/').filter(Boolean);
  const resource = pathParts[pathParts.length - (pathParts.includes('products') ? 2 : 1)]; // products or products/:id
  const idParam = pathParts[pathParts.length -1]; // Potential ID

  try {
    const productsCollection = await getProductsCollection();

    switch (event.httpMethod) {
      case 'GET':
        if (resource === 'products' && idParam && idParam !== 'products') { // GET /products/:id
          if (!ObjectId.isValid(idParam)) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid product ID format' }) };
          }
          const product = await productsCollection.findOne({ _id: new ObjectId(idParam) });
          if (!product) {
            return { statusCode: 404, body: JSON.stringify({ message: 'Product not found' }) };
          }
          return { statusCode: 200, body: JSON.stringify(mapMongoIdToApplicationId(product)), headers: { 'Content-Type': 'application/json' } };
        } else { // GET /products
          const products = await productsCollection.find({}).toArray();
          return { statusCode: 200, body: JSON.stringify(products.map(mapMongoIdToApplicationId)), headers: { 'Content-Type': 'application/json' } };
        }

      case 'POST': // POST /products
        if (!event.body) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Missing request body' }) };
        }
        const { name, description, price, images, category } = JSON.parse(event.body) as Omit<Product, 'id'>;
        if (!name || !description || price === undefined || !images || !category) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Missing required product fields' }) };
        }
        const newProductData = { name, description, price, images, category };
        const result = await productsCollection.insertOne(newProductData);
        // Construct the product object to return, including the generated ID
        const createdProduct = {
            _id: result.insertedId, // This is an ObjectId
            ...newProductData
        };
        return { statusCode: 201, body: JSON.stringify(mapMongoIdToApplicationId(createdProduct)), headers: { 'Content-Type': 'application/json' } };

      case 'PUT': // PUT /products/:id
        if (!idParam || !ObjectId.isValid(idParam)) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Invalid or missing product ID' }) };
        }
        if (!event.body) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Missing request body' }) };
        }
        const updates = JSON.parse(event.body) as Partial<Omit<Product, 'id'>>;
        // Ensure no one tries to update the ID via the body
        delete (updates as any).id;
        delete (updates as any)._id;

        const updateResult = await productsCollection.findOneAndUpdate(
          { _id: new ObjectId(idParam) },
          { $set: updates },
          { returnDocument: 'after' }
        );
        if (!updateResult) { // Changed from !updateResult.value to !updateResult for mongodb v4+
          return { statusCode: 404, body: JSON.stringify({ message: 'Product not found or no update made' }) };
        }
        return { statusCode: 200, body: JSON.stringify(mapMongoIdToApplicationId(updateResult)), headers: { 'Content-Type': 'application/json' } };

      case 'DELETE': // DELETE /products/:id
        if (!idParam || !ObjectId.isValid(idParam)) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Invalid or missing product ID' }) };
        }
        const deleteResult = await productsCollection.deleteOne({ _id: new ObjectId(idParam) });
        if (deleteResult.deletedCount === 0) {
          return { statusCode: 404, body: JSON.stringify({ message: 'Product not found' }) };
        }
        return { statusCode: 204, body: '' }; // No content

      default:
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }
  } catch (error) {
    console.error('Error processing request for products:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error', error: errorMessage }) };
  }
};
