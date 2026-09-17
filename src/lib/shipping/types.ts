export interface CourierTrackingUpdate {
  trackingNumber: string;
  courierPartner: string;
  courierStatus: string;
  location?: string;
  timestamp?: string;
  delivered?: boolean;
}
