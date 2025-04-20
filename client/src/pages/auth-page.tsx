import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { user, loginMutation, registerMutation, forgotPasswordMutation } = useAuth();
  
  // Get URL parameters
  const params = new URLSearchParams(location.split("?")[1]);
  const registerParam = params.get("register");
  
  useEffect(() => {
    if (registerParam === "true") {
      setActiveTab("register");
    }
  }, [registerParam]);
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  });
  
  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };
  
  const onRegisterSubmit = (data: RegisterForm) => {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
    });
  };
  
  const onForgotPasswordSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate({
      email: data.email,
    });
  };
  
  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="flex flex-1 flex-col justify-center items-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="flex mb-8 justify-center">
            <Link href="/" className="flex items-center gap-2">
              <svg className="h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-2xl font-bold">SmartBlog</span>
            </Link>
          </div>
          
          {showForgotPassword ? (
            <Card>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Send Reset Link
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  variant="link" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to login
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username or Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username or email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-center justify-between">
                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            variant="link" 
                            className="p-0" 
                            type="button" 
                            onClick={() => setShowForgotPassword(true)}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Login
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("register")}
                    >
                      Don't have an account? Register
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Fill in your details to create a new account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="Enter your email" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Create a password" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="acceptTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  I accept the <a href="#" className="text-primary hover:underline">terms and conditions</a>
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Create Account
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab("login")}
                    >
                      Already have an account? Login
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
      
      <div className="hidden lg:block lg:w-1/2 bg-primary">
        <div className="flex h-full flex-col justify-center p-8 text-white">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-6">SmartBlog</h1>
            <h2 className="text-2xl font-semibold mb-4">Collaborative Blogging Platform</h2>
            <p className="text-lg mb-8">
              Create, edit, and collaborate on blogs with an intuitive interface and powerful editorial tools.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 rounded-full p-1">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Rich Text Editing</h3>
                  <p className="text-sm opacity-90">Format your content with an intuitive WYSIWYG editor</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 rounded-full p-1">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Collaborative Workflow</h3>
                  <p className="text-sm opacity-90">Suggest edits and improvements to existing blogs</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 rounded-full p-1">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Review & Approval</h3>
                  <p className="text-sm opacity-90">Accept or reject suggestions to maintain quality</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <Link href="/">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
