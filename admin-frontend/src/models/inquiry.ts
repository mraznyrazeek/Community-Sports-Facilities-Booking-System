export interface Inquiry {
  inquiryId: number;
  memberId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
  responses?: InquiryResponse[];
}

export interface InquiryResponse {
  responseId: number;
  inquiryId: number;
  senderRole: "Admin" | "Member";
  message: string;
  createdAt: string;
}

export interface CreateInquiryRequest {
  subject: string;
  message: string;
}

export interface CreateInquiryResponseRequest {
  message: string;
}

export interface UpdateInquiryRequest {
  subject: string;
  message: string;
  status?: "Pending" | "In Progress" | "Resolved";
}