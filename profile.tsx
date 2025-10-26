import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Attraction, Review } from "@shared/schema";
import AttractionCard from "@/components/attraction-card";
import { useState } from "react";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"favorites" | "reviews">("favorites");

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<Attraction[]>({
    queryKey: ["/api/users", user?.id, "favorites"],
    enabled: !!user?.id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/users", user?.id, "reviews"],
    enabled: !!user?.id,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-6xl text-muted-foreground mb-4"></i>
          <h1 className="text-3xl font-bold mb-2">Please Login</h1>
          <p className="text-muted-foreground mb-4">You need to be logged in to view your profile.</p>
          <button onClick={() => setLocation("/")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg" data-testid="button-go-home">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-2xl p-8 border border-border">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-4xl">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">{user.username}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-1">Member since 2024</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("favorites")}
                className={`pb-4 border-b-2 font-semibold ${
                  activeTab === "favorites" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-tab-favorites"
              >
                <i className="fas fa-heart mr-2"></i>
                Favorites ({favorites.length})
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-4 border-b-2 font-semibold ${
                  activeTab === "reviews" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-tab-reviews"
              >
                <i className="fas fa-star mr-2"></i>
                My Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              {favoritesLoading ? (
                <div className="text-center py-12">
                  <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                  <p className="text-muted-foreground">Loading favorites...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-heart text-6xl text-muted-foreground mb-4"></i>
                  <p className="text-xl text-muted-foreground mb-4">No favorites yet</p>
                  <button onClick={() => setLocation("/explore")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg" data-testid="button-explore">
                    Explore Attractions
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              {reviewsLoading ? (
                <div className="text-center py-12">
                  <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                  <p className="text-muted-foreground">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-star text-6xl text-muted-foreground mb-4"></i>
                  <p className="text-xl text-muted-foreground mb-4">No reviews yet</p>
                  <button onClick={() => setLocation("/explore")} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg" data-testid="button-explore-reviews">
                    Explore Attractions
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-background rounded-xl p-6 border border-border" data-testid={`review-card-${review.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg">Attraction ID: {review.attractionId}</h3>
                        <div className="flex text-chart-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={i < review.rating ? "fas fa-star" : "far fa-star"}></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">{review.comment}</p>
                      <p className="text-sm text-muted-foreground">Posted {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
