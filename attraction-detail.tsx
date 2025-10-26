import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Attraction, Review } from "@shared/schema";
import StarRating from "@/components/star-rating";
import ReviewForm from "@/components/review-form";
import MapView from "@/components/map-view";
import SimpleMap from "@/components/simple-map";
import NearbyList from "@/components/nearby-list";
import TravelOptionsCard from "@/components/travel-options-card";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDistanceTo } from "@/hooks/use-distance";
import { formatDistanceToNow } from "date-fns";

// World attractions data (matching the home page)
const worldAttractions: Record<string, any> = {
  "nat-1": { id: "nat-1", name: "Grand Canyon", category: "nature", description: "Vast canyon carved by the Colorado River.", location: "Arizona, USA", lat: 36.1069, lng: -112.1129, rating: 4.9, reviewCount: 120345, image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=60", price: "Free" },
  "nat-2": { id: "nat-2", name: "Amazon Rainforest", category: "nature", description: "World's largest tropical rainforest.", location: "Amazonas, Brazil", lat: -3.4653, lng: -62.2159, rating: 4.8, reviewCount: 80432, image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "nat-3": { id: "nat-3", name: "Great Barrier Reef", category: "nature", description: "World's largest coral reef system.", location: "Queensland, Australia", lat: -18.2871, lng: 147.6992, rating: 4.9, reviewCount: 93421, image: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "nat-4": { id: "nat-4", name: "Swiss Alps", category: "nature", description: "Snow-capped mountains and alpine villages.", location: "Switzerland", lat: 46.5197, lng: 6.6323, rating: 4.9, reviewCount: 142033, image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "nat-5": { id: "nat-5", name: "Banff National Park", category: "nature", description: "Turquoise lakes and rugged peaks.", location: "Alberta, Canada", lat: 51.4968, lng: -115.9281, rating: 4.9, reviewCount: 110025, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "nat-6": { id: "nat-6", name: "Serengeti National Park", category: "nature", description: "Vast savanna famous for the Great Migration.", location: "Tanzania", lat: -2.1530, lng: 34.6857, rating: 4.8, reviewCount: 65022, image: "https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "mus-1": { id: "mus-1", name: "Louvre Museum", category: "museums", description: "World's largest art museum.", location: "Paris, France", lat: 48.8606, lng: 2.3376, rating: 4.8, reviewCount: 205340, image: "https://images.unsplash.com/photo-1549893079-842e6a180095?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "mus-2": { id: "mus-2", name: "British Museum", category: "museums", description: "Human history, art and culture.", location: "London, UK", lat: 51.5194, lng: -0.1270, rating: 4.7, reviewCount: 175224, image: "https://images.unsplash.com/photo-1544019105-0d98d9eecf75?auto=format&fit=crop&w=1600&q=60", price: "Free" },
  "mus-3": { id: "mus-3", name: "Metropolitan Museum of Art", category: "museums", description: "Iconic NYC art museum.", location: "New York, USA", lat: 40.7794, lng: -73.9632, rating: 4.8, reviewCount: 188021, image: "https://images.unsplash.com/photo-1554907984-15263bfd63d3?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "mus-4": { id: "mus-4", name: "Vatican Museums", category: "museums", description: "Art collections of the Roman Catholic Church.", location: "Vatican City", lat: 41.9029, lng: 12.4534, rating: 4.7, reviewCount: 156220, image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "mus-5": { id: "mus-5", name: "Smithsonian Museums", category: "museums", description: "Network of free museums and research centers.", location: "Washington, D.C., USA", lat: 38.8889, lng: -77.0261, rating: 4.8, reviewCount: 210450, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=60", price: "Free" },
  "mus-6": { id: "mus-6", name: "Prado Museum", category: "museums", description: "Spanish national art museum.", location: "Madrid, Spain", lat: 40.4138, lng: -3.6921, rating: 4.7, reviewCount: 99021, image: "https://images.unsplash.com/photo-1554273675-4c2a7c2c79c5?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "adv-1": { id: "adv-1", name: "Skydiving in Dubai", category: "adventure", description: "Tandem skydiving over Palm Jumeirah.", location: "Dubai, UAE", lat: 25.2048, lng: 55.2708, rating: 4.9, reviewCount: 45021, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "adv-2": { id: "adv-2", name: "Bungee Jumping in Queenstown", category: "adventure", description: "Leap from iconic Kawarau Bridge.", location: "Queenstown, New Zealand", lat: -45.0312, lng: 168.6626, rating: 4.9, reviewCount: 38022, image: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "adv-3": { id: "adv-3", name: "Safari in Kruger Park", category: "adventure", description: "Big Five safari experiences.", location: "South Africa", lat: -24.0115, lng: 31.4859, rating: 4.8, reviewCount: 52030, image: "https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "adv-4": { id: "adv-4", name: "Scuba Diving in Maldives", category: "adventure", description: "Crystal-clear waters with vibrant reefs.", location: "Maldives", lat: 3.2028, lng: 73.2207, rating: 4.9, reviewCount: 47012, image: "https://images.unsplash.com/photo-1535448582139-28da8dbe9c0c?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "adv-5": { id: "adv-5", name: "Hiking Machu Picchu", category: "adventure", description: "Inca Trail to ancient citadel.", location: "Cusco, Peru", lat: -13.1631, lng: -72.5450, rating: 4.9, reviewCount: 88032, image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "adv-6": { id: "adv-6", name: "Zip-lining in Costa Rica", category: "adventure", description: "Canopy tours through cloud forests.", location: "Monteverde, Costa Rica", lat: 10.3158, lng: -84.8200, rating: 4.8, reviewCount: 30012, image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "din-1": { id: "din-1", name: "Michelin Star Restaurants", category: "dining", description: "Fine dining in the city of lights.", location: "Paris, France", lat: 48.8566, lng: 2.3522, rating: 4.7, reviewCount: 40210, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "din-2": { id: "din-2", name: "Street Food in Bangkok", category: "dining", description: "Night markets with Thai delicacies.", location: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, rating: 4.8, reviewCount: 99021, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1600&q=60", price: "$" },
  "din-3": { id: "din-3", name: "Tapas Bars", category: "dining", description: "Vibrant tapas culture and nightlife.", location: "Barcelona, Spain", lat: 41.3851, lng: 2.1734, rating: 4.7, reviewCount: 65012, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "din-4": { id: "din-4", name: "Sushi in Tokyo", category: "dining", description: "World-renowned sushi masters.", location: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, rating: 4.9, reviewCount: 120340, image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "din-5": { id: "din-5", name: "Pizza in Naples", category: "dining", description: "Birthplace of authentic Neapolitan pizza.", location: "Naples, Italy", lat: 40.8518, lng: 14.2681, rating: 4.8, reviewCount: 72045, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=60", price: "$" },
  "din-6": { id: "din-6", name: "Food Markets", category: "dining", description: "Moroccan flavors and spices.", location: "Marrakech, Morocco", lat: 31.6295, lng: -7.9811, rating: 4.6, reviewCount: 38042, image: "https://images.unsplash.com/photo-1549664188-530ada1c9d67?auto=format&fit=crop&w=1600&q=60", price: "$" },
  "his-1": { id: "his-1", name: "Colosseum", category: "historic", description: "Ancient Roman amphitheater.", location: "Rome, Italy", lat: 41.8902, lng: 12.4922, rating: 4.8, reviewCount: 210230, image: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "his-2": { id: "his-2", name: "Great Wall of China", category: "historic", description: "Series of fortifications across northern China.", location: "Beijing, China", lat: 40.4319, lng: 116.5704, rating: 4.8, reviewCount: 175032, image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "his-3": { id: "his-3", name: "Pyramids of Giza", category: "historic", description: "Ancient pyramids and Sphinx.", location: "Giza, Egypt", lat: 29.9792, lng: 31.1342, rating: 4.7, reviewCount: 160021, image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "his-4": { id: "his-4", name: "Taj Mahal", category: "historic", description: "Mausoleum of white marble.", location: "Agra, India", lat: 27.1751, lng: 78.0421, rating: 4.9, reviewCount: 230220, image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "his-5": { id: "his-5", name: "Petra", category: "historic", description: "Rock-cut architecture and water conduit system.", location: "Ma'an, Jordan", lat: 30.3285, lng: 35.4444, rating: 4.8, reviewCount: 95012, image: "https://images.unsplash.com/photo-1534322901643-2a7d2ae92a2f?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "his-6": { id: "his-6", name: "Angkor Wat", category: "historic", description: "Largest religious monument in the world.", location: "Siem Reap, Cambodia", lat: 13.4125, lng: 103.8670, rating: 4.9, reviewCount: 123450, image: "https://images.unsplash.com/photo-1558980664-10e7170a7090?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "sho-1": { id: "sho-1", name: "Oxford Street", category: "shopping", description: "Major retail hub with flagship stores.", location: "London, UK", lat: 51.5154, lng: -0.1419, rating: 4.5, reviewCount: 54012, image: "https://images.unsplash.com/photo-1544890225-d74dfb71e7e7?auto=format&fit=crop&w=1600&q=60", price: "$" },
  "sho-2": { id: "sho-2", name: "Fifth Avenue", category: "shopping", description: "High-end shopping and landmarks.", location: "New York, USA", lat: 40.7505, lng: -73.9934, rating: 4.6, reviewCount: 62031, image: "https://images.unsplash.com/photo-1505860125062-3ce932953cf5?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "sho-3": { id: "sho-3", name: "Dubai Mall", category: "shopping", description: "One of the world's largest malls.", location: "Dubai, UAE", lat: 25.1972, lng: 55.2796, rating: 4.7, reviewCount: 143220, image: "https://images.unsplash.com/photo-1526835746356-2a8a0f3f1a5e?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "sho-4": { id: "sho-4", name: "Champs-Élysées", category: "shopping", description: "Prestigious avenue with shops and cafes.", location: "Paris, France", lat: 48.8698, lng: 2.3076, rating: 4.6, reviewCount: 70210, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=60", price: "$$$" },
  "sho-5": { id: "sho-5", name: "Shibuya", category: "shopping", description: "Trendy shopping and entertainment district.", location: "Tokyo, Japan", lat: 35.6598, lng: 139.7006, rating: 4.7, reviewCount: 98021, image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=60", price: "$$" },
  "sho-6": { id: "sho-6", name: "Grand Bazaar", category: "shopping", description: "Historic covered market.", location: "Istanbul, Turkey", lat: 41.0105, lng: 28.9702, rating: 4.6, reviewCount: 86012, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=60", price: "$" },
};

export default function AttractionDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const { user } = useAuth();

  const { data: attraction, isLoading: attractionLoading } = useQuery<Attraction>({
    queryKey: ["/api/attractions", id],
    queryFn: async () => {
      // Check if this is a world attraction (has simple ID like "nat-1", "mus-2", etc.)
      // World attractions have pattern like "nat-1", "mus-2", "adv-3", etc.
      if (id && /^[a-z]{3}-\d+$/.test(id)) {
        // This is a world attraction, get from our local data
        const worldAttraction = worldAttractions[id];
        if (worldAttraction) {
          // Convert world attraction to Attraction format
          return {
            id: worldAttraction.id,
            name: worldAttraction.name,
            category: worldAttraction.category,
            description: worldAttraction.description,
            location: { lat: worldAttraction.lat, lng: worldAttraction.lng, address: worldAttraction.location },
            images: [worldAttraction.image],
            price: worldAttraction.price.toLowerCase(),
            distance: 0,
            hours: null,
            phone: null,
            website: null,
            amenities: [],
            travelInfo: null,
            averageRating: worldAttraction.rating,
            reviewCount: worldAttraction.reviewCount,
            createdAt: new Date(),
          };
        }
        throw new Error("World attraction not found!");
      } else {
        // This is a real attraction ID (UUID), fetch from API
        const res = await fetch(`/api/attractions/${id}`);
        if (!res.ok) throw new Error("Failed to load attraction");
        return res.json();
      }
    },
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/${id}`);
      if (!res.ok) throw new Error("Failed to load reviews");
      return res.json();
    },
  });

  // Calculate distance from user's location
  const { miles: distanceFromUser, status: distanceStatus } = useDistanceTo(
    attraction?.location ? { lat: attraction.location.lat, lng: attraction.location.lng } : undefined
  );

  if (attractionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading attraction details...</p>
        </div>
      </div>
    );
  }

  if (!attraction) {
    // Check if this is a world attraction (has simple ID like "nat-1", "mus-2", etc.)
    const isWorldAttraction = id && /^[a-z]{3}-\d+$/.test(id);
    
    if (isWorldAttraction) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-6">
              <i className="fas fa-globe-americas text-6xl text-primary mb-4"></i>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Coming Soon!</h1>
              <p className="text-muted-foreground mb-6">
                This world attraction is currently being added to our database. 
                We're working hard to bring you detailed information about amazing places around the globe.
              </p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => setLocation("/")} 
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                data-testid="button-go-home"
              >
                <i className="fas fa-home mr-2"></i>
                Explore Local Attractions
              </button>
              <button 
                onClick={() => setLocation("/explore")} 
                className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <i className="fas fa-search mr-2"></i>
                Browse All Attractions
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-destructive mb-4"></i>
          <h1 className="text-3xl font-bold mb-2">Attraction Not Found</h1>
          <p className="text-muted-foreground mb-4">The attraction you're looking for doesn't exist.</p>
          <button onClick={() => setLocation("/")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg" data-testid="button-go-home">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Header with Image */}
      <div className="relative h-96">
        <img src={attraction.images[0]} alt={attraction.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">{attraction.name}</h1>
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1">
                <StarRating rating={attraction.averageRating} />
                <span className="ml-2">
                  {attraction.averageRating.toFixed(1)} ({attraction.reviewCount} reviews)
                </span>
              </div>
              <span>
                <i className="fas fa-map-marker-alt mr-1"></i>
                {distanceStatus === "ready" && distanceFromUser !== undefined 
                  ? `${distanceFromUser.toFixed(1)} miles away`
                  : distanceStatus === "locating" 
                    ? "Calculating distance..."
                    : "Distance unavailable"
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Attraction</h2>
              <p className="text-muted-foreground leading-relaxed">{attraction.description}</p>
            </div>

            {/* Amenities */}
            {attraction.amenities && attraction.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {attraction.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <i className="fas fa-check text-primary"></i>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                {user && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    data-testid="button-toggle-review-form"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    {showReviewForm ? "Cancel" : "Write Review"}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="mb-6">
                  <ReviewForm attractionId={id!} onSuccess={() => setShowReviewForm(false)} />
                </div>
              )}

              {reviewsLoading ? (
                <div>Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-muted rounded-xl">
                  <i className="fas fa-comments text-4xl text-muted-foreground mb-2"></i>
                  <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-muted p-6 rounded-xl" data-testid={`review-${review.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                            {review.userId.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold">User {review.userId.substring(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Location Map */}
            <div className="bg-card p-6 rounded-xl mb-6 border border-border">
              <h3 className="text-xl font-bold mb-4">Location</h3>
              <div className="mb-4">
                <div 
                  className="w-full rounded-xl shadow-lg border border-border overflow-hidden bg-gray-100"
                  style={{ height: "250px" }}
                >
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${attraction.location.lng-0.01},${attraction.location.lat-0.01},${attraction.location.lng+0.01},${attraction.location.lat+0.01}&layer=mapnik&marker=${attraction.location.lat},${attraction.location.lng}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    title={`Map showing ${attraction.name}`}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                {attraction.location.address}
              </p>
            </div>

            {/* Visit Information */}
            <div className="bg-card p-6 rounded-xl mb-6 border border-border">
              <h3 className="text-xl font-bold mb-4">Visit Information</h3>
              <div className="space-y-3 text-sm">
                {attraction.hours && (
                  <div className="flex items-start">
                    <i className="fas fa-clock text-primary mt-1 mr-3"></i>
                    <div>
                      <p className="font-semibold">Hours</p>
                      <p className="text-muted-foreground">{attraction.hours}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <i className="fas fa-ticket-alt text-primary mt-1 mr-3"></i>
                  <div>
                    <p className="font-semibold">Admission</p>
                    <p className="text-muted-foreground">
                      {attraction.price === "free" ? "Free Entry" : 
                       attraction.price === "$" ? "₹200-500" :
                       attraction.price === "$$" ? "₹500-1000" :
                       attraction.price === "$$$" ? "₹1000+" : attraction.price}
                    </p>
                  </div>
                </div>
                {attraction.phone && (
                  <div className="flex items-start">
                    <i className="fas fa-phone text-primary mt-1 mr-3"></i>
                    <div>
                      <p className="font-semibold">Contact</p>
                      <p className="text-muted-foreground">{attraction.phone}</p>
                    </div>
                  </div>
                )}
                {attraction.website && (
                  <div className="flex items-start">
                    <i className="fas fa-globe text-primary mt-1 mr-3"></i>
                    <div>
                      <p className="font-semibold">Website</p>
                      <a href={`https://${attraction.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {attraction.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Options */}
            {attraction.travelInfo && (
              <div className="mb-6">
                <TravelOptionsCard 
                  travelInfo={attraction.travelInfo} 
                  fromLocation={attraction.travelInfo.fromLocation}
                />
              </div>
            )}

            {/* Trip Planner */}
            <div className="bg-card p-6 rounded-xl mb-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Trip Planner</h3>
                <button
                  onClick={() => setShowPlanner(!showPlanner)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
                >
                  <i className="fas fa-calendar-plus mr-2"></i>
                  {showPlanner ? "Hide Planner" : "Plan Trip"}
                </button>
              </div>
              
              {showPlanner && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Travelers</label>
                    <select className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>1 Traveler</option>
                      <option>2 Travelers</option>
                      <option>3 Travelers</option>
                      <option>4 Travelers</option>
                      <option>5+ Travelers</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget Range</label>
                    <select className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Budget ($0-100)</option>
                      <option>Moderate ($100-500)</option>
                      <option>Luxury ($500+)</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                      <i className="fas fa-save mr-2"></i>
                      Save Plan
                    </button>
                    <button className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                      <i className="fas fa-share mr-2"></i>
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nearby Places - span full grid width */}
          <div className="lg:col-span-3">
            <NearbyList lat={attraction.location.lat} lng={attraction.location.lng} />
          </div>
        </div>
      </div>
    </div>
  );
}
