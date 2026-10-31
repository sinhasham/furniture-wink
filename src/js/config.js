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
  // Shown under the logo and in the footer.
  legalLine: 'A unit of Wink Furniture Pvt Ltd',
  // GST number: leave empty until Wink sends it. The footer shows it only when filled.
  gstNumber: '',
  instagramUrl: 'https://www.instagram.com/winkfurniturepatna/',
  // Diwali sale pop-up. Change the text here. Set enabled to false to switch it off.
  sale: Object.freeze({
    enabled: true,
    badge: 'Festive offer',
    title: 'Diwali Sale',
    text: 'Beautiful teak beds, sofas, dining sets and doors, made to order for your home this Diwali.',
    detail: 'Message us on WhatsApp to get the festive price for your design.',
    cta: 'Get Diwali price on WhatsApp',
    ctaMessage: 'Hello Wink Furniture, I saw the Diwali Sale on your website. Please share the festive price.',
    close: 'Maybe later',
    delayMs: 1200,
  }),
  // Every product shows this delivery estimate.
  deliveryDays: 15,
  maxQtyPerItem: 10,
  maxCartLines: 20,
  catalogueIsSample: true,
  sampleLabel: 'The photo is Wink\'s own work. Prices include GST. Wink confirms the final size, price and delivery on WhatsApp.',
});
