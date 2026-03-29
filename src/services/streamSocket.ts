import { Platform } from "react-native";
import { SensorFrame, SocketState } from "../types/stream";

const WS_BASE_URL = Platform.select({
  ios: "ws://192.168.1.83:8765",
  android: "ws://10.0.2.2:8765",
  default: "ws://192.168.1.83:8765",
}) as string;

const RECONNECT_TIMEOUT_MS = 10000;
const RECONNECT_INTERVAL_MS = 1000;

export type StreamEventCallback = (frame: SensorFrame) => void;
export type StateChangeCallback = (state: SocketState) => void;
export type ErrorCallback = (error: Error) => void;

export class StreamSocket {
  private ws: WebSocket | null = null;
  private intervalMs: number = 1000;
  private onFrame: StreamEventCallback | null = null;
  private onStateChange: StateChangeCallback | null = null;
  private onError: ErrorCallback | null = null;
  private sessionId: string | null = null;
  private intentionalDisconnect: boolean = false;
  private reconnectStartTime: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  connect(
    intervalMs: number,
    onFrame: StreamEventCallback,
    onStateChange: StateChangeCallback,
    onError: ErrorCallback
  ): void {
    this.intervalMs = intervalMs;
    this.onFrame = onFrame;
    this.onStateChange = onStateChange;
    this.onError = onError;
    this.sessionId = this.generateSessionId();
    this.intentionalDisconnect = false;
    this.reconnectStartTime = Date.now();

    this.doConnect();
  }

  private generateSessionId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private doConnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.onStateChange?.("connecting");

    const url = `${WS_BASE_URL}/ws/stream?mode=calm&interval_ms=${this.intervalMs}`;

    this.connectionTimeoutTimer = setTimeout(() => {
      if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
        this.ws.close();
      }
    }, RECONNECT_INTERVAL_MS);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.clearTimers();
        this.reconnectStartTime = 0;
        this.onStateChange?.("listening");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.isValidFrame(data)) {
            this.onFrame?.(data);
          } else if (data.type === "session_started") {
          } else if (data.type === "server_error") {
            console.warn("Server error:", data.message);
          } else {
            console.warn("Invalid frame received:", data);
          }
        } catch (e) {
          console.warn("Failed to parse WebSocket frame:", e);
        }
      };

      this.ws.onerror = (event) => {
        console.error("WebSocket error:", event);
      };

      this.ws.onclose = (event) => {
        this.clearTimers();

        if (this.intentionalDisconnect) {
          this.intentionalDisconnect = false;
          this.onStateChange?.("ended");
          return;
        }

        if (event.wasClean) {
          this.onStateChange?.("ended");
          return;
        }

        const elapsed = Date.now() - this.reconnectStartTime;

        if (elapsed < RECONNECT_TIMEOUT_MS) {
          this.reconnectTimer = setTimeout(() => {
            this.doConnect();
          }, RECONNECT_INTERVAL_MS);
        } else {
          this.onError?.(new Error("Failed to connect to wearable device"));
          this.onStateChange?.("error");
        }
      };
    } catch (e) {
      this.clearTimers();
      const elapsed = Date.now() - this.reconnectStartTime;

      if (elapsed < RECONNECT_TIMEOUT_MS) {
        this.reconnectTimer = setTimeout(() => {
          this.doConnect();
        }, RECONNECT_INTERVAL_MS);
      } else {
        this.onError?.(new Error("Failed to connect to wearable device"));
        this.onStateChange?.("error");
      }
    }
  }

  private clearTimers(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private isValidFrame(data: unknown): data is SensorFrame {
    if (typeof data !== "object" || data === null) return false;
    const frame = data as Record<string, unknown>;
    return (
      frame.type === "sensor_frame" &&
      typeof frame.session_id === "string" &&
      typeof frame.seq === "number" &&
      typeof frame.mode === "string" &&
      typeof frame.timestamp === "string" &&
      typeof frame.values === "object" &&
      frame.values !== null
    );
  }

  disconnect(): void {
    this.clearTimers();
    this.intentionalDisconnect = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const streamSocket = new StreamSocket();
