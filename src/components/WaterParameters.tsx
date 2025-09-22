import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, TestTube, AlertTriangle, CheckCircle, Droplets } from 'lucide-react';
import { useAquariumData } from '../hooks/useAquariumData';
import { AquariumSelector } from './AquariumSelector';
import { toast } from 'sonner@2.0.3';

const parameterPresets = {
  ph: { unit: '', idealMin: 6.5, idealMax: 7.5 },
  temperature: { unit: '°F', idealMin: 75, idealMax: 79 },
  ammonia: { unit: 'ppm', idealMin: 0, idealMax: 0.25 },
  nitrite: { unit: 'ppm', idealMin: 0, idealMax: 0.25 },
  nitrate: { unit: 'ppm', idealMin: 0, idealMax: 20 },
  hardness: { unit: 'dGH', idealMin: 8, idealMax: 12 },
  alkalinity: { unit: 'dKH', idealMin: 4, idealMax: 8 },
  dissolved_oxygen: { unit: 'mg/L', idealMin: 6, idealMax: 8 }
};

export function WaterParameters() {
  const { aquariums, waterParameters, addWaterParameter } = useAquariumData();
  const [selectedAquarium, setSelectedAquarium] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Bulk form data for all parameters
  const [bulkFormData, setBulkFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    parameters: Object.keys(parameterPresets).reduce((acc, param) => {
      acc[param] = '';
      return acc;
    }, {} as Record<string, string>)
  });

  // Helper function to format parameter names for display
  const formatParameterName = (parameter: string) => {
    switch (parameter) {
      case 'ph': return 'pH';
      case 'tds': return 'TDS';
      case 'carbonate_hardness': return 'Carbonate Hardness';
      case 'general_hardness': return 'General Hardness';
      case 'dissolved_oxygen': return 'Dissolved Oxygen';
      default: return parameter.charAt(0).toUpperCase() + parameter.slice(1).replace('_', ' ');
    }
  };

  const currentAquarium = selectedAquarium ? aquariums.find(a => a.id === selectedAquarium) : null;
  const currentParams = waterParameters.filter(p => p.aquariumId === selectedAquarium);
  
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
    
    if (!selectedAquarium) {
      toast.error('Please select an aquarium first');
      return;
    }
    
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
          aquariumId: selectedAquarium,
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
      setIsDialogOpen(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Water Parameters</h1>
        <AquariumSelector 
          selectedAquarium={selectedAquarium}
          onSelectAquarium={setSelectedAquarium}
        />
      </div>

      {!selectedAquarium ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select an aquarium to track water parameters.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Water Quality Tracking</h2>
                <p className="text-muted-foreground">
                  Monitor water quality for {currentAquarium?.name}
                </p>
              </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Test Results
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Bulk Water Test Results</DialogTitle>
              <DialogDescription>
                Record multiple water quality test results for {currentAquarium?.name}. Fill in only the parameters you tested - leave others blank.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleBulkSubmit} className="space-y-6">
                {/* Test Date */}
                <div className="space-y-2">
                  <Label htmlFor="bulk-date">Test Date</Label>
                  <Input
                    id="bulk-date"
                    type="date"
                    value={bulkFormData.date}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="max-w-xs"
                  />
                </div>

                {/* Parameter Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(parameterPresets).map(([parameter, preset]) => (
                    <div key={parameter} className="space-y-3 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor={`param-${parameter}`} className="text-base font-medium">
                          {formatParameterName(parameter)}
                          <span className="text-sm text-muted-foreground ml-1">
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
                          className="text-lg"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        <strong>Ideal range:</strong> {preset.idealMin} - {preset.idealMax} {preset.unit}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetBulkForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Record Test Results
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
          </Dialog>
            </div>
          </div>

          {latestParams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Test Results Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by recording your first water parameter test results.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record First Test Results
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latestParams.map((param) => (
            <Card key={param.parameter} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Droplets className="h-5 w-5" />
                    {param.parameter.replace('_', ' ')}
                  </CardTitle>
                  {param.status === 'good' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : param.status === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <CardDescription>
                  Last tested: {new Date(param.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {param.value}{param.unit}
                    </div>
                    <Badge 
                      variant={
                        param.status === 'good' ? 'default' : 
                        param.status === 'warning' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {param.status === 'good' ? 'Optimal' : 
                       param.status === 'warning' ? 'Warning' : 
                       'Critical'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ideal Range:</span>
                      <span>{param.idealMin} - {param.idealMax}{param.unit}</span>
                    </div>
                    {param.status !== 'good' && (
                      <div className="text-sm text-muted-foreground">
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
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Parameter Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {latestParams.filter(p => p.status !== 'good').map((param) => (
                <div key={param.parameter} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="capitalize font-medium">{param.parameter.replace('_', ' ')}</span>
                  <div className="text-right">
                    <div className="font-medium">{param.value}{param.unit}</div>
                    <div className="text-sm text-muted-foreground">
                      Should be {param.idealMin}-{param.idealMax}{param.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-orange-100 rounded text-sm text-orange-800">
              <strong>Action needed:</strong> Consider water changes, filtration adjustments, or chemical treatments to bring parameters back into optimal ranges.
            </div>
          </CardContent>
        </Card>
          )}
        </>
      )}
    </div>
  );
}