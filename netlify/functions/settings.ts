import { Handler, HandlerEvent, HandlerContext } from '@types/aws-lambda';
import { connectToDatabase } from './utils/mongodb';
import { Collection } from 'mongodb';

// Duplicated types from src/types.ts for simplicity
export interface ContactInfo {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  workingHours: string;
}

export interface SiteSettings {
  contactInfo: ContactInfo;
  siteLogoUrl: string;
  heroSliderImages: string[];
}
// End of duplicated types

// Helper to map MongoDB _id to a consistent identifier if needed, though for settings it's often not exposed.
// We'll manage settings as a singleton document identified by 'configId'.
const SETTINGS_CONFIG_ID = "site_settings";

const getSettingsCollection = async (): Promise<Collection<SiteSettings>> => {
  const { db } = await connectToDatabase();
  return db.collection<SiteSettings>('settings');
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const settingsCollection = await getSettingsCollection();

    switch (event.httpMethod) {
      case 'GET':
        // Fetch the single settings document.
        // We don't map _id here as the client doesn't need to know about it.
        const settings = await settingsCollection.findOne({ configId: SETTINGS_CONFIG_ID });
        if (!settings) {
          // If no settings found, maybe return default settings or 404
          // For now, let's return 404, or the frontend's default can take over.
          // Or, more robustly, create initial default settings here if they don't exist.
          // For this example, we assume settings are seeded or created on first PUT.
          return { statusCode: 404, body: JSON.stringify({ message: 'Site settings not found.' }), headers: { 'Content-Type': 'application/json' } };
        }
        // Remove configId and _id before sending to client for cleaner data
        const {_id, configId, ...clientSettings} = settings as any;
        return { statusCode: 200, body: JSON.stringify(clientSettings), headers: { 'Content-Type': 'application/json' } };

      case 'PUT':
        if (!event.body) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Missing request body' }) };
        }
        const newSettings = JSON.parse(event.body) as Partial<SiteSettings>;

        // Ensure required fields are present if it's a full update, or handle partial updates carefully.
        // For example, if contactInfo is partial, it needs to be merged with existing contactInfo.
        // The $set operator with dot notation can update nested fields.
        // If newSettings is Partial<SiteSettings>, direct $set might overwrite entire sub-objects.
        // For simplicity, this example assumes the client sends the full structure or backend handles merging if necessary.
        // A more robust solution would involve a deep merge or specific update logic for nested objects.

        const updateResult = await settingsCollection.findOneAndUpdate(
          { configId: SETTINGS_CONFIG_ID },
          { $set: { ...newSettings, configId: SETTINGS_CONFIG_ID } }, // Ensure configId is set
          { upsert: true, returnDocument: 'after' }
        );

        if (!updateResult) {
             // This should ideally not happen with upsert:true unless there's a db error
            return { statusCode: 500, body: JSON.stringify({ message: 'Failed to update settings' }) };
        }

        const {_id: updated_Id, configId: updatedConfigId, ...updatedClientSettings} = updateResult as any;
        return { statusCode: 200, body: JSON.stringify(updatedClientSettings), headers: { 'Content-Type': 'application/json' } };

      default:
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }
  } catch (error) {
    console.error('Error processing request for settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error', error: errorMessage }) };
  }
};
