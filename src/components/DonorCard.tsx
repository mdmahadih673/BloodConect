import React from 'react';
import { User, BloodRequest } from '../types';
import { Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { formatDate, isEligible, cn } from '../lib/utils';

interface DonorCardProps {
  key?: string;
  donor: User;
  onRequest?: (donorId: string) => void;
  showPhone?: boolean;
}

export default function DonorCard({ donor, onRequest, showPhone }: DonorCardProps) {
  const eligible = isEligible(donor.lastDonationDate);

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-secondary font-bold text-sm">
          {donor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-text text-sm group-hover:text-primary transition-colors">{donor.name}</h4>
          <p className="text-text-muted text-xs flex items-center gap-1">
            {donor.area} • 
            <span className={cn(
              "font-medium",
              eligible ? "text-success" : "text-orange-500"
            )}>
              {eligible ? "Eligible" : "On Break"}
            </span>
          </p>
        </div>
        <div className="bg-primary text-white px-2 py-1 rounded-md text-[11px] font-bold">
          {donor.bloodGroup}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[12px] text-text-muted">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last donation: {formatDate(donor.lastDonationDate)}</span>
        </div>
        {showPhone && (
          <div className="flex items-center gap-2 text-[12px] font-bold text-primary bg-primary/5 p-2 rounded-lg">
            <Phone className="w-3.5 h-3.5" />
            <span>{donor.phone}</span>
          </div>
        )}
      </div>

      {onRequest && (
        <button
          onClick={() => onRequest(donor._id)}
          disabled={!eligible}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          New Request
        </button>
      )}
    </div>
  );
}
