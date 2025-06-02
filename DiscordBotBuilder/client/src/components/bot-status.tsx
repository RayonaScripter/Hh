import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Activity, Trash2, ExternalLink, AlertCircle, CheckCircle2, Clock, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/websocket";
import type { Bot as BotType } from "@shared/schema";

interface BotStatus {
  id: number;
  name: string;
  status: string;
  lastSeen: string | null;
  inviteUrl: string | null;
  isRunning: boolean;
  guildCount: number;
}

export default function BotStatus() {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bots, isLoading } = useQuery<BotType[]>({
    queryKey: ["/api/bots"],
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // WebSocket for real-time updates
  useWebSocket((message) => {
    if (message.type === 'bot_status_change' && message.botId) {
      // Invalidate and refetch bot data when status changes
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: [`/api/bots/${message.botId}/status`] });
      
      // Show toast notification for status changes
      if (message.status === 'online') {
        toast({
          title: "Bot Online",
          description: `Your bot is now online and ready to use.`,
        });
      } else if (message.status === 'error') {
        toast({
          title: "Bot Error",
          description: message.data?.error || "Bot encountered an error",
          variant: "destructive",
        });
      } else if (message.status === 'offline') {
        toast({
          title: "Bot Offline",
          description: "Your bot has gone offline",
          variant: "destructive",
        });
      }
    }
  });

  useEffect(() => {
    // Show the component when bots exist
    if (bots && bots.length > 0) {
      setIsVisible(true);
    }
  }, [bots]);

  const deleteBot = async (botId: number) => {
    try {
      await apiRequest("DELETE", `/api/bots/${botId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      
      toast({
        title: "Bot Deleted",
        description: "Bot has been stopped and removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Delete Bot",
        description: error.message || "An error occurred while deleting the bot",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'deploying':
        return <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-discord-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'deploying':
        return 'bg-blue-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-discord-text-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'deploying':
        return 'Deploying';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="bg-discord-dark border-discord-light">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Activity className="w-5 h-5 mr-2" />
          Your Bots
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-discord-medium rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : bots && bots.length > 0 ? (
          <div className="space-y-4">
            {bots.map((bot) => (
              <div 
                key={bot.id} 
                className="flex items-center justify-between p-4 bg-discord-medium rounded-lg border border-discord-light hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 discord-gradient rounded-full flex items-center justify-center">
                      <Bot className="text-white text-xl" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(bot.status)} rounded-full border-2 border-discord-medium`} />
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium">{bot.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-discord-text-muted">
                      {getStatusIcon(bot.status)}
                      <span>{getStatusText(bot.status)}</span>
                      {bot.status === 'online' && (
                        <>
                          <span>•</span>
                          <Wifi className="w-3 h-3" />
                          <span>Last seen {formatLastSeen(bot.lastSeen)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className={`${
                      bot.status === 'online' ? 'bg-green-500/20 text-green-500' :
                      bot.status === 'deploying' ? 'bg-blue-500/20 text-blue-500' :
                      bot.status === 'error' ? 'bg-red-500/20 text-red-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}
                  >
                    {getStatusText(bot.status)}
                  </Badge>
                  
                  {bot.inviteUrl && bot.status === 'online' && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="border-discord-light text-discord-text-muted hover:text-white hover:border-primary"
                    >
                      <a href={bot.inviteUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteBot(bot.id)}
                    className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 text-discord-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Bots Deployed</h3>
            <p className="text-discord-text-muted">
              Deploy your first bot using the interface above
            </p>
          </div>
        )}
        
        {bots && bots.length > 0 && (
          <div className="mt-6 pt-4 border-t border-discord-light">
            <div className="flex items-center justify-between text-sm text-discord-text-muted">
              <span>Total Bots: {bots.length}</span>
              <span>
                Online: {bots.filter(bot => bot.status === 'online').length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
