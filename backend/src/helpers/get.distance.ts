export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    let p = 0.017453292519943295;
    let c = Math.cos;
    let a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a));
};