import React from 'react';
import type { MapProps } from './index';
import { mapEmbedUrl } from '../../utils/appointmentLocation';
export function AppointmentMap({ point }: MapProps) {
  return <iframe title="Mapa da região aproximada do CEP da diária" src={mapEmbedUrl(point)} loading="lazy"
    referrerPolicy="no-referrer" style={{width:'100%',height:280,border:0,display:'block'}} />;
}
