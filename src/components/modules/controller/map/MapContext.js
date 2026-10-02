import { createContext, useContext } from 'react';

export const MapContext = createContext({
    map: null,
});

export const useGoogleMap = () => useContext(MapContext);

export default MapContext;

