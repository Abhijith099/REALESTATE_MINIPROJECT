// SMART FILTER ENGINE FOR PROPERTIES

export const smartFilter = (properties, query) => {
  let text = query.toLowerCase();

  let results = [...properties];

  // 🔎 1. LOCATION SEARCH
  const locations = [
    "bengaluru", "bangalore", "whitefield", "koramangala",
    "jayanagar", "jp nagar", "hsr", "yelahanka",
    "sarjapur", "indiranagar", "electronic city"
  ];

  const foundLocation = locations.find(loc => text.includes(loc));
  if (foundLocation) {
    results = results.filter(p =>
      p.address.toLowerCase().includes(foundLocation) ||
      p.city.toLowerCase().includes(foundLocation)
    );
  }

  // 💰 2. BUDGET SEARCH
  let priceMatch = text.match(/(\d+)\s*(crore|cr|lakh|lakhs)/);

  if (priceMatch) {
    const num = parseInt(priceMatch[1]);
    const type = priceMatch[2];

    let limit = type.includes("crore") || type.includes("cr")
      ? num * 10000000
      : num * 100000;

    if (text.includes("under") || text.includes("below")) {
      results = results.filter(p => p.price <= limit);
    } else if (text.includes("above") || text.includes("over")) {
      results = results.filter(p => p.price >= limit);
    }
  }

  // 🛏️ 3. BEDROOM SEARCH
  const bedMatch = text.match(/(\d+)\s*(bhk|bed|bedroom)/);
  if (bedMatch) {
    const beds = parseInt(bedMatch[1]);
    results = results.filter(p => p.facilities.bedrooms >= beds);
  }

  // 🚗 4. PARKING SEARCH
  const parkMatch = text.match(/(\d+)\s*parking/);
  if (parkMatch) {
    const parking = parseInt(parkMatch[1]);
    results = results.filter(p => p.facilities.parking >= parking);
  }

  // 💧 5. BATHROOM SEARCH
  const bathMatch = text.match(/(\d+)\s*bath/);
  if (bathMatch) {
    const baths = parseInt(bathMatch[1]);
    results = results.filter(p => p.facilities.bathrooms >= baths);
  }

  // 🌊 6. CONTEXT SEARCH KEYWORDS (semantic)
  const beachWords = ["beach", "sea", "coast", "shore"];
  if (beachWords.some(w => text.includes(w))) {
    results = results.filter(p =>
      p.description.toLowerCase().includes("beach") ||
      p.description.toLowerCase().includes("sea") ||
      p.description.toLowerCase().includes("coast")
    );
  }

  // 💡 If nothing matches, return empty array (Gemini will handle it)
  return results;
};
