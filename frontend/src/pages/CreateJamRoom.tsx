import React, { ChangeEvent, useEffect, useState, useMemo } from 'react';
import { Box, Flex, Input, Text, VStack, Button, useToast, Select } from "@chakra-ui/react";
import { useAppSelector, useAppDispatch } from '../typed.hooks/hooks';
import { createJamPadLoginOwner, resetUserHelpers } from '../reducers/user.reducer/user.slice';
import moment from "moment";

const CreateJamRoom = () => {

    const [jam, setJam] = useState<any>({
        name: "",
        image: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        rate: "",
        equipment: "",
        opening: "00:00",
        closing: "00:00",
        interval: "",
    });

    const toast = useToast();
    const dispatch = useAppDispatch();
    const { isSuccess, isError } = useAppSelector(state => state.user);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setJam((prevState: any) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const timeSlots = useMemo(() => {
        let start = "00:00"
        let timeArray = [];
        while (start) {
            timeArray.push(start);
            if (start === "23:00") {
                break;
            };
            start = moment(start, "HH:mm").add(1, "hour").format("HH:mm")
        };
        return timeArray
    }, [])

    useEffect(() => {
        if (!isSuccess && !isError) {
            return
        };
        if (isSuccess) {
            toast({
                position: "bottom-left",
                title: "Success",
                description: "Room created!",
                status: "success",
                duration: 5000,
                isClosable: true,
            })
        };
        if (isError) {
            toast({
                position: "bottom-left",
                title: "Error",
                description: "Room could not be created!",
                status: "warning",
                duration: 5000,
                isClosable: true,
            })
        };
        dispatch(resetUserHelpers());
        setJam((prevState: any) => ({
            ...prevState,
            name: "",
            image: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            rate: "",
            equipment: "",
            opening: "00:00",
            closing: "00:00",
            interval: "",
        }))
    }, [isSuccess, isError, toast, dispatch])

    return (
        <>
            <Flex
                justify="center"
                alignItems="center"
                p="5vh"
            >
                <Box
                    w="80vh"
                    h="100vh"
                    borderRadius="1vh"
                    borderWidth="1px"
                    borderColor="gray.300"
                >
                    <Flex
                        justify="center"
                        alignItems="center"
                        p="3vh"
                    >
                        <VStack spacing="2vh">
                            <Text
                                as="b"
                                fontSize="4vh"
                            >
                                List a jam room!
                            </Text>
                            {
                                Object.keys(jam).map(el => (
                                    <>
                                        {
                                            el === "opening" || el === "closing" ? (
                                                <>
                                                    <Select value={jam.el} name={el} onChange={handleChange}>
                                                        {
                                                            timeSlots.map(ele => (
                                                                <option value={ele}>{ele}</option>
                                                            ))
                                                        }
                                                    </Select>
                                                </>
                                            ) : (
                                                <>
                                                    <Input placeholder={el} name={el} value={jam.el} onChange={handleChange} />
                                                </>
                                            )
                                        }
                                    </>
                                ))
                            }
                            <Button
                                onClick={async () => {
                                    await dispatch(createJamPadLoginOwner(jam));
                                }}
                            >
                                Create
                            </Button>
                        </VStack>
                    </Flex>
                </Box>
            </Flex>
        </>
    )
}

export default CreateJamRoom