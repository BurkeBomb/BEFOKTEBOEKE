// Simple price scraper service for South African bookstores
// In production, this would use proper web scraping or store APIs

interface BookSearchResult {
  title: string;
  author: string;
  price: number; // in cents
  availability: 'in_stock' | 'limited' | 'out_of_stock' | 'pre_order';
  url: string;
  store: string;
  storeLogo: string;
  shipping: number; // in cents
  estimatedDelivery: string;
  rating: number;
  reviewCount: number;
}

const SOUTH_AFRICAN_STORES = [
  {
    name: "Takealot",
    logo: "https://cdn.worldvectorlogo.com/logos/takealot.svg",
    baseUrl: "https://www.takealot.com",
    freeShippingThreshold: 45000, // R450
  },
  {
    name: "Exclusive Books",
    logo: "https://www.exclusivebooks.co.za/favicon.ico",
    baseUrl: "https://www.exclusivebooks.co.za",
    freeShippingThreshold: 35000, // R350
  },
  {
    name: "Van Schaik",
    logo: "https://www.vanschaik.com/favicon.ico",
    baseUrl: "https://www.vanschaik.com",
    freeShippingThreshold: 30000, // R300
  },
  {
    name: "Kalahari.com",
    logo: "https://kalahari.com/favicon.ico",
    baseUrl: "https://www.kalahari.com",
    freeShippingThreshold: 20000, // R200
  },
  {
    name: "Loot.co.za",
    logo: "https://www.loot.co.za/favicon.ico",
    baseUrl: "https://www.loot.co.za",
    freeShippingThreshold: 25000, // R250
  }
];

export class PriceScraper {
  async searchBook(title: string, author: string): Promise<BookSearchResult[]> {
    // In a real implementation, this would scrape actual store websites
    // For now, we'll simulate realistic pricing for South African stores
    
    const results: BookSearchResult[] = [];
    const basePrice = this.generateRealisticPrice(title, author);
    
    for (let i = 0; i < SOUTH_AFRICAN_STORES.length; i++) {
      const store = SOUTH_AFRICAN_STORES[i];
      const priceVariation = (Math.random() - 0.5) * 0.3; // ±15% price variation
      const price = Math.floor(basePrice * (1 + priceVariation));
      const shipping = price >= store.freeShippingThreshold ? 0 : Math.floor(Math.random() * 5000) + 2000; // R20-R70 shipping
      
      // Simulate some stores not having the book
      if (Math.random() > 0.8) continue;
      
      results.push({
        title,
        author,
        price,
        availability: this.getRandomAvailability(),
        url: `${store.baseUrl}/search?q=${encodeURIComponent(`${title} ${author}`)}`,
        store: store.name,
        storeLogo: store.logo,
        shipping,
        estimatedDelivery: this.getEstimatedDelivery(store.name),
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        reviewCount: Math.floor(Math.random() * 500) + 10,
      });
    }
    
    // Sort by total price (including shipping)
    return results.sort((a, b) => (a.price + a.shipping) - (b.price + b.shipping));
  }
  
  private generateRealisticPrice(title: string, author: string): number {
    // Generate realistic South African book prices based on factors
    let basePrice = 25000; // R250 base price
    
    // Adjust for likely book categories
    const titleLower = title.toLowerCase();
    if (titleLower.includes('textbook') || titleLower.includes('academic')) {
      basePrice = 80000; // R800 for textbooks
    } else if (titleLower.includes('children') || titleLower.includes('kinder')) {
      basePrice = 15000; // R150 for children's books
    } else if (titleLower.includes('novel') || titleLower.includes('roman')) {
      basePrice = 30000; // R300 for novels
    }
    
    // Add some randomness
    const variation = (Math.random() - 0.5) * 0.4; // ±20%
    return Math.floor(basePrice * (1 + variation));
  }
  
  private getRandomAvailability(): 'in_stock' | 'limited' | 'out_of_stock' | 'pre_order' {
    const rand = Math.random();
    if (rand < 0.7) return 'in_stock';
    if (rand < 0.85) return 'limited';
    if (rand < 0.95) return 'out_of_stock';
    return 'pre_order';
  }
  
  private getEstimatedDelivery(storeName: string): string {
    const deliveryOptions = {
      "Takealot": ["1-2 werksdae", "2-3 werksdae"],
      "Exclusive Books": ["2-4 werksdae", "3-5 werksdae"],
      "Van Schaik": ["1-3 werksdae", "2-4 werksdae"],
      "Kalahari.com": ["3-5 werksdae", "5-7 werksdae"],
      "Loot.co.za": ["2-5 werksdae", "3-6 werksdae"]
    };
    
    const options = deliveryOptions[storeName as keyof typeof deliveryOptions] || ["3-5 werksdae"];
    return options[Math.floor(Math.random() * options.length)];
  }
}

export const priceScraper = new PriceScraper();