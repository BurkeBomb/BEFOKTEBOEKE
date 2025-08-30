// Event service for generating sample literary events in South Africa
import { Event, InsertEvent } from "@shared/schema";

interface EventData {
  title: string;
  description: string;
  eventType: string;
  venue: string;
  address: string;
  city: string;
  price: number; // in cents
  maxAttendees?: number;
  organizer: string;
  organizerContact?: string;
  featuredAuthor?: string;
  featuredBook?: string;
  tags: string[];
  imageUrl?: string;
}

const SOUTH_AFRICAN_CITIES = [
  "Kaapstad", "Johannesburg", "Durban", "Pretoria", "Port Elizabeth", 
  "Bloemfontein", "East London", "Pietermaritzburg", "Stellenbosch", "Potchefstroom"
];

const AFRIKAANS_AUTHORS = [
  "Marlene van Niekerk", "Etienne Leroux", "André P. Brink", "Dalene Matthee",
  "Breyten Breytenbach", "Ingrid Winterbach", "Eben Venter", "Koos Kombuis",
  "Antjie Krog", "Jan Rabie", "Karel Schoeman", "Hennie Aucamp"
];

const AFRIKAANS_BOOKS = [
  "Agaat", "Triomf", "Magersfontein, O Magersfontein!", "Kringe in 'n Bos",
  "Die Korrekteur", "Niggie", "Santa Gamka", "Verkeerde Kus",
  "Country of My Skull", "Eiland", "Verkenning", "Die Avonture van Robbie Knevel"
];

const VENUES = [
  { name: "Exclusive Books", type: "Boekwinkel" },
  { name: "Protea Boekhuis", type: "Boekwinkel" },
  { name: "Die Boekrak", type: "Koffiewinkel" },
  { name: "Stellenbosch Universiteit Biblioteek", type: "Universiteit" },
  { name: "Kaapse Stadsaal", type: "Gemeenskapsaal" },
  { name: "Artscape Theatre", type: "Teater" },
  { name: "Klein Karoo Nasionale Kunstefees", type: "Kunsfees" },
  { name: "Boekbedonnerd Koffiewinkel", type: "Koffiewinkel" },
  { name: "Literaire Sentrum", type: "Kultuursentrum" },
  { name: "Huguenot Museum", type: "Museum" }
];

const EVENT_TEMPLATES: EventData[] = [
  {
    title: "Afrikaanse Poësie-aand",
    description: "Geniet 'n aand vol pragtige Afrikaanse poësie met plaaslike digters. Kom luister na nuwe werk en klassieke gedigte.",
    eventType: "poetry_night",
    venue: "Die Boekrak",
    address: "123 Kerkstraat",
    city: "Stellenbosch",
    price: 5000, // R50
    maxAttendees: 40,
    organizer: "Stellenbosch Poësiekring",
    organizerContact: "info@poesiekring.co.za",
    tags: ["poësie", "afrikaans", "kultuur", "gemeenskap"],
  },
  {
    title: "Marlene van Niekerk Boekleesing",
    description: "Die bekende outeur lees uit haar nuutste werk. 'n Unieke geleentheid om een van Suid-Afrika se grootse skrywers te hoor.",
    eventType: "book_reading",
    venue: "Exclusive Books",
    address: "V&A Waterfront",
    city: "Kaapstad",
    price: 0, // Gratis
    maxAttendees: 100,
    organizer: "Exclusive Books",
    organizerContact: "events@exclusivebooks.co.za",
    featuredAuthor: "Marlene van Niekerk",
    featuredBook: "Agaat",
    tags: ["boekleesing", "afrikaans", "literatuur", "outeur"],
  },
  {
    title: "Literêre Werkswinkel: Skryf jou eie verhaal",
    description: "Leer die kuns van kortverhaal skryf met ervare skrywers. Praktiese wenke en oefeninge ingesluit.",
    eventType: "workshop",
    venue: "Literaire Sentrum",
    address: "45 Langstraat",
    city: "Johannesburg",
    price: 15000, // R150
    maxAttendees: 20,
    organizer: "Skrywerskring Johannesburg",
    organizerContact: "workshop@skrywers.co.za",
    tags: ["werkswinkel", "skryf", "verhale", "literatuur"],
  },
  {
    title: "Breyten Breytenbach Gesprek",
    description: "Intieme gesprek met een van Suid-Afrika se mees gerespekteerde digters en kunstenaars oor sy werk en lewe.",
    eventType: "author_talk",
    venue: "Artscape Theatre",
    address: "DF Malan Straat",
    city: "Kaapstad",
    price: 8000, // R80
    maxAttendees: 200,
    organizer: "Kaapse Kunstefees",
    organizerContact: "info@kyknet.co.za",
    featuredAuthor: "Breyten Breytenbach",
    tags: ["outeurspraatjie", "poësie", "kuns", "geskiedenis"],
  },
  {
    title: "Boekklub: Triomf deur Marlene van Niekerk",
    description: "Maandelikse boekklub bespreking van een van die belangrikste Afrikaanse romans. Nuwe lede welkom!",
    eventType: "book_club",
    venue: "Protea Boekhuis",
    address: "88 Voorstraat",
    city: "Pretoria",
    price: 2500, // R25
    maxAttendees: 15,
    organizer: "Pretoria Boekklub",
    organizerContact: "boekklub@protea.co.za",
    featuredBook: "Triomf",
    featuredAuthor: "Marlene van Niekerk",
    tags: ["boekklub", "bespreking", "triomf", "literatuur"],
  }
];

export class EventService {
  generateSampleEvents(count: number = 20): Omit<InsertEvent, 'id' | 'createdAt' | 'updatedAt'>[] {
    const events: Omit<InsertEvent, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    
    for (let i = 0; i < count; i++) {
      const template = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
      const venue = VENUES[Math.floor(Math.random() * VENUES.length)];
      const city = SOUTH_AFRICAN_CITIES[Math.floor(Math.random() * SOUTH_AFRICAN_CITIES.length)];
      
      // Generate future dates (next 3 months)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90) + 1);
      startDate.setHours(18 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 4) * 15, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 2);
      
      // Randomize some properties
      const featuredAuthor = template.featuredAuthor || 
        (Math.random() > 0.6 ? AFRIKAANS_AUTHORS[Math.floor(Math.random() * AFRIKAANS_AUTHORS.length)] : undefined);
      
      const featuredBook = template.featuredBook || 
        (featuredAuthor ? AFRIKAANS_BOOKS[Math.floor(Math.random() * AFRIKAANS_BOOKS.length)] : undefined);
      
      const priceVariation = Math.random() > 0.5 ? Math.floor(Math.random() * 5000) : 0;
      const maxAttendees = template.maxAttendees ? 
        template.maxAttendees + Math.floor(Math.random() * 20) - 10 : 
        20 + Math.floor(Math.random() * 80);
      
      events.push({
        title: this.generateVariantTitle(template.title, i),
        description: template.description,
        eventType: template.eventType,
        venue: venue.name,
        address: template.address,
        city,
        startDate,
        endDate,
        price: template.price + priceVariation,
        maxAttendees: Math.max(10, maxAttendees),
        currentAttendees: Math.floor(Math.random() * (maxAttendees * 0.3)),
        organizer: template.organizer,
        organizerContact: template.organizerContact,
        featuredAuthor,
        featuredBook,
        tags: template.tags,
        imageUrl: undefined, // Would be actual images in production
        isActive: true,
        requiresBooking: template.eventType !== 'book_club',
      });
    }
    
    return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }
  
  private generateVariantTitle(baseTitle: string, index: number): string {
    if (index === 0) return baseTitle;
    
    const variants = {
      "Afrikaanse Poësie-aand": [
        "Poësie onder die Sterre",
        "Stemme van die Hart - Poësie-aand",
        "Afrikaanse Verse en Ritmes",
        "Digters in die Kollig"
      ],
      "Boekleesing": [
        "Outeur in Gesprek",
        "Literêre Lesing",
        "Verhale om die Vuur",
        "Boeke en Babbels"
      ],
      "Werkswinkel": [
        "Kreatiewe Skryfwerkswinkel",
        "Verhaal-ambag Werkswinkel",
        "Skryf vir Beginners",
        "Literêre Vaardighede"
      ]
    };
    
    for (const [key, options] of Object.entries(variants)) {
      if (baseTitle.includes(key)) {
        return options[index % options.length];
      }
    }
    
    return `${baseTitle} - Deel ${index + 1}`;
  }
}

export const eventService = new EventService();