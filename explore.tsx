import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Attraction } from "@shared/schema";
import AttractionCard from "@/components/attraction-card";
import MapView from "@/components/map-view";
import LiveWallpaper from "@/components/live-wallpaper";
import { useReducedMotion, usePerformanceMode } from "@/hooks/use-performance";

export default function Explore() {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [mapScope, setMapScope] = useState<"india" | "world">("india");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [distanceFilter, setDistanceFilter] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  // Performance and accessibility hooks
  const reducedMotion = useReducedMotion();
  const performanceMode = usePerformanceMode();

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q") || "";
    const category = url.searchParams.get("category");
    setSearchQuery(q);
    if (category) setSelectedCategories([category]);
  }, [location]);

  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  const lat = url ? url.searchParams.get("lat") : null;
  const lng = url ? url.searchParams.get("lng") : null;
  const place = url ? url.searchParams.get("place") : null;

  const { data: attractions = [], isLoading } = useQuery<Attraction[]>({
    queryKey: lat && lng ? ["/api/nearby", lat, lng] : ["/api/attractions"],
    queryFn: async () => {
      if (lat && lng) {
        const params = new URLSearchParams({ lat, lng, type: "attraction", radiusKm: "25" });
        const res = await fetch(`/api/nearby?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load nearby");
        return res.json();
      }
      const res = await fetch(`/api/attractions`);
      if (!res.ok) throw new Error("Failed to load attractions");
      return res.json();
    },
  });

  function isWithinIndia(lat: number, lng: number) {
    // Rough bounding box for India (including islands)
    return lat >= 6 && lat <= 36 && lng >= 68 && lng <= 98;
  }

  const filteredAttractions = attractions.filter((attraction) => {
    if (searchQuery && !attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !attraction.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !attraction.location.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (place && !(
      attraction.location.address.toLowerCase().includes(place.toLowerCase()) ||
      attraction.name.toLowerCase().includes(place.toLowerCase())
    )) {
      return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.includes(attraction.category)) {
      return false;
    }
    if (priceFilter && attraction.price !== priceFilter) {
      return false;
    }
    // Ignore static seed 'distance' for global view; nearby distance is handled via API
    if (attraction.averageRating < minRating) {
      return false;
    }
    if (viewMode === "map" && mapScope === "india") {
      const { lat, lng } = attraction.location;
      if (!isWithinIndia(lat, lng)) return false;
    }
    return true;
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <section className="relative py-16 min-h-screen overflow-hidden">
      {/* 3D Live Wallpaper Background */}
      <div className="absolute inset-0 z-0">
        <LiveWallpaper 
          variant="cosmic" 
          intensity={performanceMode === 'low' ? 'medium' : 'intense'} 
          reducedMotion={reducedMotion}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore All Attractions</h2>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search attractions, places, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 pr-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 sticky top-24 border border-border">
              <h3 className="text-xl font-bold mb-6 text-card-foreground">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-card-foreground mb-3 block">Category</label>
                <div className="space-y-2">
                  {["nature", "museum", "adventure", "dining", "historic", "shopping"].map((category) => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="mr-2 rounded text-primary focus:ring-primary"
                        data-testid={`checkbox-category-${category}`}
                      />
                      <span className="text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-card-foreground mb-3 block">Price Range</label>
                <div className="space-y-2">
                  {["free", "$", "$$", "$$$"].map((price) => (
                    <label key={price} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceFilter === price}
                        onChange={() => setPriceFilter(price)}
                        className="mr-2 text-primary focus:ring-primary"
                        data-testid={`radio-price-${price}`}
                      />
                      <span className="text-sm">{price === "free" ? "Free" : price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Distance Filter */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-card-foreground mb-3 block">Distance</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(Number(e.target.value))}
                  className="w-full accent-primary"
                  data-testid="slider-distance"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0 mi</span>
                  <span>{distanceFilter} mi</span>
                  <span>100 mi</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-card-foreground mb-3 block">Minimum Rating</label>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="mr-2 text-primary focus:ring-primary"
                        data-testid={`radio-rating-${rating}`}
                      />
                      <div className="flex text-chart-3 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i key={i} className={i < rating ? "fas fa-star" : "far fa-star"}></i>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceFilter("");
                  setDistanceFilter(50);
                  setMinRating(0);
                }}
                className="w-full mt-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                data-testid="button-clear-filters"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">{filteredAttractions.length} attractions found</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border"
                  }`}
                  data-testid="button-view-grid"
                >
                  <i className="fas fa-th-large mr-2"></i>Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border border-border"
                  }`}
                  data-testid="button-view-map"
                >
                  <i className="fas fa-map mr-2"></i>Map
                </button>
              </div>
            </div>

            {viewMode === "map" && (
              <div className="flex items-center justify-end mb-4 gap-2">
                <span className="text-sm text-muted-foreground mr-2">Scope:</span>
                <button
                  onClick={() => setMapScope("india")}
                  className={`px-3 py-1.5 rounded-md text-sm ${mapScope === "india" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}
                >
                  India
                </button>
                <button
                  onClick={() => setMapScope("world")}
                  className={`px-3 py-1.5 rounded-md text-sm ${mapScope === "world" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}
                >
                  World
                </button>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {isLoading ? (
                  <div>Loading...</div>
                ) : filteredAttractions.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <i className="fas fa-search text-6xl text-muted-foreground mb-4"></i>
                    <p className="text-xl text-muted-foreground">No attractions found matching your filters</p>
                  </div>
                ) : (
                  filteredAttractions.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} compact />
                  ))
                )}
              </div>
            )}

            {/* Map View */}
            {viewMode === "map" && (
              <MapView
                attractions={filteredAttractions.map((a) => ({
                  id: a.id,
                  name: a.name,
                  location: a.location,
                }))}
                center={mapScope === "india" ? { lat: 22.9734, lng: 78.6569 } : { lat: 20, lng: 0 }}
                zoom={mapScope === "india" ? 5 : 2}
                height="640px"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
