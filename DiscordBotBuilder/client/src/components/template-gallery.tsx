import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Music, Wrench, Gamepad2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Template } from "@shared/schema";

const categoryIcons = {
  moderation: Shield,
  music: Music,
  utility: Wrench,
  fun: Gamepad2,
};

const categoryColors = {
  moderation: "from-red-500 to-red-600",
  music: "from-purple-500 to-purple-600", 
  utility: "from-blue-500 to-blue-600",
  fun: "from-green-500 to-green-600",
};

export default function TemplateGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const filteredTemplates = templates?.filter(template => 
    selectedCategory === "all" || template.category === selectedCategory
  ) || [];

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "moderation", label: "Moderation" },
    { id: "music", label: "Music" },
    { id: "utility", label: "Utility" },
    { id: "fun", label: "Fun" },
  ];

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    
    // Enable deployment section
    const deploySection = document.getElementById('deploy-section');
    if (deploySection) {
      deploySection.classList.remove('opacity-50', 'pointer-events-none');
    }
  };

  const proceedToDeployment = () => {
    if (!selectedTemplate) return;
    
    const deploySection = document.getElementById('deploy-section');
    if (deploySection) {
      deploySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card id="template-section" className="bg-discord-dark border-discord-light mb-8 opacity-50 pointer-events-none">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-discord-medium rounded-lg flex items-center justify-center mr-4">
            <Wrench className="text-discord-text-muted" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Step 2: Choose Your Template</h3>
            <p className="text-discord-text-muted">Select a pre-built bot template to customize</p>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`${
                selectedCategory === category.id 
                  ? "discord-gradient text-white" 
                  : "bg-discord-medium text-discord-text-muted hover:text-white"
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* Template Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-discord-medium border-discord-light">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredTemplates.map((template) => {
              const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons];
              const colorClass = categoryColors[template.category as keyof typeof categoryColors];
              
              return (
                <Card 
                  key={template.id}
                  className={`bg-discord-medium border-discord-light hover:border-primary transition-all cursor-pointer ${
                    selectedTemplate?.id === template.id 
                      ? 'ring-2 ring-primary bg-primary/10' 
                      : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center`}>
                          {IconComponent && <IconComponent className="text-white text-xl" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{template.name}</h4>
                          <p className="text-discord-text-muted text-sm">{template.description}</p>
                        </div>
                      </div>
                      {template.isPopular && (
                        <Badge className="bg-primary text-white">Popular</Badge>
                      )}
                      {template.isPremium && (
                        <Badge className="bg-yellow-500 text-black">Premium</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {(template.features as string[]).slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-discord-text-muted">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-500 text-sm">Ready to deploy</span>
                      </div>
                      <div className="text-primary font-medium">
                        {template.price > 0 ? `$${(template.price / 100).toFixed(2)}/month` : 'Free'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
        <div className="text-center">
          <Button 
            onClick={proceedToDeployment}
            disabled={!selectedTemplate}
            className="discord-gradient px-8 py-3"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Continue with Selected Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
