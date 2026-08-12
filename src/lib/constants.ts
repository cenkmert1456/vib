export const INTERESTS = [
  "Photography",
  "Travel",
  "Music",
  "Cooking",
  "Fitness",
  "Yoga",
  "Hiking",
  "Films",
  "Gaming",
  "Art",
  "Design",
  "Books",
  "Coffee",
  "Wine",
  "Dance",
  "Surfing",
  "Football",
  "Running",
  "Fashion",
  "Cats",
  "Dogs",
  "Languages",
  "Tech",
  "Sustainability",
  "Live music",
  "Concerts",
  "Street food",
  "Brunch",
  "Climbing",
  "Beach",
  "Skiing",
  "Reading",
  "Podcasts",
  "Board games",
  "Karaoke",
  "Vintage",
  "Cars",
  "Poetry",
  "Meditation",
  "Vinyl",
] as const;

export const LIFESTYLE = [
  "Non-smoker",
  "Smoker",
  "Occasional drinks",
  "Non-drinker",
  "Social",
  "Early riser",
  "Night owl",
  "Vegetarian",
  "Vegan",
  "Fitness-focused",
  "Homebody",
  "Adventurous",
] as const;

export const LANGUAGES = [
  "English",
  "Turkish",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Korean",
  "Arabic",
  "Dutch",
  "Russian",
  "Chinese",
  "Hindi",
  "Swedish",
  "Greek",
  "Polish",
  "Hebrew",
] as const;

export const GENDERS = ["woman", "man", "nonbinary", "other"] as const;

export type GenderValue = (typeof GENDERS)[number];

export const REPORT_CATEGORIES = [
  "fake_profile",
  "harassment",
  "inappropriate",
  "spam",
  "underage",
  "other",
] as const;

export const PROMPT_QUESTIONS = [
  "My perfect weekend is…",
  "You can win me over by…",
  "The fastest way to make me laugh is…",
  "My current obsession is…",
  "Let's debate…",
  "My ideal spontaneous plan is…",
  "My simple pleasure",
  "A life goal of mine",
  "I'm weirdly attracted to",
  "Together we could",
  "My love language is",
  "Best travel story",
  "A perfect day",
  "I geek out on",
  "My happy place",
  "I'm looking for",
  "My most irrational fear",
  "Weirdest talent",
] as const;

export const CHAT_EMOJI = [
  "😀", "😂", "🥰", "😍", "😎", "🤔", "😅", "🥲", "😢", "😡",
  "👍", "👎", "👏", "🙌", "🙏", "🤝", "💪", "🫶", "✌️", "👀",
  "❤️", "💜", "💛", "💚", "🔥", "✨", "⭐", "🌹", "🎉", "🥂",
  "☕", "🍕", "🍜", "🍣", "🍦", "🌮", "🍷", "🍺",
  "😴", "🤗", "🤯", "🥳", "😇", "😈", "💯", "🚀", "🌈", "⚡",
] as const;

/** Standardized country list (ISO 3166-1 alpha-2 codes). */
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "TR", name: "Türkiye" },
  { code: "DE", name: "Germany" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "US", name: "United States" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BR", name: "Brazil" },
  { code: "AU", name: "Australia" },
  { code: "ZA", name: "South Africa" },
  { code: "PT", name: "Portugal" },
  { code: "MX", name: "Mexico" },
  { code: "IT", name: "Italy" },
  { code: "CA", name: "Canada" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "PL", name: "Poland" },
  { code: "UA", name: "Ukraine" },
  { code: "RU", name: "Russia" },
  { code: "EG", name: "Egypt" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AR", name: "Argentina" },
  { code: "GR", name: "Greece" },
];

/** Relationship intentions (configurable discovery filter). */
export const INTENTIONS = [
  "Something casual",
  "New friends",
  "Long-term partner",
  "Relationship, open to exploring",
  "Figuring it out",
] as const;

/** Education levels (optional profile field). */
export const EDUCATION = [
  "High school",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctorate",
  "Trade school",
  "Prefer not to say",
] as const;

/** Distance presets in km (5/10/25/50/100/250/anywhere). */
export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100, 250, 4000] as const;
export const ANYWHERE_KM = 4000;

/** Moods for VYBE Moments. */
export const MOODS = ["✨", "🔥", "🌙", "☀️", "🎶", "🏔️", "🌊", "🎉", "☕", "💜"] as const;

export const CITIES: { name: string; country: string; lat: number; lng: number }[] = [
  { name: "Istanbul", country: "Türkiye", lat: 41.0082, lng: 28.9784 },
  { name: "Ankara", country: "Türkiye", lat: 39.9334, lng: 32.8597 },
  { name: "İzmir", country: "Türkiye", lat: 38.4192, lng: 27.1287 },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978 },
  { name: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
];

export const MAX_BIO_LENGTH = 300;
export const MAX_PHOTOS = 6;
export const SUPER_VYBE_DAILY_LIMIT = 3;
