import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { AlertTriangle, CheckCircle, Fish, Calendar, Filter, Waves } from 'lucide-react';
import { useAquariumData } from '../hooks/useAquariumData';
import { useSpeciesDatabase } from '../hooks/useSpeciesDatabase';
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

export function Dashboard() {
  const [selectedAquarium, setSelectedAquarium] = useState<string | null>("1");
  const { aquariums, waterParameters, aquaticLife, maintenanceRecords } = useAquariumData();
  const { getSpeciesById } = useSpeciesDatabase();
  
  const currentAquarium = selectedAquarium ? aquariums.find(a => a.id === selectedAquarium) : aquariums[0];
  const currentParams = waterParameters.filter(p => p.aquariumId === currentAquarium?.id);
  const currentLife = aquaticLife.filter(l => l.aquariumId === currentAquarium?.id);
  const currentMaintenance = maintenanceRecords.filter(r => r.aquariumId === currentAquarium?.id);
  
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

  // Check parameter warnings
  const warnings = latestParams.filter(param => param.status === 'warning' || param.status === 'critical');
  const goodParams = latestParams.filter(param => param.status === 'good');

  if (!currentAquarium) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No aquariums found. Please add an aquarium first to start tracking water parameters.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <AquariumSelector 
          selectedAquarium={selectedAquarium}
          onSelectAquarium={setSelectedAquarium}
        />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {currentAquarium.name}
              <Badge variant={warnings.length > 0 ? "destructive" : "default"}>
                {warnings.length > 0 ? `${warnings.length} Alert${warnings.length > 1 ? 's' : ''}` : 'Healthy'}
              </Badge>
            </h2>
            <p className="text-muted-foreground mt-1">
              {currentAquarium.volume} gal • {currentAquarium.type} • Setup: {new Date(currentAquarium.setupDate).toLocaleDateString()}
            </p>
          </div>

        </div>
      </div>

      {warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention Required:</strong> {warnings.length} parameter{warnings.length > 1 ? 's are' : ' is'} out of range.
            Check the Water Parameters tab for details.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Aquatic Life - moved to front */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aquatic Life</CardTitle>
            <Fish className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentLife.length}</div>
            <p className="text-xs text-muted-foreground">
              {currentLife.filter(l => {
                const species = getSpeciesById(l.speciesId);
                return species?.category === 'fish';
              }).length} fish, {currentLife.filter(l => {
                const species = getSpeciesById(l.speciesId);
                return species?.category === 'plant';
              }).length} plants
            </p>
          </CardContent>
        </Card>

        {/* Last Test - moved to second position */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Test</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestParams.length > 0 
                ? (() => {
                    const mostRecentDate = Math.max(...latestParams.map(p => new Date(p.date).getTime()));
                    const daysAgo = Math.floor((Date.now() - mostRecentDate) / (1000 * 60 * 60 * 24));
                    return daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day' : `${daysAgo} days`;
                  })()
                : '--'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {latestParams.length > 0 
                ? (() => {
                    const mostRecentDate = Math.max(...latestParams.map(p => new Date(p.date).getTime()));
                    return new Date(mostRecentDate).toLocaleDateString();
                  })()
                : 'No tests recorded'
              }
            </p>
          </CardContent>
        </Card>

        {/* Filter Maintenance - new tile */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filter Maintenance</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const filterMaintenance = currentMaintenance
                  .filter(r => r.type === 'filter_maintenance')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                
                if (!filterMaintenance) return '--';
                
                const daysAgo = Math.floor((Date.now() - new Date(filterMaintenance.date).getTime()) / (1000 * 60 * 60 * 24));
                return daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day' : `${daysAgo} days`;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const filterMaintenance = currentMaintenance
                  .filter(r => r.type === 'filter_maintenance')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                
                if (!filterMaintenance) return 'No maintenance logged';
                
                return `${filterMaintenance.filterType === 'rinse' ? 'Rinsed' : 'Replaced'} • ${new Date(filterMaintenance.date).toLocaleDateString()}`;
              })()}
            </p>
          </CardContent>
        </Card>

        {/* Water Change - new tile */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Change</CardTitle>
            <Waves className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const waterChange = currentMaintenance
                  .filter(r => r.type === 'water_change')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                
                if (!waterChange) return '--';
                
                const daysAgo = Math.floor((Date.now() - new Date(waterChange.date).getTime()) / (1000 * 60 * 60 * 24));
                return daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day' : `${daysAgo} days`;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const waterChange = currentMaintenance
                  .filter(r => r.type === 'water_change')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                
                if (!waterChange) return 'No changes logged';
                
                return `${waterChange.percentageChanged || 25}% • ${new Date(waterChange.date).toLocaleDateString()}`;
              })()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Parameter Status</CardTitle>
            <CardDescription>Last measured status of all water parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestParams.length === 0 ? (
              <p className="text-muted-foreground">No recent parameter data available.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1">
                {latestParams.map((param) => (
                  <div key={param.parameter} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center space-x-3">
                      {param.status === 'good' ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : param.status === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium">{formatParameterName(param.parameter)}</span>
                        <span className="text-xs text-muted-foreground">
                          Tested: {new Date(param.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-lg">{param.value}{param.unit}</div>
                      <div className="text-xs text-muted-foreground">
                        Target: {param.idealMin}-{param.idealMax}{param.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest changes and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestParams.length > 0 && (() => {
              const sortedParams = latestParams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const activities = [];
              
              // Add most recent test
              const mostRecent = sortedParams[0];
              const daysAgo = Math.floor((Date.now() - new Date(mostRecent.date).getTime()) / (1000 * 60 * 60 * 24));
              activities.push(
                <div key="recent-test" className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">{formatParameterName(mostRecent.parameter)} tested: {mostRecent.value}{mostRecent.unit}</p>
                    <p className="text-xs text-muted-foreground">
                      {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
                    </p>
                  </div>
                </div>
              );

              // Add warning if any
              const warningParam = latestParams.find(p => p.status === 'warning' || p.status === 'critical');
              if (warningParam) {
                const warningDaysAgo = Math.floor((Date.now() - new Date(warningParam.date).getTime()) / (1000 * 60 * 60 * 24));
                activities.push(
                  <div key="warning" className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">{formatParameterName(warningParam.parameter)} {warningParam.status} detected</p>
                      <p className="text-xs text-muted-foreground">
                        {warningDaysAgo === 0 ? 'Today' : warningDaysAgo === 1 ? '1 day ago' : `${warningDaysAgo} days ago`}
                      </p>
                    </div>
                  </div>
                );
              }

              // Add aquatic life activity
              if (currentLife.length > 0) {
                const mostRecentLife = currentLife.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())[0];
                const species = getSpeciesById(mostRecentLife.speciesId);
                const lifeDaysAgo = Math.floor((Date.now() - new Date(mostRecentLife.addedDate).getTime()) / (1000 * 60 * 60 * 24));
                activities.push(
                  <div key="life-added" className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm">New {species?.category || 'species'} added: {species?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {lifeDaysAgo === 0 ? 'Today' : lifeDaysAgo === 1 ? '1 day ago' : `${lifeDaysAgo} days ago`}
                      </p>
                    </div>
                  </div>
                );
              }

              return activities.slice(0, 3); // Show max 3 activities
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}