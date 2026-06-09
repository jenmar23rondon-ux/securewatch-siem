export type Role = "ADMIN" | "ANALYST" | "VIEWER";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
export type EventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "SQL_INJECTION_ATTEMPT"
  | "DDOS_ATTEMPT"
  | "PORT_SCAN"
  | "SUSPICIOUS_IP";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type LogSource = {
  id: number;
  name: string;
  type: string;
  description?: string;
  active: boolean;
};

export type SecurityEvent = {
  id: number;
  type: EventType;
  ip: string;
  payload?: string;
  severity: Severity;
  createdAt: string;
  source?: LogSource;
  threats?: Threat[];
  alerts?: Alert[];
};

export type Alert = {
  id: number;
  title: string;
  message: string;
  severity: Severity;
  status: AlertStatus;
  createdAt: string;
  event?: SecurityEvent;
};

export type Threat = {
  id: number;
  name: string;
  rule: string;
  severity: Severity;
  score: number;
  createdAt: string;
  event?: SecurityEvent;
};
