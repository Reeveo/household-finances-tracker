import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoundSterling, LineChart, Wallet, Calculator, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Must be a valid email address"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === "register" ? "register" : "login");
  const navigate = useNavigate();
  const { user, loginMutation, registerMutation } = useAuth();
  const isMobile = useIsMobile();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
    },
  });
  
  // Redirect if already logged in using useEffect
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Update tab when URL param changes
  useEffect(() => {
    if (tabParam === "register") {
      setActiveTab("register");
    } else if (tabParam === "login") {
      setActiveTab("login");
    }
  }, [tabParam]);

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/auth-page${value === "register" ? "?tab=register" : ""}`);
  };

  // Show a compact version of the features on mobile
  const FeatureItem = ({ icon: Icon, title, description }: { 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>, 
    title: string, 
    description: string 
  }) => (
    <div className="flex items-start space-x-3 sm:space-x-4">
      <div className="bg-primary/10 p-2 sm:p-3 rounded-lg shrink-0">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-3 sm:p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-center">
        {/* Auth Form */}
        <Card className="w-full shadow-lg">
          <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center mb-1 sm:mb-2">
              <PoundSterling className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2" />
              <CardTitle className="text-xl sm:text-2xl">Personal Finance Tracker</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Manage your finances, track expenses, and plan for the future
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login" className="text-xs sm:text-sm py-1.5 sm:py-2">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-xs sm:text-sm py-1.5 sm:py-2">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3 sm:space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username" 
                            className="h-9 sm:h-10 text-sm" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            className="h-9 sm:h-10 text-sm" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-9 sm:h-10 text-sm"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </span>
                    ) : "Login"}
                  </Button>
                </form>
              </Form>
              
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                <span>Don't have an account?</span>{" "}
                <Button variant="link" className="p-0 h-auto text-xs sm:text-sm" onClick={() => handleTabChange("register")}>
                  Sign up
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3 sm:space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            className="h-9 sm:h-10 text-sm" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="h-9 sm:h-10 text-sm" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a username" 
                              className="h-9 sm:h-10 text-sm" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a password" 
                              className="h-9 sm:h-10 text-sm" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-9 sm:h-10 text-sm"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </span>
                    ) : "Create Account"}
                  </Button>
                </form>
              </Form>
              
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                <span>Already have an account?</span>{" "}
                <Button variant="link" className="p-0 h-auto text-xs sm:text-sm" onClick={() => handleTabChange("login")}>
                  Log in
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Condensed feature section for mobile */}
          {isMobile && (
            <CardFooter className="border-t px-4 py-4 flex flex-col space-y-4">
              <h3 className="text-sm font-medium text-center">Features</h3>
              <div className="grid grid-cols-1 gap-3">
                <FeatureItem 
                  icon={LineChart}
                  title="Visual Financial Insights"
                  description="Track income, expenses, and net worth over time."
                />
                <FeatureItem 
                  icon={Wallet}
                  title="Expense Tracking & Budgeting"
                  description="Categorize expenses and set budget targets."
                />
              </div>
            </CardFooter>
          )}
        </Card>
        
        {/* Hero Section - Desktop only */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Take control of your financial future
            </h2>
            <p className="text-gray-600">
              Our comprehensive financial management platform helps you track expenses,
              plan savings, and make informed decisions about your money.
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              <FeatureItem 
                icon={LineChart}
                title="Visual Financial Insights"
                description="Interactive dashboards to track income, expenses, and net worth over time."
              />
              
              <FeatureItem 
                icon={Wallet}
                title="Expense Tracking & Budgeting"
                description="Categorize expenses and set budget targets to improve your spending habits."
              />
              
              <FeatureItem 
                icon={Calculator}
                title="Financial Planning Tools"
                description="Mortgage, overpayment and pension calculators to help plan your future."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
