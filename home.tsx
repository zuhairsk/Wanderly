import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { Attraction } from "@shared/schema";
import AttractionCard from "@/components/attraction-card";
// Globe3D removed from hero section
import NearbyList from "@/components/nearby-list";
import LiveWallpaper from "@/components/live-wallpaper";
import { useReducedMotion, usePerformanceMode } from "@/hooks/use-performance";

const categories = [
  { name: "Nature", icon: "fa-tree", color: "text-chart-2" },
  { name: "Museums", icon: "fa-landmark", color: "text-chart-1" },
  { name: "Adventure", icon: "fa-hiking", color: "text-chart-3" },
  { name: "Dining", icon: "fa-utensils", color: "text-destructive" },
  { name: "Historic", icon: "fa-monument", color: "text-chart-5" },
  { name: "Shopping", icon: "fa-shopping-bag", color: "text-accent-foreground" },
];

type WorldAttraction = {
  id: string;
  name: string;
  category: "nature" | "museums" | "adventure" | "dining" | "historic" | "shopping";
  description: string;
  location: string; // city, country
  rating: number;
  reviewCount: number;
  image: string; // URL
  price: "Free" | "$" | "$$" | "$$$";
};

const worldAttractions: WorldAttraction[] = [
  // Nature
  { id: "nat-1", name: "Grand Canyon", category: "nature", description: "Vast canyon carved by the Colorado River.", location: "Arizona, USA", rating: 4.9, reviewCount: 120345, image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=60", price: "Free" },
  { id: "nat-2", name: "Amazon Rainforest", category: "nature", description: "World's largest tropical rainforest.", location: "Amazonas, Brazil", rating: 4.8, reviewCount: 80432, image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "nat-3", name: "Great Barrier Reef", category: "nature", description: "World's largest coral reef system.", location: "Queensland, Australia", rating: 4.9, reviewCount: 93421, image: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "nat-4", name: "Swiss Alps", category: "nature", description: "Snow-capped mountains and alpine villages.", location: "Switzerland", rating: 4.9, reviewCount: 142033, image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "nat-5", name: "Banff National Park", category: "nature", description: "Turquoise lakes and rugged peaks.", location: "Alberta, Canada", rating: 4.9, reviewCount: 110025, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "nat-6", name: "Serengeti National Park", category: "nature", description: "Vast savanna famous for the Great Migration.", location: "Tanzania", rating: 4.8, reviewCount: 65022, image: "https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&w=1600&q=60", price: "$$$" },

  // Museums
  { id: "mus-1", name: "Louvre Museum", category: "museums", description: "World's largest art museum.", location: "Paris, France", rating: 4.8, reviewCount: 205340, image: "https://images.unsplash.com/photo-1549893079-842e6a180095?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "mus-2", name: "British Museum", category: "museums", description: "Human history, art and culture.", location: "London, UK", rating: 4.7, reviewCount: 175224, image: "https://images.unsplash.com/photo-1544019105-0d98d9eecf75?auto=format&fit=crop&w=1600&q=60", price: "Free" },
  { id: "mus-3", name: "Metropolitan Museum of Art", category: "museums", description: "Iconic NYC art museum.", location: "New York, USA", rating: 4.8, reviewCount: 188021, image: "https://images.unsplash.com/photo-1554907984-15263bfd63d3?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "mus-4", name: "Vatican Museums", category: "museums", description: "Art collections of the Roman Catholic Church.", location: "Vatican City", rating: 4.7, reviewCount: 156220, image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "mus-5", name: "Smithsonian Museums", category: "museums", description: "Network of free museums and research centers.", location: "Washington, D.C., USA", rating: 4.8, reviewCount: 210450, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=60", price: "Free" },
  { id: "mus-6", name: "Prado Museum", category: "museums", description: "Spanish national art museum.", location: "Madrid, Spain", rating: 4.7, reviewCount: 99021, image: "https://images.unsplash.com/photo-1554273675-4c2a7c2c79c5?auto=format&fit=crop&w=1600&q=60", price: "$$" },

  // Adventure
  { id: "adv-1", name: "Skydiving in Dubai", category: "adventure", description: "Tandem skydiving over Palm Jumeirah.", location: "Dubai, UAE", rating: 4.9, reviewCount: 45021, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "adv-2", name: "Bungee Jumping in Queenstown", category: "adventure", description: "Leap from iconic Kawarau Bridge.", location: "Queenstown, New Zealand", rating: 4.9, reviewCount: 38022, image: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "adv-3", name: "Safari in Kruger Park", category: "adventure", description: "Big Five safari experiences.", location: "South Africa", rating: 4.8, reviewCount: 52030, image: "https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "adv-4", name: "Scuba Diving in Maldives", category: "adventure", description: "Crystal-clear waters with vibrant reefs.", location: "Maldives", rating: 4.9, reviewCount: 47012, image: "https://images.unsplash.com/photo-1535448582139-28da8dbe9c0c?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "adv-5", name: "Hiking Machu Picchu", category: "adventure", description: "Inca Trail to ancient citadel.", location: "Cusco, Peru", rating: 4.9, reviewCount: 88032, image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "adv-6", name: "Zip-lining in Costa Rica", category: "adventure", description: "Canopy tours through cloud forests.", location: "Monteverde, Costa Rica", rating: 4.8, reviewCount: 30012, image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1600&q=60", price: "$$$" },

  // Dining
  { id: "din-1", name: "Michelin Star Restaurants", category: "dining", description: "Fine dining in the city of lights.", location: "Paris, France", rating: 4.7, reviewCount: 40210, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "din-2", name: "Street Food in Bangkok", category: "dining", description: "Night markets with Thai delicacies.", location: "Bangkok, Thailand", rating: 4.8, reviewCount: 99021, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1600&q=60", price: "$" },
  { id: "din-3", name: "Tapas Bars", category: "dining", description: "Vibrant tapas culture and nightlife.", location: "Barcelona, Spain", rating: 4.7, reviewCount: 65012, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "din-4", name: "Sushi in Tokyo", category: "dining", description: "World-renowned sushi masters.", location: "Tokyo, Japan", rating: 4.9, reviewCount: 120340, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "din-5", name: "Pizza in Naples", category: "dining", description: "Birthplace of authentic Neapolitan pizza.", location: "Naples, Italy", rating: 4.8, reviewCount: 72045, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=60", price: "$" },
  { id: "din-6", name: "Food Markets", category: "dining", description: "Moroccan flavors and spices.", location: "Marrakech, Morocco", rating: 4.6, reviewCount: 38042, image: "https://images.unsplash.com/photo-1549664188-530ada1c9d67?auto=format&fit=crop&w=1600&q=60", price: "$" },

  // Historic
  { id: "his-1", name: "Colosseum", category: "historic", description: "Ancient Roman amphitheater.", location: "Rome, Italy", rating: 4.8, reviewCount: 210230, image: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "his-2", name: "Great Wall of China", category: "historic", description: "Series of fortifications across northern China.", location: "Beijing, China", rating: 4.8, reviewCount: 175032, image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "his-3", name: "Pyramids of Giza", category: "historic", description: "Ancient pyramids and Sphinx.", location: "Giza, Egypt", rating: 4.7, reviewCount: 160021, image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "his-4", name: "Taj Mahal", category: "historic", description: "Mausoleum of white marble.", location: "Agra, India", rating: 4.9, reviewCount: 230220, image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "his-5", name: "Petra", category: "historic", description: "Rock-cut architecture and water conduit system.", location: "Ma'an, Jordan", rating: 4.8, reviewCount: 95012, image: "https://images.unsplash.com/photo-1534322901643-2a7d2ae92a2f?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "his-6", name: "Angkor Wat", category: "historic", description: "Largest religious monument in the world.", location: "Siem Reap, Cambodia", rating: 4.9, reviewCount: 123450, image: "https://images.unsplash.com/photo-1558980664-10e7170a7090?auto=format&fit=crop&w=1600&q=60", price: "$$" },

  // Shopping
  { id: "sho-1", name: "Oxford Street", category: "shopping", description: "Major retail hub with flagship stores.", location: "London, UK", rating: 4.5, reviewCount: 54012, image: "https://images.unsplash.com/photo-1544890225-d74dfb71e7e2?auto=format&fit=crop&w=1600&q=60", price: "$" },
  { id: "sho-2", name: "Fifth Avenue", category: "shopping", description: "High-end shopping and landmarks.", location: "New York, USA", rating: 4.6, reviewCount: 62031, image: "https://images.unsplash.com/photo-1505860125062-3ce932953cf5?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "sho-3", name: "Dubai Mall", category: "shopping", description: "One of the world's largest malls.", location: "Dubai, UAE", rating: 4.7, reviewCount: 143220, image: "https://images.unsplash.com/photo-1526835746356-2a8a0f3f1a5e?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "sho-4", name: "Champs-Élysées", category: "shopping", description: "Prestigious avenue with shops and cafes.", location: "Paris, France", rating: 4.6, reviewCount: 70210, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  { id: "sho-5", name: "Shibuya", category: "shopping", description: "Trendy shopping and entertainment district.", location: "Tokyo, Japan", rating: 4.7, reviewCount: 98021, image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  { id: "sho-6", name: "Grand Bazaar", category: "shopping", description: "Historic covered market.", location: "Istanbul, Turkey", rating: 4.6, reviewCount: 86012, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=60", price: "$" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [locationText, setLocationText] = useState("");
  const [, setLocation] = useLocation();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Performance and accessibility hooks
  const reducedMotion = useReducedMotion();
  const performanceMode = usePerformanceMode();

  const { data: attractions = [], isLoading } = useQuery<Attraction[]>({
    queryKey: ["/api/attractions"],
  });

  const featuredAttractions = attractions.slice(0, 6);

  const categoryKey = (name: string) => name.toLowerCase();

  const filteredWorldAttractions = useMemo(() => {
    if (selectedCategory === "All Categories") return worldAttractions;
    const key = categoryKey(selectedCategory);
    return worldAttractions.filter((a) => a.category === key);
  }, [selectedCategory]);

  const handleCategoryClick = (name: string) => {
    setIsFiltering(true);
    setSelectedCategory((prev) => (prev === name ? "All Categories" : name));
    // small delay to show loading state for UX polish
    setTimeout(() => setIsFiltering(false), 200);
  };

  // Ask for location once on mount for Nearby section
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // ignore errors silently; Nearby section will stay hidden
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Full Page 3D Live Wallpaper */}
      <LiveWallpaper 
        variant="cosmic" 
        intensity="intense" 
        reducedMotion={reducedMotion}
        className="fixed"
      />
      
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 pointer-events-none"></div>

      {/* Content wrapper with proper stacking */}
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          {/* Additional gradient for hero section */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 fade-in">Discover Local Treasures Near You</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto fade-in">
            Explore hidden gems, popular attractions, and unforgettable experiences in your area
          </p>

          {/* 3D Globe removed */}

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                  <input
                    type="text"
                    placeholder="Search attractions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    data-testid="input-search"
                  />
                </div>
                <div className="flex-1 relative">
                  <i className="fas fa-map-marker-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                  <input
                    type="text"
                    placeholder="Location (leave blank or type 'near me')"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    data-testid="input-location"
                  />
                </div>
                <div className="sm:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedCategory(v);
                    }}
                    className="w-full px-4 py-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground appearance-none cursor-pointer"
                    data-testid="select-category"
                  >
                    <option>All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={async () => {
                    const params = new URLSearchParams();
                    if (searchQuery.trim()) params.set("q", searchQuery.trim());
                    if (selectedCategory !== "All Categories") params.set("category", selectedCategory.toLowerCase());
                    if (locationText.trim().toLowerCase() === "near me" || locationText.trim() === "") {
                      if (navigator.geolocation) {
                        try {
                          await new Promise<void>((resolve) => {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                params.set("lat", String(pos.coords.latitude));
                                params.set("lng", String(pos.coords.longitude));
                                resolve();
                              },
                              () => resolve(),
                              { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
                            );
                          });
                        } catch {}
                      }
                    } else {
                      params.set("place", locationText.trim());
                    }
                    setLocation(`/explore?${params.toString()}`);
                  }}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
                  data-testid="button-search"
                >
                  <i className="fas fa-search"></i>
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-8 text-white/80 flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-map-marked-alt text-primary text-2xl"></i>
              <span className="text-sm font-medium">100+ Attractions</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-users text-primary text-2xl"></i>
              <span className="text-sm font-medium">Growing Community</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-star text-primary text-2xl"></i>
              <span className="text-sm font-medium">Verified Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-16 relative">
        {/* Semi-transparent overlay for better content readability */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Explore by Category</h2>

          {/* Horizontal selectable buttons */}
          <div className="overflow-x-auto">
            <div className="flex items-center justify-center gap-3 md:gap-4 w-max mx-auto">
              {categories.map((category) => {
                const isActive = selectedCategory === category.name;
                return (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`px-4 py-2 rounded-full border transition-all cursor-pointer select-none whitespace-nowrap flex items-center text-sm md:text-base ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow"
                        : "bg-card text-card-foreground border-border hover:border-primary/60 hover:shadow"
                    }`}
                    data-testid={`button-category-${category.name.toLowerCase()}`}
                  >
                    <i className={`fas ${category.icon} mr-2 ${isActive ? "" : category.color}`}></i>
                    {category.name}
                  </button>
                );
              })}
              <button
                onClick={() => setSelectedCategory("All Categories")}
                className="px-4 py-2 rounded-full border border-border bg-background hover:border-primary/60 text-sm md:text-base"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {/* Results grid for selected category */}
          <div className="mt-10">
            {selectedCategory && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">
                  {selectedCategory} Attractions ({filteredWorldAttractions.length} results)
                </h3>
                {isFiltering && <span className="text-muted-foreground text-sm">Loading…</span>}
              </div>
            )}
            {selectedCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredWorldAttractions.map((a) => (
                  <Link key={a.id} href={`/attraction/${a.id}`}>
                    <a className="block focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-xl">
                      <div className="bg-card rounded-xl overflow-hidden shadow-md border border-border cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="relative aspect-video">
                          <img
                            src={a.image}
                            alt={`${a.name} - ${a.description}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-bold text-card-foreground">{a.name}</h4>
                            <span className="text-sm font-semibold text-primary">{a.price}</span>
                          </div>
                          <p className="text-muted-foreground mb-3 line-clamp-2">{a.description}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span><i className="fas fa-map-marker-alt mr-2"></i>{a.location}</span>
                            <span><i className="fas fa-star mr-1 text-yellow-500"></i>{a.rating.toFixed(1)} ({a.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Featured Attractions */}
      <section className="py-16 relative">
        {/* Semi-transparent overlay for better content readability */}
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Attractions</h2>
              <p className="text-muted-foreground text-lg">Handpicked experiences just for you</p>
            </div>
            <Link href="/explore">
              <a className="hidden md:inline-flex items-center text-primary hover:underline font-semibold" data-testid="link-view-all">
                View All <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden shadow-md border border-border animate-pulse">
                  <div className="h-56 bg-muted"></div>
                  <div className="p-6">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-20 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredAttractions.map((attraction) => (
                <AttractionCard key={attraction.id} attraction={attraction} />
              ))}
            </div>
          )}
        </div>
      </section>

      </div> {/* Close content wrapper */}
    </div>
  );
}
