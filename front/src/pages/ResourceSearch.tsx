"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeContext"
import HeaderCompo from "@/pages/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  BookOpen, 
  Heart,
  Brain,
  Shield,
  Target,
  Users,
  FileText,
  ExternalLink,
  Filter,
  Star,
  PlusCircle,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { searchResources, addKnowledgeResource, type ResourceSearch, type KnowledgeResource } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Resource {
  title: string
  description: string
  category: string
  type: string
  difficulty?: string
  url?: string
  rating?: number
  tags?: string[]
  content?: string
  source?: string
}

const ResourceSearchPage = () => {
  const { theme } = useTheme()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [resources, setResources] = useState<Resource[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  
  // Form state for adding new resource
  const [newResource, setNewResource] = useState<KnowledgeResource>({
    content: "",
    category: "general",
    type: "article",
    source: ""
  })

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "cbt", label: "Cognitive Behavioral Therapy" },
    { value: "mindfulness", label: "Mindfulness & Meditation" },
    { value: "anxiety", label: "Anxiety Management" },
    { value: "depression", label: "Depression Support" },
    { value: "crisis", label: "Crisis Resources" },
    { value: "self_care", label: "Self-Care" },
    { value: "relationships", label: "Relationships" },
    { value: "trauma", label: "Trauma Recovery" },
    { value: "general", label: "General Resources" }
  ]
  
  const resourceTypes = [
    { value: "article", label: "Article" },
    { value: "technique", label: "Technique" },
    { value: "workbook", label: "Workbook" },
    { value: "program", label: "Program" },
    { value: "toolkit", label: "Toolkit" },
    { value: "exercise", label: "Exercise" },
    { value: "reference", label: "Reference" }
  ]

  // Mock resources for fallback
  const mockResources: Resource[] = [
    {
      title: "Cognitive Behavioral Therapy Techniques",
      description: "A comprehensive guide to CBT techniques for managing anxiety and depression",
      category: "cbt",
      type: "article",
      tags: ["anxiety", "depression", "therapy"]
    },
    {
      title: "Mindfulness Daily Practice Guide",
      description: "Step-by-step guide to incorporating mindfulness into your daily routine",
      category: "mindfulness",
      type: "guide",
      tags: ["meditation", "stress", "wellness"]
    },
    {
      title: "Crisis Management Toolkit",
      description: "Emergency resources and techniques for managing mental health crises",
      category: "crisis",
      type: "toolkit",
      tags: ["emergency", "support", "hotlines"]
    },
    {
      title: "Self-Care Essentials",
      description: "Fundamental self-care practices for maintaining mental wellbeing",
      category: "self_care",
      type: "article",
      tags: ["wellness", "routine", "health"]
    }
  ];
  
  // Function to use mock resources when API fails
  const useMockResources = () => {
    console.log("Using mock resources");
    let filteredResources = [...mockResources];
    
    if (category && category !== "all") {
      filteredResources = filteredResources.filter(r => r.category === category);
    }
    
    if (query.trim()) {
      const searchQuery = query.trim().toLowerCase();
      filteredResources = filteredResources.filter(r => 
        r.title.toLowerCase().includes(searchQuery) || 
        r.description.toLowerCase().includes(searchQuery) ||
        (r.tags && r.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
      );
    }
    
    setResources(filteredResources);
    setTotal(filteredResources.length);
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('mindmate_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query.trim() && (!category || category === "all")) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const searchParams: ResourceSearch = {
        query: query.trim() || category,
        category: category && category !== "all" ? category : undefined,
        limit: 10
      };
      
      console.log('Searching resources with params:', searchParams);
      
      try {
        const result = await searchResources(searchParams);
        console.log('Search result:', result);
        
        if (result && Array.isArray(result.resources)) {
          setResources(result.resources);
          setTotal(result.total || result.resources.length);
        } else {
          // If API returns invalid data, use mock resources
          console.log('API returned invalid data, using mock resources');
          useMockResources();
        }
      } catch (searchError) {
        console.error('Search API error:', searchError);
        
        // Provide fallback data using mock resources
        useMockResources();
        const fallbackResources = [
          {
            title: "Understanding Anxiety",
            description: "A comprehensive guide to understanding and managing anxiety symptoms",
            category: "anxiety",
            type: "article",
            tags: ["anxiety", "mental health", "coping strategies"]
          },
          {
            title: "Mindfulness Meditation Guide",
            description: "Step-by-step guide to practicing mindfulness meditation for stress reduction",
            category: "mindfulness",
            type: "technique",
            tags: ["meditation", "mindfulness", "stress reduction"]
          },
          {
            title: "CBT Workbook",
            description: "Interactive worksheets and exercises based on cognitive behavioral therapy",
            category: "cbt",
            type: "workbook",
            tags: ["cbt", "worksheets", "therapy"]
          }
        ];
        
        setResources(fallbackResources);
        setTotal(fallbackResources.length);
      }
    } catch (err: any) {
      console.error("Resource search failed:", err);
      setError(err.message || "Failed to search resources");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddResource = async () => {
    if (!newResource.content.trim() || !newResource.source.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await addKnowledgeResource(newResource);
      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setShowAddDialog(false);
        // Reset form
        setNewResource({
          content: "",
          category: "general",
          type: "article",
          source: ""
        });
        // Refresh resources
        handleSearch();
      }, 1500);
    } catch (err: any) {
      console.error("Failed to add resource:", err);
      setError(err.message || "Failed to add resource");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resource input changes
  const handleResourceChange = (field: keyof KnowledgeResource, value: string) => {
    setNewResource(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    // Initial search with empty query to get popular resources
    handleSearch();
  }, []);
  
  // Icon mapping for resource categories
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cbt':
        return <Brain className="h-5 w-5" />;
      case 'mindfulness':
        return <Heart className="h-5 w-5" />;
      case 'anxiety':
        return <Shield className="h-5 w-5" />;
      case 'depression':
        return <Users className="h-5 w-5" />;
      case 'crisis':
        return <AlertCircle className="h-5 w-5" />;
      case 'self_care':
        return <Heart className="h-5 w-5" />;
      case 'relationships':
        return <Users className="h-5 w-5" />;
      case 'trauma':
        return <Shield className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };
  
  // Function to render star ratings
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {Array(5).fill(0).map((_, idx) => (
          <Star 
            key={idx} 
            className={`w-4 h-4 ${idx < Math.floor(rating) 
              ? 'fill-amber-400 text-amber-400' 
              : idx < rating 
                ? 'fill-amber-400/50 text-amber-400/50' 
                : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 text-gray-900"
    }`}>
      <HeaderCompo />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"
          }`}>
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Therapeutic Resources</h1>
          <p className="text-lg opacity-80 max-w-3xl mx-auto">
            Search our curated library of evidence-based therapeutic resources, techniques, and materials
          </p>
        </div>
        
        {/* Search Form */}
        <div className={`p-6 rounded-xl ${theme === "dark" ? "bg-gray-800/50" : "bg-white shadow-lg"}`}>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </form>
          
          {isAuthenticated && (
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2" 
                onClick={() => setShowAddDialog(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Add Resource
              </Button>
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {loading ? 'Searching...' : resources.length > 0 ? `Found ${total} resources` : 'Popular Resources'}
            </h2>
            {resources.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filter by:</span>
                <Select value={category} onValueChange={(val) => {
                  setCategory(val);
                  handleSearch();
                }}>
                  <SelectTrigger className={`w-[180px] ${theme === "dark" ? "bg-gray-700 border-gray-600" : ""}`}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons
              Array(3).fill(0).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-xl p-6 animate-pulse ${
                    theme === "dark" ? "bg-gray-800" : "bg-white shadow-md"
                  }`}
                >
                  <div className="h-4 w-2/3 mb-3 rounded bg-gray-300 dark:bg-gray-600"></div>
                  <div className="h-3 w-full mb-2 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-5/6 mb-2 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-4/6 mb-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))
            ) : resources.length > 0 ? (
              resources.map((resource, idx) => (
                <Card 
                  key={idx}
                  className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    theme === "dark" ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "hover:border-blue-200"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-md ${theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                          {getCategoryIcon(resource.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{resource.title || "Untitled Resource"}</CardTitle>
                          {renderRating(resource.rating)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">
                      {resource.description || resource.content}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="capitalize">
                        {resource.type}
                      </Badge>
                      {resource.category && (
                        <Badge variant="outline" className="capitalize">
                          {resource.category.replace('_', ' ')}
                        </Badge>
                      )}
                      {resource.difficulty && (
                        <Badge variant="outline" className={
                          resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                          resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }>
                          {resource.difficulty}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {resource.tags?.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-opacity-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {resource.url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full gap-2"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Resource
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className={`col-span-3 text-center p-8 rounded-xl ${
                theme === "dark" ? "bg-gray-800" : "bg-white shadow-sm"
              }`}>
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No resources found</h3>
                <p className="opacity-70">
                  Try using different search terms or browse all categories
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Resource Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className={theme === "dark" ? "bg-gray-800 text-white border-gray-700" : ""}>
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription className={theme === "dark" ? "text-gray-400" : ""}>
              Add a new resource to the knowledge base for others to find.
            </DialogDescription>
          </DialogHeader>
          
          {addSuccess ? (
            <div className="py-10 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Resource Added Successfully</h3>
              <p className="opacity-70">Your resource has been added to the knowledge base.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content/Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={newResource.content}
                    onChange={(e) => handleResourceChange('content', e.target.value)}
                    placeholder="Enter resource content or description..."
                    className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={newResource.category} 
                      onValueChange={(val) => handleResourceChange('category', val)}
                    >
                      <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => cat.value).map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={newResource.type} 
                      onValueChange={(val) => handleResourceChange('type', val)}
                    >
                      <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Source <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newResource.source}
                    onChange={(e) => handleResourceChange('source', e.target.value)}
                    placeholder="Enter source URL or reference..."
                    className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddResource} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Resource'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ResourceSearchPage
