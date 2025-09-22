import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useAquariumData } from '../hooks/useAquariumData';

interface AquariumSelectorProps {
  selectedAquarium: string | null;
  onSelectAquarium: (aquariumId: string | null) => void;
  showLabel?: boolean;
  className?: string;
}

export function AquariumSelector({ 
  selectedAquarium, 
  onSelectAquarium, 
  showLabel = true,
  className = ""
}: AquariumSelectorProps) {
  const { aquariums, waterParameters } = useAquariumData();

  const getAquariumWarnings = (aquariumId: string) => {
    const params = waterParameters.filter(p => p.aquariumId === aquariumId);
    return params.filter(param => param.status === 'warning' || param.status === 'critical').length;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">Select Aquarium:</span>
      )}
      <Select value={selectedAquarium || ''} onValueChange={(value) => onSelectAquarium(value || null)}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select an aquarium" />
        </SelectTrigger>
        <SelectContent>
          {aquariums.map((aquarium) => {
            const warnings = getAquariumWarnings(aquarium.id);
            return (
              <SelectItem key={aquarium.id} value={aquarium.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{aquarium.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({aquarium.volume} gal)
                    </span>
                  </div>
                  {warnings > 0 && (
                    <Badge variant="destructive" className="text-xs ml-2">
                      {warnings}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}