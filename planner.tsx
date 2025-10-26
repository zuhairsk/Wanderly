import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Attraction } from "@shared/schema";
import AttractionCard from "@/components/attraction-card";
import AnimatedBackground from "@/components/animated-background";
import FloatingElements3D from "@/components/floating-elements-3d";
import Perspective3DBackground from "@/components/perspective-3d-background";
import LiveWallpaper from "@/components/live-wallpaper";
import PaymentPage from "@/components/payment-page";
import ConfirmationPage from "@/components/confirmation-page";
import { useReducedMotion, usePerformanceMode } from "@/hooks/use-performance";

interface BookingItem {
  id: string;
  name: string;
  category: string;
  price: string;
  date: string;
  time: string;
  quantity: number;
  image: string;
  location: string;
}

interface TripPlan {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  attractions: Attraction[];
  totalCost: number;
  bestTime: string;
  transportMode: string;
}

const budgetRanges = [
  { value: "budget", label: "Budget (₹0-5,000)", min: 0, max: 5000 },
  { value: "moderate", label: "Moderate (₹5,000-15,000)", min: 5000, max: 15000 },
  { value: "luxury", label: "Luxury (₹15,000+)", min: 15000, max: 50000 },
];

const transportOptions = [
  { value: "metro", label: "Metro/Train", icon: "fas fa-subway", costMultiplier: 1 },
  { value: "bus", label: "Bus", icon: "fas fa-bus", costMultiplier: 0.8 },
  { value: "auto", label: "Auto-rickshaw", icon: "fas fa-motorcycle", costMultiplier: 1.5 },
  { value: "cab", label: "Cab/Taxi", icon: "fas fa-taxi", costMultiplier: 2.5 },
  { value: "car", label: "Private Car", icon: "fas fa-car", costMultiplier: 3 },
];

const bestTravelTimes = {
  "delhi": "October to March (Pleasant weather)",
  "mumbai": "November to February (Cool and dry)",
  "bangalore": "October to March (Mild climate)",
  "chennai": "November to February (Cool season)",
  "kolkata": "October to March (Pleasant weather)",
  "hyderabad": "October to March (Cool season)",
  "tirupati": "October to March (Pleasant weather)",
  "default": "October to March (Best weather across India)"
};

export default function Planner() {
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [budget, setBudget] = useState("moderate");
  const [transportMode, setTransportMode] = useState("metro");
  const [destination, setDestination] = useState("");
  const [savedPlans, setSavedPlans] = useState<TripPlan[]>([]);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  
  // Payment states
  const [currentStep, setCurrentStep] = useState<"planning" | "payment" | "confirmation">("planning");
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  const [paymentId, setPaymentId] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  // Performance and accessibility hooks
  const reducedMotion = useReducedMotion();
  const performanceMode = usePerformanceMode();

  // Handle URL parameters for pre-selecting attractions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const attractionId = urlParams.get('attraction');
    if (attractionId) {
      setSelectedAttractions([attractionId]);
    }
  }, []);

  const { data: attractions = [], isLoading } = useQuery<Attraction[]>({
    queryKey: ["/api/attractions"],
  });

  // Calculate trip duration
  const tripDuration = startDate && endDate 
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate estimated costs
  const selectedAttractionsData = attractions.filter(attr => selectedAttractions.includes(attr.id));
  const baseCost = selectedAttractionsData.reduce((total, attr) => {
    const price = attr.price === "free" ? 0 : 
                  attr.price === "$" ? 200 : 
                  attr.price === "$$" ? 500 : 1000;
    return total + price;
  }, 0);

  const transportCost = baseCost * (transportOptions.find(t => t.value === transportMode)?.costMultiplier || 1);
  const accommodationCost = travelers * tripDuration * 1000; // ₹1000 per person per day
  const foodCost = travelers * tripDuration * 500; // ₹500 per person per day
  const totalCost = transportCost + accommodationCost + foodCost;

  // Get best travel time for destination
  const getBestTravelTime = (dest: string) => {
    const key = dest.toLowerCase();
    return bestTravelTimes[key as keyof typeof bestTravelTimes] || bestTravelTimes.default;
  };

  // Save trip plan
  const saveTripPlan = () => {
    if (!tripName || !startDate || !endDate || selectedAttractions.length === 0) {
      alert("Please fill in all required fields and select at least one attraction");
      return;
    }

    const newPlan: TripPlan = {
      id: Date.now().toString(),
      name: tripName,
      destination,
      startDate,
      endDate,
      travelers,
      budget,
      attractions: selectedAttractionsData,
      totalCost,
      bestTime: getBestTravelTime(destination),
      transportMode: transportOptions.find(t => t.value === transportMode)?.label || "Metro/Train"
    };

    const updatedPlans = [...savedPlans, newPlan];
    setSavedPlans(updatedPlans);
    localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
    
    alert(`Trip "${tripName}" saved successfully!`);
    setTripName("");
    setStartDate("");
    setEndDate("");
    setSelectedAttractions([]);
    setDestination("");
  };

  // Load saved plans
  useEffect(() => {
    const saved = localStorage.getItem('tripPlans');
    if (saved) {
      setSavedPlans(JSON.parse(saved));
    }
  }, []);

  // Toggle attraction selection
  const toggleAttraction = (attractionId: string) => {
    setSelectedAttractions(prev => 
      prev.includes(attractionId) 
        ? prev.filter(id => id !== attractionId)
        : [...prev, attractionId]
    );
  };

  // Proceed to payment
  const proceedToPayment = () => {
    if (!tripName || !startDate || !endDate || selectedAttractions.length === 0) {
      alert("Please fill in all required fields and select at least one attraction");
      return;
    }

    const selectedAttractionsData = attractions.filter(attr => selectedAttractions.includes(attr.id));
    
    // Create booking items
    const items: BookingItem[] = selectedAttractionsData.map((attraction, index) => ({
      id: attraction.id,
      name: attraction.name,
      category: attraction.category,
      price: attraction.price,
      date: startDate,
      time: `${9 + index}:00 AM`, // Simple time assignment
      quantity: travelers,
      image: attraction.images[0] || "/placeholder-attraction.jpg",
      location: attraction.location.address || attraction.location.lat + ", " + attraction.location.lng
    }));

    setBookingItems(items);
    
    // Calculate total amount
    const subtotal = items.reduce((total, item) => {
      const priceValue = item.price === "free" ? 0 : 
                        item.price === "$" ? 300 :
                        item.price === "$$" ? 750 :
                        item.price === "$$$" ? 1500 : 0;
      return total + (priceValue * item.quantity);
    }, 0);
    
    const gst = subtotal * 0.18;
    const serviceFee = subtotal * 0.05;
    const finalTotal = subtotal + gst + serviceFee;
    
    setTotalAmount(finalTotal);
    setCurrentStep("payment");
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentId(paymentId);
    setCurrentStep("confirmation");
  };

  // Start new booking
  const startNewBooking = () => {
    setCurrentStep("planning");
    setSelectedAttractions([]);
    setTripName("");
    setStartDate("");
    setEndDate("");
    setDestination("");
    setBookingItems([]);
    setPaymentId("");
    setTotalAmount(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Payment Step */}
      {currentStep === "payment" && (
        <PaymentPage
          bookingItems={bookingItems}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={() => setCurrentStep("planning")}
        />
      )}

      {/* Confirmation Step */}
      {currentStep === "confirmation" && (
        <ConfirmationPage
          paymentId={paymentId}
          bookingItems={bookingItems}
          totalAmount={totalAmount}
          onNewBooking={startNewBooking}
        />
      )}

      {/* Planning Step */}
      {currentStep === "planning" && (
        <>
          {/* Header with 3D Background */}
          <section className="relative py-16 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <LiveWallpaper 
                variant="cosmic" 
                intensity={performanceMode === 'low' ? 'medium' : 'intense'} 
                reducedMotion={reducedMotion}
              />
              <Perspective3DBackground 
                variant="cosmic" 
                intensity={performanceMode === 'low' ? 'medium' : 'intense'} 
                reducedMotion={reducedMotion}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-primary/20"></div>
              <FloatingElements3D 
                variant="geometric" 
                intensity={performanceMode === 'low' ? 'medium' : 'intense'} 
                reducedMotion={reducedMotion}
              />
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                <i className="fas fa-calendar-plus text-primary mr-3"></i>
                Smart Trip Planner
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Plan your perfect Indian adventure with personalized recommendations
              </p>
            </div>
          </section>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Additional Live Wallpaper for main content area */}
            <div className="absolute inset-0 z-0">
              <LiveWallpaper 
                variant="nebula" 
                intensity={performanceMode === 'low' ? 'subtle' : 'medium'} 
                reducedMotion={reducedMotion}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/90"></div>
            </div>
            
            <div className="relative z-10 grid lg:grid-cols-3 gap-8">
              {/* Trip Planning Form */}
              <div className="lg:col-span-1">
                <div className="bg-card p-6 rounded-xl border border-border sticky top-8">
                  <h2 className="text-2xl font-bold mb-6">
                    <i className="fas fa-route text-primary mr-2"></i>
                    Plan Your Trip
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Trip Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Trip Name</label>
                      <input
                        type="text"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        placeholder="e.g., Delhi Heritage Tour"
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Destination */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Destination</label>
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Destination</option>
                        <option value="delhi">Delhi</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="bangalore">Bangalore</option>
                        <option value="chennai">Chennai</option>
                        <option value="kolkata">Kolkata</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="tirupati">Tirupati</option>
                      </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Travelers */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Number of Travelers</label>
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {[1,2,3,4,5,6,7,8].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Budget Range</label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {budgetRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Transport Mode */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Transport</label>
                      <div className="grid grid-cols-2 gap-2">
                        {transportOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => setTransportMode(option.value)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              transportMode === option.value
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            <i className={`${option.icon} mr-2`}></i>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trip Summary */}
                    {tripDuration > 0 && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Trip Summary</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{tripDuration} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Travelers:</span>
                            <span>{travelers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Attractions:</span>
                            <span>{selectedAttractions.length}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Estimated Cost:</span>
                            <span>₹{totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Best Travel Time */}
                    {destination && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
                          <i className="fas fa-calendar-check mr-2"></i>
                          Best Time to Visit
                        </h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {getBestTravelTime(destination)}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={proceedToPayment}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        <i className="fas fa-credit-card mr-2"></i>
                        Book & Pay Now
                      </button>
                      <button
                        onClick={saveTripPlan}
                        className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        <i className="fas fa-save mr-2"></i>
                        Save Trip Plan
                      </button>
                      <button
                        onClick={() => setShowSavedPlans(!showSavedPlans)}
                        className="w-full bg-muted text-muted-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        <i className="fas fa-history mr-2"></i>
                        {showSavedPlans ? 'Hide' : 'Show'} Saved Plans
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attractions Selection */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">
                    <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                    Select Attractions ({selectedAttractions.length} selected)
                  </h2>
                  <p className="text-muted-foreground">
                    Choose attractions for your trip. Click on cards to select/deselect.
                  </p>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2,3,4,5,6].map((i) => (
                      <div key={i} className="bg-card rounded-xl overflow-hidden shadow-md border border-border animate-pulse">
                        <div className="h-48 bg-muted"></div>
                        <div className="p-6">
                          <div className="h-6 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded mb-4"></div>
                          <div className="h-20 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {attractions.map((attraction) => (
                      <div
                        key={attraction.id}
                        onClick={() => toggleAttraction(attraction.id)}
                        className={`cursor-pointer transition-all ${
                          selectedAttractions.includes(attraction.id)
                            ? 'ring-2 ring-primary ring-offset-2'
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="relative">
                          <AttractionCard attraction={attraction} />
                          {selectedAttractions.includes(attraction.id) && (
                            <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-2 rounded-full">
                              <i className="fas fa-check"></i>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Saved Plans Section */}
            {showSavedPlans && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">
                  <i className="fas fa-history text-primary mr-2"></i>
                  Saved Trip Plans
                </h2>
                {savedPlans.length === 0 ? (
                  <div className="text-center py-12 bg-muted rounded-xl">
                    <i className="fas fa-calendar-times text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-muted-foreground">No saved trip plans yet. Create your first trip plan above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPlans.map((plan) => (
                      <div key={plan.id} className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-muted-foreground mb-4">{plan.destination}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{Math.ceil((new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Travelers:</span>
                            <span>{plan.travelers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Attractions:</span>
                            <span>{plan.attractions.length}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total Cost:</span>
                            <span>₹{plan.totalCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transport:</span>
                            <span>{plan.transportMode}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <i className="fas fa-calendar-check mr-1"></i>
                            {plan.bestTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
