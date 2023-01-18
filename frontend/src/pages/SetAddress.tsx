import { Box, Button, Flex, Input, Text, VStack, useToast } from '@chakra-ui/react';
import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { IAddressSet } from '../interfaces/user.interface';
import { resetUserHelpers, setAddressLoginUser } from '../reducers/user.reducer/user.slice';
import { useAppDispatch, useAppSelector } from '../typed.hooks/hooks';

const SetAddress: FC = () => {

    const [address, setAddress] = useState<IAddressSet>({
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAddress(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const dispatch = useAppDispatch();
    const { isSuccess, isError } = useAppSelector(state => state.user);
    const toast = useToast();

    useEffect(() => {
        if (!isSuccess && !isError) {
            return
        };
        if (isSuccess) {
            toast({
                position: "bottom-left",
                title: "Success",
                description: "Address set!",
                status: "success",
                duration: 5000,
                isClosable: true,
            })
        };
        if (isError) {
            toast({
                position: "bottom-left",
                title: "Error",
                description: "Address could not be set!",
                status: "warning",
                duration: 5000,
                isClosable: true,
            })
        };
        dispatch(resetUserHelpers());
    }, [isSuccess, isError, toast, dispatch])

    return (
        <>
            <Flex
                justify="center"
                alignItems="center"
                p="15vh"
            >
                <Box
                    w="60vh"
                    h="60vh"
                    borderColor="gray.300"
                    borderWidth="1px"
                    borderRadius="1vh"
                >
                    <Flex
                        justify="center"
                        alignItems="center"
                        p="3vh"
                        borderBottom="1px"
                        borderBottomColor="gray.300"
                    >
                        <Text
                            as="b"
                            fontSize="3vh"
                        >
                            Set Address
                        </Text>
                    </Flex>
                    <Flex
                        justify="center"
                        alignItems="center"
                        p="3vh"
                    >
                        <VStack spacing="3vh">
                            <Input placeholder='address' value={address.address} name="address" onChange={handleChange} />
                            <Input placeholder='city' value={address.city} name="city" onChange={handleChange} />
                            <Input placeholder='state' value={address.state} name="state" onChange={handleChange} />
                            <Input placeholder='pincode' value={address.pincode} name="pincode" onChange={handleChange} />
                            <Button
                                onClick={async () => {
                                    await dispatch(setAddressLoginUser(address));
                                    setAddress(prevState => ({
                                        ...prevState,
                                        address: "",
                                        state: "",
                                        city: "",
                                        pincode: ""
                                    }))
                                }}
                            >
                                Set Address
                            </Button>
                        </VStack>
                    </Flex>
                </Box>
            </Flex>
        </>
    )
}

export default SetAddress