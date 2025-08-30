import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Camera, 
  X, 
  RotateCcw, 
  Download, 
  Loader2,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CameraBookScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BookInfo {
  title: string;
  author: string;
  year?: number;
  genre: string;
  description?: string;
  confidence: number;
}

export default function CameraBookScanner({ open, onOpenChange }: CameraBookScannerProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedBook, setDetectedBook] = useState<BookInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [addToWishlist, setAddToWishlist] = useState(false);
  const [isRare, setIsRare] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Use front camera initially
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
        description: "Gee asseblief toestemming om die kamera te gebruik",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const switchCamera = useCallback(async () => {
    if (!isStreaming) return;
    
    stopCamera();
    
    try {
      // Try to switch between front and back camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: videoRef.current?.style.transform === 'scaleX(-1)' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        // Flip the video for front camera
        videoRef.current.style.transform = stream.getVideoTracks()[0].getSettings().facingMode === 'user' 
          ? 'scaleX(-1)' : 'scaleX(1)';
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      // Fallback to original camera
      startCamera();
    }
  }, [isStreaming, startCamera, stopCamera]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // Stop camera after capture
    stopCamera();
    setIsCapturing(false);
    
    // Analyze the captured image
    analyzeBookCover(imageData);
  }, [stopCamera]);

  const analyzeBookCover = async (imageData: string) => {
    setIsAnalyzing(true);
    
    try {
      const response = await apiRequest("POST", "/api/books/analyze-cover", {
        image: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
      });
      
      const bookInfo = await response.json();
      setDetectedBook(bookInfo);
      
      toast({
        title: "Boek Geïdentifiseer",
        description: `"${bookInfo.title}" deur ${bookInfo.author} gevind`,
      });
    } catch (error) {
      console.error('Error analyzing book cover:', error);
      toast({
        title: "Analise Misluk",
        description: "Kon nie die boek identifiseer nie. Probeer weer met 'n duidelike foto.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      return apiRequest("POST", "/api/books/add-from-camera", bookData);
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
        description: "Probeer asseblief weer",
        variant: "destructive",
      });
    },
  });

  const handleAddBook = () => {
    if (!detectedBook) return;
    
    addBookMutation.mutate({
      title: detectedBook.title,
      author: detectedBook.author,
      year: detectedBook.year,
      genre: detectedBook.genre,
      description: detectedBook.description,
      isRare,
      addToWishlist,
      capturedImage,
    });
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setDetectedBook(null);
    setIsAnalyzing(false);
    setAddToWishlist(false);
    setIsRare(false);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setDetectedBook(null);
    startCamera();
  };

  // Start camera when modal opens
  useEffect(() => {
    if (open && !isStreaming && !capturedImage) {
      startCamera();
    }
  }, [open, isStreaming, capturedImage, startCamera]);

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
            <Camera className="h-5 w-5 text-blue-500" />
            <span>AI Boek Kamera Skaneerder</span>
          </DialogTitle>
          <DialogDescription>
            Neem 'n foto van 'n boek se omslag om dit outomaties by jou versameling te voeg
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera/Image Display */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {isStreaming && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <Button
                      onClick={switchCamera}
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={captureImage}
                      disabled={isCapturing}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      {isCapturing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                    >
                      {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
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
              </>
            ) : (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured book cover"
                  className="w-full h-64 object-cover"
                />
                <Button
                  onClick={retakePhoto}
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Herneem
                </Button>
              </div>
            )}
          </div>

          {/* Analysis Status */}
          {isAnalyzing && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <div>
                    <p className="font-medium">Analiseer Boek Omslag...</p>
                    <p className="text-sm text-muted-foreground">
                      AI is besig om die boek te identifiseer
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
                  <span>Boek Geïdentifiseer</span>
                  <Badge variant="secondary">
                    {Math.round(detectedBook.confidence * 100)}% sekerheid
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
                </div>
                
                {detectedBook.description && (
                  <div>
                    <Label>Beskrywing</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {detectedBook.description}
                    </p>
                  </div>
                )}

                {detectedBook.confidence < 0.7 && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Lae sekerheid. Kontroleer asseblief die boek inligting voordat jy dit byvoeg.
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
                    onClick={retakePhoto}
                    variant="outline"
                    className="flex-1"
                  >
                    Herneem Foto
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