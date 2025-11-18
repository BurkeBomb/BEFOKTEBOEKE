import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Share2,
  Download,
  Copy,
  Palette,
  Type,
  Image as ImageIcon,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/IMG_0287_1753515119482.png";
import type { Book as BookRecord } from "@shared/schema";

interface BookShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: BookRecord;
}

interface QuoteGraphicOptions {
  template: 'classic' | 'modern' | 'minimal' | 'vintage' | 'elegant';
  colorScheme: 'warm' | 'cool' | 'monochrome' | 'vibrant' | 'earth';
  includeRating: boolean;
  includeReview: boolean;
  customQuote: string;
  fontSize: 'small' | 'medium' | 'large';
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export default function BookShareModal({ open, onOpenChange, book }: BookShareModalProps) {
  const [shareOptions, setShareOptions] = useState<QuoteGraphicOptions>({
    template: 'classic',
    colorScheme: 'warm',
    includeRating: true,
    includeReview: false,
    customQuote: '',
    fontSize: 'medium',
    logoPosition: 'bottom-right'
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const colorSchemes = {
    warm: {
      background: '#FFF7ED',
      primary: '#EA580C',
      secondary: '#FED7AA',
      text: '#9A3412',
      accent: '#FB923C'
    },
    cool: {
      background: '#F0F9FF',
      primary: '#0284C7',
      secondary: '#BAE6FD',
      text: '#0C4A6E',
      accent: '#38BDF8'
    },
    monochrome: {
      background: '#F9FAFB',
      primary: '#374151',
      secondary: '#E5E7EB',
      text: '#111827',
      accent: '#6B7280'
    },
    vibrant: {
      background: '#FDF4FF',
      primary: '#C026D3',
      secondary: '#F3E8FF',
      text: '#86198F',
      accent: '#E879F9'
    },
    earth: {
      background: '#FFFBEB',
      primary: '#92400E',
      secondary: '#FDE68A',
      text: '#78350F',
      accent: '#D97706'
    }
  };

  const generateQuoteGraphic = useCallback(async () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const context = ctx;

      // Set canvas size for social media (1080x1080 for Instagram)
      canvas.width = 1080;
      canvas.height = 1080;

      const colors = colorSchemes[shareOptions.colorScheme];
      
      // Clear canvas and set background
      context.fillStyle = colors.background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Add gradient background based on template
      if (shareOptions.template === 'modern') {
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, colors.background);
        gradient.addColorStop(1, colors.secondary);
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Add decorative elements based on template
      if (shareOptions.template === 'elegant') {
        context.strokeStyle = colors.primary;
        context.lineWidth = 8;
        context.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      }

      const coverSize = 280;
      const coverX = (canvas.width - coverSize) / 2;
      const coverY = 120;

      const drawBookCoverPlaceholder = () => {
        context.fillStyle = colors.primary;
        context.fillRect(coverX, coverY, coverSize, coverSize * 1.4);
        context.fillStyle = colors.background;
        context.font = 'bold 80px Arial';
        context.textAlign = 'center';
        context.fillText('📚', coverX + coverSize / 2, coverY + coverSize * 0.7);
      };

      const continueDrawing = () => {
        context.fillStyle = colors.text;
        context.font = `bold ${shareOptions.fontSize === 'large' ? '56' : shareOptions.fontSize === 'medium' ? '48' : '40'}px Arial`;
        context.textAlign = 'center';

        const maxWidth = canvas.width - 120;
        const words = book.title.split(' ');
        let line = '';
        let y = coverY + coverSize * 1.4 + 80;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = context.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, canvas.width / 2, y);
            line = words[n] + ' ';
            y += 60;
          } else {
            line = testLine;
          }
        }
        context.fillText(line, canvas.width / 2, y);

        context.font = `${shareOptions.fontSize === 'large' ? '36' : shareOptions.fontSize === 'medium' ? '32' : '28'}px Arial`;
        context.fillStyle = colors.primary;
        context.fillText(`deur ${book.author}`, canvas.width / 2, y + 60);

        const quoteText = shareOptions.customQuote ||
          (shareOptions.includeReview && book.personalReview ? book.personalReview :
            `"'n Wonderlike toevoeging tot my Afrikaanse boekversameling!"`);

        if (quoteText) {
          context.font = `italic ${shareOptions.fontSize === 'large' ? '32' : shareOptions.fontSize === 'medium' ? '28' : '24'}px Arial`;
          context.fillStyle = colors.accent;

          const quoteWords = quoteText.split(' ');
          let quoteLine = '';
          let quoteY = y + 140;

          for (let n = 0; n < quoteWords.length; n++) {
            const testLine = quoteLine + quoteWords[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth - 200 && n > 0) {
              context.fillText(quoteLine, canvas.width / 2, quoteY);
              quoteLine = quoteWords[n] + ' ';
              quoteY += 40;
            } else {
              quoteLine = testLine;
            }
          }
          context.fillText(quoteLine, canvas.width / 2, quoteY);
        }

        if (shareOptions.includeRating && book.personalRating) {
          const starSize = 32;
          const starsY = canvas.height - 200;
          const starsStartX = (canvas.width - (5 * starSize * 1.2)) / 2;

          context.font = `${starSize}px Arial`;
          for (let i = 0; i < 5; i++) {
            context.fillStyle = i < book.personalRating ? colors.primary : colors.secondary;
            context.fillText('★', starsStartX + (i * starSize * 1.2), starsY);
          }
        }

        const logoSize = 40;
        let logoX = 40;
        let logoY = canvas.height - 80;

        switch (shareOptions.logoPosition) {
          case 'top-left':
            logoX = 40;
            logoY = 60;
            break;
          case 'top-right':
            logoX = canvas.width - logoSize - 40;
            logoY = 60;
            break;
          case 'bottom-left':
            logoX = 40;
            logoY = canvas.height - 80;
            break;
          case 'bottom-right':
            logoX = canvas.width - logoSize - 40;
            logoY = canvas.height - 80;
            break;
          case 'center':
            logoX = (canvas.width - logoSize) / 2;
            logoY = canvas.height - 60;
            break;
        }

        context.fillStyle = colors.primary;
        context.beginPath();
        context.arc(logoX + logoSize / 2, logoY - logoSize / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = colors.text;
        context.font = 'bold 16px Arial';
        context.textAlign = shareOptions.logoPosition === 'center' ? 'center' : 'left';
        if (shareOptions.logoPosition === 'center') {
          context.fillText('BURKEBOOKS', logoX + logoSize / 2, logoY + 20);
        } else {
          context.fillText('BURKEBOOKS', logoX + logoSize + 10, logoY - logoSize / 2 + 6);
        }

        const imageData = canvas.toDataURL('image/png');
        setGeneratedImage(imageData);
      };

      if (book.coverImage) {
        try {
          const img = new Image();
          img.onload = () => {
            context.drawImage(img, coverX, coverY, coverSize, coverSize * 1.4);
            continueDrawing();
          };
          img.src = book.coverImage;
        } catch (error) {
          drawBookCoverPlaceholder();
          continueDrawing();
        }
      } else {
        drawBookCoverPlaceholder();
        continueDrawing();
      }
    } catch (error) {
      console.error('Error generating quote graphic:', error);
      toast({
        title: "Kon nie grafika skep nie",
        description: "Probeer asseblief weer",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [book, shareOptions, toast]);

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_share.png`;
    link.href = generatedImage;
    link.click();
  };

  const copyImageToClipboard = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast({
        title: "Gekopieër na Knipbord",
        description: "Die grafika is gereed om te plak in sosiale media",
      });
    } catch (error) {
      toast({
        title: "Kon nie kopieer nie",
        description: "Jou blaaier ondersteun nie hierdie funksie nie",
        variant: "destructive",
      });
    }
  };

  const shareToSocialMedia = (platform: string) => {
    const shareText = `Ek lees tans "${book.title}" deur ${book.author}. ${shareOptions.customQuote || "'n Fantastiese boek!"} #BURKEBOOKS #AfrikaansLiteratuur #Boeke`;
    const shareUrl = window.location.origin;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-blue-500" />
            <span>Deel "{book.title}" op Sosiale Media</span>
          </DialogTitle>
          <DialogDescription>
            Skep 'n pragtige aanhaling grafika om jou boek op sosiale media te deel
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customization Options */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Aanpassing Opsies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Sjabloon</Label>
                  <Select
                    value={shareOptions.template}
                    onValueChange={(value: any) => setShareOptions(prev => ({ ...prev, template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Klassiek</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimaal</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Scheme */}
                <div className="space-y-2">
                  <Label>Kleurskema</Label>
                  <Select
                    value={shareOptions.colorScheme}
                    onValueChange={(value: any) => setShareOptions(prev => ({ ...prev, colorScheme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warm">Warm (Oranje/Bruin)</SelectItem>
                      <SelectItem value="cool">Koel (Blou)</SelectItem>
                      <SelectItem value="monochrome">Monochroom</SelectItem>
                      <SelectItem value="vibrant">Lewendig (Pers)</SelectItem>
                      <SelectItem value="earth">Aarde (Geel/Bruin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <Label>Teks Grootte</Label>
                  <Select
                    value={shareOptions.fontSize}
                    onValueChange={(value: any) => setShareOptions(prev => ({ ...prev, fontSize: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Klein</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Groot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Logo Position */}
                <div className="space-y-2">
                  <Label>Logo Posisie</Label>
                  <Select
                    value={shareOptions.logoPosition}
                    onValueChange={(value: any) => setShareOptions(prev => ({ ...prev, logoPosition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Bo Links</SelectItem>
                      <SelectItem value="top-right">Bo Regs</SelectItem>
                      <SelectItem value="bottom-left">Onder Links</SelectItem>
                      <SelectItem value="bottom-right">Onder Regs</SelectItem>
                      <SelectItem value="center">Sentreer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Quote */}
                <div className="space-y-2">
                  <Label>Persoonlike Aanhaling</Label>
                  <Textarea
                    placeholder="Skryf jou eie aanhaling oor hierdie boek..."
                    value={shareOptions.customQuote}
                    onChange={(e) => setShareOptions(prev => ({ ...prev, customQuote: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeRating"
                      checked={shareOptions.includeRating}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, includeRating: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="includeRating">Sluit my sterretelling in</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeReview"
                      checked={shareOptions.includeReview}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, includeReview: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="includeReview">Sluit my resensie in</Label>
                  </div>
                </div>

                <Button 
                  onClick={generateQuoteGraphic}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Skep Grafika...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Skep Deel Grafika
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview and Actions */}
          <div className="space-y-4">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Voorskou</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                  {generatedImage ? (
                    <img 
                      src={generatedImage} 
                      alt="Generated quote graphic" 
                      className="max-w-full max-h-[400px] rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Klik "Skep Deel Grafika" om 'n voorskou te sien</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {generatedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Deel of Laai Af</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Download and Copy */}
                  <div className="flex space-x-2">
                    <Button onClick={downloadImage} variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Laai Af
                    </Button>
                    <Button onClick={copyImageToClipboard} variant="outline" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Kopieer
                    </Button>
                  </div>

                  {/* Social Media Sharing */}
                  <div className="space-y-2">
                    <Label>Deel op Sosiale Media</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => shareToSocialMedia('twitter')}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Twitter className="h-4 w-4 text-blue-500" />
                        <span>Twitter</span>
                      </Button>
                      <Button
                        onClick={() => shareToSocialMedia('facebook')}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <span>Facebook</span>
                      </Button>
                      <Button
                        onClick={() => shareToSocialMedia('linkedin')}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Linkedin className="h-4 w-4 text-blue-700" />
                        <span>LinkedIn</span>
                      </Button>
                      <Button
                        onClick={() => shareToSocialMedia('whatsapp')}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span>WhatsApp</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}