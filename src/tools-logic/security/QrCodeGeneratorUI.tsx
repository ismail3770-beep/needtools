"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import QRCodeStyling from "qr-code-styling";

export default function QrCodeGeneratorUI() {
  const inputClass = 'w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-black dark:text-white outline-none focus:border-black/25 dark:focus:border-white/25';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40 mb-1.5';
  const switcherBtn = 'inline-flex items-center rounded-lg border border-black/10 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors mb-2 mr-1';
  const switcherActive = 'inline-flex items-center rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-xs font-semibold mb-2 mr-1';

  const tabs = [
    { id: "text", label: "Text" },
    { id: "link", label: "URL" },
    { id: "email", label: "Email" },
    { id: "sms", label: "SMS" },
    { id: "phone", label: "Call" },
    { id: "wifi", label: "WiFi" },
    { id: "vcard", label: "vCard" },
    { id: "event", label: "Event" },
  ];

  const [activeTab, setActiveTab] = useState("link");
  const [isTrackable, setIsTrackable] = useState(false);
  
  const [inputs, setInputs] = useState<any>({
    text: "",
    link: "https://needtools.app",
    email: "", emailSub: "", emailBody: "",
    phone: "",
    smsPhone: "", smsBody: "",
    wifiSsid: "", wifiPass: "", wifiEnc: "wpa",
    vcardFname: "", vcardLname: "", vcardPhone: "", vcardEmail: "", vcardOrg: "",
    eventTitle: "", eventLoc: "", eventUrl: "",
  });

  const [dotsColor, setDotsColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShortId, setGeneratedShortId] = useState<string | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  const [qrCodeStyling, setQrCodeStyling] = useState<any>(null);
  const [myQRCodes, setMyQRCodes] = useState<any[]>([]);

  useEffect(() => {
    const qs = new QRCodeStyling({
      width: 250,
      height: 250,
      margin: 10,
      imageOptions: { crossOrigin: "anonymous", margin: 10 }
    });
    setQrCodeStyling(qs);
    if (qrRef.current) qs.append(qrRef.current);

    const saved = localStorage.getItem("needtools_qrcodes");
    if (saved) {
      try { setMyQRCodes(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!qrCodeStyling) return;
    qrCodeStyling.update({
      data: getRawPayload(),
      dotsOptions: { color: dotsColor, type: "square" },
      backgroundOptions: { color: bgColor },
    });
  }, [inputs, activeTab, dotsColor, bgColor, qrCodeStyling]);

  const handleInputChange = (key: string, val: string) => {
    setInputs((prev: any) => ({ ...prev, [key]: val }));
  };

  const getRawPayload = () => {
    switch (activeTab) {
      case "link": return inputs.link || "https://needtools.app";
      case "email": return `mailto:${inputs.email}?subject=${encodeURIComponent(inputs.emailSub)}&body=${encodeURIComponent(inputs.emailBody)}`;
      case "sms": return `sms:${inputs.smsPhone}?body=${encodeURIComponent(inputs.smsBody)}`;
      case "phone": return `tel:${inputs.phone}`;
      case "text": return inputs.text || "Hello World";
      case "wifi": return `WIFI:T:${inputs.wifiEnc};S:${inputs.wifiSsid};P:${inputs.wifiPass};;`;
      case "vcard": return `BEGIN:VCARD\nVERSION:3.0\nN:${inputs.vcardLname};${inputs.vcardFname}\nFN:${inputs.vcardFname} ${inputs.vcardLname}\nORG:${inputs.vcardOrg}\nTEL:${inputs.vcardPhone}\nEMAIL:${inputs.vcardEmail}\nEND:VCARD`;
      case "event": return `BEGIN:VEVENT\nSUMMARY:${inputs.eventTitle}\nLOCATION:${inputs.eventLoc}\nURL:${inputs.eventUrl}\nEND:VEVENT`;
      default: return inputs.link;
    }
  };

  const handleGenerate = async () => {
    if (!qrCodeStyling) return;
    setIsGenerating(true);
    setGeneratedShortId(null);
    
    try {
      let finalPayload = getRawPayload();
      
      if (isTrackable && ["link", "email", "phone", "sms"].includes(activeTab)) {
        const { databases } = await import("@/lib/appwrite");
        const dbId = process.env.NEXT_PUBLIC_APPWRITE_DB_ID || "6a789c5430b868b6d118";
        const qrColId = process.env.NEXT_PUBLIC_APPWRITE_QR_COL_ID || "6a88a2e1ec9f98d098a2"; // using the proper collection
        
        const shortId = Math.random().toString(36).substring(2, 8);
        
        await databases.createDocument(
          dbId,
          qrColId,
          "unique()",
          {
            shortId,
            destinationUrl: finalPayload,
            payloadData: JSON.stringify({ type: activeTab, name: inputs.link || "My QR Code" }),
            isDynamic: true,
            createdAt: new Date().toISOString()
          }
        );

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://needtools.app';
        finalPayload = `${baseUrl}/qr/${shortId}`; 
        setGeneratedShortId(shortId);
        
        const newQr = {
          shortId,
          name: inputs.link || "Untitled",
          destinationUrl: getRawPayload(),
          createdAt: new Date().toISOString()
        };
        const updatedList = [newQr, ...myQRCodes];
        setMyQRCodes(updatedList);
        localStorage.setItem("needtools_qrcodes", JSON.stringify(updatedList));

        qrCodeStyling.update({ data: finalPayload });
      }
    } catch (err: any) {
      console.error(err);
    }
    setIsGenerating(false);
  };

  const handleDownload = (ext: "png" | "jpeg" | "webp" | "svg") => {
    if (qrCodeStyling) qrCodeStyling.download({ name: "qr-code", extension: ext });
  };

  return (
    <div className="rounded-xl bg-white dark:bg-neutral-900/20 shadow-sm overflow-hidden text-left font-sans">
      
      {/* Top Bar: Static / Dynamic switch */}
      <div className="flex flex-wrap items-center gap-2 border-b border-black/5 dark:border-white/10 px-4 sm:px-6 py-3">
          <button 
            onClick={() => setIsTrackable(false)}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${!isTrackable ? 'bg-black text-white dark:bg-white dark:text-black' : 'border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Static
          </button>
          <button 
            onClick={() => setIsTrackable(true)}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${isTrackable ? 'bg-black text-white dark:bg-white dark:text-black' : 'border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Dynamic · Trackable
          </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_minmax(16rem,20rem)] divide-y lg:divide-y-0 lg:divide-x divide-black/5 dark:divide-white/10">
          
          {/* Left Column: Form & Customization */}
          <div className="p-4 sm:p-6 space-y-6">
              
              {/* Tabs */}
              <div className="flex flex-wrap gap-1">
                  {tabs.map(tab => (
                      <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={activeTab === tab.id ? switcherActive : switcherBtn}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>

              {/* Dynamic Inputs Panel */}
              <div className="space-y-4">
                  {activeTab === "text" && (
                      <div><label className={labelClass}>Text</label><textarea className={inputClass} rows={4} value={inputs.text} onChange={(e) => handleInputChange('text', e.target.value)} placeholder="Your Text"></textarea></div>
                  )}
                  {activeTab === "link" && (
                      <div><label className={labelClass}>URL</label><input type="text" className={inputClass} value={inputs.link} onChange={(e) => handleInputChange('link', e.target.value)} placeholder="https://" /></div>
                  )}
                  {activeTab === "email" && (
                      <>
                          <div><label className={labelClass}>Email</label><input type="email" className={inputClass} value={inputs.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="e.g. someone@domain.com" /></div>
                          <div><label className={labelClass}>Subject</label><input type="text" className={inputClass} value={inputs.emailSub} onChange={(e) => handleInputChange('emailSub', e.target.value)} placeholder="e.g. Job Application" /></div>
                          <div><label className={labelClass}>Message</label><textarea className={inputClass} rows={3} value={inputs.emailBody} onChange={(e) => handleInputChange('emailBody', e.target.value)} placeholder="e.g. Your message here to be sent as email"></textarea></div>
                      </>
                  )}
                  {activeTab === "phone" && (
                      <div><label className={labelClass}>Phone Number</label><input type="text" className={inputClass} value={inputs.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="e.g. 123456789" /></div>
                  )}
                  {activeTab === "sms" && (
                      <>
                          <div><label className={labelClass}>Phone Number</label><input type="text" className={inputClass} value={inputs.smsPhone} onChange={(e) => handleInputChange('smsPhone', e.target.value)} placeholder="e.g 123456789" /></div>
                          <div><label className={labelClass}>Message</label><textarea className={inputClass} rows={3} value={inputs.smsBody} onChange={(e) => handleInputChange('smsBody', e.target.value)} placeholder="e.g. Job Application"></textarea></div>
                      </>
                  )}
                  {activeTab === "vcard" && (
                      <>
                          <div><label className={labelClass}>First Name</label><input type="text" className={inputClass} value={inputs.vcardFname} onChange={(e) => handleInputChange('vcardFname', e.target.value)} placeholder="e.g. John" /></div>
                          <div><label className={labelClass}>Last Name</label><input type="text" className={inputClass} value={inputs.vcardLname} onChange={(e) => handleInputChange('vcardLname', e.target.value)} placeholder="e.g. Doe" /></div>
                          <div><label className={labelClass}>Phone</label><input type="text" className={inputClass} value={inputs.vcardPhone} onChange={(e) => handleInputChange('vcardPhone', e.target.value)} placeholder="e.g. +112345689" /></div>
                      </>
                  )}
                  {activeTab === "wifi" && (
                      <>
                          <div><label className={labelClass}>Network SSID</label><input type="text" className={inputClass} value={inputs.wifiSsid} onChange={(e) => handleInputChange('wifiSsid', e.target.value)} placeholder="e.g 123456789" /></div>
                          <div><label className={labelClass}>Password</label><input type="text" className={inputClass} value={inputs.wifiPass} onChange={(e) => handleInputChange('wifiPass', e.target.value)} placeholder="Optional" /></div>
                          <div><label className={labelClass}>Encryption</label><select className={inputClass} value={inputs.wifiEnc} onChange={(e) => handleInputChange('wifiEnc', e.target.value)}><option value="wep">WEP</option><option value="wpa">WPA/WPA2</option></select></div>
                      </>
                  )}
                  {activeTab === "event" && (
                      <>
                          <div><label className={labelClass}>Title</label><input type="text" className={inputClass} value={inputs.eventTitle} onChange={(e) => handleInputChange('eventTitle', e.target.value)} /></div>
                          <div><label className={labelClass}>Location</label><input type="text" className={inputClass} value={inputs.eventLoc} onChange={(e) => handleInputChange('eventLoc', e.target.value)} /></div>
                      </>
                  )}
              </div>

              {/* Customization Details Accordion */}
              <details className="rounded-lg border border-black/5 dark:border-white/10 mt-6" open>
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Customization</summary>
                  <div className="px-4 pb-4 space-y-4 border-t border-black/5 dark:border-white/10 pt-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                              <label className={labelClass}>Background</label>
                              <div className="flex items-center gap-2">
                                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-9 rounded p-0 border border-black/10 cursor-pointer" />
                                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className={inputClass} />
                              </div>
                          </div>
                          <div>
                              <label className={labelClass}>Foreground</label>
                              <div className="flex items-center gap-2">
                                  <input type="color" value={dotsColor} onChange={(e) => setDotsColor(e.target.value)} className="h-9 w-9 rounded p-0 border border-black/10 cursor-pointer" />
                                  <input type="text" value={dotsColor} onChange={(e) => setDotsColor(e.target.value)} className={inputClass} />
                              </div>
                          </div>
                      </div>
                      <Link href="/tools/qr-codes/dashboard" className="block rounded-lg border border-dashed border-black/15 dark:border-white/15 px-4 py-3 text-xs text-black/50 dark:text-white/50 hover:bg-black/5 transition-colors">
                          Access the dashboard for advanced features such as Dynamic QR Codes, advanced QR Code customization and frames.
                      </Link>
                  </div>
              </details>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button onClick={handleGenerate} disabled={isGenerating} className="inline-flex items-center justify-center rounded-lg bg-black dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-colors">
                      {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                      Generate
                  </button>
              </div>

          </div>

          {/* Right Column: Preview Panel */}
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-neutral-50/80 dark:bg-neutral-950/40 min-h-[16rem] lg:sticky lg:top-24">
              
              <div className="w-full max-w-[12rem] bg-white rounded-lg shadow-sm border border-black/5 flex items-center justify-center overflow-hidden mb-4 p-2">
                  <div ref={qrRef} className="w-full aspect-square flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto" style={{ filter: isGenerating ? 'blur(2px)' : 'none' }}></div>
              </div>
              
              <div className="mt-4 flex w-full max-w-xs gap-2 mb-4">
                  {["svg", "png", "webp"].map((ext) => (
                      <button 
                          key={ext}
                          onClick={() => handleDownload(ext as any)}
                          className="flex-1 rounded-lg border border-black/10 dark:border-white/10 px-2 py-2 text-xs font-semibold uppercase hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                          {ext}
                      </button>
                  ))}
              </div>

              {generatedShortId && (
                  <div className="w-full max-w-xs mb-4 flex items-center justify-center gap-2 text-xs text-emerald-600 bg-emerald-50 py-2 rounded-lg font-medium border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" /> Live routing enabled
                  </div>
              )}

              <p className="mt-4 text-xs text-center text-black/40 dark:text-white/40">
                  Access the dashboard for advanced features such as Dynamic QR Codes, advanced QR Code customization and frames.
              </p>
              
              <Link href="/tools/qr-codes/dashboard" className="mt-3 inline-flex items-center justify-center rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-colors w-full max-w-xs">
                  Dashboard
              </Link>
          </div>
      </div>
    </div>
  );
}
