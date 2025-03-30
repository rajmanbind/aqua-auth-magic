
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Phone, MapPin, User, Search, DollarSign, GraduationCap, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const skillOptions = [
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'painting', label: 'Painting' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'furniture', label: 'Furniture' }
];

const educationOptions = [
  { value: 'high_school', label: 'High School' },
  { value: 'associate', label: 'Associate Degree' },
  { value: 'bachelor', label: 'Bachelor\'s Degree' },
  { value: 'master', label: 'Master\'s Degree' },
  { value: 'phd', label: 'PhD' },
  { value: 'vocational', label: 'Vocational Training' },
  { value: 'certification', label: 'Professional Certification' }
];

const WorkerSearch = () => {
  // Main search input
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [skills, setSkills] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [rating, setRating] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]); // Min and max hourly rate
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [education, setEducation] = useState('');
  
  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    title: '',
    description: '',
    location: { address: '', city: '', state: '' }
  });

  // Search workers query
  const { data: workers = [], refetch, isLoading } = useQuery({
    queryKey: ['workers', searchQuery, skills, city, state, rating, priceRange, yearsOfExperience, education],
    queryFn: async () => {
      setIsSearching(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append('query', searchQuery);
        if (skills) queryParams.append('skills', skills);
        if (city) queryParams.append('city', city);
        if (state) queryParams.append('state', state);
        if (rating) queryParams.append('rating', rating);
        if (priceRange[0] > 0 || priceRange[1] < 100) {
          queryParams.append('minPrice', priceRange[0].toString());
          queryParams.append('maxPrice', priceRange[1].toString());
        }
        if (yearsOfExperience) queryParams.append('experience', yearsOfExperience);
        if (education) queryParams.append('education', education);

        const response = await fetch(`/api/users/search?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Search failed');
        
        return await response.json();
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "Failed to search for workers. Please try again.",
          variant: "destructive"
        });
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    enabled: false // Don't fetch on component mount
  });

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const handlePriceRangeChange = (values) => {
    setPriceRange(values);
  };

  const handleSelectWorker = (worker) => {
    setSelectedWorker(worker);
    setBookingDetails({
      ...bookingDetails,
      workerId: worker._id
    });
  };

  const handleBookNow = async () => {
    try {
      if (!bookingDetails.title || !bookingDetails.description) {
        toast({
          title: "Missing Information",
          description: "Please provide a title and description for your booking.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId: selectedWorker._id,
          brokerId: selectedWorker.brokerId,
          title: bookingDetails.title,
          description: bookingDetails.description,
          category: skills || 'other',
          location: bookingDetails.location
        }),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const data = await response.json();
      
      toast({
        title: "Booking Successful",
        description: selectedWorker.brokerId 
          ? "The broker has been notified and will assign the worker to your task."
          : "The worker has been notified and will contact you soon.",
      });

      // Reset selection and details
      setSelectedWorker(null);
      setBookingDetails({
        title: '',
        description: '',
        location: { address: '', city: '', state: '' }
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Error",
        description: "Failed to book the worker. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Workers</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for workers by name, skills, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Select value={skills} onValueChange={setSkills}>
                  <SelectTrigger id="skills">
                    <SelectValue placeholder="Select skills" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm"
              >
                {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
              </Button>
              
              <Button type="submit" disabled={isSearching || isLoading}>
                {isSearching ? "Searching..." : "Search Workers"}
              </Button>
            </div>
            
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="space-y-4 pt-2 border-t mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <Label htmlFor="rating">Minimum Rating</Label>
                  </div>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger id="rating">
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any rating</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <Label>Hourly Rate Range ($ per hour)</Label>
                  </div>
                  <div className="pt-4 px-2">
                    <Slider 
                      value={priceRange} 
                      onValueChange={handlePriceRangeChange} 
                      min={0} 
                      max={100} 
                      step={5}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}{priceRange[1] === 100 ? '+ ' : ''}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <Label htmlFor="experience">Years of Experience</Label>
                    </div>
                    <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
                      <SelectTrigger id="experience">
                        <SelectValue placeholder="Any experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any experience</SelectItem>
                        <SelectItem value="1">1+ year</SelectItem>
                        <SelectItem value="3">3+ years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                        <SelectItem value="10">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-purple-600" />
                      <Label htmlFor="education">Education Level</Label>
                    </div>
                    <Select value={education} onValueChange={setEducation}>
                      <SelectTrigger id="education">
                        <SelectValue placeholder="Any education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any education</SelectItem>
                        {educationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Workers Results */}
      {workers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workers.map((worker) => (
                <Card key={worker._id} className={`overflow-hidden border ${selectedWorker?._id === worker._id ? 'border-2 border-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{worker.name}</CardTitle>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          <span>{worker.rating.toFixed(1)} ({worker.ratingCount} reviews)</span>
                        </div>
                      </div>
                      <Badge variant={worker.brokerId ? "outline" : "secondary"}>
                        {worker.brokerId ? "Broker Managed" : "Independent"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {worker.address && (
                      <div className="flex items-center text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>
                          {[worker.address.city, worker.address.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {worker.skills && worker.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {worker.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {worker.hourlyRate && (
                      <div className="flex items-center text-sm mb-2">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        <span>${worker.hourlyRate}/hr</span>
                      </div>
                    )}
                    
                    {worker.yearsOfExperience && (
                      <div className="flex items-center text-sm mb-2">
                        <Briefcase className="h-4 w-4 mr-1 text-blue-600" />
                        <span>{worker.yearsOfExperience} {worker.yearsOfExperience === 1 ? 'year' : 'years'} experience</span>
                      </div>
                    )}
                    
                    {worker.education && (
                      <div className="flex items-center text-sm mb-2">
                        <GraduationCap className="h-4 w-4 mr-1 text-purple-600" />
                        <span>{worker.education}</span>
                      </div>
                    )}
                    
                    {!worker.brokerId && worker.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{worker.phone}</span>
                      </div>
                    )}
                    
                    {worker.brokerId && (
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Managed by a broker</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleSelectWorker(worker)} 
                      variant={selectedWorker?._id === worker._id ? "default" : "outline"}
                      className="w-full"
                    >
                      {selectedWorker?._id === worker._id ? "Selected" : "Select Worker"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Form for Selected Worker */}
      {selectedWorker && (
        <Card>
          <CardHeader>
            <CardTitle>Book {selectedWorker.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="E.g., Fix kitchen cabinet"
                  value={bookingDetails.title}
                  onChange={(e) => setBookingDetails({...bookingDetails, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Task Description</Label>
                <Input
                  id="description"
                  placeholder="Describe what you need done"
                  value={bookingDetails.description}
                  onChange={(e) => setBookingDetails({...bookingDetails, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Your address"
                  value={bookingDetails.location.address}
                  onChange={(e) => setBookingDetails({
                    ...bookingDetails, 
                    location: {...bookingDetails.location, address: e.target.value}
                  })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="location-city"
                    placeholder="City"
                    value={bookingDetails.location.city}
                    onChange={(e) => setBookingDetails({
                      ...bookingDetails, 
                      location: {...bookingDetails.location, city: e.target.value}
                    })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="location-state"
                    placeholder="State"
                    value={bookingDetails.location.state}
                    onChange={(e) => setBookingDetails({
                      ...bookingDetails, 
                      location: {...bookingDetails.location, state: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedWorker(null)}>
              Cancel
            </Button>
            <Button onClick={handleBookNow}>
              Book Now
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default WorkerSearch;
