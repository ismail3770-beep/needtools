"use client";

import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { account } from "@/lib/appwrite";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const session = await account.get();
      if (session) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isAuthenticated ? (
        <DashboardOverview onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}
