import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, RefreshCw, Save, Shield, Moon, Sun, User as UserIcon, BellRing, Lock, CreditCard, AlarmClock, FileText, HelpCircle, Trash2, Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

// Form schemas
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  enableAnimations: z.boolean(),
  enableSounds: z.boolean(),
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  budgetAlerts: z.boolean(),
  goalAlerts: z.boolean(),
  weeklyReports: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Update profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Appearance form
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      enableAnimations: true,
      enableSounds: false,
    },
  });

  // Notifications form
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      budgetAlerts: true,
      goalAlerts: true,
      weeklyReports: false,
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/users/${user?.id}`, 
        data
      );
      return await response.json() as User;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/users/${user?.id}/password`, 
        data
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please verify your current password.",
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handle security form submission
  const onSecuritySubmit = (data: SecurityFormValues) => {
    updatePasswordMutation.mutate(data);
  };

  // Handle appearance form submission
  const onAppearanceSubmit = (data: AppearanceFormValues) => {
    // In a real app, this would persist to local storage or user preferences
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Appearance updated",
        description: "Your appearance preferences have been saved.",
      });
    }, 500);
  };

  // Handle notifications form submission
  const onNotificationsSubmit = (data: NotificationsFormValues) => {
    // In a real app, this would save to user preferences in the database
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been saved.",
      });
    }, 500);
  };

  // Handle account deactivation
  const handleDeactivateAccount = () => {
    setIsSubmitting(true);
    setIsDeactivateOpen(false);
    
    // In a real app, this would call an API to deactivate the account
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Account scheduled for deactivation",
        description: "Your account will be deactivated within 30 days. You can cancel this action by contacting support.",
      });
    }, 800);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6 pb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            {isSubmitting && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving changes...
              </div>
            )}
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 text-xs sm:text-sm mb-4">
              <TabsTrigger value="profile" className="px-1 sm:px-3 py-1.5 h-9 sm:h-10">
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="px-1 sm:px-3 py-1.5 h-9 sm:h-10">
                Security
              </TabsTrigger>
              <TabsTrigger value="sharing" className="px-1 sm:px-3 py-1.5 h-9 sm:h-10">
                Sharing
              </TabsTrigger>
              <TabsTrigger value="appearance" className="px-1 sm:px-3 py-1.5 h-9 sm:h-10">
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="px-1 sm:px-3 py-1.5 h-9 sm:h-10">
                Notifications
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="mr-2 h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your account profile information and email address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              This email will be used for account notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending || !profileForm.formState.isDirty}
                          className="px-4 sm:px-5 py-2 h-10 text-sm sm:text-base w-full sm:w-auto"
                        >
                          {updateProfileMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Data Export
                  </CardTitle>
                  <CardDescription>
                    Download a copy of your financial data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md flex flex-col">
                      <div className="text-sm font-medium">Transaction History</div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Export your transactions as CSV
                      </div>
                      <Button variant="outline" size="sm" className="mt-auto justify-self-end w-full sm:w-auto">
                        <FileText className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>
                    
                    <div className="p-3 border rounded-md flex flex-col">
                      <div className="text-sm font-medium">Complete Data Export</div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Export all your financial data as JSON
                      </div>
                      <Button variant="outline" size="sm" className="mt-auto justify-self-end w-full sm:w-auto">
                        <FileText className="mr-2 h-4 w-4" />
                        Export JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updatePasswordMutation.isPending || !securityForm.formState.isDirty}
                          className="px-4 sm:px-5 py-2 h-10 text-sm sm:text-base w-full sm:w-auto"
                        >
                          {updatePasswordMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Two-Factor Authentication</div>
                        <div className="text-xs text-muted-foreground">
                          Add an extra layer of security to your account
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Session Management</div>
                        <div className="text-xs text-muted-foreground">
                          Manage your active sessions and devices
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled className="text-xs">
                        Manage Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Sharing Settings */}
            <TabsContent value="sharing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Partner Access
                  </CardTitle>
                  <CardDescription>
                    Share your financial data with trusted partners
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Active Partners</h3>
                      <div className="rounded-lg border overflow-hidden">
                        <div className="p-5 text-center text-muted-foreground text-sm">
                          You haven't shared your data with any partners yet.
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Invite a Partner</h3>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="partnerEmail">Partner's Email</Label>
                            <Input id="partnerEmail" placeholder="partner@example.com" />
                          </div>
                          
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="accessLevel">Access Level</Label>
                            <Select defaultValue="view">
                              <SelectTrigger id="accessLevel">
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                              <SelectContent position="popper">
                                <SelectItem value="view">View Only</SelectItem>
                                <SelectItem value="edit">Edit</SelectItem>
                                <SelectItem value="full">Full Access</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              View Only: Partner can see your financial data.<br />
                              Edit: Partner can modify transactions.<br />
                              Full Access: Partner has complete control.
                            </p>
                          </div>
                        </div>
                        <Button className="w-full sm:w-auto">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Send Invitation
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Pending Invitations
                  </CardTitle>
                  <CardDescription>
                    Manage your sent invitations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="p-5 text-center text-muted-foreground text-sm">
                      No pending invitations.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sun className="mr-2 h-5 w-5" />
                    Theme & Display
                  </CardTitle>
                  <CardDescription>
                    Customize how the application looks and behaves
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...appearanceForm}>
                    <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-4">
                      <FormField
                        control={appearanceForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <div className="grid grid-cols-3 gap-3 pt-1">
                              <Button
                                variant={field.value === "light" ? "default" : "outline"}
                                className={cn(
                                  "justify-start",
                                  field.value === "light" && "border-primary text-primary"
                                )}
                                type="button"
                                onClick={() => field.onChange("light")}
                              >
                                <Sun className="mr-2 h-4 w-4" />
                                Light
                              </Button>
                              <Button
                                variant={field.value === "dark" ? "default" : "outline"}
                                className={cn(
                                  "justify-start",
                                  field.value === "dark" && "border-primary text-primary"
                                )}
                                type="button"
                                onClick={() => field.onChange("dark")}
                              >
                                <Moon className="mr-2 h-4 w-4" />
                                Dark
                              </Button>
                              <Button
                                variant={field.value === "system" ? "default" : "outline"}
                                className={cn(
                                  "justify-start",
                                  field.value === "system" && "border-primary text-primary"
                                )}
                                type="button"
                                onClick={() => field.onChange("system")}
                              >
                                <Laptop className="mr-2 h-4 w-4" />
                                System
                              </Button>
                            </div>
                            <FormDescription>
                              Select a theme preference for the application interface
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appearanceForm.control}
                        name="enableAnimations"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Animations</FormLabel>
                              <FormDescription>
                                Enable or disable UI animations and transitions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appearanceForm.control}
                        name="enableSounds"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Sound Effects</FormLabel>
                              <FormDescription>
                                Enable or disable interface sound effects
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || !appearanceForm.formState.isDirty}
                          className="px-4 sm:px-5 py-2 h-10 text-sm sm:text-base w-full sm:w-auto"
                        >
                          {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Preferences
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BellRing className="mr-2 h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationsForm}>
                    <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-4">
                      <FormField
                        control={notificationsForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="budgetAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Budget Alerts</FormLabel>
                              <FormDescription>
                                Get notified when approaching budget limits
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="goalAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Savings Goal Alerts</FormLabel>
                              <FormDescription>
                                Get notified about savings goal progress
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationsForm.control}
                        name="weeklyReports"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Weekly Financial Summary</FormLabel>
                              <FormDescription>
                                Receive weekly financial reports by email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || !notificationsForm.formState.isDirty}
                          className="px-4 sm:px-5 py-2 h-10 text-sm sm:text-base w-full sm:w-auto"
                        >
                          {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Preferences
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlarmClock className="mr-2 h-5 w-5" />
                    Scheduled Notifications
                  </CardTitle>
                  <CardDescription>
                    Set recurring financial reminders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <AlarmClock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Monthly Budget Review</div>
                          <div className="text-sm text-muted-foreground">
                            First day of every month
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Danger Zone */}
          <Card className="border-destructive/30">
            <CardHeader className="border-b border-destructive/30">
              <CardTitle className="text-destructive flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanent account changes that cannot be easily reversed
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Deactivate Account</h3>
                  <p className="text-sm text-muted-foreground">
                    This will deactivate your account and hide all your data
                  </p>
                </div>
                <AlertDialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deactivate Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will deactivate your account and hide all your data. Your data will be permanently deleted after 30 days unless you reactivate your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="w-full sm:w-auto" 
                        onClick={handleDeactivateAccount}
                      >
                        Yes, deactivate my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
          
          {/* Help and Support */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center justify-center">
              <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface LaptopProps extends React.SVGAttributes<SVGElement> {
  size?: number;
}

function Laptop({ size = 24, ...props }: LaptopProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="4" width="16" height="12" rx="1" />
      <path d="M2 20h20" />
      <path d="M6 12h12" />
      <path d="M12 12v4" />
    </svg>
  );
}