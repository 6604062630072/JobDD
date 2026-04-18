export interface Company {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  socialLinks?: Record<string, string>;
  isVerified: boolean;
  verificationStatus: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  verificationDocs?: string[];
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export interface CreateCompanyDto {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
}
