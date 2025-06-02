import { useState } from "react";
import { Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TokenValidationResult {
  valid: boolean;
  botInfo?: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
  };
  error?: string;
}

export default function TokenInput() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<TokenValidationResult | null>(null);
  const { toast } = useToast();

  const validateToken = async () => {
    if (!token.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a bot token",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await apiRequest("POST", "/api/validate-token", { token });
      const result = await response.json();
      
      setValidationResult(result);
      
      if (result.valid) {
        toast({
          title: "Token Validated!",
          description: `Successfully connected to ${result.botInfo.username}`,
        });
        
        // Enable template section
        const templateSection = document.getElementById('template-section');
        if (templateSection) {
          templateSection.classList.remove('opacity-50', 'pointer-events-none');
          templateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to validate token";
      setValidationResult({ valid: false, error: errorMessage });
      
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  return (
    <Card className="bg-discord-dark border-discord-light mb-8">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
            <Shield className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Step 1: Add Your Bot Token</h3>
            <p className="text-discord-text-muted">Enter your Discord bot token to get started</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-discord-text-muted mb-2">
              Bot Token <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your Discord bot token here..."
                className="bg-discord-medium border-discord-light text-white placeholder-discord-text-dark focus:border-primary pr-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isValidating) {
                    validateToken();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleTokenVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-discord-text-muted hover:text-white"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-discord-text-muted mt-2 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Don't have a token?{" "}
              <a 
                href="https://discord.com/developers/applications" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Learn how to create one
              </a>
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              {validationResult && (
                <div className="flex items-center space-x-2">
                  {validationResult.valid ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-green-500 text-sm">
                        Connected to {validationResult.botInfo?.username}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-500 text-sm">
                        {validationResult.error}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <Button 
              onClick={validateToken}
              disabled={isValidating || !token.trim()}
              className={`${
                validationResult?.valid 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "discord-gradient"
              }`}
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Validating...
                </>
              ) : validationResult?.valid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Validated
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Validate Token
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
