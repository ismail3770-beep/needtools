import { exportEditedPdf } from "./usePdfExport";

self.onmessage = async (e: MessageEvent) => {
  const { originalPdfBytes, edits, minFontScale } = e.data;
  try {
    const result = await exportEditedPdf(originalPdfBytes, edits, minFontScale);
    (self as unknown as Worker).postMessage({ success: true, result }, [result.pdfBytes.buffer]);
  } catch (error: any) {
    (self as unknown as Worker).postMessage({ success: false, error: error.message });
  }
};
