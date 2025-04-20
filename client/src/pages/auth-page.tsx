import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm, RegisterForm, ForgotPasswordForm } from "@/components/auth/auth-forms";
import { PenSquare } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [location] = useLocation();

  // Extract tab from URL query params if present
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const tab = params.get("tab");
    if (tab && (tab === "register" || tab === "forgot-password")) {
      setActiveTab(tab);
    }
  }, [location]);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Column - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <PenSquare className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">BlogCollab</h2>
            <p className="mt-2 text-sm text-gray-600">
              Collaborative blogging made simple
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="forgot-password">Forgot Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="register" className="mt-6">
              <RegisterForm />
            </TabsContent>
            
            <TabsContent value="forgot-password" className="mt-6">
              <ForgotPasswordForm onBack={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Hero Content */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-400 to-primary-700 text-white p-8 items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to BlogCollab</h1>
          <p className="text-xl mb-8">
            The collaborative blogging platform that brings writers together to create, improve, and share amazing content.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-start">
              <div className="bg-white rounded-full p-2 mr-4">
                <PenSquare className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Create Together</h3>
                <p>Collaborate with other writers to improve your content</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Version Control</h3>
                <p>Keep track of changes and revert to previous versions</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-time Notifications</h3>
                <p>Get notified when someone edits your content</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
