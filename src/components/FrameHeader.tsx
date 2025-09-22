import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft } from "lucide-react";

interface FrameHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline";
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function FrameHeader({
  title,
  description,
  badge,
  badgeVariant = "secondary",
  onBack,
  actions,
}: FrameHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{title}</h1>
              {badge && (
                <Badge variant={badgeVariant}>{badge}</Badge>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}