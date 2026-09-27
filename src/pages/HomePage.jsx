import MapaClinica from "../components/ui/MapaClinica";

function HomePage() {
    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">Bienvenido a la Veterinaria San Marcos</h1>

            <h2 className="h4 mb-3">Cómo llegar</h2>
            <MapaClinica />
        </div>
    )
}

export default HomePage;