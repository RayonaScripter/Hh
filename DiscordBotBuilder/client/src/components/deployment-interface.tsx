import { useState } from "react";
import { Rocket, Settings, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/websocket";

interface DeploymentStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export default function DeploymentInterface() {
  const [botName, setBotName] = useState("");
  const [commandPrefix, setCommandPrefix] = useState("!");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    { id: 'validate', label: 'Validating bot token...', status: 'pending' },
    { id: 'setup', label: 'Setting up bot instance...', status: 'pending' },
    { id: 'configure', label: 'Configuring template...', status: 'pending' },
    { id: 'start', label: 'Starting bot services...', status: 'pending' },
  ]);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deployedBot, setDeployedBot] = useState<any>(null);
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  useWebSocket((message) => {
    if (message.type === 'bot_status_change') {
      const { status, data } = message;
      
      if (status === 'deploying') {
        updateDeploymentStep('validate', 'running');
      } else if (status === 'online') {
        // Complete all steps
        setDeploymentSteps(prev => 
          prev.map(step => ({ ...step, status: 'completed' }))
        );
        setDeploymentProgress(100);
        setIsDeploying(false);
        setDeployedBot(data);
        
        toast({
          title: "Deployment Successful!",
          description: "Your bot is now online and ready to use.",
        });
      } else if (status === 'error') {
        setDeploymentSteps(prev => 
          prev.map(step => 
            step.status === 'running' 
              ? { ...step, status: 'error' }
              : step
          )
        );
        setIsDeploying(false);
        
        toast({
          title: "Deployment Failed",
          description: data?.error || "An error occurred during deployment",
          variant: "destructive",
        });
      }
    }
  });

  const updateDeploymentStep = (stepId: string, status: DeploymentStep['status']) => {
    setDeploymentSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
    
    // Update progress
    const completedSteps = deploymentSteps.filter(s => s.status === 'completed').length;
    const runningSteps = deploymentSteps.filter(s => s.status === 'running').length;
    const progress = (completedSteps / deploymentSteps.length) * 100;
    setDeploymentProgress(progress);
  };

  const deployBot = async () => {
    if (!botName.trim()) {
      toast({
        title: "Bot Name Required",
        description: "Please enter a name for your bot",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentProgress(0);
    setDeployedBot(null);
    
    // Reset steps
    setDeploymentSteps(prev => 
      prev.map(step => ({ ...step, status: 'pending' }))
    );

    try {
      // Get token from previous step (this would normally be passed via state management)
      const tokenInput = document.querySelector('input[type="password"], input[type="text"]') as HTMLInputElement;
      const token = tokenInput?.value;
      
      if (!token) {
        throw new Error("Bot token not found. Please validate your token first.");
      }

      // Get selected template (this would normally be passed via state management)
      const selectedTemplateCard = document.querySelector('.ring-2.ring-primary');
      if (!selectedTemplateCard) {
        throw new Error("No template selected. Please choose a template first.");
      }

      const templateName = selectedTemplateCard.querySelector('h4')?.textContent;
      let templateId = 'moderation-pro'; // default
      
      switch (templateName) {
        case 'Music Master':
          templateId = 'music-master';
          break;
        case 'Utility Hub':
        case 'MultiTool':
          templateId = 'utility-hub';
          break;
        case 'Fun Zone':
        case 'GameHub':
          templateId = 'fun-zone';
          break;
      }

      const botData = {
        name: botName,
        token,
        templateId,
        config: {
          prefix: commandPrefix,
          name: botName,
        },
      };

      const response = await apiRequest("POST", "/api/bots", botData);
      const bot = await response.json();
      
      // Deployment progress will be updated via WebSocket
      
    } catch (error: any) {
      setIsDeploying(false);
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy bot",
        variant: "destructive",
      });
    }
  };

  const getStepIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-discord-text-muted" />;
    }
  };

  return (
    <Card id="deploy-section" className="bg-discord-dark border-discord-light mb-8 opacity-50 pointer-events-none">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-discord-medium rounded-lg flex items-center justify-center mr-4">
            <Rocket className="text-discord-text-muted" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Step 3: Deploy Your Bot</h3>
            <p className="text-discord-text-muted">Review settings and launch your bot</p>
          </div>
        </div>
        
        {!isDeploying && !deployedBot && (
          <>
            {/* Configuration */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-discord-text-muted mb-2">
                    Bot Name
                  </label>
                  <Input
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="My Discord Bot"
                    className="bg-discord-medium border-discord-light text-white placeholder-discord-text-dark focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-discord-text-muted mb-2">
                    Command Prefix
                  </label>
                  <Input
                    value={commandPrefix}
                    onChange={(e) => setCommandPrefix(e.target.value)}
                    placeholder="!"
                    maxLength={3}
                    className="bg-discord-medium border-discord-light text-white placeholder-discord-text-dark focus:border-primary"
                  />
                </div>
              </div>
              
              <Card className="bg-discord-medium border-discord-light">
                <CardContent className="p-4">
                  <h4 className="text-white font-medium mb-3">Selected Template</h4>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Settings className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Template Selected</p>
                      <p className="text-discord-text-muted text-sm">Ready for deployment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={deployBot}
                disabled={!botName.trim()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 px-8 py-3 text-white font-semibold transform hover:scale-105 transition-all"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy Bot Now
              </Button>
            </div>
          </>
        )}
        
        {/* Deployment Progress */}
        {isDeploying && (
          <div className="bg-discord-medium rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Deployment Progress</h4>
              <span className="text-discord-text-muted text-sm">{Math.round(deploymentProgress)}%</span>
            </div>
            
            <Progress value={deploymentProgress} className="mb-4" />
            
            <div className="space-y-3">
              {deploymentSteps.map((step) => (
                <div key={step.id} className="flex items-center text-sm">
                  <div className="mr-3">
                    {getStepIcon(step.status)}
                  </div>
                  <span className={`${
                    step.status === 'completed' ? 'text-green-500' :
                    step.status === 'running' ? 'text-primary' :
                    step.status === 'error' ? 'text-red-500' :
                    'text-discord-text-muted'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Success State */}
        {deployedBot && (
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <CheckCircle2 className="text-white text-xl" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Bot Deployed Successfully!</h4>
                <p className="text-discord-text-muted">Your bot is now online and ready to use</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="bg-discord-darker border-discord-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-discord-text-muted text-sm">Bot Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-500 text-sm">Online</span>
                    </div>
                  </div>
                  <p className="text-white font-medium">{deployedBot.botTag || 'Bot Online'}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-discord-darker border-discord-light">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-discord-text-muted text-sm">Server Count</span>
                    <span className="text-white font-medium">{deployedBot.guildCount || 0}</span>
                  </div>
                  <p className="text-discord-text-muted text-sm">Servers connected</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {deployedBot.inviteUrl && (
                <Button 
                  asChild
                  className="discord-gradient"
                >
                  <a href={deployedBot.inviteUrl} target="_blank" rel="noopener noreferrer">
                    <Rocket className="w-4 h-4 mr-2" />
                    Invite Bot to Server
                  </a>
                </Button>
              )}
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Bot Settings
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
