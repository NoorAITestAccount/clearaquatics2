import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Droplets, Filter, Calendar, Edit, Trash2 } from 'lucide-react';
import { useAquariumData, type Aquarium, type MaintenanceRecord } from '../hooks/useAquariumData';
import { toast } from 'sonner@2.0.3';

interface MaintenanceManagerProps {
  aquarium: Aquarium;
  isOpen: boolean;
  onClose: () => void;
}

type MaintenanceFormData = {
  type: 'water_change' | 'filter_maintenance';
  date: string;
  notes: string;
  // Water change fields
  percentageChanged: string;
  // Filter maintenance fields
  filterType: 'rinse' | 'replace';
  filterMedia: string;
};

export function MaintenanceManager({ aquarium, isOpen, onClose }: MaintenanceManagerProps) {
  const { maintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord } = useAquariumData();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    type: 'water_change',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    percentageChanged: '25',
    filterType: 'rinse',
    filterMedia: ''
  });

  const currentRecords = maintenanceRecords
    .filter(r => r.aquariumId === aquarium.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const waterChangeRecords = currentRecords.filter(r => r.type === 'water_change');
  const filterMaintenanceRecords = currentRecords.filter(r => r.type === 'filter_maintenance');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }

    if (formData.type === 'water_change' && !formData.percentageChanged) {
      toast.error('Please enter the percentage changed');
      return;
    }

    if (formData.type === 'filter_maintenance' && !formData.filterMedia) {
      toast.error('Please specify the filter media');
      return;
    }

    const baseRecord = {
      aquariumId: aquarium.id,
      type: formData.type,
      date: formData.date,
      notes: formData.notes
    };

    if (formData.type === 'water_change') {
      const percentage = parseInt(formData.percentageChanged);
      const volumeChanged = (aquarium.volume * percentage) / 100;
      
      addMaintenanceRecord({
        ...baseRecord,
        percentageChanged: percentage,
        volumeChanged: volumeChanged
      });
      
      toast.success(`Water change recorded: ${percentage}% (${volumeChanged.toFixed(1)} gallons)`);
    } else {
      addMaintenanceRecord({
        ...baseRecord,
        filterType: formData.filterType,
        filterMedia: formData.filterMedia
      });
      
      toast.success(`Filter maintenance recorded: ${formData.filterType === 'rinse' ? 'Cleaned' : 'Replaced'} ${formData.filterMedia}`);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'water_change',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      percentageChanged: '25',
      filterType: 'rinse',
      filterMedia: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleDelete = (record: MaintenanceRecord) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      deleteMaintenanceRecord(record.id);
      toast.success('Maintenance record deleted');
    }
  };

  const formatMaintenanceDescription = (record: MaintenanceRecord) => {
    if (record.type === 'water_change') {
      return `${record.percentageChanged}% water change (${record.volumeChanged?.toFixed(1)} gal)`;
    } else {
      return `${record.filterType === 'rinse' ? 'Cleaned' : 'Replaced'} ${record.filterMedia}`;
    }
  };

  const getMaintenanceIcon = (type: string) => {
    return type === 'water_change' ? 
      <Droplets className="h-6 w-6" /> : 
      <Filter className="h-6 w-6" />;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[75vw] max-w-none max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <Calendar className="h-7 w-7" />
              Maintenance Log for {aquarium.name}
            </DialogTitle>
            <DialogDescription className="text-base">
              Track water changes and filter maintenance for your {aquarium.type} aquarium ({aquarium.volume} gallons)
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Badge variant="outline" className="capitalize text-base px-4 py-2">
                  {aquarium.type}
                </Badge>
                <span className="text-base text-muted-foreground">
                  {currentRecords.length} maintenance records
                </span>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="text-base px-6 py-3">
                <Plus className="h-6 w-6 mr-3" />
                Add Maintenance
              </Button>
            </div>

            {currentRecords.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Calendar className="h-16 w-16 text-muted-foreground mb-6" />
                  <h3 className="font-semibold mb-3 text-xl">No Maintenance Records Yet</h3>
                  <p className="text-muted-foreground text-center mb-6 text-base">
                    Start tracking your aquarium maintenance to keep it healthy.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="text-base px-6 py-3">
                    <Plus className="h-6 w-6 mr-3" />
                    Add First Record
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Water Changes Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                    <Droplets className="h-6 w-6" />
                    Water Changes ({waterChangeRecords.length})
                  </h3>
                  {waterChangeRecords.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground text-base">No water changes recorded yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                      {waterChangeRecords.map((record) => (
                        <Card key={record.id}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-3 text-base">
                                <Droplets className="h-6 w-6" />
                                {formatMaintenanceDescription(record)}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(record)}
                                className="text-base px-4 py-2"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                            <CardDescription className="text-base">
                              {new Date(record.date).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          {record.notes && (
                            <CardContent className="pt-0">
                              <p className="text-base text-muted-foreground">{record.notes}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filter Maintenance Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                    <Filter className="h-6 w-6" />
                    Filter Maintenance ({filterMaintenanceRecords.length})
                  </h3>
                  {filterMaintenanceRecords.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground text-base">No filter maintenance recorded yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                      {filterMaintenanceRecords.map((record) => (
                        <Card key={record.id}>
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-3 text-base">
                                <Filter className="h-6 w-6" />
                                {formatMaintenanceDescription(record)}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(record)}
                                className="text-base px-4 py-2"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                            <CardDescription className="text-base">
                              {new Date(record.date).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          {record.notes && (
                            <CardContent className="pt-0">
                              <p className="text-base text-muted-foreground">{record.notes}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Maintenance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[60vw] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Maintenance Record</DialogTitle>
            <DialogDescription className="text-base">
              Record maintenance performed on {aquarium.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Maintenance Type */}
              <div className="space-y-3">
                <Label htmlFor="type" className="text-base">Maintenance Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'water_change' | 'filter_maintenance') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="text-base py-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water_change" className="text-base">
                      <div className="flex items-center gap-3">
                        <Droplets className="h-5 w-5" />
                        Water Change
                      </div>
                    </SelectItem>
                    <SelectItem value="filter_maintenance" className="text-base">
                      <div className="flex items-center gap-3">
                        <Filter className="h-5 w-5" />
                        Filter Maintenance
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-3">
                <Label htmlFor="date" className="text-base">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="text-base py-3"
                />
              </div>

              {/* Water Change Specific Fields */}
              {formData.type === 'water_change' && (
                <div className="space-y-3">
                  <Label htmlFor="percentage" className="text-base">Percentage Changed (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentageChanged}
                    onChange={(e) => setFormData(prev => ({ ...prev, percentageChanged: e.target.value }))}
                    placeholder="25"
                    required
                    className="text-base py-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.percentageChanged && !isNaN(parseInt(formData.percentageChanged)) && 
                      `≈ ${((aquarium.volume * parseInt(formData.percentageChanged)) / 100).toFixed(1)} gallons`
                    }
                  </p>
                </div>
              )}

              {/* Filter Maintenance Specific Fields */}
              {formData.type === 'filter_maintenance' && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="filterType" className="text-base">Action Performed</Label>
                    <Select 
                      value={formData.filterType} 
                      onValueChange={(value: 'rinse' | 'replace') => 
                        setFormData(prev => ({ ...prev, filterType: value }))
                      }
                    >
                      <SelectTrigger className="text-base py-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rinse" className="text-base">Cleaned/Rinsed</SelectItem>
                        <SelectItem value="replace" className="text-base">Replaced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="filterMedia" className="text-base">Filter Media/Component</Label>
                    <Input
                      id="filterMedia"
                      value={formData.filterMedia}
                      onChange={(e) => setFormData(prev => ({ ...prev, filterMedia: e.target.value }))}
                      placeholder="e.g., Bio sponge, Carbon cartridge, Ceramic rings"
                      required
                      className="text-base py-3"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional details about the maintenance..."
                  className="text-base"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="text-base px-6 py-3"
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-base px-6 py-3">
                  Add Maintenance Record
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}