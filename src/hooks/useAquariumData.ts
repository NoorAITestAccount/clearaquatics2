import { useState, useEffect } from 'react';

export interface Aquarium {
  id: string;
  name: string;
  volume: number;
  type: 'freshwater' | 'saltwater' | 'brackish';
  setupDate: string;
  description?: string;
  lightLevel: 'low' | 'medium' | 'high';
  co2Injection: boolean;
}

export interface WaterParameter {
  id: string;
  aquariumId: string;
  parameter: string;
  value: number;
  unit: string;
  date: string;
  idealMin: number;
  idealMax: number;
  status: 'good' | 'warning' | 'critical';
}

export interface AquaticLife {
  id: string;
  aquariumId: string;
  speciesId: string; // Reference to species database
  addedDate: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  aquariumId: string;
  type: 'water_change' | 'filter_maintenance';
  date: string;
  notes?: string;
  // Water change specific fields
  volumeChanged?: number; // in gallons or percentage
  percentageChanged?: number;
  // Filter maintenance specific fields
  filterType?: 'rinse' | 'replace';
  filterMedia?: string;
}

// Helper function to determine aquarium tech level
export function getAquariumTechLevel(aquarium: Aquarium): 'low-tech' | 'mid-tech' | 'high-tech' {
  if (!aquarium.co2Injection && aquarium.lightLevel === 'low') {
    return 'low-tech';
  }
  if (aquarium.co2Injection && aquarium.lightLevel === 'high') {
    return 'high-tech';
  }
  return 'mid-tech';
}

// Mock data for demonstration
const mockAquariums: Aquarium[] = [
  {
    id: '1',
    name: 'Living room tank',
    volume: 37,
    type: 'freshwater',
    setupDate: '2025-09-01',
    description: 'Main living room aquarium with tropical fish',
    lightLevel: 'high',
    co2Injection: true
  },
  {
    id: '2',
    name: 'Betta Tank',
    volume: 5,
    type: 'freshwater',
    setupDate: '2024-03-01',
    description: 'Single betta with live plants',
    lightLevel: 'low',
    co2Injection: false
  }
];

const mockWaterParameters: WaterParameter[] = [
  // pH historical data for Living Room Tank (aquarium '1') - spanning past month
  {
    id: '1',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.2,
    unit: '',
    date: '2025-09-15',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '8',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.1,
    unit: '',
    date: '2025-09-12',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '9',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.3,
    unit: '',
    date: '2025-09-10',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '10',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.4,
    unit: '',
    date: '2025-09-08',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '11',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.6,
    unit: '',
    date: '2025-09-06',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'warning'
  },
  {
    id: '12',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.5,
    unit: '',
    date: '2025-09-04',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '13',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.3,
    unit: '',
    date: '2025-09-02',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '14',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.1,
    unit: '',
    date: '2025-08-31',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '15',
    aquariumId: '1',
    parameter: 'ph',
    value: 6.9,
    unit: '',
    date: '2025-08-29',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '16',
    aquariumId: '1',
    parameter: 'ph',
    value: 6.8,
    unit: '',
    date: '2025-08-27',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '17',
    aquariumId: '1',
    parameter: 'ph',
    value: 6.7,
    unit: '',
    date: '2025-08-25',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '18',
    aquariumId: '1',
    parameter: 'ph',
    value: 6.4,
    unit: '',
    date: '2025-08-23',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'warning'
  },
  {
    id: '19',
    aquariumId: '1',
    parameter: 'ph',
    value: 6.6,
    unit: '',
    date: '2025-08-21',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '20',
    aquariumId: '1',
    parameter: 'ph',
    value: 6.8,
    unit: '',
    date: '2025-08-19',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '21',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.0,
    unit: '',
    date: '2025-08-17',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '22',
    aquariumId: '1',
    parameter: 'ph',
    value: 7.2,
    unit: '',
    date: '2025-08-15',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '2',
    aquariumId: '1',
    parameter: 'temperature',
    value: 77,
    unit: '°F',
    date: '2025-09-15',
    idealMin: 75,
    idealMax: 79,
    status: 'good'
  },
  {
    id: '3',
    aquariumId: '1',
    parameter: 'ammonia',
    value: 0.5,
    unit: 'ppm',
    date: '2025-09-13',
    idealMin: 0,
    idealMax: 0.25,
    status: 'warning'
  },
  {
    id: '4',
    aquariumId: '1',
    parameter: 'nitrite',
    value: 0.1,
    unit: 'ppm',
    date: '2025-09-11',
    idealMin: 0,
    idealMax: 0.25,
    status: 'good'
  },
  {
    id: '5',
    aquariumId: '1',
    parameter: 'nitrate',
    value: 15,
    unit: 'ppm',
    date: '2025-09-10',
    idealMin: 0,
    idealMax: 20,
    status: 'good'
  },
  {
    id: '6',
    aquariumId: '2',
    parameter: 'ph',
    value: 6.8,
    unit: '',
    date: '2025-09-12',
    idealMin: 6.5,
    idealMax: 7.5,
    status: 'good'
  },
  {
    id: '7',
    aquariumId: '2',
    parameter: 'temperature',
    value: 81,
    unit: '°F',
    date: '2025-09-12',
    idealMin: 75,
    idealMax: 79,
    status: 'warning'
  }
];

const mockAquaticLife: AquaticLife[] = [
  {
    id: '1',
    aquariumId: '1',
    speciesId: 'neon-tetra',
    addedDate: '2025-09-05'
  },
  {
    id: '2',
    aquariumId: '1',
    speciesId: 'angelfish',
    addedDate: '2025-09-10'
  },
  {
    id: '3',
    aquariumId: '1',
    speciesId: 'java-fern',
    addedDate: '2025-09-02'
  },
  {
    id: '4',
    aquariumId: '2',
    speciesId: 'betta-splendens',
    addedDate: '2024-03-05'
  }
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    aquariumId: '1',
    type: 'water_change',
    date: '2025-09-12',
    volumeChanged: 9.25,
    percentageChanged: 25,
    notes: 'Weekly 25% water change'
  },
  {
    id: '2',
    aquariumId: '1',
    type: 'filter_maintenance',
    date: '2025-09-09',
    filterType: 'rinse',
    filterMedia: 'Mechanical sponge',
    notes: 'Rinsed bio-sponge in tank water'
  },
  {
    id: '3',
    aquariumId: '2',
    type: 'water_change',
    date: '2025-09-11',
    volumeChanged: 1.25,
    percentageChanged: 25,
    notes: '25% water change'
  },
  {
    id: '4',
    aquariumId: '2',
    type: 'filter_maintenance',
    date: '2025-09-07',
    filterType: 'replace',
    filterMedia: 'Carbon cartridge',
    notes: 'Monthly cartridge replacement'
  }
];

export function useAquariumData() {
  const [aquariums, setAquariums] = useState<Aquarium[]>(mockAquariums);
  const [waterParameters, setWaterParameters] = useState<WaterParameter[]>(mockWaterParameters);
  const [aquaticLife, setAquaticLife] = useState<AquaticLife[]>(mockAquaticLife);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(mockMaintenanceRecords);

  const addAquarium = (aquarium: Omit<Aquarium, 'id'>) => {
    const newAquarium = {
      ...aquarium,
      id: Date.now().toString()
    };
    setAquariums(prev => [...prev, newAquarium]);
    return newAquarium;
  };

  const updateAquarium = (id: string, updates: Partial<Aquarium>) => {
    setAquariums(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAquarium = (id: string) => {
    setAquariums(prev => prev.filter(a => a.id !== id));
    setWaterParameters(prev => prev.filter(p => p.aquariumId !== id));
    setAquaticLife(prev => prev.filter(l => l.aquariumId !== id));
    setMaintenanceRecords(prev => prev.filter(r => r.aquariumId !== id));
  };

  const addWaterParameter = (parameter: Omit<WaterParameter, 'id' | 'status'>) => {
    // Determine status based on ideal range
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (parameter.value < parameter.idealMin || parameter.value > parameter.idealMax) {
      const deviation = Math.max(
        (parameter.idealMin - parameter.value) / parameter.idealMin,
        (parameter.value - parameter.idealMax) / parameter.idealMax
      );
      status = deviation > 0.5 ? 'critical' : 'warning';
    }

    const newParameter = {
      ...parameter,
      id: Date.now().toString(),
      status
    };
    setWaterParameters(prev => [...prev, newParameter]);
    return newParameter;
  };

  const addAquaticLife = (life: Omit<AquaticLife, 'id'>) => {
    const newLife = {
      ...life,
      id: Date.now().toString()
    };
    setAquaticLife(prev => [...prev, newLife]);
    return newLife;
  };

  const updateAquaticLife = (id: string, updates: Partial<AquaticLife>) => {
    setAquaticLife(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteAquaticLife = (id: string) => {
    setAquaticLife(prev => prev.filter(l => l.id !== id));
  };

  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString()
    };
    setMaintenanceRecords(prev => [...prev, newRecord]);
    return newRecord;
  };

  const updateMaintenanceRecord = (id: string, updates: Partial<MaintenanceRecord>) => {
    setMaintenanceRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteMaintenanceRecord = (id: string) => {
    setMaintenanceRecords(prev => prev.filter(r => r.id !== id));
  };

  return {
    aquariums,
    waterParameters,
    aquaticLife,
    maintenanceRecords,
    addAquarium,
    updateAquarium,
    deleteAquarium,
    addWaterParameter,
    addAquaticLife,
    updateAquaticLife,
    deleteAquaticLife,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord
  };
}