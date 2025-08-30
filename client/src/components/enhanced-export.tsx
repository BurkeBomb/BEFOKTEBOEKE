import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Image,
  Cloud,
  Share2,
  Printer,
  Calendar,
  Filter
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EnhancedExport() {
  const [exportOptions, setExportOptions] = useState({
    format: "csv",
    includeImages: false,
    includeReviews: false,
    filterBy: "all",
    sortBy: "title"
  });
  const { toast } = useToast();

  const { data: exportHistory } = useQuery({
    queryKey: ["/api/exports/history"],
  });

  const exportMutation = useMutation({
    mutationFn: async (options: any) => {
      return await apiRequest("/api/exports/create", "POST", options);
    },
    onSuccess: (data) => {
      toast({
        title: "Uitvoer Begin",
        description: "Jou uitvoer word verwerk. Jou sal 'n koppeling kry wanneer dit gereed is.",
      });
      // In a real app, this would start a background job
      setTimeout(() => {
        toast({
          title: "Uitvoer Gereed",
          description: "Jou lêer is gereed vir aflaai!",
        });
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Uitvoer Misluk",
        description: "Kon nie jou versameling uitvoer nie. Probeer weer.",
        variant: "destructive",
      });
    },
  });

  const shareCollectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/collections/share", "POST");
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.shareUrl);
      toast({
        title: "Deelkoppeling Geskep",
        description: "Deelkoppeling is na jou klipbord gekopieer!",
      });
    },
  });

  const formatOptions = [
    { id: "csv", name: "CSV", icon: FileSpreadsheet, description: "Geskik vir Excel en Google Sheets" },
    { id: "pdf", name: "PDF", icon: FileText, description: "Drukvriendlike katalogus" },
    { id: "excel", name: "Excel", icon: FileSpreadsheet, description: "Microsoft Excel formaat" },
    { id: "json", name: "JSON", icon: FileText, description: "Tegniese data uitvoer" }
  ];

  const filterOptions = [
    { id: "all", name: "Alle Boeke" },
    { id: "wishlist", name: "Slegs Wenslys" },
    { id: "rare", name: "Slegs Skaars" },
    { id: "genre", name: "Per Genre" },
    { id: "author", name: "Per Outeur" }
  ];

  const sortOptions = [
    { id: "title", name: "Titel" },
    { id: "author", name: "Outeur" },
    { id: "year", name: "Jaar" },
    { id: "genre", name: "Genre" },
    { id: "added", name: "Datum Bygevoeg" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center space-x-2">
          <Download className="h-6 w-6 text-primary" />
          <span>Gevorderde Uitvoer</span>
        </h2>
        <p className="text-muted-foreground">
          Voer jou versameling uit in verskeie formate en deel met ander
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Uitvoer Opsies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Formaat</h4>
              <div className="grid grid-cols-2 gap-2">
                {formatOptions.map((format) => (
                  <Button
                    key={format.id}
                    variant={exportOptions.format === format.id ? "default" : "outline"}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.id }))}
                    className="flex items-center space-x-2 justify-start h-auto p-3"
                  >
                    <format.icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{format.name}</div>
                      <div className="text-xs opacity-70">{format.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Filter</h4>
              <select 
                className="w-full p-2 border border-input rounded-md bg-background"
                value={exportOptions.filterBy}
                onChange={(e) => setExportOptions(prev => ({ ...prev, filterBy: e.target.value }))}
              >
                {filterOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Sorteer Volgens</h4>
              <select 
                className="w-full p-2 border border-input rounded-md bg-background"
                value={exportOptions.sortBy}
                onChange={(e) => setExportOptions(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>

            {/* Additional Options */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Addisionele Opsies</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeImages}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeImages: e.target.checked 
                    }))}
                  />
                  <span className="text-sm">Sluit boek afbeeldings in</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeReviews}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeReviews: e.target.checked 
                    }))}
                  />
                  <span className="text-sm">Sluit persoonlike resensies in</span>
                </label>
              </div>
            </div>

            <Button 
              onClick={() => exportMutation.mutate(exportOptions)}
              disabled={exportMutation.isPending}
              className="w-full"
            >
              {exportMutation.isPending ? "Voer Uit..." : "Begin Uitvoer"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Vinnige Aksies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => shareCollectionMutation.mutate()}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Deel Versameling Openbaar
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Druk Versameling
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Rugsteun na Wolk
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <Image className="h-4 w-4 mr-2" />
              Genereer Visuele Katalogus
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Uitvoer Geskiedenis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportHistory?.map((export_item: any) => (
              <div key={export_item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {export_item.type === 'pdf' && <FileText className="h-5 w-5 text-primary" />}
                    {export_item.type === 'csv' && <FileSpreadsheet className="h-5 w-5 text-primary" />}
                    {export_item.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {export_item.name || `${export_item.type.toUpperCase()} Uitvoer`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(export_item.createdAt).toLocaleDateString('af-ZA')} • {export_item.size}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={export_item.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {export_item.status === 'completed' ? 'Gereed' : 'Verwerk'}
                  </Badge>
                  {export_item.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Laai Af
                    </Button>
                  )}
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <Download className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Geen Uitvoer Geskiedenis
                </h3>
                <p className="text-muted-foreground">
                  Jou uitvoer geskiedenis sal hier verskyn
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Uitvoer Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg text-center">
              <FileText className="mx-auto h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold text-foreground mb-1">Versekering Rapport</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Volledige waardasie en toestand rapport
              </p>
              <Button size="sm" variant="outline">Gebruik Template</Button>
            </div>

            <div className="p-4 border border-border rounded-lg text-center">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold text-foreground mb-1">Inventaris Lys</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Basiese lys vir inventaris bestuur
              </p>
              <Button size="sm" variant="outline">Gebruik Template</Button>
            </div>

            <div className="p-4 border border-border rounded-lg text-center">
              <Image className="mx-auto h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold text-foreground mb-1">Visuele Katalogus</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Foto katalogus met beskrywings
              </p>
              <Button size="sm" variant="outline">Gebruik Template</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}