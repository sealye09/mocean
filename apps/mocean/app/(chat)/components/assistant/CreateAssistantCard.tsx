import { Bot, Plus, Sparkles, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CreateAssistantCardProps {
  onClick: () => void;
}

const CreateAssistantCard: React.FC<CreateAssistantCardProps> = ({
  onClick,
}) => {
  return (
    <Card
      className="group cursor-pointer border-2 border-dashed border-muted-foreground/25 bg-muted/20 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="flex items-center p-6">
        <div className="flex w-full items-center space-x-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-transform duration-200 group-hover:scale-110">
              <Plus className="h-6 w-6" />
            </div>

            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-lg transition-transform duration-200 group-hover:rotate-12">
              <Bot className="h-2 w-2 text-blue-500" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">
              创建新助手
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              设计专属于你的AI助手，定制独特的对话体验
            </p>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Wand2 className="mr-1 h-3 w-3" />
                自定义
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                智能
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Bot className="mr-1 h-3 w-3" />
                专业
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateAssistantCard;
