// Utility functions for working with maps

// Type definitions for Google Maps integration
declare global {
  interface Window {
    google?: any;
    initMap?: () => void;
  }
}

// Initialize a map with given container ID
export function initializeMap(containerId: string, options: { lat: number, lng: number, zoom: number }) {
  // Check if Google Maps is loaded
  if (window.google && window.google.maps) {
    try {
      const element = document.getElementById(containerId);
      if (!element) {
        console.error(`Container with ID ${containerId} not found`);
        return null;
      }

      const mapOptions = {
        center: { lat: options.lat, lng: options.lng },
        zoom: options.zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      };

      const map = new window.google.maps.Map(element, mapOptions);
      return map;
    } catch (error) {
      console.error('Error initializing map:', error);
      return null;
    }
  } else {
    // If Google Maps is not loaded, use a loading div
    const element = document.getElementById(containerId);
    if (element) {
      element.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background-color: #f0f0f0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p style="margin-top: 12px;">Loading map...</p>
        </div>
      `;
    }
    console.log(`Map API not loaded. Container: ${containerId}`);
    return null;
  }
}

// Add a marker to the map
export function addMarker(map: any, options: { lat: number, lng: number, title?: string, icon?: string }) {
  if (!map || !window.google) return null;
  
  try {
    const marker = new window.google.maps.Marker({
      position: { lat: parseFloat(options.lat.toString()), lng: parseFloat(options.lng.toString()) },
      map,
      title: options.title || 'Bus Location',
      icon: options.icon || {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#0F52BA',
        strokeWeight: 1,
        rotation: 0
      }
    });
    
    return marker;
  } catch (error) {
    console.error('Error adding marker:', error);
    return null;
  }
}

// Update a marker's position
export function updateMarkerPosition(marker: any, position: { lat: number, lng: number }) {
  if (!marker || !window.google) return;
  
  try {
    // Parse latitude and longitude to ensure they are numbers
    const lat = parseFloat(position.lat.toString());
    const lng = parseFloat(position.lng.toString());
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid position coordinates:', position);
      return;
    }
    
    const latLng = new window.google.maps.LatLng(lat, lng);
    marker.setPosition(latLng);
    
    // Update marker rotation to match travel direction if previous position exists
    if (marker.previousPosition) {
      const heading = calculateHeading(
        marker.previousPosition.lat, 
        marker.previousPosition.lng,
        lat,
        lng
      );
      
      if (heading !== null) {
        const icon = marker.getIcon();
        icon.rotation = heading;
        marker.setIcon(icon);
      }
    }
    
    // Store current position as previous for next update
    marker.previousPosition = { lat, lng };
  } catch (error) {
    console.error('Error updating marker position:', error);
  }
}

// Calculate distance between two points (in kilometers)
export function calculateDistance(point1: { lat: number, lng: number }, point2: { lat: number, lng: number }): number {
  const R = 6371; // Earth's radius in km
  const dLat = degToRad(point2.lat - point1.lat);
  const dLng = degToRad(point2.lng - point1.lng);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(degToRad(point1.lat)) * Math.cos(degToRad(point2.lat)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

// Helper function to convert degrees to radians
function degToRad(deg: number): number {
  return deg * (Math.PI/180);
}

// Helper function to convert radians to degrees
function radToDeg(rad: number): number {
  return rad * (180/Math.PI);
}

// Calculate the heading (in degrees) from point1 to point2
export function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number | null {
  try {
    // Convert to radians
    const lat1Rad = degToRad(lat1);
    const lng1Rad = degToRad(lng1);
    const lat2Rad = degToRad(lat2);
    const lng2Rad = degToRad(lng2);
    
    // Calculate the delta between the longitudes
    const dLng = lng2Rad - lng1Rad;
    
    // Calculate the heading
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    const heading = Math.atan2(y, x);
    
    // Convert to degrees and normalize to 0-360
    return (radToDeg(heading) + 360) % 360;
  } catch (error) {
    console.error('Error calculating heading:', error);
    return null;
  }
}

// Calculate estimated time of arrival (in minutes)
export function calculateETA(distance: number, speed: number): number {
  // If speed is zero or not provided, use a default value to avoid division by zero
  const currentSpeed = speed && speed > 0 ? speed : 40; // default speed 40 km/h
  
  // Speed in km/h, distance in km
  // Returns time in minutes
  return (distance / currentSpeed) * 60;
}

// Create a polyline to show the bus route
export function createRoutePolyline(map: any, path: Array<{ lat: number, lng: number }>, options?: { color?: string, width?: number }) {
  if (!map || !window.google) return null;
  
  try {
    const polyline = new window.google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: options?.color || '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: options?.width || 4,
    });
    
    polyline.setMap(map);
    return polyline;
  } catch (error) {
    console.error('Error creating route polyline:', error);
    return null;
  }
}

// Reverse geocode coordinates to get address
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  if (!window.google) return "Location unavailable";
  
  try {
    const geocoder = new window.google.maps.Geocoder();
    const response = await new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
    
    return response as string;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return "Location unavailable";
  }
}

// Calculate traffic-based ETA
export function calculateTrafficETA(distance: number, speed: number, trafficFactor: number = 1.0): number {
  // trafficFactor: 1.0 = normal traffic, >1.0 = heavier traffic, <1.0 = lighter traffic
  // Adjust ETA based on traffic conditions
  return calculateETA(distance, speed / trafficFactor);
}

// Format coordinates for display
export function formatCoordinates(lat: number, lng: number): string {
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}° ${latDirection}, ${Math.abs(lng).toFixed(6)}° ${lngDirection}`;
}

// Common Sri Lankan locations with coordinates
export const sriLankaLocations = {
  colombo: { lat: 6.9271, lng: 79.8612 },
  kandy: { lat: 7.2906, lng: 80.6337 },
  galle: { lat: 6.0535, lng: 80.2210 },
  jaffna: { lat: 9.6615, lng: 80.0255 },
  negombo: { lat: 7.2081, lng: 79.8352 },
  anuradhapura: { lat: 8.3114, lng: 80.4037 },
  trincomalee: { lat: 8.5922, lng: 81.2352 },
  batticaloa: { lat: 7.7246, lng: 81.7068 },
  nuwara_eliya: { lat: 6.9497, lng: 80.7891 },
  matara: { lat: 5.9549, lng: 80.5550 },
};

// Get center of Sri Lanka as default map center
export const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };
