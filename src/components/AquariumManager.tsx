import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Droplets } from 'lucide-react';
import { useAquariumData, type Aquarium } from '../hooks/useAquariumData';
import { toast } from 'sonner@2.0.3';

export function AquariumManager() {
  const { aquariums, addAquarium, updateAquarium, deleteAquarium } = useAquariumData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAquarium, setEditingAquarium] = useState<Aquarium | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    volume: '',
    type: 'freshwater' as const,
    setupDate: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.volume || !formData.setupDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const aquariumData = {
      name: formData.name,
      volume: parseInt(formData.volume),
      type: formData.type,
      setupDate: formData.setupDate,
      description: formData.description
    };

    if (editingAquarium) {
      updateAquarium(editingAquarium.id, aquariumData);
      toast.success('Aquarium updated successfully');
    } else {
      addAquarium(aquariumData);
      toast.success('Aquarium added successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      volume: '',
      type: 'freshwater',
      setupDate: '',
      description: ''
    });
    setEditingAquarium(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (aquarium: Aquarium) => {
    setFormData({
      name: aquarium.name,
      volume: aquarium.volume.toString(),
      type: aquarium.type,
      setupDate: aquarium.setupDate,
      description: aquarium.description || ''
    });
    setEditingAquarium(aquarium);
    setIsDialogOpen(true);
  };

  const handleDelete = (aquarium: Aquarium) => {
    if (confirm(`Are you sure you want to delete "${aquarium.name}"? This will also delete all associated data.`)) {
      deleteAquarium(aquarium.id);
      if (selectedAquarium === aquarium.id) {
        onSelectAquarium(null);
      }
      toast.success('Aquarium deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Aquarium Management</h2>
            <p className="text-muted-foreground">
              Manage your aquariums and select which one to monitor
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Aquarium
              </Button>
              </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAquarium ? 'Edit Aquarium' : 'Add New Aquarium'}
              </DialogTitle>
              <DialogDescription>
                {editingAquarium 
                  ? 'Update the details of your aquarium'
                  : 'Add a new aquarium to start tracking its parameters'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Community Tank"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume (gal) *</Label>
                  <Input
                    id="volume"
                    type="number"
                    value={formData.volume}
                    onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                    placeholder="75"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freshwater">Freshwater</SelectItem>
                      <SelectItem value="saltwater">Saltwater</SelectItem>
                      <SelectItem value="brackish">Brackish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setupDate">Setup Date *</Label>
                <Input
                  id="setupDate"
                  type="date"
                  value={formData.setupDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, setupDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of your aquarium setup"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAquarium ? 'Update' : 'Add'} Aquarium
                </Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {aquariums.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Droplets className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Aquariums Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first aquarium to start tracking water parameters and aquatic life.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Aquarium
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aquariums.map((aquarium) => (
            <Card 
              key={aquarium.id} 
              className="transition-colors hover:bg-accent/50"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    {aquarium.name}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(aquarium);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(aquarium);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {aquarium.volume} gal • {aquarium.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Setup Date:</span>
                    <span>{new Date(aquarium.setupDate).toLocaleDateString()}</span>
                  </div>
                  {aquarium.description && (
                    <p className="text-sm text-muted-foreground">
                      {aquarium.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={aquarium.type === 'freshwater' ? 'default' : 'secondary'}>
                      {aquarium.type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}