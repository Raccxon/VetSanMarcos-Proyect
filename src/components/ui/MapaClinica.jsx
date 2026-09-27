import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

// Arreglo del bug conocido: Leaflet no encuentra sus propios iconos con vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

const CLINICA_POSICION = [-34.1708, -70.74444]; //Rancagua, Aproximado

function MapaClinica() {
    return (
        <div style ={{ height: '350px'}} className="rounded overflow-hidden">
            <MapContainer 
                center={CLINICA_POSICION}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={CLINICA_POSICION}>
                    <Popup>
                        Veterinaria San Marcos <br />
                         Rancagua, Chile.
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default MapaClinica;