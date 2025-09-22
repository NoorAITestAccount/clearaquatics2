import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Calendar, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useAquariumData } from '../hooks/useAquariumData';
import { AquariumSelector } from './AquariumSelector';

// Helper function to format parameter names for display
const formatParameterName = (parameter: string) => {
  switch (parameter) {
    case 'ph': return 'pH';
    case 'tds': return 'TDS';
    case 'carbonate_hardness': return 'Carbonate Hardness';
    case 'general_hardness': return 'General Hardness';
    default: return parameter.charAt(0).toUpperCase() + parameter.slice(1).replace('_', ' ');
  }
};

// Color palette for multiple parameters
const parameterColors = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#9333ea', // Purple
  '#c2410c', // Orange
  '#0891b2', // Cyan
  '#be123c', // Rose
];

export function ParameterHistory() {
  const [selectedAquarium, setSelectedAquarium] = useState<string | null>("1");
  const { aquariums, waterParameters } = useAquariumData();
  const [selectedParameters, setSelectedParameters] = useState<string[]>(['ph']);
  const [timeRange, setTimeRange] = useState<string>('30');
  const [chartMode, setChartMode] = useState<'combined' | 'separate'>('separate');

  const currentAquarium = selectedAquarium ? aquariums.find(a => a.id === selectedAquarium) : null;
  const currentParams = waterParameters.filter(p => p.aquariumId === selectedAquarium);

  // Filter by time range
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
  const filteredParams = currentParams.filter(p => new Date(p.date) >= cutoffDate);

  // Get unique parameters
  const availableParameters = [...new Set(currentParams.map(p => p.parameter))];

  // Handle parameter selection
  const handleParameterToggle = (parameter: string) => {
    setSelectedParameters(prev => {
      if (prev.includes(parameter)) {
        return prev.filter(p => p !== parameter);
      } else {
        return [...prev, parameter];
      }
    });
  };

  // Prepare chart data for combined view
  const prepareCombinedChartData = () => {
    const dateMap = new Map();
    
    selectedParameters.forEach(parameter => {
      const paramData = filteredParams
        .filter(p => p.parameter === parameter)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      paramData.forEach(p => {
        const dateKey = new Date(p.date).toLocaleDateString();
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey });
        }
        dateMap.get(dateKey)[parameter] = p.value;
        dateMap.get(dateKey)[`${parameter}_unit`] = p.unit;
        dateMap.get(dateKey)[`${parameter}_status`] = p.status;
      });
    });

    return Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Prepare chart data for individual charts
  const prepareIndividualChartData = (parameter: string) => {
    return filteredParams
      .filter(p => p.parameter === parameter)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(p => ({
        date: new Date(p.date).toLocaleDateString(),
        value: p.value,
        idealMin: p.idealMin,
        idealMax: p.idealMax,
        status: p.status,
        unit: p.unit
      }));
  };

  // Calculate trend for a parameter
  const calculateTrend = (parameter: string) => {
    const paramData = filteredParams
      .filter(p => p.parameter === parameter)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (paramData.length < 2) return null;
    
    const recent = paramData.slice(-3);
    const older = paramData.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    return change;
  };

  // Get statistics for a parameter
  const getParameterStats = (parameter: string) => {
    const paramData = filteredParams.filter(p => p.parameter === parameter);
    if (paramData.length === 0) return null;
    
    const values = paramData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const latest = values[values.length - 1];
    const unit = paramData[0].unit;
    
    return { min, max, avg, latest, count: values.length, unit };
  };

  const combinedChartData = chartMode === 'combined' ? prepareCombinedChartData() : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Parameter History</h1>
        <AquariumSelector 
          selectedAquarium={selectedAquarium}
          onSelectAquarium={setSelectedAquarium}
        />
      </div>

      {!selectedAquarium ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select an aquarium to view parameter history.
          </AlertDescription>
        </Alert>
      ) : currentParams.length === 0 ? (
        <>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border">
            <div>
              <h2 className="text-2xl font-bold">Historical Analysis</h2>
              <p className="text-muted-foreground">
                Historical trends for {currentAquarium?.name}
              </p>
            </div>
          </div>
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              No parameter data available yet. Start by adding some water test results in the Aquarium Management tab.
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Historical Analysis</h2>
                <p className="text-muted-foreground">
                  Historical trends for {currentAquarium?.name}
                </p>
              </div>
              <div className="flex space-x-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parameter Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Parameter Selection</CardTitle>
                  <CardDescription>
                    Choose which parameters to display and how to view them
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={chartMode === 'separate' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartMode('separate')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Separate Charts
                  </Button>
                  <Button
                    variant={chartMode === 'combined' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartMode('combined')}
                    disabled={selectedParameters.length < 2}
                  >
                    <LineChartIcon className="h-4 w-4 mr-2" />
                    Combined Chart
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {availableParameters.map((parameter) => {
                  const isSelected = selectedParameters.includes(parameter);
                  const stats = getParameterStats(parameter);
                  const trend = calculateTrend(parameter);
                  
                  return (
                    <div
                      key={parameter}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleParameterToggle(parameter)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isSelected} readOnly />
                          <span className="font-medium">{formatParameterName(parameter)}</span>
                        </div>
                        {trend !== null && (
                          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {Math.abs(trend).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      {stats && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>Latest: {stats.latest.toFixed(2)}{stats.unit}</div>
                          <div>Avg: {stats.avg.toFixed(2)}{stats.unit}</div>
                          <div>{stats.count} measurements</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {selectedParameters.length === 0 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please select at least one parameter to display charts.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {selectedParameters.length > 0 && (
            <>
              {/* Statistics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {selectedParameters.slice(0, 4).map((parameter) => {
                  const stats = getParameterStats(parameter);
                  const trend = calculateTrend(parameter);
                  
                  if (!stats) return null;
                  
                  return (
                    <Card key={parameter}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {formatParameterName(parameter)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {stats.latest.toFixed(2)}{stats.unit}
                        </div>
                        {trend !== null && (
                          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {trend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                            {Math.abs(trend).toFixed(1)}% from previous period
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Avg: {stats.avg.toFixed(2)}{stats.unit} • {stats.count} tests
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Charts */}
              {chartMode === 'combined' && selectedParameters.length > 1 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Combined Parameter Trends</CardTitle>
                    <CardDescription>
                      Multiple parameters displayed together over the last {timeRange} days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={combinedChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            labelFormatter={(label) => `Date: ${label}`}
                            formatter={(value: any, name: string) => {
                              const unit = combinedChartData.find(d => d[`${name}_unit`])?.[`${name}_unit`] || '';
                              return [value + unit, formatParameterName(name)];
                            }}
                          />
                          <Legend />
                          
                          {selectedParameters.map((parameter, index) => (
                            <Line 
                              key={parameter}
                              type="monotone" 
                              dataKey={parameter} 
                              stroke={parameterColors[index % parameterColors.length]} 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name={formatParameterName(parameter)}
                              connectNulls={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-1">
                  {selectedParameters.map((parameter) => {
                    const chartData = prepareIndividualChartData(parameter);
                    const stats = getParameterStats(parameter);
                    
                    if (chartData.length === 0 || !stats) return null;
                    
                    return (
                      <Card key={parameter}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="capitalize">
                                {formatParameterName(parameter)} Trend
                              </CardTitle>
                              <CardDescription>
                                Historical values over the last {timeRange} days
                              </CardDescription>
                            </div>
                            <Badge variant="outline">
                              {stats.count} measurements
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 12 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip 
                                  labelFormatter={(label) => `Date: ${label}`}
                                  formatter={(value: any, name: string) => {
                                    if (name === 'value') return [value + stats.unit, 'Measured Value'];
                                    if (name === 'idealMin') return [value + stats.unit, 'Ideal Min'];
                                    if (name === 'idealMax') return [value + stats.unit, 'Ideal Max'];
                                    return [value, name];
                                  }}
                                />
                                <Legend />
                                
                                {/* Ideal range bands */}
                                <Line 
                                  type="monotone" 
                                  dataKey="idealMin" 
                                  stroke="#10b981" 
                                  strokeDasharray="5 5" 
                                  dot={false}
                                  name="Ideal Min"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="idealMax" 
                                  stroke="#10b981" 
                                  strokeDasharray="5 5" 
                                  dot={false}
                                  name="Ideal Max"
                                />
                                
                                {/* Actual values */}
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#2563eb" 
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  name="Measured Value"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}