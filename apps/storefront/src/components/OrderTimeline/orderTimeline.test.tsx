import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderTimeline, getCourierTrackingUrl } from './OrderTimeline';

describe('OrderTimeline Component & Courier Tracking', () => {
  describe('getCourierTrackingUrl', () => {
    it('generates correct tracking URLs for major Indian courier partners', () => {
      expect(getCourierTrackingUrl('Delhivery', 'DEL12345')).toBe(
        'https://www.delhivery.com/track/package/DEL12345'
      );
      expect(getCourierTrackingUrl('Blue Dart Express', 'BD998877')).toBe(
        'https://www.bluedart.com/tracking?trackNumber=BD998877'
      );
      expect(getCourierTrackingUrl('Shiprocket', 'SR554433')).toBe(
        'https://shiprocket.co/tracking/SR554433'
      );
      expect(getCourierTrackingUrl('DTDC', 'DTDC1122')).toBe(
        'https://www.dtdc.in/tracking.asp?strCnno=DTDC1122'
      );
      expect(getCourierTrackingUrl('IndiaPost Speed Post', 'IP9988')).toContain(
        'indiapost.gov.in'
      );
    });
  });

  describe('OrderTimeline Rendering', () => {
    it('renders cancelled notice when order status is CANCELLED', () => {
      render(<OrderTimeline status="CANCELLED" />);
      expect(
        screen.getByText(/This order was cancelled prior to dispatch/i)
      ).toBeDefined();
    });

    it('renders all 4 order milestones for active orders', () => {
      render(<OrderTimeline status="PROCESSING" />);
      expect(screen.getByText('Order Confirmed')).toBeDefined();
      expect(screen.getByText('Crafting & Packing')).toBeDefined();
      expect(screen.getByText('In Transit')).toBeDefined();
      expect(screen.getByText('Delivered')).toBeDefined();
    });

    it('renders tracking number and courier tracking link when provided', () => {
      render(
        <OrderTimeline
          status="SHIPPED"
          trackingNumber="DEL987654321IN"
          courierPartner="Delhivery"
          courierStatus="Out for delivery"
        />
      );

      expect(screen.getByText('DEL987654321IN')).toBeDefined();
      expect(screen.getByText('Delhivery')).toBeDefined();
      expect(screen.getByText('(Out for delivery)')).toBeDefined();

      const trackLink = screen.getByRole('link', { name: /track live shipment/i });
      expect(trackLink).toBeDefined();
      expect(trackLink.getAttribute('href')).toBe(
        'https://www.delhivery.com/track/package/DEL987654321IN'
      );
    });
  });
});
