import { Bot, Shield, Music, Wrench, Gamepad2, Sparkles, Rocket, Play, CheckCircle2, Users, Activity, Clock } from "lucide-react";
import TokenInput from "@/components/token-input";
import TemplateGallery from "@/components/template-gallery";
import DeploymentInterface from "@/components/deployment-interface";
import BotStatus from "@/components/bot-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const scrollToTokenSection = () => {
    document.getElementById('token-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTemplates = () => {
    document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-discord-darker">
      {/* Header */}
      <header className="bg-discord-dark border-b border-discord-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 discord-gradient rounded-lg flex items-center justify-center">
                <Bot className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold text-white">BotForge</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={scrollToTemplates}
                className="text-discord-text-muted hover:text-white transition-colors"
              >
                Templates
              </button>
              <a href="#how-it-works" className="text-discord-text-muted hover:text-white transition-colors">
                How it Works
              </a>
              <Button onClick={scrollToTokenSection} className="discord-gradient">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <Badge variant="secondary" className="mb-8 bg-discord-medium text-discord-text-muted">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Create powerful Discord bots in minutes
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Build Discord Bots
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent block">
                Without Code
              </span>
            </h1>
            
            <p className="text-xl text-discord-text-muted max-w-3xl mx-auto mb-12 leading-relaxed">
              Choose from our premium templates, add your bot token, and deploy instantly. 
              No coding skills required - just point, click, and launch your Discord bot.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                onClick={scrollToTokenSection}
                className="discord-gradient text-lg px-8 py-4 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Creating Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 border-discord-light text-discord-text-muted hover:text-white hover:border-primary"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50k+</div>
                <div className="text-discord-text-muted">Bots Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">25+</div>
                <div className="text-discord-text-muted">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-discord-text-muted">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-discord-text-muted">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-discord-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple 3-Step Process</h2>
            <p className="text-xl text-discord-text-muted max-w-2xl mx-auto">
              Get your Discord bot up and running in under 5 minutes
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="bg-discord-medium border-discord-light relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 discord-gradient rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Shield className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Add Bot Token</h3>
                <p className="text-discord-text-muted">
                  Paste your Discord bot token to authenticate and connect your bot
                </p>
              </CardContent>
            </Card>
            
            {/* Step 2 */}
            <Card className="bg-discord-medium border-discord-light relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 discord-gradient rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Bot className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Choose Template</h3>
                <p className="text-discord-text-muted">
                  Select from our collection of professionally designed bot templates
                </p>
              </CardContent>
            </Card>
            
            {/* Step 3 */}
            <Card className="bg-discord-medium border-discord-light relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 discord-gradient rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Rocket className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Deploy & Launch</h3>
                <p className="text-discord-text-muted">
                  Click deploy and your bot goes live instantly with full hosting included
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bot Creation Interface */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="token-section">
            <TokenInput />
          </div>
          <TemplateGallery />
          <DeploymentInterface />
          <BotStatus />
        </div>
      </section>

      {/* Templates Gallery */}
      <section id="templates-section" className="py-20 bg-discord-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Premium Bot Templates</h2>
            <p className="text-xl text-discord-text-muted max-w-3xl mx-auto">
              Choose from our collection of professionally designed Discord bot templates
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Template previews */}
            <Card className="bg-discord-medium border-discord-light hover:border-primary transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Shield className="text-white text-xl" />
                  </div>
                  <Badge className="bg-primary text-white">Popular</Badge>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">Guardian Bot</h3>
                <p className="text-discord-text-muted text-sm mb-4">Advanced server protection with AI-powered content filtering</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    AI Content Moderation
                  </div>
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Advanced Auto-Mod Rules
                  </div>
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Detailed Analytics Dashboard
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-primary font-semibold">Free</div>
                  <Button size="sm" className="discord-gradient">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-discord-medium border-discord-light hover:border-primary transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Music className="text-white text-xl" />
                  </div>
                  <Badge variant="secondary" className="bg-yellow-500 text-black">Premium</Badge>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">Harmony Pro</h3>
                <p className="text-discord-text-muted text-sm mb-4">Professional music streaming with premium features</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Lossless Audio Quality
                  </div>
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Multi-Platform Support
                  </div>
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Custom Playlists & DJ Mode
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-primary font-semibold">$14.99/month</div>
                  <Button size="sm" className="discord-gradient">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-discord-medium border-discord-light hover:border-primary transition-all transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Wrench className="text-white text-xl" />
                  </div>
                  <Badge className="bg-green-500 text-white">Free</Badge>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">MultiTool</h3>
                <p className="text-discord-text-muted text-sm mb-4">Essential utilities for server management</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Server Management Tools
                  </div>
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Role & Permission Manager
                  </div>
                  <div className="flex items-center text-sm text-discord-text-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Custom Commands System
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-green-500 font-semibold">Free Forever</div>
                  <Button size="sm" className="discord-gradient">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-discord-darker border-t border-discord-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 discord-gradient rounded-lg flex items-center justify-center">
                  <Bot className="text-white text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-white">BotForge</h3>
              </div>
              <p className="text-discord-text-muted mb-6 max-w-md">
                The easiest way to create, deploy, and manage Discord bots. No coding required.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-discord-text-muted hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="text-discord-text-muted hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-discord-text-muted hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-discord-text-muted hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-discord-text-muted hover:text-white transition-colors">Discord Server</a></li>
                <li><a href="#" className="text-discord-text-muted hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-discord-light mt-8 pt-8 text-center">
            <p className="text-discord-text-muted text-sm">
              © 2024 BotForge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
