import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification token.");
        return;
      }

      try {
        const response = await fetch(`/api/verify-email/${token}`, {
          method: "GET",
          credentials: "include",
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully. You can now login.");
          
          toast({
            title: "Email Verified",
            description: "Your email has been verified successfully.",
          });
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email. The token may be invalid or expired.");
          
          toast({
            title: "Verification Failed",
            description: "Failed to verify your email. The link may be invalid or expired.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email. Please try again later.");
        
        toast({
          title: "Verification Failed",
          description: "An error occurred while verifying your email.",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [token, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary-500 animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4">Verifying Your Email</h1>
              <p className="text-gray-600 mb-6">
                Please wait while we verify your email address...
              </p>
            </>
          )}
          
          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4">Email Verified</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button onClick={() => navigate("/auth")}>
                Proceed to Login
              </Button>
            </>
          )}
          
          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button variant="outline" onClick={() => navigate("/auth")}>
                Back to Login
              </Button>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
