"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, QrCode } from "lucide-react";

export default function QrDashboardPage() {
  const [myQRCodes, setMyQRCodes] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("needtools_qrcodes");
    if (saved) {
      try {
        setMyQRCodes(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center justify-between">
          <Link href="/tools/qr-codes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Generator
          </Link>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
            My QR Codes
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 mb-8">
            <QrCode className="w-8 h-8 text-blue-500" /> My QR Codes
          </h1>

          {myQRCodes.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p>You haven't created any Trackable QR codes yet on this browser.</p>
              <Link href="/tools/qr-codes" className="inline-block mt-4 text-blue-600 font-bold hover:underline">
                Create your first Dynamic QR
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myQRCodes.map((qr) => (
                <div key={qr.shortId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{qr.name || "Untitled"}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Dest: {qr.destinationUrl}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      ID: {qr.shortId} &bull; Created {new Date(qr.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <Link href={`/tools/qr-codes/stats/${qr.shortId}`} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Stats
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
