import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, TestTube, AlertTriangle, CheckCircle, Droplets } from 'lucide-react';
import { useAquariumData, type Aquarium } from '../hooks/useAquariumData';
import { toast } from 'sonner@2.0.3';

interface WaterParameterManagerProps {
  aquarium: Aquarium;
  isOpen: boolean;
  onClose: () => void;
}

const parameterPresets = {
  temperature: { unit: '°F', idealMin: 75, idealMax: 79 },
  ph: { unit: '', idealMin: 6.5, idealMax: 7.5 },
  ammonia: { unit: 'ppm', idealMin: 0, idealMax: 0.25 },
  nitrate: { unit: 'ppm', idealMin: 0, idealMax: 20 },
  nitrite: { unit: 'ppm', idealMin: 0, idealMax: 0.25 },
  alkalinity: { unit: 'dKH', idealMin: 4, idealMax: 8 },
  carbonate_hardness: { unit: 'dKH', idealMin: 4, idealMax: 8 },
  general_hardness: { unit: 'dGH', idealMin: 8, idealMax: 12 },
  salinity: { unit: 'sg', idealMin: 1.020, idealMax: 1.025 },
  tds: { unit: 'ppm', idealMin: 150, idealMax: 300 }
};

// Helper function to format parameter names for display
const formatParameterName = (parameter: string) => {
  switch (parameter) {
    case 'ph': return 'pH';
    case 'tds': return 'TDS';
    case 'carbonate_hardness': return 'Carbonate Hardness';
    case 'general_hardness': return 'General Hardness';
    default: return parameter.replace('_', ' ');
  }
};

export function WaterParameterManager({ aquarium, isOpen, onClose }: WaterParameterManagerProps) {
  const { waterParameters, addWaterParameter } = useAquariumData();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Bulk form data for all parameters
  const [bulkFormData, setBulkFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    parameters: Object.keys(parameterPresets).reduce((acc, param) => {
      acc[param] = '';
      return acc;
    }, {} as Record<string, string>)
  });

  const currentParams = waterParameters.filter(p => p.aquariumId === aquarium.id);
  
  // Get latest parameters
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

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkFormData.date) {
      toast.error('Please select a test date');
      return;
    }

    // Get all filled parameters
    const filledParameters = Object.entries(bulkFormData.parameters)
      .filter(([param, value]) => value.trim() !== '')
      .map(([param, value]) => ({ param, value: parseFloat(value) }));

    if (filledParameters.length === 0) {
      toast.error('Please enter at least one parameter value');
      return;
    }

    // Add each filled parameter
    let successCount = 0;
    filledParameters.forEach(({ param, value }) => {
      const preset = parameterPresets[param as keyof typeof parameterPresets];
      if (preset && !isNaN(value)) {
        addWaterParameter({
          aquariumId: aquarium.id,
          parameter: param,
          value: value,
          unit: preset.unit,
          date: bulkFormData.date,
          idealMin: preset.idealMin,
          idealMax: preset.idealMax
        });
        successCount++;
      }
    });

    if (successCount > 0) {
      toast.success(`${successCount} water parameter${successCount > 1 ? 's' : ''} recorded`);
      resetBulkForm();
      setIsAddDialogOpen(false);
    } else {
      toast.error('No valid parameters were recorded');
    }
  };

  const resetBulkForm = () => {
    setBulkFormData({
      date: new Date().toISOString().split('T')[0],
      parameters: Object.keys(parameterPresets).reduce((acc, param) => {
        acc[param] = '';
        return acc;
      }, {} as Record<string, string>)
    });
  };

  const handleParameterChange = (parameter: string, value: string) => {
    setBulkFormData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [parameter]: value
      }
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[75vw] max-w-none max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <Droplets className="h-7 w-7" />
              Water Parameters for {aquarium.name}
            </DialogTitle>
            <DialogDescription className="text-base">
              Track and monitor water quality for your {aquarium.type} aquarium ({aquarium.volume} gallons)
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Badge variant="outline" className="capitalize text-base px-4 py-2">
                  {aquarium.type}
                </Badge>
                <span className="text-base text-muted-foreground">
                  {latestParams.length} parameters tracked
                </span>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="text-base px-6 py-3">
                <Plus className="h-6 w-6 mr-3" />
                Record Test Results
              </Button>
            </div>

            {latestParams.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <TestTube className="h-16 w-16 text-muted-foreground mb-6" />
                  <h3 className="font-semibold mb-3 text-xl">No Test Results Yet</h3>
                  <p className="text-muted-foreground text-center mb-6 text-base">
                    Start by recording your first water parameter test results.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="text-base px-6 py-3">
                    <Plus className="h-6 w-6 mr-3" />
                    Record First Test Results
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
                {latestParams.map((param) => (
                  <Card key={param.parameter} className="relative">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 capitalize text-base leading-tight">
                          <Droplets className="h-6 w-6 flex-shrink-0" />
                          <span className="min-w-0 flex-1">{formatParameterName(param.parameter)}</span>
                        </CardTitle>
                        {param.status === 'good' ? (
                          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        ) : param.status === 'warning' ? (
                          <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <CardDescription className="text-base">
                        Last tested: {new Date(param.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold">
                            {param.value}{param.unit}
                          </div>
                          <Badge 
                            variant={
                              param.status === 'good' ? 'default' : 
                              param.status === 'warning' ? 'secondary' : 
                              'destructive'
                            }
                            className="text-base px-4 py-2 mt-2"
                          >
                            {param.status === 'good' ? 'Optimal' : 
                             param.status === 'warning' ? 'Warning' : 
                             'Critical'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-base">
                            <span className="text-muted-foreground">Ideal Range:</span>
                            <span>{param.idealMin} - {param.idealMax}{param.unit}</span>
                          </div>
                          {param.status !== 'good' && (
                            <div className="text-base text-muted-foreground">
                              {param.value < param.idealMin ? 
                                `${(param.idealMin - param.value).toFixed(2)}${param.unit} below minimum` :
                                `${(param.value - param.idealMax).toFixed(2)}${param.unit} above maximum`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {latestParams.some(p => p.status !== 'good') && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-orange-800 text-lg">
                    <AlertTriangle className="h-7 w-7" />
                    Parameter Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {latestParams.filter(p => p.status !== 'good').map((param) => (
                      <div key={param.parameter} className="flex items-center justify-between p-4 bg-white rounded">
                        <span className="capitalize font-medium text-base">{formatParameterName(param.parameter)}</span>
                        <div className="text-right">
                          <div className="font-medium text-base">{param.value}{param.unit}</div>
                          <div className="text-base text-muted-foreground">
                            Should be {param.idealMin}-{param.idealMax}{param.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-orange-100 rounded text-base text-orange-800">
                    <strong>Action needed:</strong> Consider water changes, filtration adjustments, or chemical treatments to bring parameters back into optimal ranges.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Test Results Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">Bulk Water Test Results</DialogTitle>
            <DialogDescription className="text-base">
              Record multiple water quality test results for {aquarium.name}. Fill in only the parameters you tested - leave others blank.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleBulkSubmit} className="space-y-8">
              {/* Test Date */}
              <div className="space-y-3">
                <Label htmlFor="bulk-date" className="text-base">Test Date</Label>
                <Input
                  id="bulk-date"
                  type="date"
                  value={bulkFormData.date}
                  onChange={(e) => setBulkFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="max-w-xs text-base py-3"
                />
              </div>

              {/* Parameter Grid */}
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
                {Object.entries(parameterPresets).map(([parameter, preset]) => (
                  <div key={parameter} className="space-y-4 p-6 border rounded-lg">
                    <div className="space-y-3">
                      <Label htmlFor={`param-${parameter}`} className="text-base font-medium block leading-tight">
                        {formatParameterName(parameter)}
                        <span className="text-sm text-muted-foreground ml-2 block sm:inline">
                          ({preset.unit || 'no unit'})
                        </span>
                      </Label>
                      <Input
                        id={`param-${parameter}`}
                        type="number"
                        step="0.01"
                        value={bulkFormData.parameters[parameter]}
                        onChange={(e) => handleParameterChange(parameter, e.target.value)}
                        placeholder={`Enter ${parameter} value`}
                        className="text-lg py-3"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      <strong>Ideal range:</strong> {preset.idealMin} - {preset.idealMax} {preset.unit}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetBulkForm();
                    setIsAddDialogOpen(false);
                  }}
                  className="text-base px-6 py-3"
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-base px-6 py-3">
                  Record Test Results
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}