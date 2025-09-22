import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  Droplets,
  Fish,
  Lightbulb,
  Calendar,
} from "lucide-react";
import {
  useAquariumData,
  type Aquarium,
  getAquariumTechLevel,
} from "../hooks/useAquariumData";
import { AquaticLifeManager } from "./AquaticLifeManager";
import { WaterParameterManager } from "./WaterParameterManager";
import { MaintenanceManager } from "./MaintenanceManager";
import { toast } from "sonner@2.0.3";

export function AquariumManagement() {
  const {
    aquariums,
    addAquarium,
    updateAquarium,
    deleteAquarium,
  } = useAquariumData();

  // Aquarium management state
  const [isAquariumDialogOpen, setIsAquariumDialogOpen] =
    useState(false);
  const [editingAquarium, setEditingAquarium] =
    useState<Aquarium | null>(null);
  const [aquariumFormData, setAquariumFormData] = useState({
    name: "",
    volume: "",
    type: "freshwater" as const,
    setupDate: "",
    description: "",
    lightLevel: "medium" as const,
    co2Injection: false,
  });

  // Aquatic life management state
  const [selectedAquariumForLife, setSelectedAquariumForLife] =
    useState<Aquarium | null>(null);

  // Water parameter management state
  const [
    selectedAquariumForParameters,
    setSelectedAquariumForParameters,
  ] = useState<Aquarium | null>(null);

  // Maintenance management state
  const [
    selectedAquariumForMaintenance,
    setSelectedAquariumForMaintenance,
  ] = useState<Aquarium | null>(null);

  const handleAquariumSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !aquariumFormData.name ||
      !aquariumFormData.volume ||
      !aquariumFormData.setupDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const aquariumData = {
      name: aquariumFormData.name,
      volume: parseInt(aquariumFormData.volume),
      type: aquariumFormData.type,
      setupDate: aquariumFormData.setupDate,
      description: aquariumFormData.description,
      lightLevel: aquariumFormData.lightLevel,
      co2Injection: aquariumFormData.co2Injection,
    };

    if (editingAquarium) {
      updateAquarium(editingAquarium.id, aquariumData);
      toast.success("Aquarium updated successfully");
    } else {
      addAquarium(aquariumData);
      toast.success("Aquarium added successfully");
    }

    resetAquariumForm();
  };

  const resetAquariumForm = () => {
    setAquariumFormData({
      name: "",
      volume: "",
      type: "freshwater",
      setupDate: "",
      description: "",
      lightLevel: "medium",
      co2Injection: false,
    });
    setEditingAquarium(null);
    setIsAquariumDialogOpen(false);
  };

  const handleEditAquarium = (aquarium: Aquarium) => {
    setAquariumFormData({
      name: aquarium.name,
      volume: aquarium.volume.toString(),
      type: aquarium.type,
      setupDate: aquarium.setupDate,
      description: aquarium.description || "",
      lightLevel: aquarium.lightLevel,
      co2Injection: aquarium.co2Injection,
    });
    setEditingAquarium(aquarium);
    setIsAquariumDialogOpen(true);
  };

  const handleDeleteAquarium = (aquarium: Aquarium) => {
    if (
      confirm(
        `Are you sure you want to delete "${aquarium.name}"? This will also delete all associated data.`,
      )
    ) {
      deleteAquarium(aquarium.id);
      toast.success("Aquarium deleted");
    }
  };

  const getTechLevelBadgeVariant = (techLevel: string) => {
    switch (techLevel) {
      case "low-tech":
        return "secondary";
      case "high-tech":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Aquarium Management
            </h1>
            <p className="text-muted-foreground">
              Set up and manage your aquarium tanks and their
              inhabitants
            </p>
          </div>
          <Dialog
            open={isAquariumDialogOpen}
            onOpenChange={setIsAquariumDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetAquariumForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Aquarium
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[75vw] max-w-none max-h-[95vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingAquarium
                    ? "Edit Aquarium"
                    : "Add New Aquarium"}
                </DialogTitle>
                <DialogDescription>
                  {editingAquarium
                    ? "Update the details of your aquarium"
                    : "Add a new aquarium to start tracking its parameters"}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleAquariumSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={aquariumFormData.name}
                    onChange={(e) =>
                      setAquariumFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Community Tank"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volume">
                      Volume (gal) *
                    </Label>
                    <Input
                      id="volume"
                      type="number"
                      value={aquariumFormData.volume}
                      onChange={(e) =>
                        setAquariumFormData((prev) => ({
                          ...prev,
                          volume: e.target.value,
                        }))
                      }
                      placeholder="75"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={aquariumFormData.type}
                      onValueChange={(value: any) =>
                        setAquariumFormData((prev) => ({
                          ...prev,
                          type: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freshwater">
                          Freshwater
                        </SelectItem>
                        <SelectItem value="saltwater">
                          Saltwater
                        </SelectItem>
                        <SelectItem value="brackish">
                          Brackish
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setupDate">
                    Setup Date *
                  </Label>
                  <Input
                    id="setupDate"
                    type="date"
                    value={aquariumFormData.setupDate}
                    onChange={(e) =>
                      setAquariumFormData((prev) => ({
                        ...prev,
                        setupDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lightLevel">
                    Light Level *
                  </Label>
                  <Select
                    value={aquariumFormData.lightLevel}
                    onValueChange={(value: any) =>
                      setAquariumFormData((prev) => ({
                        ...prev,
                        lightLevel: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">
                        Medium
                      </SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label
                      htmlFor="co2Injection"
                      className="font-medium"
                    >
                      Co2 injections?
                    </Label>
                    <Checkbox
                      id="co2Injection"
                      checked={aquariumFormData.co2Injection}
                      onCheckedChange={(checked: boolean) =>
                        setAquariumFormData((prev) => ({
                          ...prev,
                          co2Injection: checked,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={aquariumFormData.description}
                    onChange={(e) =>
                      setAquariumFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional description of your aquarium setup"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAquariumForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAquarium ? "Update" : "Add"}{" "}
                    Aquarium
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
            <h3 className="font-semibold mb-2">
              No Aquariums Yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first aquarium to start tracking water
              parameters and aquatic life.
            </p>
            <Button
              onClick={() => setIsAquariumDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Aquarium
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aquariums.map((aquarium) => {
            const techLevel = getAquariumTechLevel(aquarium);

            return (
              <Card
                key={aquarium.id}
                className="transition-colors hover:bg-accent/50 flex flex-col h-full"
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
                          handleEditAquarium(aquarium);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAquarium(aquarium);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {aquarium.volume} gallons
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Setup Date:
                      </span>
                      <span>
                        {new Date(
                          aquarium.setupDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Light Level:
                      </span>
                      <span className="capitalize">
                        {aquarium.lightLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        CO₂ Injection:
                      </span>
                      <span>
                        {aquarium.co2Injection ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="min-h-[3rem]">
                      {aquarium.description ? (
                        <p className="text-sm text-muted-foreground">
                          {aquarium.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic">
                          No description provided
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 mt-auto">
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          aquarium.type === "freshwater"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {aquarium.type}
                      </Badge>
                      <Badge
                        variant={getTechLevelBadgeVariant(
                          techLevel,
                        )}
                        className="flex items-center gap-1"
                      >
                        <Lightbulb className="h-3 w-3" />
                        {techLevel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            setSelectedAquariumForLife(aquarium)
                          }
                        >
                          <Fish className="h-4 w-4 mr-2" />
                          Manage Life
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            setSelectedAquariumForParameters(
                              aquarium,
                            )
                          }
                        >
                          <Droplets className="h-4 w-4 mr-2" />
                          Water Tests
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          setSelectedAquariumForMaintenance(
                            aquarium,
                          )
                        }
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Maintenance Log
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Aquatic Life Manager Dialog */}
      {selectedAquariumForLife && (
        <AquaticLifeManager
          aquarium={selectedAquariumForLife}
          isOpen={true}
          onClose={() => setSelectedAquariumForLife(null)}
        />
      )}

      {/* Water Parameter Manager Dialog */}
      {selectedAquariumForParameters && (
        <WaterParameterManager
          aquarium={selectedAquariumForParameters}
          isOpen={true}
          onClose={() => setSelectedAquariumForParameters(null)}
        />
      )}

      {/* Maintenance Manager Dialog */}
      {selectedAquariumForMaintenance && (
        <MaintenanceManager
          aquarium={selectedAquariumForMaintenance}
          isOpen={true}
          onClose={() =>
            setSelectedAquariumForMaintenance(null)
          }
        />
      )}
    </div>
  );
}