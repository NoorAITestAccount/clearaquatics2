import { useState, useMemo } from 'react';

export interface Species {
  id: string;
  name: string;
  scientificName: string;
  category: 'fish' | 'plant' | 'crustacean';
  waterType: 'freshwater' | 'saltwater' | 'brackish';
  requirements: {
    minPh: number;
    maxPh: number;
    minTemp: number; // Fahrenheit
    maxTemp: number; // Fahrenheit
    minTankSize?: number; // gallons
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    socialBehavior: 'peaceful' | 'semi-aggressive' | 'aggressive' | 'schooling';
  };
  description?: string;
  maxSize?: number; // inches for fish, height for plants
  lifespan?: number; // years
}

// Comprehensive species database
const speciesDatabase: Species[] = [
  // Freshwater Fish
  {
    id: 'neon-tetra',
    name: 'Neon Tetra',
    scientificName: 'Paracheirodon innesi',
    category: 'fish',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.0,
      maxPh: 7.0,
      minTemp: 68,
      maxTemp: 79,
      minTankSize: 10,
      difficulty: 'beginner',
      socialBehavior: 'schooling'
    },
    description: 'Popular schooling fish with bright blue and red coloration',
    maxSize: 1.5,
    lifespan: 10
  },
  {
    id: 'angelfish',
    name: 'Angelfish',
    scientificName: 'Pterophyllum scalare',
    category: 'fish',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.8,
      maxPh: 7.8,
      minTemp: 75,
      maxTemp: 86,
      minTankSize: 30,
      difficulty: 'intermediate',
      socialBehavior: 'semi-aggressive'
    },
    description: 'Elegant cichlid with distinctive triangular shape',
    maxSize: 6,
    lifespan: 10
  },
  {
    id: 'betta-splendens',
    name: 'Betta Fish',
    scientificName: 'Betta splendens',
    category: 'fish',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.5,
      maxPh: 7.5,
      minTemp: 75,
      maxTemp: 82,
      minTankSize: 2.5,
      difficulty: 'beginner',
      socialBehavior: 'aggressive'
    },
    description: 'Colorful fighting fish, males should be kept alone',
    maxSize: 3,
    lifespan: 3
  },
  {
    id: 'guppy',
    name: 'Guppy',
    scientificName: 'Poecilia reticulata',
    category: 'fish',
    waterType: 'freshwater',
    requirements: {
      minPh: 7.0,
      maxPh: 8.5,
      minTemp: 72,
      maxTemp: 82,
      minTankSize: 5,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Hardy, colorful livebearers perfect for beginners',
    maxSize: 2,
    lifespan: 2
  },
  {
    id: 'goldfish',
    name: 'Goldfish',
    scientificName: 'Carassius auratus',
    category: 'fish',
    waterType: 'freshwater',
    requirements: {
      minPh: 7.0,
      maxPh: 8.4,
      minTemp: 65,
      maxTemp: 75,
      minTankSize: 40,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Classic aquarium fish, needs large tank and good filtration',
    maxSize: 12,
    lifespan: 20
  },
  {
    id: 'corydoras',
    name: 'Corydoras Catfish',
    scientificName: 'Corydoras paleatus',
    category: 'fish',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.0,
      maxPh: 8.0,
      minTemp: 72,
      maxTemp: 79,
      minTankSize: 20,
      difficulty: 'beginner',
      socialBehavior: 'schooling'
    },
    description: 'Bottom-dwelling catfish, excellent tank cleaners',
    maxSize: 3,
    lifespan: 20
  },

  // Saltwater Fish
  {
    id: 'clownfish',
    name: 'Clownfish',
    scientificName: 'Amphiprion ocellatus',
    category: 'fish',
    waterType: 'saltwater',
    requirements: {
      minPh: 8.1,
      maxPh: 8.4,
      minTemp: 75,
      maxTemp: 82,
      minTankSize: 20,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Iconic marine fish, often pairs with anemones',
    maxSize: 4,
    lifespan: 10
  },
  {
    id: 'yellow-tang',
    name: 'Yellow Tang',
    scientificName: 'Zebrasoma flavescens',
    category: 'fish',
    waterType: 'saltwater',
    requirements: {
      minPh: 8.1,
      maxPh: 8.4,
      minTemp: 75,
      maxTemp: 82,
      minTankSize: 75,
      difficulty: 'intermediate',
      socialBehavior: 'semi-aggressive'
    },
    description: 'Bright yellow reef fish, excellent algae eater',
    maxSize: 8,
    lifespan: 30
  },
  {
    id: 'blue-hippo-tang',
    name: 'Blue Hippo Tang',
    scientificName: 'Paracanthurus hepatus',
    category: 'fish',
    waterType: 'saltwater',
    requirements: {
      minPh: 8.1,
      maxPh: 8.4,
      minTemp: 75,
      maxTemp: 82,
      minTankSize: 100,
      difficulty: 'intermediate',
      socialBehavior: 'peaceful'
    },
    description: 'Beautiful blue tang, needs plenty of swimming space',
    maxSize: 12,
    lifespan: 20
  },

  // Brackish Fish
  {
    id: 'mollies',
    name: 'Mollies',
    scientificName: 'Poecilia sphenops',
    category: 'fish',
    waterType: 'brackish',
    requirements: {
      minPh: 7.5,
      maxPh: 8.5,
      minTemp: 75,
      maxTemp: 82,
      minTankSize: 20,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Hardy livebearers that thrive in brackish conditions',
    maxSize: 4,
    lifespan: 5
  },

  // Freshwater Plants
  {
    id: 'java-fern',
    name: 'Java Fern',
    scientificName: 'Microsorum pteropus',
    category: 'plant',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.0,
      maxPh: 7.5,
      minTemp: 68,
      maxTemp: 82,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Hardy fern that grows attached to wood or rocks',
    maxSize: 14,
    lifespan: 5
  },
  {
    id: 'anubias',
    name: 'Anubias',
    scientificName: 'Anubias barteri',
    category: 'plant',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.5,
      maxPh: 7.8,
      minTemp: 72,
      maxTemp: 82,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Slow-growing plant with broad, dark green leaves',
    maxSize: 16,
    lifespan: 10
  },
  {
    id: 'amazon-sword',
    name: 'Amazon Sword',
    scientificName: 'Echinodorus amazonicus',
    category: 'plant',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.5,
      maxPh: 7.5,
      minTemp: 72,
      maxTemp: 82,
      difficulty: 'intermediate',
      socialBehavior: 'peaceful'
    },
    description: 'Large background plant with sword-like leaves',
    maxSize: 20,
    lifespan: 3
  },
  {
    id: 'java-moss',
    name: 'Java Moss',
    scientificName: 'Taxiphyllum barbieri',
    category: 'plant',
    waterType: 'freshwater',
    requirements: {
      minPh: 5.5,
      maxPh: 8.0,
      minTemp: 68,
      maxTemp: 86,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Versatile carpeting moss, great for breeding tanks',
    maxSize: 4,
    lifespan: 10
  },

  // Saltwater Plants/Corals
  {
    id: 'green-star-polyp',
    name: 'Green Star Polyp',
    scientificName: 'Briareum violacea',
    category: 'plant',
    waterType: 'saltwater',
    requirements: {
      minPh: 8.1,
      maxPh: 8.4,
      minTemp: 75,
      maxTemp: 82,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Hardy soft coral with bright green polyps',
    maxSize: 12,
    lifespan: 20
  },

  // Crustaceans
  {
    id: 'cherry-shrimp',
    name: 'Cherry Shrimp',
    scientificName: 'Neocaridina davidi',
    category: 'crustacean',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.5,
      maxPh: 8.0,
      minTemp: 68,
      maxTemp: 78,
      minTankSize: 5,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Colorful freshwater shrimp, excellent algae eaters',
    maxSize: 1.5,
    lifespan: 2
  },
  {
    id: 'amano-shrimp',
    name: 'Amano Shrimp',
    scientificName: 'Caridina multidentata',
    category: 'crustacean',
    waterType: 'freshwater',
    requirements: {
      minPh: 6.0,
      maxPh: 7.5,
      minTemp: 68,
      maxTemp: 78,
      minTankSize: 10,
      difficulty: 'intermediate',
      socialBehavior: 'peaceful'
    },
    description: 'Large freshwater shrimp, outstanding algae control',
    maxSize: 2,
    lifespan: 3
  },
  {
    id: 'hermit-crab',
    name: 'Hermit Crab',
    scientificName: 'Calcinus elegans',
    category: 'crustacean',
    waterType: 'saltwater',
    requirements: {
      minPh: 8.1,
      maxPh: 8.4,
      minTemp: 75,
      maxTemp: 82,
      minTankSize: 20,
      difficulty: 'beginner',
      socialBehavior: 'peaceful'
    },
    description: 'Reef-safe hermit crab, good detritus cleaner',
    maxSize: 1,
    lifespan: 10
  }
];

export function useSpeciesDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [waterTypeFilter, setWaterTypeFilter] = useState<string>('all');

  const filteredSpecies = useMemo(() => {
    return speciesDatabase.filter(species => {
      const matchesSearch = !searchQuery || 
        species.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        species.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || species.category === categoryFilter;
      const matchesWaterType = waterTypeFilter === 'all' || species.waterType === waterTypeFilter;

      return matchesSearch && matchesCategory && matchesWaterType;
    });
  }, [searchQuery, categoryFilter, waterTypeFilter]);

  const getSpeciesById = (id: string): Species | undefined => {
    return speciesDatabase.find(species => species.id === id);
  };

  const getSpeciesByIds = (ids: string[]): Species[] => {
    return speciesDatabase.filter(species => ids.includes(species.id));
  };

  return {
    species: filteredSpecies,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    waterTypeFilter,
    setWaterTypeFilter,
    getSpeciesById,
    getSpeciesByIds
  };
}