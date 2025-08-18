"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SaveAudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, categoryId?: string) => void;
  isLoading?: boolean;
}

export default function SaveAudioModal({
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: SaveAudioModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined); // Changed to undefined

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, categoryId);
    // Reset form
    setName("");
    setCategoryId(undefined);
  };

  // Reset form when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("");
      setCategoryId(undefined);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Audio to Library</DialogTitle>
          <DialogDescription>
            Give your audio a name and optionally assign it to a category.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter audio name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={categoryId || ""} onValueChange={(value) => setCategoryId(value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {/* TODO: Load categories from API */}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}