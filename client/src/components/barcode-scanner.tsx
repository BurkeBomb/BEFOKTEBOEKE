import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  QrCode, 
  X, 
  RotateCcw, 
  Loader2,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookInfo {
  title: string;
  author: string;
  year?: number;
  genre: string;
  description?: string;
  isbn: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
  confidence: number;
  source: string; // 'google_books' | 'open_library' | 'worldcat'
}

export default function BarcodeScanner({ open, onOpenChange }: BarcodeScannerProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedBook, setDetectedBook] = useState<BookInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [addToWishlist, setAddToWishlist] = useState(false);
  const [isRare, setIsRare] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera for barcode scanning
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Kamera Toegang Geweier",
        description: "Gee asseblief toestemming om die kamera te gebruik vir strepieskode skandering",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsStreaming(false);
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;
    
    setIsScanning(true);
    
    // Scan for barcodes every 500ms
    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for barcode scanning
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple barcode detection (in a real implementation, you'd use a library like QuaggaJS)
      // For now, we'll simulate barcode detection
      simulateBarcodeDetection(imageData);
    }, 500);
  }, [isScanning]);

  const simulateBarcodeDetection = useCallback((imageData: ImageData) => {
    // This is a simplified simulation. In a real app, use QuaggaJS or similar library
    // For demo purposes, we'll randomly detect a barcode after a few seconds
    if (Math.random() > 0.95) { // 5% chance per scan
      const mockISBN = "9780143127796"; // Example ISBN for testing
      setScanResult(mockISBN);
      stopScanning();
      lookupBookByISBN(mockISBN);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const lookupBookByISBN = async (isbn: string) => {
    setIsAnalyzing(true);
    
    try {
      const response = await apiRequest("POST", "/api/books/lookup-isbn", { isbn });
      const bookInfo = await response.json();
      setDetectedBook(bookInfo);
      
      toast({
        title: "Boek Gevind",
        description: `"${bookInfo.title}" deur ${bookInfo.author} geïdentifiseer`,
      });
    } catch (error) {
      console.error('Error looking up ISBN:', error);
      toast({
        title: "ISBN Opsoek Misluk",
        description: "Kon nie boek inligting vir hierdie ISBN vind nie",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      return apiRequest("POST", "/api/books/add-from-isbn", bookData);
    },
    onSuccess: () => {
      toast({
        title: "Boek Bygevoeg",
        description: "Die boek is suksesvol by jou versameling gevoeg",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      resetScanner();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Kon nie boek byvoeg nie",
        description: "Probeer asseblief weer later",
        variant: "destructive",
      });
    },
  });

  const handleAddBook = () => {
    if (!detectedBook) return;
    
    addBookMutation.mutate({
      ...detectedBook,
      isRare,
      addToWishlist,
    });
  };

  const resetScanner = () => {
    setScanResult(null);
    setDetectedBook(null);
    setIsAnalyzing(false);
    setAddToWishlist(false);
    setIsRare(false);
    stopCamera();
  };

  const retryScanning = () => {
    setScanResult(null);
    setDetectedBook(null);
    startScanning();
  };

  // Start camera when modal opens
  useEffect(() => {
    if (open && !isStreaming) {
      startCamera();
    }
  }, [open, isStreaming, startCamera]);

  // Cleanup on close
  const handleClose = () => {
    resetScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-green-500" />
            <span>ISBN Strepieskode Skandeerder</span>
          </DialogTitle>
          <DialogDescription>
            Rig die kamera na 'n boek se ISBN strepieskode om dit outomaties by jou versameling te voeg
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Display */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning Overlay */}
            {isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-green-500 w-64 h-32 rounded-lg">
                  <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-transparent via-green-500/20 to-transparent animate-pulse" />
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <p className="text-white text-sm bg-black/50 rounded px-2 py-1">
                      Rig kamera na ISBN strepieskode
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {isStreaming && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {!isScanning ? (
                  <Button
                    onClick={startScanning}
                    className="rounded-full"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Begin Skandeer
                  </Button>
                ) : (
                  <Button
                    onClick={stopScanning}
                    variant="secondary"
                    className="rounded-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Stop Skandeer
                  </Button>
                )}
              </div>
            )}
            
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={startCamera} className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>Begin Kamera</span>
                </Button>
              </div>
            )}
          </div>

          {/* Scanning Status */}
          {isScanning && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="font-medium">Skandeer vir strepieskodes...</p>
                    <p className="text-sm text-muted-foreground">
                      Hou die kamera stabiel en verseker goeie beligting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ISBN Found */}
          {scanResult && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">ISBN Gevind: {scanResult}</p>
                    <p className="text-sm text-muted-foreground">
                      Soek boek inligting op...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Status */}
          {isAnalyzing && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <div>
                    <p className="font-medium">Soek Boek Inligting...</p>
                    <p className="text-sm text-muted-foreground">
                      Deursoek aanlyn databasisse vir boek besonderhede
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detected Book Information */}
          {detectedBook && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Boek Gevind</span>
                  <Badge variant="secondary">
                    Bron: {detectedBook.source}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Titel</Label>
                    <p className="font-medium">{detectedBook.title}</p>
                  </div>
                  <div>
                    <Label>Outeur</Label>
                    <p className="font-medium">{detectedBook.author}</p>
                  </div>
                  <div>
                    <Label>ISBN</Label>
                    <p className="font-medium">{detectedBook.isbn}</p>
                  </div>
                  {detectedBook.year && (
                    <div>
                      <Label>Jaar</Label>
                      <p className="font-medium">{detectedBook.year}</p>
                    </div>
                  )}
                  <div>
                    <Label>Genre</Label>
                    <Badge>{detectedBook.genre}</Badge>
                  </div>
                  {detectedBook.publisher && (
                    <div>
                      <Label>Uitgewer</Label>
                      <p className="font-medium">{detectedBook.publisher}</p>
                    </div>
                  )}
                </div>
                
                {detectedBook.description && (
                  <div>
                    <Label>Beskrywing</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {detectedBook.description}
                    </p>
                  </div>
                )}

                {/* Add Book Options */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wishlist"
                      checked={addToWishlist}
                      onCheckedChange={setAddToWishlist}
                    />
                    <Label htmlFor="wishlist">Voeg by wenslys</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rare"
                      checked={isRare}
                      onCheckedChange={setIsRare}
                    />
                    <Label htmlFor="rare">Merk as skaars</Label>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={retryScanning}
                    variant="outline"
                    className="flex-1"
                  >
                    Skandeer Weer
                  </Button>
                  <Button
                    onClick={handleAddBook}
                    disabled={addBookMutation.isPending}
                    className="flex-1"
                  >
                    {addBookMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Voeg by...
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Voeg Boek By
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}