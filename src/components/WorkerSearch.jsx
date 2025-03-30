
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Phone, MapPin, User, Search, DollarSign, GraduationCap, Briefcase, SlidersHorizontal } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

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
  const isMobile = useIsMobile();

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

  const clearFilters = () => {
    setSkills('');
    setCity('');
    setState('');
    setRating('');
    setPriceRange([0, 100]);
    setYearsOfExperience('');
    setEducation('');
  };

  const FiltersContent = () => (
    <div className="space-y-5 p-1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="skills" className="text-sm font-medium">Skills</Label>
          <Select value={skills} onValueChange={setSkills}>
            <SelectTrigger id="skills" className="w-full">
              <SelectValue placeholder="Select skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any skill</SelectItem>
              {skillOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">City</Label>
          <Input
            id="city"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium">State</Label>
          <Input
            id="state"
            placeholder="Enter state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Advanced Filters</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <Label htmlFor="rating" className="text-sm">Minimum Rating</Label>
            </div>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger id="rating" className="w-full">
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any rating</SelectItem>
                <SelectItem value="3">3+ stars</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <Label className="text-sm">Hourly Rate Range ($ per hour)</Label>
            </div>
            <div className="pt-2 px-2">
              <Slider 
                value={priceRange} 
                onValueChange={handlePriceRangeChange} 
                min={0} 
                max={100} 
                step={5}
                className="w-full"
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
                <Label htmlFor="experience" className="text-sm">Years of Experience</Label>
              </div>
              <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
                <SelectTrigger id="experience" className="w-full">
                  <SelectValue placeholder="Any experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any experience</SelectItem>
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
                <Label htmlFor="education" className="text-sm">Education Level</Label>
              </div>
              <Select value={education} onValueChange={setEducation}>
                <SelectTrigger id="education" className="w-full">
                  <SelectValue placeholder="Any education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any education</SelectItem>
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
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters} 
            className="mr-2"
          >
            Clear Filters
          </Button>
          {isMobile && (
            <DrawerClose asChild>
              <Button size="sm">Apply Filters</Button>
            </DrawerClose>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search workers by name, skills or location..."
                className="pl-10 pr-20 h-12 text-base md:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10"
                disabled={isSearching || isLoading}
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {isMobile ? (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" type="button" className="w-full flex items-center justify-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="px-4 pb-6">
                  <DrawerHeader className="pt-6 px-0">
                    <DrawerTitle>Filter Workers</DrawerTitle>
                  </DrawerHeader>
                  <FiltersContent />
                </DrawerContent>
              </Drawer>
            ) : (
              <Collapsible>
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>{showAdvancedFilters ? "Hide Filters" : "Show Filters"}</span>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <Button type="submit" disabled={isSearching || isLoading}>
                    {isSearching ? "Searching..." : "Search Workers"}
                  </Button>
                </div>
                
                <CollapsibleContent className="pt-4">
                  <FiltersContent />
                </CollapsibleContent>
              </Collapsible>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Workers Results */}
      {workers.length > 0 && (
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="py-4 px-6 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Search Results</CardTitle>
              <Badge variant="outline" className="font-normal">
                {workers.length} worker{workers.length !== 1 && 's'} found
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workers.map((worker) => (
                <Card key={worker._id} className="overflow-hidden border hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{worker.name}</h3>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" />
                          <span>{worker.rating?.toFixed(1) || 'N/A'} ({worker.ratingCount || 0} reviews)</span>
                        </div>
                      </div>
                      <Badge variant={worker.brokerId ? "outline" : "secondary"} className="ml-2">
                        {worker.brokerId ? "Broker Managed" : "Independent"}
                      </Badge>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2.5">
                      {worker.address && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {[worker.address.city, worker.address.state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {worker.hourlyRate && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                          <span className="font-medium">${worker.hourlyRate}/hr</span>
                        </div>
                      )}
                      
                      {worker.yearsOfExperience && (
                        <div className="flex items-center text-sm">
                          <Briefcase className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                          <span>{worker.yearsOfExperience} {worker.yearsOfExperience === 1 ? 'year' : 'years'} experience</span>
                        </div>
                      )}
                      
                      {worker.education && (
                        <div className="flex items-center text-sm">
                          <GraduationCap className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                          <span>{worker.education}</span>
                        </div>
                      )}
                      
                      {!worker.brokerId && worker.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span>{worker.phone}</span>
                        </div>
                      )}
                      
                      {worker.brokerId && (
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">Managed by a broker</span>
                        </div>
                      )}
                    </div>
                    
                    {worker.skills && worker.skills.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {worker.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkerSearch;
