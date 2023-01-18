import axios from "axios";
import { IPadNearbyResponse, IPads } from "../../interfaces/pad.interface";

const API_URL = "http://localhost:5000/api/pad";

// get nearby pads
const getNearbyPadsUser = async (latitude: number, longitude: number, token: string): Promise<IPadNearbyResponse> => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.get(API_URL + `/get/pads/${latitude}/${longitude}`, config);
    return response.data;
};

// get pad by id
const getPadByIdUser = async (id: string, token: string): Promise<{ success: boolean, pad: IPads }> => {
    const config = {
        headers: {
            Authorizqation: `Bearer ${token}`
        }
    };
    const response = await axios.get(API_URL + `/get/pad/${id}`, config);
    return response.data;
}

const padService = {
    getNearbyPadsUser,
    getPadByIdUser
};

export default padService;