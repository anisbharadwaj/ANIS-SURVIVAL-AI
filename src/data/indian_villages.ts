export interface IndianVillage {
  id: string;
  name: string;
  state: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Northeast' | 'Central';
  latitude: number;
  longitude: number;
  altitude: number;
  terrain: string;
  description: string;
  survivalTip: string;
  safetyRating: 'Excellent' | 'Good' | 'Caution Required';
  keyContacts: string;
}

export const INDIAN_VILLAGES: IndianVillage[] = [
  {
    id: "mawlynnong",
    name: "Mawlynnong",
    state: "Meghalaya",
    region: "Northeast",
    latitude: 25.2017,
    longitude: 91.9161,
    altitude: 1050,
    terrain: "Subtropical Forest / Wetlands",
    description: "Known as Asia's Cleanest Village. Famous for its pristine living conditions, bamboo trash bins, and natural living root bridges nearby.",
    survivalTip: "Ensure waterproofing gear. Abundant water is clean but filter due to jungle run-off. Watch for slippery root trails.",
    safetyRating: "Excellent",
    keyContacts: "Mawlynnong Community Council: 112 / Forest Ranger: +91 364-222-3456"
  },
  {
    id: "malana",
    name: "Malana",
    state: "Himachal Pradesh",
    region: "North",
    latitude: 32.0628,
    longitude: 77.2625,
    altitude: 2652,
    terrain: "Alpine / High Altitude Mountain",
    description: "An ancient, isolated village in the Parvati Valley. It has its own democratic system and distinct language, Kanashi.",
    survivalTip: "Respect local customs strictly; do not touch villagers' houses or sacred walls without permission (fines apply). Stock up on warm layers.",
    safetyRating: "Caution Required",
    keyContacts: "Jari Police Outpost: 112 / Kullu Rescue Team: +91 1902-222722"
  },
  {
    id: "khonoma",
    name: "Khonoma",
    state: "Nagaland",
    region: "Northeast",
    latitude: 25.6481,
    longitude: 94.0194,
    altitude: 1621,
    terrain: "Hilly Forest / Agro-terraces",
    description: "India's first official Green Village. Famous for wildlife conservation, sustainable alder tree farming, and historic Naga battlegrounds.",
    survivalTip: "Terraced paths can become deeply muddy in monsoons. High humidity; keep communication batteries sealed against moisture.",
    safetyRating: "Excellent",
    keyContacts: "Khonoma Eco-tourism Cell: 112 / Kohima Central Hospital: +91 370-222-1326"
  },
  {
    id: "kuldhara",
    name: "Kuldhara",
    state: "Rajasthan",
    region: "West",
    latitude: 26.8778,
    longitude: 70.7852,
    altitude: 210,
    terrain: "Thar Desert / Arid Ghost Ruins",
    description: "An abandoned, haunted ghost village near Jaisalmer. Abandoned overnight by Paliwal Brahmins in the 19th century.",
    survivalTip: "Extreme dehydration hazard. Ground temperature exceeds 45°C in summer. Secure minimum 5 liters of water before exploring.",
    safetyRating: "Caution Required",
    keyContacts: "Jaisalmer Desert Guard: 112 / Jaisalmer District Hospital: +91 2992-252344"
  },
  {
    id: "majuli",
    name: "Majuli",
    state: "Assam",
    region: "East",
    latitude: 26.9608,
    longitude: 94.2183,
    altitude: 85,
    terrain: "Riverine Island / Wetlands",
    description: "The world's largest river island, situated in the Brahmaputra River. Famous for Vaishnavite Satras and mask-making heritage.",
    survivalTip: "Annual monsoon flooding hazard. Monitor river silt currents. Keep a flotation device or dynamic emergency route loaded.",
    safetyRating: "Good",
    keyContacts: "Garampur Police Station: 112 / Majuli Emergency Boat Rescue: +91 3775-274424"
  },
  {
    id: "hampi",
    name: "Hampi (Kishkindha)",
    state: "Karnataka",
    region: "South",
    latitude: 15.3350,
    longitude: 76.4600,
    altitude: 420,
    terrain: "Rocky Granite Boulder Hills",
    description: "An ancient village situated within the ruins of the Vijayanagara Empire. Surrounded by a scenic landscape of giant boulders.",
    survivalTip: "Intense daytime heat. Wear thick rubber-grip footwear for boulder scrambling. Keep an eye out for rock scorpions and cobras.",
    safetyRating: "Excellent",
    keyContacts: "Hampi Tourist Police: 112 / Kamalapur Medical Center: +91 8394-241250"
  },
  {
    id: "piplantri",
    name: "Piplantri",
    state: "Rajasthan",
    region: "West",
    latitude: 25.1011,
    longitude: 73.8114,
    altitude: 350,
    terrain: "Semi-Arid Hills",
    description: "An inspirational village where residents plant 111 trees for every girl born, creating a vast eco-sanctuary and water oasis.",
    survivalTip: "Shaded canopy provides excellent thermal shelter. Abundant aloe vera plants grow locally and can be used for minor skin burns.",
    safetyRating: "Excellent",
    keyContacts: "Rajsamand Police Station: 112 / Piplantri Village Panchayat: +91 2952-220011"
  },
  {
    id: "gokarna_v",
    name: "Gokarna",
    state: "Karnataka",
    region: "South",
    latitude: 14.5422,
    longitude: 74.3181,
    altitude: 12,
    terrain: "Coastal Cliffs / Sandy Beaches",
    description: "A coastal temple village famous for its dramatic rocky cliffs overlooking the Arabian Sea and isolated trekking beaches.",
    survivalTip: "High rip tides active during monsoons. Watch footing along wet, mossy coastal cliffs. Keep sand out of GPS tracking seals.",
    safetyRating: "Good",
    keyContacts: "Gokarna Marine Police: 112 / Gokarna Health Clinic: +91 8386-256241"
  },
  {
    id: "ziro",
    name: "Ziro",
    state: "Arunachal Pradesh",
    region: "Northeast",
    latitude: 27.5956,
    longitude: 93.8394,
    altitude: 1500,
    terrain: "Pine Hills / Paddy Valleys",
    description: "Home of the Apatani tribe, famous for wet-rice-fish cultivation and Ziro Music Festival in a scenic valley backdrop.",
    survivalTip: "High altitude temperature drops sharply at night (below 4°C in winter). Prepare thermal fire materials and shelter locks.",
    safetyRating: "Excellent",
    keyContacts: "Ziro Forest Range Division: 112 / Hapoli General Hospital: +91 3788-224216"
  },
  {
    id: "marwant",
    name: "Marwant",
    state: "Chhattisgarh",
    region: "Central",
    latitude: 22.3500,
    longitude: 81.9200,
    altitude: 440,
    terrain: "Sal Forest / Deciduous Hills",
    description: "A traditional village surrounded by dense forest in central India. Famous for tribal art and deep connection with wildlife.",
    survivalTip: "Avoid venturing deep into dense Sal forests after sunset. Keep fire-starting materials ready for predator deterring.",
    safetyRating: "Caution Required",
    keyContacts: "Bilaspur Range Office: 112 / Forest Guard Outpost: +91 7752-234255"
  },
  {
    id: "raghurajpur",
    name: "Raghurajpur",
    state: "Odisha",
    region: "East",
    latitude: 19.8402,
    longitude: 85.8239,
    altitude: 15,
    terrain: "Coastal Plains / Palm Groves",
    description: "A heritage crafts village famous for its Pattachitra painters, palm leaf inscriptions, and traditional Gotipua dance.",
    survivalTip: "High coastal humidity can cause rapid electrolyte loss. Take sodium replacement tabs. Coconut water is abundant and safe.",
    safetyRating: "Excellent",
    keyContacts: "Chandanpur Police Station: 112 / Puri District Headquarters: +91 6752-223030"
  },
  {
    id: "landour",
    name: "Landour",
    state: "Uttarakhand",
    region: "North",
    latitude: 30.4650,
    longitude: 78.0931,
    altitude: 2286,
    terrain: "Himalayan Ridge / Oak & Deodar",
    description: "A peaceful cantonment town and rustic village setup adjacent to Mussoorie. Highly scenic, preserving dense deodar canopy.",
    survivalTip: "Steep slopes and dense fog cover can impair navigation. Maintain dead reckoning bearings. Use high-intensity signal torches.",
    safetyRating: "Excellent",
    keyContacts: "Landour Cantonment Board: 112 / Landour Community Hospital: +91 135-263-2053"
  },
  {
    id: "punsari",
    name: "Punsari",
    state: "Gujarat",
    region: "West",
    latitude: 23.5132,
    longitude: 73.0125,
    altitude: 110,
    terrain: "Semi-Arid Plains",
    description: "Famous as India's smartest village. Equipped with local Wi-Fi, solar streetlights, water purifying plants, and digital safety systems.",
    survivalTip: "Extremely reliable technology grid. In an emergency, locate a village digital hub with automated emergency help booths.",
    safetyRating: "Excellent",
    keyContacts: "Punsari Security Command: 112 / Himatnagar Civil Hospital: +91 2772-246211"
  },
  {
    id: "poovar_v",
    name: "Poovar",
    state: "Kerala",
    region: "South",
    latitude: 8.3182,
    longitude: 77.0734,
    altitude: 5,
    terrain: "Estuary / Mangroves",
    description: "A tropical backwater village where a beautiful river meets the sea. Surrounded by dense coconut groves and floating huts.",
    survivalTip: "Estuary waters are deep and tidal. Avoid swimming near sandbar junctions. Apply repellent against high mosquito vectors.",
    safetyRating: "Excellent",
    keyContacts: "Poovar Coastal Ward: 112 / Neyyattinkara Hospital: +91 471-222-2244"
  },
  {
    id: "nako",
    name: "Nako",
    state: "Himachal Pradesh",
    region: "North",
    latitude: 31.8791,
    longitude: 78.6272,
    altitude: 3662,
    terrain: "Cold High-Altitude Desert",
    description: "A high-altitude village near the Indo-Tibetan border. Famous for its sacred lake, stone houses, and ancient Nako Monastery.",
    survivalTip: "Extreme high-altitude altitude sickness (AMS) risk. Limit physical exertion. Water freezes at night; secure indoor thermal locks.",
    safetyRating: "Caution Required",
    keyContacts: "Pooh Police Division: 112 / Reckong Peo District Medical: +91 1786-222248"
  }
];
