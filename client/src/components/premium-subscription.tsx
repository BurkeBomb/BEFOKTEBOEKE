import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users,
  TrendingUp,
  Gift
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function PremiumSubscription() {
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/subscription/status"],
  });

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      return await apiRequest(`/api/subscription/upgrade`, "POST", { plan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
      toast({
        title: "Opgradering Suksesvol",
        description: "Jou rekening is opgegradeer! Geniet jou nuwe voordele.",
      });
    },
    onError: () => {
      toast({
        title: "Opgradering Misluk",
        description: "Kon nie rekening opgradeer nie. Probeer weer.",
        variant: "destructive",
      });
    },
  });

  const plans = [
    {
      id: "free",
      name: "Gratis",
      price: 0,
      period: "per maand",
      color: "bg-muted",
      textColor: "text-muted-foreground",
      features: [
        "Tot 100 boeke",
        "Basiese soektog",
        "Advertensies",
        "Basiese statistieke",
        "Email ondersteuning"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 4900, // R49.00
      period: "per maand",
      color: "bg-primary",
      textColor: "text-primary-foreground",
      popular: true,
      features: [
        "Onbeperkte boeke",
        "Geen advertensies",
        "AI aanbevelings",
        "Gevorderde analise",
        "Prioriteit ondersteuning",
        "Barcode skan",
        "Wolkrugsteun",
        "Uitvoer na alle formate"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: 9900, // R99.00
      period: "per maand",
      color: "bg-gradient-to-r from-amber-500 to-orange-500",
      textColor: "text-white",
      features: [
        "Alles in Premium",
        "Sosiale gemeenskapsfunksies",
        "Boekklubs en wedstryde",
        "Versekering waardasies",
        "Uitleenbestuur",
        "Persoonlike assistent",
        "Vroë toegang tot funksies",
        "Video ondersteuning"
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('af-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount / 100);
  };

  const currentTier = user?.subscriptionTier || 'free';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Kies jou Plan
        </h2>
        <p className="text-muted-foreground">
          Ontsluit kragtige funksies om jou boekversameling te bestuur
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative overflow-hidden ${
              selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
            } ${currentTier === plan.id ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0">
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Gewildste Plan
                </div>
              </div>
            )}
            
            {currentTier === plan.id && (
              <div className="absolute top-0 right-0">
                <Badge className="bg-green-500 text-white">
                  Huidige Plan
                </Badge>
              </div>
            )}

            <CardHeader className={`${plan.popular ? 'pt-8' : ''}`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                {plan.id === 'pro' && <Crown className="h-6 w-6 text-amber-500" />}
                {plan.id === 'premium' && <Star className="h-6 w-6 text-primary" />}
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-foreground">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.color} ${plan.textColor}`}
                onClick={() => {
                  setSelectedPlan(plan.id);
                  if (plan.id !== 'free' && currentTier !== plan.id) {
                    upgradeMutation.mutate(plan.id);
                  }
                }}
                disabled={currentTier === plan.id || upgradeMutation.isPending}
              >
                {currentTier === plan.id ? (
                  "Huidige Plan"
                ) : plan.id === 'free' ? (
                  "Gratis Plan"
                ) : upgradeMutation.isPending ? (
                  "Opgradeer..."
                ) : (
                  `Opgradeer na ${plan.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Vergelyk Funksies</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Premium Voordele</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• AI-aangedrewe genre voorspellings</li>
                <li>• Gevorderde soek en filter opsies</li>
                <li>• Advertensie-vrye ervaring</li>
                <li>• Wolkrugsteun van jou versameling</li>
                <li>• Uitvoer na alle formate (PDF, Excel, CSV)</li>
                <li>• Barcode skan vir vinnige toevoeging</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Users className="h-4 w-4 text-amber-500" />
                <span>Pro Eksklusief</span>
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Boekklubs en leesuitdagings</li>
                <li>• Sosiale funksies en resensies</li>
                <li>• Versekering waardasie rapporte</li>
                <li>• Uitleenbestuur en herinneringe</li>
                <li>• Persoonlike boek assistent</li>
                <li>• Vroë toegang tot nuwe funksies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Verwys Vriende Program</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">
                Verdien 1 maand gratis Premium vir elke vriend wat aansluit!
              </p>
              <p className="text-sm text-muted-foreground">
                Jou verwysing kode: <code className="bg-muted px-2 py-1 rounded">
                  {user?.referralCode || 'BURKEBOOKS123'}
                </code>
              </p>
            </div>
            <Badge variant="secondary">
              {user?.totalReferrals || 0} Verwysings
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}