import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Plus, Fish, Leaf, Bug, Edit, Trash2, AlertTriangle, Search, Filter } from 'lucide-react';
import { useAquariumData, type AquaticLife } from '../hooks/useAquariumData';
import { useSpeciesDatabase, type Species } from '../hooks/useSpeciesDatabase';
import { AquariumSelector } from './AquariumSelector';
import { toast } from 'sonner@2.0.3';

export function AquaticLife() {
  const [selectedAquarium, setSelectedAquarium] = useState<string | null>(null);
  const { aquariums, aquaticLife, waterParameters, addAquaticLife, updateAquaticLife, deleteAquaticLife } = useAquariumData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLife, setEditingLife] = useState<AquaticLife | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([]);
  const [speciesCount, setSpeciesCount] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  
  const {
    species,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    waterTypeFilter,
    setWaterTypeFilter,
    getSpeciesById,
    getSpeciesByIds
  } = useSpeciesDatabase();

  const currentAquarium = selectedAquarium ? aquariums.find(a => a.id === selectedAquarium) : null;
  const currentLife = aquaticLife.filter(l => l.aquariumId === selectedAquarium);
  const currentParams = waterParameters.filter(p => p.aquariumId === selectedAquarium);

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

  // Filter species by aquarium water type
  const compatibleSpecies = species.filter(s => 
    !currentAquarium || s.waterType === currentAquarium.type
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAquarium) {
      toast.error('Please select an aquarium first');
      return;
    }

    if (selectedSpecies.length === 0) {
      toast.error('Please select at least one species');
      return;
    }

    // Add each selected species
    selectedSpecies.forEach(species => {
      const count = speciesCount[species.id] || 1;
      const lifeData: Omit<AquaticLife, 'id'> = {
        aquariumId: selectedAquarium,
        speciesId: species.id,
        count: count,
        addedDate: new Date().toISOString().split('T')[0],
        notes: notes || undefined
      };

      if (editingLife) {
        updateAquaticLife(editingLife.id, lifeData);
      } else {
        addAquaticLife(lifeData);
      }
    });

    const message = selectedSpecies.length === 1 
      ? `${selectedSpecies[0].name} added successfully`
      : `${selectedSpecies.length} species added successfully`;
    
    toast.success(message);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSpecies([]);
    setSpeciesCount({});
    setNotes('');
    setEditingLife(null);
    setIsDialogOpen(false);
    setSearchQuery('');
    setCategoryFilter('all');
    setWaterTypeFilter('all');
  };

  const handleSpeciesToggle = (species: Species) => {
    setSelectedSpecies(prev => {
      const isSelected = prev.find(s => s.id === species.id);
      if (isSelected) {
        // Remove species
        const newSelected = prev.filter(s => s.id !== species.id);
        const newCount = { ...speciesCount };
        delete newCount[species.id];
        setSpeciesCount(newCount);
        return newSelected;
      } else {
        // Add species
        setSpeciesCount(prev => ({ ...prev, [species.id]: 1 }));
        return [...prev, species];
      }
    });
  };

  const handleDelete = (life: AquaticLife) => {
    const speciesInfo = getSpeciesById(life.speciesId);
    const displayName = speciesInfo?.name || 'Unknown Species';
    
    if (confirm(`Are you sure you want to remove "${displayName}" from your aquarium?`)) {
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
      case 'fish': return <Fish className="h-5 w-5" />;
      case 'plant': return <Leaf className="h-5 w-5" />;
      case 'crustacean': return <Bug className="h-5 w-5" />;
      default: return <Fish className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Aquatic Life</h1>
        <AquariumSelector 
          selectedAquarium={selectedAquarium}
          onSelectAquarium={setSelectedAquarium}
        />
      </div>

      {!selectedAquarium ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select an aquarium to manage aquatic life.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Life Management</h2>
                <p className="text-muted-foreground">
                  Manage fish, plants, and invertebrates in {currentAquarium?.name} ({currentAquarium?.type})
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Life
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Aquatic Life</DialogTitle>
                    <DialogDescription>
                      Select species from our database. All compatibility requirements are automatically included.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Search and Filters */}
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search species..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="fish">Fish</SelectItem>
                            <SelectItem value="plant">Plants</SelectItem>
                            <SelectItem value="crustacean">Crustaceans</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={waterTypeFilter} onValueChange={setWaterTypeFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Waters</SelectItem>
                            <SelectItem value="freshwater">Freshwater</SelectItem>
                            <SelectItem value="saltwater">Saltwater</SelectItem>
                            <SelectItem value="brackish">Brackish</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedSpecies.length > 0 && (
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold mb-2">Selected Species ({selectedSpecies.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedSpecies.map(species => (
                              <Badge key={species.id} variant="secondary" className="flex items-center gap-2">
                                {species.name}
                                <Input
                                  type="number"
                                  min="1"
                                  value={speciesCount[species.id] || 1}
                                  onChange={(e) => setSpeciesCount(prev => ({ 
                                    ...prev, 
                                    [species.id]: parseInt(e.target.value) || 1 
                                  }))}
                                  className="w-16 h-6 text-xs"
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Species Grid */}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
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
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(species.category)}
                                <Checkbox checked={!!isSelected} readOnly />
                              </div>
                              <Badge variant="outline" className={getDifficultyColor(species.requirements.difficulty)}>
                                {species.requirements.difficulty}
                              </Badge>
                            </div>
                            <h4 className="font-medium">{species.name}</h4>
                            <p className="text-xs text-muted-foreground italic mb-2">{species.scientificName}</p>
                            <div className="space-y-1 text-xs">
                              <div>pH: {species.requirements.minPh} - {species.requirements.maxPh}</div>
                              <div>Temp: {species.requirements.minTemp}°F - {species.requirements.maxTemp}°F</div>
                              {species.requirements.minTankSize && (
                                <div>Min Tank: {species.requirements.minTankSize} gal</div>
                              )}
                            </div>
                            {species.description && (
                              <p className="text-xs text-muted-foreground mt-2">{species.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {compatibleSpecies.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No species match your current filters.</p>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes about care, behavior, etc."
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={selectedSpecies.length === 0}>
                        Add {selectedSpecies.length > 0 ? `${selectedSpecies.length} Species` : 'Life'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {currentLife.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Fish className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Aquatic Life Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add fish, plants, or invertebrates from our species database to track their requirements.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Life
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentLife.map((life) => {
                const speciesInfo = getSpeciesById(life.speciesId);
                const warnings = checkCompatibility(life);
                
                if (!speciesInfo) {
                  return (
                    <Card key={life.id} className="border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Species Not Found</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Species data missing (ID: {life.speciesId})
                        </p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(life)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={life.id} className={warnings.length > 0 ? 'border-orange-200' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getTypeIcon(speciesInfo.category)}
                          {speciesInfo.name}
                        </CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(life)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="italic">
                        {speciesInfo.scientificName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="capitalize">
                            {speciesInfo.category}
                          </Badge>
                          <span className="text-sm font-medium">
                            Count: {life.count}
                          </span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Added: {new Date(life.addedDate).toLocaleDateString()}
                        </div>
                        
                        <Badge variant="outline" className={getDifficultyColor(speciesInfo.requirements.difficulty)}>
                          {speciesInfo.requirements.difficulty}
                        </Badge>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Requirements:</h4>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>pH: {speciesInfo.requirements.minPh} - {speciesInfo.requirements.maxPh}</div>
                            <div>Temp: {speciesInfo.requirements.minTemp}°F - {speciesInfo.requirements.maxTemp}°F</div>
                            {speciesInfo.requirements.minTankSize && (
                              <div>Min Tank: {speciesInfo.requirements.minTankSize} gallons</div>
                            )}
                            <div>Social: {speciesInfo.requirements.socialBehavior}</div>
                          </div>
                        </div>

                        {warnings.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-medium">Compatibility Issues</span>
                            </div>
                            <div className="text-xs text-orange-600 space-y-1">
                              {warnings.map((warning, index) => (
                                <div key={index}>• {warning}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {life.notes && (
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Notes:</h4>
                            <p className="text-xs text-muted-foreground">{life.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5" />
                  Fish
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentLife.filter(l => {
                    const species = getSpeciesById(l.speciesId);
                    return species?.category === 'fish';
                  }).reduce((sum, l) => sum + l.count, 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentLife.filter(l => {
                    const species = getSpeciesById(l.speciesId);
                    return species?.category === 'fish';
                  }).length} species
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Plants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentLife.filter(l => {
                    const species = getSpeciesById(l.speciesId);
                    return species?.category === 'plant';
                  }).reduce((sum, l) => sum + l.count, 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentLife.filter(l => {
                    const species = getSpeciesById(l.speciesId);
                    return species?.category === 'plant';
                  }).length} species
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Crustaceans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentLife.filter(l => {
                    const species = getSpeciesById(l.speciesId);
                    return species?.category === 'crustacean';
                  }).reduce((sum, l) => sum + l.count, 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentLife.filter(l => {
                    const species = getSpeciesById(l.speciesId);
                    return species?.category === 'crustacean';
                  }).length} species
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}