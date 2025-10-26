import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Attraction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "nature",
    description: "",
    address: "",
    lat: "",
    lng: "",
    images: "",
    price: "free",
    distance: "",
    hours: "",
    phone: "",
    website: "",
    amenities: "",
  });

  const { data: attractions = [], isLoading: attractionsLoading } = useQuery<Attraction[]>({
    queryKey: ["/api/attractions"],
  });

  const deleteAttractionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/attractions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete attraction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
      toast({ title: "Success", description: "Attraction deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createAttractionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/attractions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
      toast({ title: "Success", description: "Attraction created successfully" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAttractionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/attractions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update attraction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
      toast({ title: "Success", description: "Attraction updated successfully" });
      setEditingAttraction(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "nature",
      description: "",
      address: "",
      lat: "",
      lng: "",
      images: "",
      price: "free",
      distance: "",
      hours: "",
      phone: "",
      website: "",
      amenities: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const attractionData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      location: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        address: formData.address,
      },
      images: formData.images.split(",").map((s) => s.trim()),
      price: formData.price,
      distance: parseFloat(formData.distance),
      hours: formData.hours || undefined,
      phone: formData.phone || undefined,
      website: formData.website || undefined,
      amenities: formData.amenities ? formData.amenities.split(",").map((s) => s.trim()) : [],
    };

    if (editingAttraction) {
      updateAttractionMutation.mutate({ id: editingAttraction.id, data: attractionData });
    } else {
      createAttractionMutation.mutate(attractionData);
    }
  };

  const handleEdit = (attraction: Attraction) => {
    setEditingAttraction(attraction);
    setFormData({
      name: attraction.name,
      category: attraction.category,
      description: attraction.description,
      address: attraction.location.address,
      lat: attraction.location.lat.toString(),
      lng: attraction.location.lng.toString(),
      images: attraction.images.join(", "),
      price: attraction.price,
      distance: attraction.distance.toString(),
      hours: attraction.hours || "",
      phone: attraction.phone || "",
      website: attraction.website || "",
      amenities: attraction.amenities?.join(", ") || "",
    });
    setIsAddDialogOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-destructive mb-4"></i>
          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          <button
            onClick={() => setLocation("/")}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg"
            data-testid="button-go-home"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-muted min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <i className="fas fa-map-marked-alt text-3xl text-chart-1"></i>
              <span className="text-3xl font-bold">{attractions.length}</span>
            </div>
            <p className="text-muted-foreground">Total Attractions</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <i className="fas fa-users text-3xl text-chart-2"></i>
              <span className="text-3xl font-bold">
                {attractions.reduce((sum, a) => sum + a.reviewCount, 0)}
              </span>
            </div>
            <p className="text-muted-foreground">Total Reviews</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <i className="fas fa-star text-3xl text-chart-3"></i>
              <span className="text-3xl font-bold">
                {attractions.length > 0
                  ? (
                      attractions.reduce((sum, a) => sum + a.averageRating, 0) / attractions.length
                    ).toFixed(1)
                  : "0.0"}
              </span>
            </div>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <i className="fas fa-chart-line text-3xl text-chart-4"></i>
              <span className="text-3xl font-bold">Live</span>
            </div>
            <p className="text-muted-foreground">Platform Status</p>
          </div>
        </div>

        {/* Manage Attractions */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Manage Attractions</h3>
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) {
                  setEditingAttraction(null);
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground" data-testid="button-add-attraction">
                  <i className="fas fa-plus mr-2"></i>Add New Attraction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAttraction ? "Edit Attraction" : "Add New Attraction"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nature">Nature</SelectItem>
                        <SelectItem value="museum">Museum</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="dining">Dining</SelectItem>
                        <SelectItem value="historic">Historic</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      data-testid="textarea-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitude *</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                        required
                        data-testid="input-lat"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude *</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                        required
                        data-testid="input-lng"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      data-testid="input-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="images">Images (comma-separated URLs) *</Label>
                    <Input
                      id="images"
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      required
                      data-testid="input-images"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Select
                        value={formData.price}
                        onValueChange={(value) => setFormData({ ...formData, price: value })}
                      >
                        <SelectTrigger data-testid="select-price">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="$">$ (Under $20)</SelectItem>
                          <SelectItem value="$$">$$ ($20-$50)</SelectItem>
                          <SelectItem value="$$$">$$$ (Over $50)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="distance">Distance (miles) *</Label>
                      <Input
                        id="distance"
                        type="number"
                        step="0.1"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        required
                        data-testid="input-distance"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="e.g., Mon-Fri: 9AM-5PM"
                      data-testid="input-hours"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        data-testid="input-phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="www.example.com"
                        data-testid="input-website"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                    <Input
                      id="amenities"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      placeholder="Free Parking, WiFi, Pet Friendly"
                      data-testid="input-amenities"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingAttraction(null);
                        resetForm();
                      }}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAttractionMutation.isPending || updateAttractionMutation.isPending}
                      data-testid="button-save"
                    >
                      {createAttractionMutation.isPending || updateAttractionMutation.isPending
                        ? "Saving..."
                        : editingAttraction
                          ? "Update"
                          : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Attractions Table */}
          <div className="overflow-x-auto">
            {attractionsLoading ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                <p className="text-muted-foreground">Loading attractions...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 font-semibold">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold">Reviews</th>
                    <th className="text-left py-3 px-4 font-semibold">Price</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attractions.map((attraction) => (
                    <tr
                      key={attraction.id}
                      className="border-b border-border hover:bg-muted transition-colors"
                      data-testid={`row-attraction-${attraction.id}`}
                    >
                      <td className="py-3 px-4 font-medium">{attraction.name}</td>
                      <td className="py-3 px-4 text-muted-foreground capitalize">
                        {attraction.category}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <i className="fas fa-star text-chart-3 mr-1"></i>
                          <span>{attraction.averageRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{attraction.reviewCount}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {attraction.price === "free" ? "Free" : attraction.price}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(attraction)}
                          className="text-primary hover:underline mr-3"
                          data-testid={`button-edit-${attraction.id}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${attraction.name}"?`)) {
                              deleteAttractionMutation.mutate(attraction.id);
                            }
                          }}
                          className="text-destructive hover:underline"
                          disabled={deleteAttractionMutation.isPending}
                          data-testid={`button-delete-${attraction.id}`}
                        >
                          {deleteAttractionMutation.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
