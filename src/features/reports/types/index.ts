// Types and interfaces for the reports system

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  parameters: ReportParameter[];
  format: "pdf" | "excel" | "csv" | "json";
  frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  automatic: boolean;
  active: boolean;
  createdAt: Date;
  lastExecution?: Date;
}

export type ReportType =
  | "user_performance"
  | "exam_statistics"
  | "certifications_issued"
  | "question_analysis"
  | "regulatory_compliance"
  | "individual_progress"
  | "period_comparison"
  | "system_audit";

export interface ReportParameter {
  name: string;
  type: "date" | "date_range" | "user" | "exam" | "certification" | "number";
  required: boolean;
  defaultValue?: string | number | Date;
  options?: ParameterOption[];
}

export interface ParameterOption {
  value: string;
  label: string;
}

export interface ReportData {
  metadata: ReportMetadata;
  data: Record<string, unknown>[];
  charts?: ChartConfiguration[];
  summary: ReportSummary;
}

export interface ReportMetadata {
  reportId: string;
  reportName: string;
  generatedAt: Date;
  parametersUsed: Record<string, unknown>;
  totalRecords: number;
  generationTime: number; // in milliseconds
}

export interface ChartConfiguration {
  type: "bar" | "line" | "pie" | "area" | "scatter";
  title: string;
  data: Record<string, unknown>[];
  configuration: Record<string, unknown>;
}

export interface ReportSummary {
  indicators: ReportIndicator[];
  trends: ReportTrend[];
  alerts: ReportAlert[];
}

export interface ReportIndicator {
  name: string;
  value: number;
  unit: string;
  change?: number; // percentage change from previous period
  status: "positive" | "neutral" | "negative";
}

export interface ReportTrend {
  metric: string;
  direction: "ascending" | "descending" | "stable";
  percentage: number;
  period: string;
}

export interface ReportAlert {
  level: "info" | "warning" | "error";
  message: string;
  recommendation?: string;
}
