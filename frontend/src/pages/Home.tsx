import React, { FC, useEffect, useState } from 'react';
import { Flex, Text, Box, Button, Spinner, VStack } from "@chakra-ui/react";
import { useAppSelector, useAppDispatch } from '../typed.hooks/hooks';
import OwnerHomeCard from '../components/OwnerHomeCard';
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { getNearbyPadsLoginUser, resetPad, resetPadHelpers } from '../reducers/pads.reducer/pads.slice';
import { IPads } from "../interfaces/pad.interface";
import { useNavigate } from 'react-router-dom';

const Home: FC = () => {

    const { pads } = useAppSelector(state => state.pads);
    const navigate = useNavigate();
    const [padDetails, setPadDetails] = useState<{
        name: string,
        id: string
    }>({
        name: "",
        id: ""
    })
    const userType = useAppSelector(state => state.user.user!.userType);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!
    });

    const dispatch = useAppDispatch();

    const [coords, setCoords] = useState<{
        lat: number,
        lng: number
    }>({
        lat: 0,
        lng: 0
    })

    const [pageCoords, setPageCoords] = useState<{
        x: number | null,
        y: number | null
    }>({
        x: null,
        y: null
    });

    const instanceOfIPadArray = (param: any): param is Array<IPads> => {
        return param[0].latitude !== undefined;
    }

    const getCenter = () => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
        });
    };

    useEffect(() => {
        return () => {
            dispatch(resetPad());
        }
    }, [dispatch])

    useEffect(() => {
        (async () => {
            let geolocation: any = await getCenter();
            let position = {
                latitude: geolocation.coords.latitude,
                longitude: geolocation.coords.longitude
            };
            await dispatch(getNearbyPadsLoginUser(position));
            dispatch(resetPadHelpers());
            setCoords(prevState => ({
                ...prevState,
                lat: geolocation.coords.latitude!,
                lng: geolocation.coords.longitude!
            }))
        })()
    }, [dispatch])

    return (
        <>
            <Flex
                justify="Center"
                alignItems="center"
                p={userType === "Owner" ? "15vh" : (!isLoaded ? "15vh" : "0vh")}
                w="100%"
                h="100vh"
                onClick={userType === "Owner" ? undefined : (e) => {
                    setPageCoords(prevState => ({
                        ...prevState,
                        x: e.clientX,
                        y: e.clientY
                    }))
                }}
            >
                {
                    userType === "Owner" ? (
                        <>
                            <VStack>
                                <OwnerHomeCard heading={"Create jam room"} text={"Start listing your jam rooms on Livelee"} nav={"#"} />
                                <OwnerHomeCard heading={"Update jam Room details"} text={"Change jam room details here"} nav={"#"} />
                                <OwnerHomeCard heading={"Manage bookings"} text={"Manage bookings here"} nav={"#"} />
                            </VStack>
                        </>
                    ) : (
                        <>
                            {
                                !isLoaded ? (
                                    <>
                                        <Spinner
                                            color='blue.500'
                                            emptyColor='gray.300'
                                            speed='0.65s'
                                            size="xl"
                                            thickness='4px'
                                        />
                                    </>
                                ) : (
                                    <>
                                        {
                                            !pageCoords.x && !pageCoords.y ? (
                                                null
                                            ) : (
                                                <>
                                                    <Box
                                                        borderWidth="1px"
                                                        borderColor="gray.200"
                                                        bg="purple.200"
                                                        w="15vh"
                                                        h="5vh"
                                                        as="button"
                                                        display="grid"
                                                        placeContent="center"
                                                        position="absolute"
                                                        left={`${pageCoords.x}px`}
                                                        top={`${pageCoords.y}px`}
                                                        zIndex="1"
                                                        onClick={padDetails.name === "You" ? undefined : () => {
                                                            navigate(`/get/pad/${padDetails.id}`)
                                                        }}
                                                    >
                                                        <Text>
                                                            {padDetails.name}
                                                        </Text>
                                                    </Box>
                                                </>
                                            )
                                        }
                                        <>
                                            <GoogleMap
                                                center={coords}
                                                zoom={15}
                                                mapContainerStyle={{ width: "100%", height: "100vh" }}
                                            >
                                                <Marker
                                                    position={coords}
                                                    onClick={
                                                        () => setPadDetails(prevState => ({
                                                            ...prevState,
                                                            name: "You"
                                                        }))
                                                    }
                                                />
                                                {
                                                    Array.isArray(pads) ? (
                                                        <>
                                                            {
                                                                pads?.length === 0 ? (
                                                                    <>
                                                                        <Text
                                                                            as="b"
                                                                            color="gray.300"
                                                                            fontSize="4vh"
                                                                        >
                                                                            There are no jam rooms near you!
                                                                        </Text>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {

                                                                            instanceOfIPadArray(pads) ? (
                                                                                <>
                                                                                    {
                                                                                        pads?.map(pad => (
                                                                                            <Marker
                                                                                                key={pad._id}
                                                                                                position={{
                                                                                                    lat: pad.latitude,
                                                                                                    lng: pad.longitude
                                                                                                }}
                                                                                                onClick={() => {
                                                                                                    setPadDetails(prevState => ({
                                                                                                        ...prevState,
                                                                                                        name: pad?.name,
                                                                                                        id: pad?._id
                                                                                                    }))
                                                                                                }}
                                                                                            />
                                                                                        ))
                                                                                    }
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Text
                                                                                        as="b"
                                                                                        color="gray.300"
                                                                                        fontSize="4vh"
                                                                                    >
                                                                                        There has been an error in loading this page!
                                                                                    </Text>
                                                                                </>
                                                                            )
                                                                        }
                                                                    </>
                                                                )
                                                            }
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Text
                                                                as="b"
                                                                fontSize="4vh"
                                                                color="gray.300"
                                                            >
                                                                There has been an error in loading this page!
                                                            </Text>
                                                        </>
                                                    )
                                                }
                                            </GoogleMap>
                                        </>
                                    </>
                                )
                            }
                        </>
                    )
                }
            </Flex>
        </>
    )
}

export default Home