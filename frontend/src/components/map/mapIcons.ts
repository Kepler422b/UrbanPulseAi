import L from 'leaflet';

export const createCustomMarkerIcon = (color: string, label?: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-16px, -32px);
      ">
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C9.925 2 5 6.925 5 13C5 21.2 16 30 16 30C16 30 27 21.2 27 13C27 6.925 22.075 2 16 2Z" fill="${color}" stroke="#07111F" stroke-width="2"/>
          <circle cx="16" cy="13" r="5" fill="#07111F"/>
          <circle cx="16" cy="13" r="3" fill="#FFFFFF"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const createPickerMarkerIcon = () => {
  return L.divIcon({
    className: 'picker-map-marker',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-18px, -36px);
      ">
        <div style="position: absolute; bottom: 0; width: 14px; height: 6px; background: rgba(0,0,0,0.4); border-radius: 50%; filter: blur(2px);"></div>
        <svg viewBox="0 0 36 36" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 2C10.82 2 5 7.82 5 15C5 24.5 18 34 18 34C18 34 31 24.5 31 15C31 7.82 25.18 2 18 2Z" fill="#22D3EE" stroke="#07111F" stroke-width="2.5"/>
          <circle cx="18" cy="14" r="5" fill="#0B1728"/>
          <circle cx="18" cy="14" r="2.5" fill="#22D3EE"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};
