// Public, non-secret site configuration. Never put keys or tokens here.
export const CONFIG = Object.freeze({
  brand: 'Wink Furniture',
  currency: 'INR',
  locale: 'en-IN',
  // Wink's WhatsApp Business number (digits only, with country code). Public on purpose: customers message it.
  whatsappNumber: '919471860287',
  whatsappIsSample: false,
  channelUrl: 'https://whatsapp.com/channel/0029VbB1mZa6buMJvRdu7426',
  address: 'Wink Furniture Factory, Near Patna Convent School, Main Road, Bhupatipur West, Ramkrishna Nagar, Patna 800020',
  // Customers can visit the factory: they call first.
  phone: '917667657717',
  deliveryNote: 'Delivery is available in Patna and nearby areas of Bihar. We confirm your area and the charge on WhatsApp.',
  maxQtyPerItem: 10,
  maxCartLines: 20,
  catalogueIsSample: true,
  sampleLabel: 'The photo is Wink\'s own work. Price and size shown here are placeholders: Wink confirms the final size, price and delivery on WhatsApp.',
});
