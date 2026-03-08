/**
 * Equipment Checklist Modal
 * Allows users to toggle available equipment, triggering dynamic exercise substitutions.
 */
import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ALL_EQUIPMENT,
  type EquipmentItem,
  getEquipmentChecklist,
  setEquipmentChecklist,
} from "@/lib/workout-logic";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function EquipmentChecklist({ open, onOpenChange, onSave }: Props) {
  const [checklist, setChecklist] = useState<Record<EquipmentItem, boolean>>(getEquipmentChecklist);

  useEffect(() => {
    if (open) setChecklist(getEquipmentChecklist());
  }, [open]);

  const toggle = (item: EquipmentItem) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleSave = () => {
    setEquipmentChecklist(checklist);
    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Equipment Available
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Uncheck equipment you don't have — exercises will be swapped automatically.
        </p>
        <div className="space-y-3 py-2">
          {ALL_EQUIPMENT.map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={checklist[item]}
                onCheckedChange={() => toggle(item)}
              />
              <span className={`text-sm font-medium transition-colors ${
                checklist[item] ? "text-foreground" : "text-muted-foreground line-through"
              }`}>
                {item}
              </span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">
            Save & Update Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
