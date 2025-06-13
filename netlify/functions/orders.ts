import { Handler, HandlerEvent, HandlerContext } from '@types/aws-lambda';
import { connectToDatabase } from './utils/mongodb';
import { Collection, ObjectId } from 'mongodb';

// Duplicated types from src/types.ts for simplicity
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  productImage: string;
}

export interface Order {
  id: string; // Comes from MongoDB's _id
  customerName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string; // ISO string
  status: 'Pending' | 'Processed' | 'Shipped' | 'Delivered';
}
// End of duplicated types

const mapMongoIdToApplicationId = (doc: any): Order => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id.toHexString(), ...rest } as Order;
};

const getOrdersCollection = async (): Promise<Collection<Omit<Order, 'id'>>> => {
  const { db } = await connectToDatabase();
  return db.collection<Omit<Order, 'id'>>('orders');
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Basic path parsing, similar to products.ts
  const pathParts = event.path.split('/').filter(Boolean);
  // Expected paths: /.netlify/functions/orders or /.netlify/functions/orders/:id
  // The last part is the function name 'orders' or an ID.
  const idParam = pathParts.length > 0 && pathParts[pathParts.length -1] !== 'orders' ? pathParts[pathParts.length -1] : null;

  try {
    const ordersCollection = await getOrdersCollection();

    // IMPORTANT: GET /orders and PUT /orders/:id should be admin-protected.
    // This requires an authentication mechanism (e.g., Netlify Identity + JWT)
    // which is outside the scope of this initial MongoDB integration.
    // For now, these operations are open but would need securing in a real application.

    switch (event.httpMethod) {
      case 'GET':
        // For simplicity, GET /orders/:id is not implemented as per DataContext.tsx, but could be added.
        // DataContext.tsx only calls GET /orders (for all orders, admin)
        if (idParam) {
             return { statusCode: 404, body: JSON.stringify({ message: 'Fetching individual order not implemented, fetch all orders.' }) };
        }
        // This should be admin protected
        const orders = await ordersCollection.find({}).sort({ orderDate: -1 }).toArray(); // Sort by newest first
        return { statusCode: 200, body: JSON.stringify(orders.map(mapMongoIdToApplicationId)), headers: { 'Content-Type': 'application/json' } };

      case 'POST': // POST /orders - public access to create an order
        if (!event.body) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Missing request body' }) };
        }
        const { customerName, phoneNumber, address, items, totalAmount } = JSON.parse(event.body) as Omit<Order, 'id' | 'orderDate' | 'status'>;

        if (!customerName || !phoneNumber || !address || !items || items.length === 0 || totalAmount === undefined) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Missing required order fields' }) };
        }

        const newOrderData: Omit<Order, 'id'> = {
          customerName,
          phoneNumber,
          address,
          items,
          totalAmount,
          orderDate: new Date().toISOString(),
          status: 'Pending',
        };
        const result = await ordersCollection.insertOne(newOrderData);
        const createdOrder = {
            _id: result.insertedId,
            ...newOrderData
        };
        return { statusCode: 201, body: JSON.stringify(mapMongoIdToApplicationId(createdOrder)), headers: { 'Content-Type': 'application/json' } };

      case 'PUT': // PUT /orders/:id - admin protected to update status
        if (!idParam || !ObjectId.isValid(idParam)) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Invalid or missing order ID' }) };
        }
        if (!event.body) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Missing request body' }) };
        }
        const { status } = JSON.parse(event.body) as { status: Order['status'] };
        if (!status || !['Pending', 'Processed', 'Shipped', 'Delivered'].includes(status)) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Invalid status value' }) };
        }

        const updateResult = await ordersCollection.findOneAndUpdate(
          { _id: new ObjectId(idParam) },
          { $set: { status: status } },
          { returnDocument: 'after' }
        );

        if (!updateResult) {
          return { statusCode: 404, body: JSON.stringify({ message: 'Order not found or no update made' }) };
        }
        return { statusCode: 200, body: JSON.stringify(mapMongoIdToApplicationId(updateResult)), headers: { 'Content-Type': 'application/json' } };

      default:
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }
  } catch (error) {
    console.error('Error processing request for orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error', error: errorMessage }) };
  }
};
