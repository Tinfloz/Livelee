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
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.get(API_URL + `/get/pad/${id}`, config);
    return response.data;
};

// get slots 
const getSlotsByDate = async (id: string, token: string, date: { date: string }): Promise<{ success: boolean, slots: Array<string> }> => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(API_URL + `/get/slots/${id}`, date, config);
    return response.data;
}

const padService = {
    getNearbyPadsUser,
    getPadByIdUser,
    getSlotsByDate
};

export default padService;