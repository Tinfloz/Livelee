import nodeGeocoder from "node-geocoder";

export const getLatLng = async (address: string): Promise<Array<number>> => {
    let options: nodeGeocoder.Options = {
        provider: "openstreetmap"
    };
    let geocoder = nodeGeocoder(options);
    const res = await geocoder.geocode(address);
    return [res[0].latitude!, res[0].longitude!];
}