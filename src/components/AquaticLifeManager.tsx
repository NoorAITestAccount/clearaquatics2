import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Plus, Fish, Leaf, Bug, AlertTriangle, Search, Trash2 } from 'lucide-react';
import { useAquariumData, type AquaticLife, type Aquarium } from '../hooks/useAquariumData';
import { useSpeciesDatabase, type Species } from '../hooks/useSpeciesDatabase';
import { toast } from 'sonner@2.0.3';

interface AquaticLifeManagerProps {
  aquarium: Aquarium;
  isOpen: boolean;
  onClose: () => void;
}

export function AquaticLifeManager({ aquarium, isOpen, onClose }: AquaticLifeManagerProps) {
  const { aquaticLife, waterParameters, addAquaticLife, updateAquaticLife, deleteAquaticLife } = useAquariumData();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([]);
  
  // Local state for the dialog filters to avoid infinite loops
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localCategoryFilter, setLocalCategoryFilter] = useState('all');
  
  const { species, getSpeciesById } = useSpeciesDatabase();

  const currentLife = aquaticLife.filter(l => l.aquariumId === aquarium.id);
  const currentParams = waterParameters.filter(p => p.aquariumId === aquarium.id);

  // Get latest parameters for compatibility checking
  const latestParams = currentParams.reduce((acc, param) => {
    const existing = acc.find(p => p.parameter === param.parameter);
    if (!existing || new Date(param.date) > new Date(existing.date)) {
      const index = acc.findIndex(p => p.parameter === param.parameter);
      if (index >= 0) {
        acc[index] = param;
      } else {
        acc.push(param);
      }
    }
    return acc;
  }, [] as typeof currentParams);

  const currentPh = latestParams.find(p => p.parameter === 'ph')?.value;
  const currentTemp = latestParams.find(p => p.parameter === 'temperature')?.value;

  // Filter species by aquarium water type and local filters
  const compatibleSpecies = species.filter(s => {
    const matchesWaterType = s.waterType === aquarium.type;
    const matchesSearch = !localSearchQuery || 
      s.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(localSearchQuery.toLowerCase());
    const matchesCategory = localCategoryFilter === 'all' || s.category === localCategoryFilter;
    
    return matchesWaterType && matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSpecies.length === 0) {
      toast.error('Please select at least one species');
      return;
    }

    // Add each selected species
    selectedSpecies.forEach(species => {
      const lifeData: Omit<AquaticLife, 'id'> = {
        aquariumId: aquarium.id,
        speciesId: species.id,
        addedDate: new Date().toISOString().split('T')[0]
      };

      addAquaticLife(lifeData);
    });

    const message = selectedSpecies.length === 1 
      ? `${selectedSpecies[0].name} added successfully`
      : `${selectedSpecies.length} species added successfully`;
    
    toast.success(message);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSpecies([]);
    setIsAddDialogOpen(false);
    setLocalSearchQuery('');
    setLocalCategoryFilter('all');
  };

  const handleSpeciesToggle = (species: Species) => {
    setSelectedSpecies(prev => {
      const isSelected = prev.find(s => s.id === species.id);
      if (isSelected) {
        // Remove species
        return prev.filter(s => s.id !== species.id);
      } else {
        // Add species
        return [...prev, species];
      }
    });
  };

  const handleDelete = (life: AquaticLife) => {
    const speciesInfo = getSpeciesById(life.speciesId);
    const displayName = speciesInfo?.name || 'Unknown Species';
    
    if (confirm(`Are you sure you want to remove "${displayName}" from ${aquarium.name}?`)) {
      deleteAquaticLife(life.id);
      toast.success('Aquatic life removed');
    }
  };

  const checkCompatibility = (life: AquaticLife) => {
    const warnings: string[] = [];
    const speciesInfo = getSpeciesById(life.speciesId);
    
    if (!speciesInfo) return warnings;
    
    if (currentPh) {
      if (currentPh < speciesInfo.requirements.minPh) {
        warnings.push(`pH too low (${currentPh} < ${speciesInfo.requirements.minPh})`);
      }
      if (currentPh > speciesInfo.requirements.maxPh) {
        warnings.push(`pH too high (${currentPh} > ${speciesInfo.requirements.maxPh})`);
      }
    }

    if (currentTemp) {
      if (currentTemp < speciesInfo.requirements.minTemp) {
        warnings.push(`Temperature too low (${currentTemp}°F < ${speciesInfo.requirements.minTemp}°F)`);
      }
      if (currentTemp > speciesInfo.requirements.maxTemp) {
        warnings.push(`Temperature too high (${currentTemp}°F > ${speciesInfo.requirements.maxTemp}°F)`);
      }
    }

    return warnings;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fish': return <Fish className="h-7 w-7" />;
      case 'plant': return <Leaf className="h-7 w-7" />;
      case 'crustacean': return <Bug className="h-7 w-7" />;
      default: return <Fish className="h-7 w-7" />;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[75vw] max-w-none max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <Fish className="h-7 w-7" />
              Aquatic Life in {aquarium.name}
            </DialogTitle>
            <DialogDescription className="text-base">
              Manage fish, plants, and invertebrates in your {aquarium.type} aquarium ({aquarium.volume} gallons)
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Badge variant="outline" className="capitalize text-base px-4 py-2">
                  {aquarium.type}
                </Badge>
                <span className="text-base text-muted-foreground">
                  {currentLife.length} species
                </span>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="text-base px-6 py-3 mr-4">
                <Plus className="h-6 w-6 mr-3" />
                Add Life
              </Button>
            </div>

            {currentLife.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Fish className="h-16 w-16 text-muted-foreground mb-6" />
                  <h3 className="font-semibold mb-3 text-xl">No Aquatic Life Yet</h3>
                  <p className="text-muted-foreground text-center mb-6 text-base">
                    Add fish, plants, or invertebrates from our species database.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="text-base px-6 py-3">
                    <Plus className="h-6 w-6 mr-3" />
                    Add First Life
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                {currentLife.map((life) => {
                  const speciesInfo = getSpeciesById(life.speciesId);
                  const warnings = checkCompatibility(life);
                  
                  if (!speciesInfo) {
                    return (
                      <Card key={life.id} className="border-red-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 text-red-600 mb-3">
                            <AlertTriangle className="h-6 w-6" />
                            <span className="font-medium text-base">Species Not Found</span>
                          </div>
                          <p className="text-base text-muted-foreground mb-6">
                            Species data missing (ID: {life.speciesId})
                          </p>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(life)}
                            className="text-base px-6 py-3"
                          >
                            <Trash2 className="h-6 w-6 mr-3" />
                            Remove
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <Card key={life.id} className={`max-w-xs ${warnings.length > 0 ? 'border-orange-200' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {getTypeIcon(speciesInfo.category)}
                            {speciesInfo.name}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(life)}
                            className="px-2 py-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription className="flex items-center justify-between">
                          <span className="italic">{speciesInfo.scientificName}</span>
                          <Badge variant="secondary" className="capitalize px-2 py-1 ml-2">
                            {speciesInfo.category}
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3">
                        <div className="space-y-2">
                          <div className="text-muted-foreground">
                            Added: {new Date(life.addedDate).toLocaleDateString()}
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-medium">Requirements:</h4>
                            <div className="text-muted-foreground space-y-1">
                              <div>pH: {speciesInfo.requirements.minPh} - {speciesInfo.requirements.maxPh}</div>
                              <div>Temp: {speciesInfo.requirements.minTemp}°F - {speciesInfo.requirements.maxTemp}°F</div>
                              {speciesInfo.requirements.minTankSize && (
                                <div>Min Tank: {speciesInfo.requirements.minTankSize} gallons</div>
                              )}
                              <div>Social: {speciesInfo.requirements.socialBehavior}</div>
                            </div>
                          </div>

                          {warnings.length > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Compatibility Issues</span>
                              </div>
                              <div className="text-orange-600 space-y-1">
                                {warnings.map((warning, index) => (
                                  <div key={index}>• {warning}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Species Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Aquatic Life to {aquarium.name}</DialogTitle>
            <DialogDescription className="text-base">
              Select species compatible with your {aquarium.type} aquarium. Requirements are automatically checked.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search species..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="pl-10 text-base py-2"
                  />
                </div>
                <Select value={localCategoryFilter} onValueChange={setLocalCategoryFilter}>
                  <SelectTrigger className="w-48 text-base py-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-base">All Types</SelectItem>
                    <SelectItem value="fish" className="text-base">Fish</SelectItem>
                    <SelectItem value="plant" className="text-base">Plants</SelectItem>
                    <SelectItem value="crustacean" className="text-base">Crustaceans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedSpecies.length > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold mb-3 text-base">Selected Species ({selectedSpecies.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpecies.map(species => (
                      <Badge key={species.id} variant="secondary" className="text-base px-3 py-1">
                        {species.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Species Grid - Scrollable Area */}
            <div className="flex-1 min-h-0">
              <div className="h-80 overflow-y-auto border rounded-lg p-3">
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {compatibleSpecies.map((species) => {
                    const isSelected = selectedSpecies.find(s => s.id === species.id);
                    return (
                      <div
                        key={species.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleSpeciesToggle(species)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(species.category)}
                            <Checkbox checked={!!isSelected} readOnly className="h-4 w-4" />
                          </div>
                        </div>
                        <h4 className="font-medium">{species.name}</h4>
                        <p className="text-muted-foreground italic mb-2">{species.scientificName}</p>
                        <div className="space-y-1">
                          <div>pH: {species.requirements.minPh} - {species.requirements.maxPh}</div>
                          <div>Temp: {species.requirements.minTemp}°F - {species.requirements.maxTemp}°F</div>
                          {species.requirements.minTankSize && (
                            <div>Min Tank: {species.requirements.minTankSize} gal</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {compatibleSpecies.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No species match your current filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Button Area */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm} className="text-base px-6 py-3">
                Cancel
              </Button>
              <Button type="submit" disabled={selectedSpecies.length === 0} className="text-base px-6 py-3">
                Add {selectedSpecies.length > 0 ? `${selectedSpecies.length} Species` : 'Life'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}