import { apiClient } from "./client";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { ReportGenerateRequest } from "../types/api";

export const reportsApi = {
  generateReport: async (data?: ReportGenerateRequest): Promise<string> => {
    const response = await apiClient.post("/reports/generate", data, {
      responseType: "arraybuffer",
    });

    const filename = `stress_report_${new Date().toISOString().split("T")[0]}.pdf`;
    const file = new File(Paths.document, filename);
    
    const uint8Array = new Uint8Array(response.data);
    await file.write(uint8Array);

    return file.uri;
  },

  openReport: async (fileUri: string): Promise<void> => {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Stress Report",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  },
};
