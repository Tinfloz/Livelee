import { ValidationErrors } from "./errors/validation.errors"

export interface IPads {
    _id: string,
    name: string,
    image: string,
    latitude: number,
    longitude: number,
    address?: string,
    city?: string,
    pincode?: string,
    rate?: number,
    equipemnt?: string
}

export interface IPadNearbyResponse {
    success: boolean,
    padsArray: Array<IPads>
}

export interface IPadInit {
    pads: Array<IPads> | IPads | null,
    slots: Array<string> | null,
    isSuccess: boolean,
    isLoading: boolean,
    isError: boolean,
    message: string | ValidationErrors
}