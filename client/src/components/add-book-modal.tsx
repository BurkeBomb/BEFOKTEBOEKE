import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addBookWithAISchema, type AddBookWithAI } from "@shared/schema";
import { X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<AddBookWithAI>({
    resolver: zodResolver(addBookWithAISchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      isRare: false,
      addToWishlist: false,
    },
  });

  const addBookMutation = useMutation({
    mutationFn: async (data: AddBookWithAI) => {
      setIsAIProcessing(true);
      return apiRequest("POST", "/api/books/add-with-ai", data);
    },
    onSuccess: (newBook) => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Boek bygevoeg!",
        description: `"${newBook.title}" is suksesvol bygevoeg met AI-voorspelde genre: ${newBook.genre}`,
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kon nie boek byvoeg nie. Probeer weer.",
        variant: "destructive",
      });
      console.error("Error adding book:", error);
    },
    onSettled: () => {
      setIsAIProcessing(false);
    },
  });

  const onSubmit = (data: AddBookWithAI) => {
    addBookMutation.mutate(data);
  };

  const handleClose = () => {
    if (!addBookMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Voeg Nuwe Boek By</span>
            {!addBookMutation.isPending && (
              <Button variant="ghost" size="sm" onClick={handleClose} className="p-1 h-auto">
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {isAIProcessing && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-4" />
            <p className="text-slate-600">🧠 AI voorspel genre...</p>
          </div>
        )}

        {!isAIProcessing && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Voer boektitel in..." 
                        {...field}
                        className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outeur *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Voer outeur naam in..." 
                        {...field}
                        className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jaar</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2024"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrywing (vir AI genre-voorspelling)</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3}
                        placeholder="Beskryf kortliks waaroor die boek gaan..."
                        {...field}
                        className="border-slate-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="isRare"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-slate-300"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-slate-700 cursor-pointer">
                        Skaars boek
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addToWishlist"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-slate-300"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-slate-700 cursor-pointer">
                        Voeg by wenslys
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleClose} 
                  className="flex-1"
                  disabled={addBookMutation.isPending}
                >
                  Kanselleer
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={addBookMutation.isPending}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Voeg By met AI
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
