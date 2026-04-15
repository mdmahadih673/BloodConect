import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Droplets, MapPin, Phone, Calendar, Clock } from 'lucide-react';

// Fix for default marker icons in Leaflet using CDN
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  area: string;
  availability: boolean;
  last_donation_date: string;
  dist_meters: number;
  lat?: number;
  lng?: number;
}

interface DonorMapProps {
  donors: Donor[];
  center: [number, number];
  onSendRequest: (donorId: string) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function DonorMap({ donors, center, onSendRequest }: DonorMapProps) {
  return (
    <div className="h-full w-full rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User Location Marker */}
        <Marker position={center}>
          <Popup>
            <div className="font-bold">You are here</div>
          </Popup>
        </Marker>

        {donors.map((donor) => {
          // In a real app, we'd have lat/lng in the donor object
          // For this demo, let's assume they are returned or we use a fallback
          // Since PostGIS geography is used, we'd usually return them as separate fields
          // For now, let's assume the RPC returns lat/lng or we mock them for the demo
          const donorLat = center[0] + (Math.random() - 0.5) * 0.02;
          const donorLng = center[1] + (Math.random() - 0.5) * 0.02;

          const isEligible = !donor.last_donation_date || 
            (new Date().getTime() - new Date(donor.last_donation_date).getTime()) > (90 * 24 * 60 * 60 * 1000);

          return (
            <Marker key={donor.id} position={[donorLat, donorLng]}>
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-black">
                      {donor.blood_group}
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${donor.availability ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                      {donor.availability ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  
                  <h3 className="font-black text-gray-900 text-lg mb-1">{donor.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <MapPin className="w-3 h-3" />
                    {donor.area} • {(donor.dist_meters / 1000).toFixed(1)}km away
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Eligibility:</span>
                      <span className={isEligible ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {isEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Last Donation:</span>
                      <span className="text-gray-900 font-medium">
                        {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSendRequest(donor.id)}
                    className="w-full bg-red-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Droplets className="w-4 h-4" />
                    Send Request
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
